// ============================================
// AUTHENTICATION SERVICE (SUPABASE)
// ============================================

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
  company_name,
  city,
  postal_code,
  country,
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
  company_name: row.company_name ?? undefined,
  city: row.city ?? undefined,
  postal_code: row.postal_code ?? undefined,
  country: row.country ?? undefined,
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

    const { data, error } = await client.auth.signInWithPassword({
      email: (credentials.email || '').trim().toLowerCase(),
      password: (credentials.password || '').trim(),
    });

    if (error) {
      throw error;
    }

    const user = data.user;
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
   * Assign role to user
   */
  static async assignRoleToUser(userId: string, roleName: RoleName) {
    const client = ensureClient();

    const { data: role, error: roleError } = await client
      .from('roles')
      .select('id, name, display_name, description, created_at, updated_at')
      .eq('name', roleName)
      .maybeSingle();

    if (roleError) throw roleError;
    if (!role) throw new Error('Role not found');

    const { data, error } = await client
      .from('user_profiles')
      .update({
        role_id: role.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select(PROFILE_SELECT)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) return null;
    return mapProfile({ ...data, role });
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
