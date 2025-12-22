// ============================================
// AUTHENTICATION SERVICE (SUPABASE)
// ============================================

import { createClient } from '@supabase/supabase-js';
import { supabase, supabaseConfig } from '@/lib/supabase';
import { LoginCredentials, SignupData, UserProfile, AuthUser, RoleName, Role } from '@/types';

// NOTE:
// We explicitly join the roles table using the generated foreign key name
// so that profile.role is ALWAYS populated when role_id is set.
// This fixes cases where role detection fell back to "customer" even for admins.
const PROFILE_SELECT = `
  id,
  email,
  full_name,
  phone,
  address,
  city,
  state,
  country,
  postal_code,
  role_id,
  branch_id,
  avatar_url,
  is_active,
  created_at,
  updated_at,
  role:roles!user_profiles_role_id_fkey(id, name, display_name, description, created_at, updated_at)
`;

const ensureClient = () => {
  if (!supabase || !supabaseConfig.isConfigured) {
    throw new Error('Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env');
  }
  return supabase;
};

const mapProfile = (row: any): UserProfile => ({
  id: row.id,
  email: row.email,
  full_name: row.full_name ?? undefined,
  phone: row.phone ?? undefined,
  address: row.address ?? undefined,
  city: row.city ?? undefined,
  state: row.state ?? undefined,
  country: row.country ?? undefined,
  postal_code: row.postal_code ?? undefined,
  role_id: row.role_id ?? null,
  branch_id: row.branch_id ?? undefined,
  avatar_url: row.avatar_url ?? undefined,
  is_active: row.is_active ?? true,
  created_at: row.created_at,
  updated_at: row.updated_at,
  role: row.role ? (row.role as Role) : undefined,
});

export class AuthService {
  /**
   * Sign in with email and password (Supabase)
   */
  static async signIn(credentials: LoginCredentials, _selectedRole?: RoleName) {
    const client = ensureClient();
    console.log('Signing in with credentials:', credentials,);
    const { data, error } = await client.auth.signInWithPassword({
      email: (credentials.email || '').trim().toLowerCase(),
      password: credentials.password || '',
    });

    if (error) {
      console.log('Error signing in:', error);
      throw error;
    }

    const user = data.user;
    console.log('User:', user);
    if (!user) {
      throw new Error('Unable to log in. No user returned.');
    }

    let profile: UserProfile | null = null;
    try {
      profile = await this.getUserProfile(user.id);
    } catch (profileError) {
      console.warn('Unable to load profile after login:', profileError);
    }

    return {
      user: {
        id: user.id,
        email: user.email || '',
      },
      session: data.session,
      profile: profile || undefined,
    };
  }

  /**
   * Sign up new user (Supabase)
   */
  static async signUp(signupData: SignupData) {
    const client = ensureClient();

    const email = (signupData.email || '').trim().toLowerCase();
    const password = signupData.password || '';

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: signupData.full_name,
          phone: signupData.phone,
        },
      },
    });

    if (error) {
      throw error;
    }

    const user = data.user;
    let profile: UserProfile | null = null;

    if (user) {
      try {
        profile = await this.getUserProfile(user.id);
      } catch (profileError) {
        console.warn('Profile not yet available after signup (likely awaiting email confirmation):', profileError);
      }
    }

    return {
      user: {
        id: user?.id || '',
        email: user?.email || email,
      },
      session: data.session,
      profile: profile || undefined,
    };
  }

  /**
   * Create a new user (Admin function)
   * Uses a temporary client to avoid logging out the admin
   */
  static async createUserWithProfile(
    userData: SignupData & { role: RoleName; branch_id?: string; company_id?: string }
  ) {
    // 1. Ensure configuration
    if (!supabaseConfig.isConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const email = (userData.email || '').trim().toLowerCase();
    const password = userData.password || '';

    // 2. Get Role ID first
    const mainClient = ensureClient();
    const { data: roleData, error: roleError } = await mainClient
      .from('roles')
      .select('id')
      .eq('name', userData.role)
      .single();

    if (roleError || !roleData) {
      throw new Error(`Invalid role: ${userData.role}`);
    }

    // 3. Create a temporary client for the new user signup
    // This isolates the session so the admin stays logged in
    const tempClient = createClient(supabaseConfig.url, supabaseConfig.key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 4. Create the user in Auth
    // Note: This will trigger handle_new_user(), but the trigger now checks
    // if profile exists first, so it won't conflict with our manual insert
    const { data: authData, error: authError } = await tempClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          phone: userData.phone,
        },
      },
    });

    if (authError) {
      throw authError; // e.g. "User already registered"
    }

    const newUser = authData.user;
    if (!newUser) {
      throw new Error('Failed to create user: No user data returned.');
    }

    // 5. Insert into user_profiles using Main Client (Admin privileges via RLS)
    // The trigger will skip this if it already exists
    const { error: profileError } = await mainClient
      .from('user_profiles')
      .insert({
        id: newUser.id,
        email: email,
        full_name: userData.full_name,
        phone: userData.phone,
        role_id: roleData.id,
        branch_id: userData.branch_id || null, // Optional
        is_active: true,
      });

    if (profileError) {
      // Check if error is due to duplicate key (profile already created by trigger)
      if (profileError.code === '23505') {
        // Duplicate key, update instead
        const { error: updateError } = await mainClient
          .from('user_profiles')
          .update({
            full_name: userData.full_name,
            phone: userData.phone,
            role_id: roleData.id,
            branch_id: userData.branch_id || null,
          })
          .eq('id', newUser.id);

        if (updateError) {
          throw new Error(`Failed to update profile: ${updateError.message}`);
        }
      } else {
        throw new Error(`Failed to create profile: ${profileError.message}`);
      }
    }

    return { success: true, userId: newUser.id };
  }

  /**
   * Sign out current user
   */
  static async signOut() {
    const client = ensureClient();
    const { error } = await client.auth.signOut();
    if (error) {
      throw error;
    }
  }

  /**
   * Get current session
   */
  static async getSession() {
    const client = ensureClient();
    const { data, error } = await client.auth.getSession();
    if (error) {
      throw error;
    }
    return data.session;
  }

  /**
   * Get current user with profile
   */
  static async getCurrentUser(): Promise<AuthUser | null> {
    const client = ensureClient();
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) {
      return null; // No session, so no user
    }

    const { data, error } = await client.auth.getUser();
    // Supabase throws AuthSessionMissingError when no session; treat as logged-out
    if (error) {
      if (error.name === 'AuthSessionMissingError') {
        return null;
      }
      throw error;
    }

    if (!data.user) return null;

    let profile: UserProfile | null = null;
    try {
      profile = await this.getUserProfile(data.user.id);
      // Auto-repair profile if missing (common for manual Auth users)
      if (!profile) {
        profile = await this.repairMissingProfile(data.user.id, data.user.email || '');
      }
    } catch (profileError) {
      console.warn('Unable to load profile for current user:', profileError);
    }

    return {
      id: data.user.id,
      email: data.user.email || '',
      profile: profile || undefined,
    };
  }

  /**
   * Internal helper to create a basic profile if one is missing
   */
  private static async repairMissingProfile(userId: string, email: string): Promise<UserProfile | null> {
    const client = ensureClient();
    try {
      // 1. Find a default role (e.g., manager or technician)
      const { data: roleData } = await client
        .from('roles')
        .select('id')
        .eq('name', 'manager') // Defaulting to manager for "staff" vibe
        .maybeSingle();

      if (!roleData) return null;

      // 2. Create the profile
      const { data, error } = await client
        .from('user_profiles')
        .insert({
          id: userId,
          email: email,
          full_name: email.split('@')[0],
          role_id: roleData.id,
          is_active: true,
        })
        .select(PROFILE_SELECT)
        .maybeSingle();

      if (error) {
        console.warn('Failed to repair missing profile:', error);
        return null;
      }

      return data ? mapProfile(data) : null;
    } catch (err) {
      console.warn('Error in repairMissingProfile:', err);
      return null;
    }
  }

  /**
   * Get user profile with role
   */
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const client = ensureClient();
    const { data, error } = await client
      .from('user_profiles')
      .select(PROFILE_SELECT)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) return null;
    return mapProfile(data);
  }

  /**
   * Get user profile by email (for admin flows or role assignment)
   */
  static async getUserProfileByEmail(email: string): Promise<UserProfile | null> {
    const client = ensureClient();
    const { data, error } = await client
      .from('user_profiles')
      .select(PROFILE_SELECT)
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) return null;
    return mapProfile(data);
  }

  /**
   * Get all user profiles with roles (admin-only via RLS)
   */
  static async getAllUserProfiles(): Promise<UserProfile[]> {
    const client = ensureClient();
    const { data, error } = await client
      .from('user_profiles')
      .select(PROFILE_SELECT)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(mapProfile);
  }

  /**
   * Reset password (sends email)
   */
  static async resetPassword(email: string) {
    const client = ensureClient();
    const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase());
    if (error) {
      throw error;
    }
    return { success: true };
  }

  /**
   * Update password for logged-in user
   */
  static async updatePassword(newPassword: string) {
    const client = ensureClient();
    const { error, data } = await client.auth.updateUser({ password: newPassword });
    if (error) {
      throw error;
    }
    return data.user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<UserProfile>) {
    const client = ensureClient();
    const { data, error } = await client
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select(PROFILE_SELECT)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data ? mapProfile(data) : null;
  }

  /**
   * Update full user profile (Admin function)
   * Can update: role_id, branch_id, email, phone, full_name
   */
  static async updateUserProfile(userId: string, updates: {
    role?: RoleName;
    branch_id?: string | null;
    email?: string;
    phone?: string;
    full_name?: string;
  }) {
    const client = ensureClient();
    const dbUpdates: any = {
      updated_at: new Date().toISOString(),
    };

    // specific field mapping
    if (updates.email) dbUpdates.email = updates.email.trim().toLowerCase();
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.full_name) dbUpdates.full_name = updates.full_name;
    if (updates.branch_id !== undefined) dbUpdates.branch_id = updates.branch_id;

    // Handle Role Name -> ID conversion
    if (updates.role) {
      const { data: roleData, error: roleError } = await client
        .from('roles')
        .select('id')
        .eq('name', updates.role)
        .single();

      if (roleError || !roleData) throw new Error(`Invalid role: ${updates.role}`);
      dbUpdates.role_id = roleData.id;
    }

    const { data, error } = await client
      .from('user_profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select(PROFILE_SELECT)
      .maybeSingle();

    if (error) throw error;
    return data ? mapProfile(data) : null;
  }

  /**
   * Assign role to user (Legacy wrapper)
   */
  static async assignRoleToUser(userId: string, roleName: RoleName) {
    return this.updateUserProfile(userId, { role: roleName });
  }

  /**
   * Assign role by email via RPC (security definer in DB)
   * Requires a Postgres function named assign_role_by_admin(target_email, role_name, full_name, phone)
   */
  static async assignRoleByEmail(params: {
    email: string;
    role: RoleName;
    full_name?: string;
    phone?: string;
  }) {
    const client = ensureClient();
    const { data, error } = await client.rpc('assign_role_by_admin', {
      target_email: params.email.trim().toLowerCase(),
      role_name: params.role,
      full_name: params.full_name ?? null,
      phone: params.phone ?? null,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Deactivate user (soft delete)
   */
  static async deactivateUser(userId: string) {
    const client = ensureClient();
    const { data, error } = await client.rpc('deactivate_user', {
      p_user_id: userId,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Reactivate user
   */
  static async reactivateUser(userId: string) {
    const client = ensureClient();
    const { data, error } = await client.rpc('reactivate_user', {
      p_user_id: userId,
    });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Delete user permanently (hard delete)
   * Only available to company admins
   */
  static async deleteUser(userId: string) {
    const client = ensureClient();

    // First, log the activity
    await this.logUserActivity(userId, 'user_deleted', { deleted_by: (await this.getCurrentUser())?.id });

    // Delete the user profile (will cascade to auth.users via trigger)
    const { error } = await client
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      throw error;
    }

    return { success: true };
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(userId: string) {
    const client = ensureClient();
    const { error } = await client
      .from('user_profiles')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.warn('Failed to update last login:', error);
    }
  }

  /**
   * Log user activity
   */
  static async logUserActivity(userId: string, action: string, details?: any) {
    const client = ensureClient();
    const { error } = await client.rpc('log_user_activity', {
      p_user_id: userId,
      p_action: action,
      p_details: details || null,
    });

    if (error) {
      console.warn('Failed to log activity:', error);
    }
  }

  /**
   * Get user activity log
   */
  static async getUserActivityLog(userId: string, limit: number = 50) {
    const client = ensureClient();
    const { data, error } = await client
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Bulk update users
   */
  static async bulkUpdateUsers(userIds: string[], updates: {
    role?: RoleName;
    branch_id?: string | null;
    is_active?: boolean;
  }) {
    const client = ensureClient();
    const dbUpdates: any = {
      updated_at: new Date().toISOString(),
    };

    // Handle Role Name -> ID conversion
    if (updates.role) {
      const { data: roleData, error: roleError } = await client
        .from('roles')
        .select('id')
        .eq('name', updates.role)
        .single();

      if (roleError || !roleData) throw new Error(`Invalid role: ${updates.role}`);
      dbUpdates.role_id = roleData.id;
    }

    if (updates.branch_id !== undefined) dbUpdates.branch_id = updates.branch_id;
    if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;

    const { error } = await client
      .from('user_profiles')
      .update(dbUpdates)
      .in('id', userIds);

    if (error) throw error;

    // Log bulk activity
    for (const userId of userIds) {
      await this.logUserActivity(userId, 'bulk_update', updates);
    }

    return { success: true, updated: userIds.length };
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(roleName: RoleName): Promise<UserProfile[]> {
    const client = ensureClient();
    const { data, error } = await client
      .from('user_profiles')
      .select(PROFILE_SELECT)
      .eq('role.name', roleName)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(mapProfile);
  }

  /**
   * Get users by branch
   */
  static async getUsersByBranch(branchId: string): Promise<UserProfile[]> {
    const client = ensureClient();
    const { data, error } = await client
      .from('user_profiles')
      .select(PROFILE_SELECT)
      .eq('branch_id', branchId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(mapProfile);
  }

  /**
   * Get users by status (active/inactive)
   */
  static async getUsersByStatus(isActive: boolean): Promise<UserProfile[]> {
    const client = ensureClient();
    const { data, error } = await client
      .from('user_profiles')
      .select(PROFILE_SELECT)
      .eq('is_active', isActive)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []).map(mapProfile);
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const client = ensureClient();

    // Initial check
    this.getCurrentUser().then(callback).catch(console.error);

    return client.auth.onAuthStateChange(async (_event, session) => {
      const supabaseUser = session?.user;
      if (!supabaseUser) {
        callback(null);
        return;
      }

      let profile: UserProfile | null = null;
      try {
        profile = await this.getUserProfile(supabaseUser.id);
        if (!profile) {
          profile = await this.repairMissingProfile(supabaseUser.id, supabaseUser.email || '');
        }
      } catch (profileError) {
        console.warn('Unable to load profile on auth change:', profileError);
      }

      callback({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        profile: profile || undefined,
      });
    });
  }
}
