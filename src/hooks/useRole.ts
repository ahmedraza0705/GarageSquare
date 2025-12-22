// ============================================
// ROLE HOOK
// ============================================

import { useAuth } from './useAuth';
import { RoleName } from '@/types';

export function useRole() {
  const { user } = useAuth();

  // Hard-coded company admin emails (SYNC with RoleBasedNavigator.tsx)
  const adminEmails = ['test@gmail.com'];
  const email = user?.email?.toLowerCase() || '';

  // Try to get role from profile.role.name first
  let role: RoleName | undefined = user?.profile?.role?.name as RoleName | undefined;

  // Fallback to email whitelist for admin status
  if (email && adminEmails.includes(email)) {
    role = 'company_admin';
  }

  // Debug logging
  if (user) {
    console.log('🔍 Role Detection:', {
      email: email,
      hasProfile: !!user.profile,
      profileRole: user.profile?.role?.name,
      finalRole: role,
    });
  }

  const isCompanyAdmin = role === 'company_admin';
  const isManager = role === 'manager';
  const isSupervisor = role === 'supervisor';
  const isTechnicianGroupManager = role === 'technician_group_manager';
  const isTechnician = role === 'technician';
  const isCustomer = role === 'customer';

  const isStaff = isCompanyAdmin || isManager || isSupervisor || isTechnicianGroupManager || isTechnician;

  return {
    role,
    isCompanyAdmin,
    isManager,
    isSupervisor,
    isTechnicianGroupManager,
    isTechnician,
    isCustomer,
    isStaff,
    userProfile: user?.profile,
    branchId: user?.profile?.branch_id,
  };
}

