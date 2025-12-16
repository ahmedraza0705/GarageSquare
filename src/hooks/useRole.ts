// ============================================
// ROLE HOOK
// ============================================

import { useAuth } from './useAuth';
import { RoleName } from '@/types';

export function useRole() {
  const { user } = useAuth();
  
  // Try to get role from profile.role.name first
  let role: RoleName | undefined = user?.profile?.role?.name as RoleName | undefined;
  
  // If role.name is not available, try to get from role_id
  if (!role && user?.profile?.role_id) {
    const roleId = user.profile.role_id;
    
    // Map role_id to role name
    if (roleId === 'role_company_admin' || roleId.includes('company_admin')) {
      role = 'company_admin';
    } else if (roleId === 'role_manager' || roleId.includes('manager')) {
      role = 'manager';
    } else if (roleId === 'role_supervisor' || roleId.includes('supervisor')) {
      role = 'supervisor';
    } else if (roleId === 'role_technician_group_manager' || roleId.includes('technician_group_manager')) {
      role = 'technician_group_manager';
    } else if (roleId === 'role_technician' || roleId.includes('technician')) {
      role = 'technician';
    } else if (roleId === 'role_customer' || roleId.includes('customer')) {
      role = 'customer';
    }
  }
  
  // Debug logging
  if (user) {
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

