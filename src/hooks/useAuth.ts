// ============================================
// AUTH HOOK
// ============================================

import { useState, useEffect } from 'react';
import { AuthService } from '@/services/auth_v2.service';
import { AuthUser, LoginCredentials, SignupData, RoleName } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check for existing session
    checkSession();

    // Listen to auth state changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const session = await AuthService.getSession();
      if (session) {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      setError(err as Error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials: LoginCredentials, selectedRole?: RoleName) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.signIn(credentials, selectedRole);
      setUser({
        id: result.user.id,
        email: result.user.email || '',
        profile: result.profile || undefined,
      });
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (signupData: SignupData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.signUp(signupData);
      setUser({
        id: result.user.id,
        email: result.user.email || '',
        profile: result.profile || undefined,
      });
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signOut();
      setUser(null);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await AuthService.resetPassword(email);
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  };
}

