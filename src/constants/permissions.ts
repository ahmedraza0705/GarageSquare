// ============================================
// PERMISSIONS MATRIX
// ============================================

import { RoleName } from '@/types';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'manage' | 'assign' | 'all';

export type PermissionResource = 
  | 'all'
  | 'branches'
  | 'customers'
  | 'vehicles'
  | 'job_cards'
  | 'tasks'
  | 'payments'
  | 'reports'
  | 'team'
  | 'profile'
  | 'services';

export interface PermissionCheck {
  resource: PermissionResource;
  action: PermissionAction;
}

// Permission Matrix: Role -> Resource -> Actions
export const PERMISSIONS_MATRIX: Record<RoleName, Record<PermissionResource, PermissionAction[]>> = {
  company_admin: {
    all: ['all'],
    branches: ['all'],
    customers: ['all'],
    vehicles: ['all'],
    job_cards: ['all'],
    tasks: ['all'],
    payments: ['all'],
    reports: ['all'],
    team: ['all'],
    profile: ['all'],
    services: ['all'],
  },
  manager: {
    all: [],
    branches: ['view', 'manage'],
    customers: ['view', 'create', 'update', 'delete'],
    vehicles: ['view', 'create', 'update', 'delete'],
    job_cards: ['view', 'create', 'update', 'manage'],
    tasks: ['view', 'create', 'update'],
    payments: ['view', 'create', 'update', 'manage'],
    reports: ['view'],
    team: ['view', 'manage'],
    profile: ['view', 'update'],
    services: ['view', 'create', 'update'],
  },
  supervisor: {
    all: [],
    branches: ['view'],
    customers: ['view'],
    vehicles: ['view'],
    job_cards: ['view', 'create', 'update', 'manage'],
    tasks: ['view', 'create', 'update', 'assign', 'manage'],
    payments: ['view'],
    reports: ['view'],
    team: ['view'],
    profile: ['view', 'update'],
    services: ['view'],
  },
  technician_group_manager: {
    all: [],
    branches: ['view'],
    customers: ['view'],
    vehicles: ['view'],
    job_cards: ['view', 'assign'],
    tasks: ['view', 'assign'],
    payments: ['view'],
    reports: [],
    team: ['view'],
    profile: ['view', 'update'],
    services: ['view'],
  },
  technician: {
    all: [],
    branches: ['view'],
    customers: ['view'],
    vehicles: ['view'],
    job_cards: ['view', 'update'],
    tasks: ['view', 'update'],
    payments: ['view'],
    reports: [],
    team: [],
    profile: ['view', 'update'],
    services: ['view'],
  },
  customer: {
    all: [],
    branches: [],
    customers: [],
    vehicles: ['view'],
    job_cards: ['view'],
    tasks: [],
    payments: ['view'],
    reports: [],
    team: [],
    profile: ['view', 'update'],
    services: ['view'],
  },
};

/**
 * Check if a role has permission for a resource and action
 */
export function hasPermission(
  role: RoleName | undefined,
  resource: PermissionResource,
  action: PermissionAction
): boolean {
  if (!role) return false;
  
  const rolePermissions = PERMISSIONS_MATRIX[role];
  if (!rolePermissions) return false;

  // Company admin has all permissions
  if (role === 'company_admin') return true;

  // Check for 'all' permission
  if (rolePermissions.all?.includes('all')) return true;

  // Check specific resource permissions
  const resourcePermissions = rolePermissions[resource];
  if (!resourcePermissions) return false;

  // Check if action is allowed
  return resourcePermissions.includes(action) || resourcePermissions.includes('all');
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: RoleName): PermissionAction[] {
  const rolePermissions = PERMISSIONS_MATRIX[role];
  if (!rolePermissions) return [];

  if (role === 'company_admin' || rolePermissions.all?.includes('all')) {
    return ['all'];
  }

  // Flatten all permissions for the role
  const allActions = new Set<PermissionAction>();
  Object.values(rolePermissions).forEach(actions => {
    actions.forEach(action => allActions.add(action));
  });

  return Array.from(allActions);
}

