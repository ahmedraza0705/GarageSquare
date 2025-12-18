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
      password: (credentials.password || '').trim(),
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
    const password = (signupData.password || '').trim();

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

    // 2. Create a temporary client for the new user signup
    // This isolates the session so the admin stays logged in
    const tempClient = createClient(supabaseConfig.url, supabaseConfig.key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const email = (userData.email || '').trim().toLowerCase();
    const password = (userData.password || '').trim();

    // 3. Create the user in Auth
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

    // 4. Get Role ID
    const mainClient = ensureClient();
    const { data: roleData, error: roleError } = await mainClient
      .from('roles')
      .select('id')
      .eq('name', userData.role)
      .single();

    if (roleError || !roleData) {
      // Ideally rollback auth user here if possible, but requires Service Role key.
      // For client-side, we just throw, leaving a "zombie" auth user (better than inconsistent state).
      // In prod with edge functions, this is transactional.
      throw new Error(`Invalid role: ${userData.role}`);
    }

    // 5. Insert into user_profiles using Main Client (Admin privileges via RLS)
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
      throw new Error(`Failed to create profile: ${profileError.message}`);
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
