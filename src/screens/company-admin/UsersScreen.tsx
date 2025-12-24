// ============================================
// ENHANCED USER MANAGEMENT SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, TextInput, Modal, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile, RoleName } from '@/types';
import { AuthService } from '@/services/auth_v2.service';
import { supabase } from '@/lib/supabase';
// Icons
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  Shield,
  Edit2,
  X,
  Check,
  Building2,
  Filter,
  Trash2,
  UserX,
  UserCheck,
  MoreVertical,
  CheckSquare,
  Square,
  Clock,
  AlertCircle,
  Menu,
  Moon,
  ChevronRight,
} from 'lucide-react-native';

// Constants
const AVAILABLE_ROLES: { value: RoleName; label: string; color: string }[] = [
  { value: 'manager', label: 'Manager', color: '#2563EB' },
  { value: 'supervisor', label: 'Supervisor', color: '#7C3AED' },
  { value: 'technician_group_manager', label: 'Tech Lead', color: '#059669' },
  { value: 'technician', label: 'Technician', color: '#D97706' },
  { value: 'customer', label: 'Customer', color: '#4B5563' },
];

type FilterType = {
  role: RoleName | '';
  branch: string;
  status: 'all' | 'active' | 'inactive';
};



export default function UsersScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      initialize();
    }, [])
  );

  const initialize = async () => {
    console.log('[UsersScreen] Initializing. Current User Company ID:', user?.profile?.company_id);
    await Promise.all([loadUsers(), loadBranches()]);
  };

  const loadBranches = async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('branches').select('id, name').order('name');
      setBranches(data || []);
    } catch (error) {
      console.error('Error loading branches:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('[UsersScreen] Loading users...');
      const profiles = await AuthService.getAllUserProfiles();
      console.log('[UsersScreen] ✅ Profiles fetched:', profiles.length);

      // Log each user's details
      profiles.forEach((profile, index) => {
        console.log(`[UsersScreen] User ${index + 1}:`, {
          email: profile.email,
          name: profile.full_name,
          role_id: profile.role_id,
          role_name: profile.role?.name,
          company_id: profile.company_id,
        });
      });

      setUsers(profiles);
    } catch (error) {
      console.error('[UsersScreen] ❌ Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    console.log('[UsersScreen] 🔍 Filtering users. Total users:', users.length);

    const filtered = users.filter(u => {
      console.log(`[UsersScreen] Checking user: ${u.email}, role: ${u.role?.name || 'NO ROLE'}`);

      // 1. ONLY exclude company admins - show all other roles
      if (u.role?.name === 'company_admin') {
        console.log(`[UsersScreen] ❌ EXCLUDED (company admin): ${u.email}`);
        return false;
      }

      // 2. Apply search filter
      const matchesSearch =
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) {
        console.log(`[UsersScreen] ❌ EXCLUDED (search): ${u.email}`);
        return false;
      }

      console.log(`[UsersScreen] ✅ INCLUDED: ${u.email}`);
      return true;
    });

    console.log('[UsersScreen] 📊 Total filtered users:', filtered.length);
    return filtered;
  }, [users, searchQuery]);

  // Handlers
  const handleAddUser = () => {
    navigation.navigate('AddUser');
  };

  const handleEditUser = (user: UserProfile) => {
    navigation.navigate('UserDetail', { user });
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5F5F5' }} edges={['top', 'left', 'right']}>
      {/* Search Bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center gap-2">
          {/* Search Input */}
          <View className="flex-1 flex-row items-center bg-white rounded-lg px-3 py-2.5">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Search User"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity className="p-1">
              <Filter size={20} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            onPress={handleAddUser}
            className="w-11 h-11 rounded-lg items-center justify-center"
            style={{ backgroundColor: '#4CAF50' }}
          >
            <UserPlus size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* User List */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={initialize} />}
        style={{ flex: 1 }}
      >
        {filteredUsers.map(user => {
          const roleConfig = AVAILABLE_ROLES.find(r => r.value === user.role?.name);
          const branchName = branches.find(b => b.id === user.branch_id)?.name;

          return (
            <TouchableOpacity
              key={user.id}
              onPress={() => handleEditUser(user)}
              className="bg-white rounded-xl p-4 mb-3 flex-row items-center justify-between"
              style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
            >
              {/* Left: Avatar + Info */}
              <View className="flex-row items-center flex-1">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#4A90E2' }}
                >
                  <Text className="text-white font-bold text-base">
                    {getInitials(user.full_name || user.email)}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="font-semibold text-base" style={{ color: '#000000' }} numberOfLines={1}>
                    {user.full_name || 'Unknown User'}
                  </Text>
                  <Text className="text-sm" style={{ color: '#757575' }} numberOfLines={1}>
                    {branchName || 'No Branch'} , {roleConfig?.label || user.role?.name || 'No Role'}
                  </Text>
                </View>
              </View>

              <ChevronRight size={20} color="#757575" />
            </TouchableOpacity>
          );
        })}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <View className="items-center py-12">
            <Users size={48} color="#E5E7EB" />
            <Text className="text-gray-400 mt-4 text-center">
              {searchQuery ? 'No matching users found' : 'No team members yet'}
            </Text>
            {searchQuery && (
              <TouchableOpacity onPress={clearSearch} className="mt-3">
                <Text className="text-blue-600 font-medium">Clear search</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

