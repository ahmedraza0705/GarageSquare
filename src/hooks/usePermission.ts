// ============================================
// PERMISSION HOOK
// ============================================

import { useRole } from './useRole';
import { hasPermission, PermissionResource, PermissionAction } from '@/constants/permissions';

export function usePermission() {
  const { role } = useRole();

  const checkPermission = (
    resource: PermissionResource,
    action: PermissionAction
  ): boolean => {
    return hasPermission(role, resource, action);
  };

  return {
    checkPermission,
    canView: (resource: PermissionResource) => checkPermission(resource, 'view'),
    canCreate: (resource: PermissionResource) => checkPermission(resource, 'create'),
    canUpdate: (resource: PermissionResource) => checkPermission(resource, 'update'),
    canDelete: (resource: PermissionResource) => checkPermission(resource, 'delete'),
    canManage: (resource: PermissionResource) => checkPermission(resource, 'manage'),
    canAssign: (resource: PermissionResource) => checkPermission(resource, 'assign'),
  };
}

