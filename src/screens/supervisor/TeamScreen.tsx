// ============================================
// TEAM SCREEN (Supervisor)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useRole } from '@/hooks/useRole';
import { UserProfile } from '@/types';

export default function SupervisorTeamScreen() {
  const { branchId } = useRole();
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      
      // Check if Supabase is disabled
      if (!supabase) {
        console.warn('Supabase is disabled - no team members available');
        setTeamMembers([]);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          role:roles(*)
        `)
        .eq('branch_id', branchId)
        .in('role_id', [
          (await supabase.from('roles').select('id').eq('name', 'technician').single()).data?.id,
          (await supabase.from('roles').select('id').eq('name', 'technician_group_manager').single()).data?.id,
        ])
        .order('full_name', { ascending: true });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error loading team members:', error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadTeamMembers} />
      }
    >
      <View className="px-6 py-4">
        {teamMembers.map((member) => (
          <View
            key={member.id}
            className="bg-white rounded-lg p-4 mb-4 shadow-sm"
          >
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              {member.full_name || member.email}
            </Text>
            {member.role && (
              <Text className="text-gray-600 text-sm mb-1 capitalize">
                {member.role.name.replace('_', ' ')}
              </Text>
            )}
            {member.phone && (
              <Text className="text-gray-600 text-sm">
                {member.phone}
              </Text>
            )}
          </View>
        ))}

        {teamMembers.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-gray-500">No team members found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

