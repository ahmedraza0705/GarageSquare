// ============================================
// USER SERVICE (SUPABASE)
// ============================================

import { supabase } from '@/lib/supabase';

export class UserService {
    /**
     * Get staff counts by role
     */
    static async getStaffStats(branchId?: string) {
        if (!supabase) {
            return {
                branchManager: 0,
                supervisor: 0,
                technicianManager: 0,
                technician: 0,
            };
        }

        try {
            let query = supabase
                .from('user_profiles')
                .select('role:roles(name)');

            if (branchId) {
                query = query.eq('branch_id', branchId);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching staff stats:', error);
                return {
                    branchManager: 0,
                    supervisor: 0,
                    technicianManager: 0,
                    technician: 0,
                };
            }

            const stats = {
                branchManager: 0,
                supervisor: 0,
                technicianManager: 0,
                technician: 0,
            };

            (data || []).forEach((profile: any) => {
                const roleName = profile.role?.name;
                if (roleName === 'branch_manager') stats.branchManager++;
                else if (roleName === 'supervisor') stats.supervisor++;
                else if (roleName === 'technician_manager') stats.technicianManager++;
                else if (roleName === 'technician') stats.technician++;
            });

            return stats;
        } catch (error) {
            console.error('Error in getStaffStats:', error);
            return {
                branchManager: 0,
                supervisor: 0,
                technicianManager: 0,
                technician: 0,
            };
        }
    }
}
