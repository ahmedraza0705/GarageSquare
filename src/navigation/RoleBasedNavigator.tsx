// ============================================
// ROLE-BASED NAVIGATOR
// ============================================

import React from 'react';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';
import StaffNavigator from './StaffNavigator';
import CustomerNavigator from './role/CustomerNavigator';
import TechnicianNavigator from '../roles/technician/navigation/TechnicianNavigator';
import GroupManagerNavigator from '../roles/technicianGroupManager/navigation/GroupManagerNavigator';

export default function RoleBasedNavigator() {
  const { role } = useRole();
  const { user } = useAuth();

  // Hard-coded company admin emails – these ALWAYS see the admin panel,
  // even if role detection fails or profile/role_id is missing.
  // const adminEmails = [
  //   'test@gmail.com',
  // ];

  const email = user?.email?.toLowerCase() || '';

  // If the logged-in email is one of the admin emails, force admin navigator (StaffNavigator)
  // if (email && adminEmails.includes(email)) {
  //   return <StaffNavigator />;
  // }

  switch (role) {
    case 'company_admin':
    case 'manager':
    case 'supervisor':
      return <StaffNavigator />;
    case 'technician_group_manager':
      return <GroupManagerNavigator />;
    case 'technician':
      return <TechnicianNavigator />;
    case 'customer':
      return <CustomerNavigator />;
    default:
      // Default to StaffNavigator (likely technician view restricted by RBAC) for testing
      // For safety during dev, maybe default to Technician if unknown? Or keep Staff
      return <StaffNavigator />;
  }
}
