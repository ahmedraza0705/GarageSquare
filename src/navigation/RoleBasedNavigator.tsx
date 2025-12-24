// ============================================
// ROLE-BASED NAVIGATOR
// ============================================

import React from 'react';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';
import StaffNavigator from './StaffNavigator';
import CustomerNavigator from './role/CustomerNavigator';

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
    case 'technician_group_manager':
    case 'technician':
      return <StaffNavigator />;
    case 'customer':
      return <CustomerNavigator />;
    default:
      // Default to StaffNavigator (likely technician view restricted by RBAC) for testing
      return <StaffNavigator />;
  }
}
