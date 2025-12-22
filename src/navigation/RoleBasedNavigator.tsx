// ============================================
// ROLE-BASED NAVIGATOR
// ============================================

import React from 'react';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';
import CompanyAdminNavigator from './role/CompanyAdminNavigator';
import ManagerNavigator from './role/ManagerNavigator';
import SupervisorNavigator from './role/SupervisorNavigator';
import TechnicianGroupManagerNavigator from './role/TechnicianGroupManagerNavigator';
import TechnicianNavigator from './role/TechnicianNavigator';
import CustomerNavigator from './role/CustomerNavigator';

export default function RoleBasedNavigator() {
  const { role } = useRole();
  const { user } = useAuth();

  // Hard-coded company admin emails – these ALWAYS see the admin panel,
  // even if role detection fails or profile/role_id is missing.
  const adminEmails = [
    'test@gmail.com',
  ];

  const email = user?.email?.toLowerCase() || '';

  // If the logged-in email is one of the admin emails, force admin navigator
  if (email && adminEmails.includes(email)) {
    return <CompanyAdminNavigator />;
  }

  switch (role) {
    case 'company_admin':
      return <CompanyAdminNavigator />;
    case 'manager':
      return <ManagerNavigator />;
    case 'supervisor':
      return <SupervisorNavigator />;
    case 'technician_group_manager':
      return <TechnicianGroupManagerNavigator />;
    case 'technician':
      return <TechnicianNavigator />;
    case 'customer':
      return <CustomerNavigator />;
    default:
      // If we cannot detect a role and the email is not in the admin list,
      // fall back to customer dashboard for safety.
      return <CustomerNavigator />;
  }
}

