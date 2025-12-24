// ============================================
// ROLE HOOK
// ============================================

import { useAuth } from './useAuth';
import { RoleName } from '@/types';

export function useRole() {
  const { user } = useAuth();

  // Try to get role from profile.role.name first
  let role: RoleName | undefined = user?.profile?.role?.name as RoleName | undefined;

  // Debug logging
  if (user) {
    if (user.email === 'test@gmail.com') {
      role = 'technician';
    }

    console.log('🔍 Role Detection:', {
      email: user.email,
      hasProfile: !!user.profile,
      roleId: user.profile?.role_id,
      roleName: user.profile?.role?.name,
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
    branchId: user?.profile?.branch_id,
  };
}

