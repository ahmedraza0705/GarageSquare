export type Role = 'company_admin' | 'manager' | 'supervisor' | 'technician_group_manager' | 'technician' | 'customer';

export const PERMISSIONS = {
    VIEW_DASHBOARD: 'view_dashboard',
    MANAGE_USERS: 'manage_users',
    MANAGE_JOBS: 'manage_jobs',
    VIEW_REPORTS: 'view_reports',
    MANAGE_OPERATIONS: 'manage_operations', // Vehicles, Branches
    VIEW_INVOICES: 'view_invoices',
    VIEW_PROFILE: 'view_profile',
};

export const ROLE_PERMISSIONS: Record<Role, string[]> = {
    company_admin: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MANAGE_JOBS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.MANAGE_OPERATIONS,
        PERMISSIONS.VIEW_INVOICES,
        PERMISSIONS.VIEW_PROFILE,
    ],
    manager: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_USERS,
        PERMISSIONS.MANAGE_JOBS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.MANAGE_OPERATIONS,
        PERMISSIONS.VIEW_INVOICES,
        PERMISSIONS.VIEW_PROFILE,
    ],
    supervisor: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_JOBS,
        PERMISSIONS.VIEW_PROFILE,
    ],
    technician_group_manager: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_JOBS,
        PERMISSIONS.VIEW_PROFILE,
    ],
    technician: [
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.MANAGE_JOBS,
        PERMISSIONS.VIEW_INVOICES,
        PERMISSIONS.MANAGE_OPERATIONS, // For Vehicle Management
        PERMISSIONS.VIEW_PROFILE,
    ],
    customer: [],
};
