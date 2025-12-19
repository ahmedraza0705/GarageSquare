// ============================================
// ENHANCED USER MANAGEMENT SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, TextInput, Modal, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProfile, RoleName } from '@/types';
import { AuthService } from '@/services/auth.service';
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
  // State
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    role: '' as RoleName | '',
    branch_id: '',
  });

  // Search/Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterType>({
    role: '',
    branch: '',
    status: 'all',
  });

  // Bulk Selection State
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Action Menu State
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
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
      const profiles = await AuthService.getAllUserProfiles();
      setUsers(profiles);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Search filter
      const matchesSearch =
        u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      // Role filter
      const matchesRole = !filters.role || u.role?.name === filters.role;

      // Branch filter
      const matchesBranch = !filters.branch || u.branch_id === filters.branch;

      // Status filter
      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'active' && u.is_active) ||
        (filters.status === 'inactive' && !u.is_active);

      return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });
  }, [users, searchQuery, filters]);

  // Handlers
  const openAddModal = () => {
    setEditingUser(null);
    setForm({ full_name: '', phone: '', email: '', password: '', role: '', branch_id: '' });
    setShowModal(true);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      email: user.email,
      password: '',
      role: (user.role?.name as RoleName) || '',
      branch_id: user.branch_id || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    // Validation
    if (!form.full_name.trim() || !form.email.trim() || !form.role) {
      Alert.alert('Missing Fields', 'Name, Email, and Role are required.');
      return;
    }
    if (!editingUser && !form.password) {
      Alert.alert('Missing Password', 'Password is required for new users.');
      return;
    }

    try {
      setSaving(true);
      if (editingUser) {
        await AuthService.updateUserProfile(editingUser.id, {
          email: form.email !== editingUser.email ? form.email : undefined,
          full_name: form.full_name,
          phone: form.phone,
          role: form.role as RoleName,
          branch_id: form.branch_id || null,
        });
        Alert.alert('Success', 'Profile updated.');
      } else {
        await AuthService.createUserWithProfile({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          phone: form.phone,
          role: form.role as RoleName,
          branch_id: form.branch_id || undefined,
        });
        Alert.alert('Success', 'User created.');
      }
      setShowModal(false);
      loadUsers();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    const action = user.is_active ? 'deactivate' : 'reactivate';
    Alert.alert(
      `${action === 'deactivate' ? 'Deactivate' : 'Reactivate'} User`,
      `Are you sure you want to ${action} ${user.full_name || user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'deactivate' ? 'Deactivate' : 'Reactivate',
          style: action === 'deactivate' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              if (action === 'deactivate') {
                await AuthService.deactivateUser(user.id);
              } else {
                await AuthService.reactivateUser(user.id);
              }
              Alert.alert('Success', `User ${action}d successfully.`);
              loadUsers();
            } catch (error: any) {
              Alert.alert('Error', error.message || `Failed to ${action} user.`);
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = async (user: UserProfile) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to permanently delete ${user.full_name || user.email}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.deleteUser(user.id);
              Alert.alert('Success', 'User deleted successfully.');
              loadUsers();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete user.');
            }
          },
        },
      ]
    );
  };

  const handleBulkAction = (action: 'role' | 'branch' | 'activate' | 'deactivate') => {
    const selectedUserIds = Array.from(selectedUsers);

    if (action === 'activate' || action === 'deactivate') {
      Alert.alert(
        `${action === 'activate' ? 'Activate' : 'Deactivate'} Users`,
        `${action === 'activate' ? 'Activate' : 'Deactivate'} ${selectedUserIds.length} selected users?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: action === 'activate' ? 'Activate' : 'Deactivate',
            onPress: async () => {
              try {
                await AuthService.bulkUpdateUsers(selectedUserIds, {
                  is_active: action === 'activate',
                });
                Alert.alert('Success', `${selectedUserIds.length} users ${action}d.`);
                setSelectedUsers(new Set());
                setShowBulkActions(false);
                loadUsers();
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Bulk action failed.');
              }
            },
          },
        ]
      );
    }
    // TODO: Implement role and branch bulk actions with picker
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
      setShowBulkActions(true);
    }
  };

  const clearFilters = () => {
    setFilters({ role: '', branch: '', status: 'all' });
    setSearchQuery('');
  };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const roleColor = (role?: string) => {
    const found = AVAILABLE_ROLES.find(r => r.value === role);
    return found ? found.color : '#6B7280';
  };

  const formatLastLogin = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const activeFiltersCount = [filters.role, filters.branch, filters.status !== 'all'].filter(Boolean).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">User Management</Text>
          <Text className="text-gray-500 text-sm">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
            {selectedUsers.size > 0 && ` • ${selectedUsers.size} selected`}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full ${activeFiltersCount > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}
          >
            <Filter size={20} color={activeFiltersCount > 0 ? '#2563EB' : '#6B7280'} />
            {activeFiltersCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-blue-600 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">{activeFiltersCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <View className="bg-blue-50 p-2 rounded-full">
            <Users size={24} color="#2563EB" />
          </View>
        </View>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View className="px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm font-semibold text-gray-700">Filters</Text>
            {activeFiltersCount > 0 && (
              <TouchableOpacity onPress={clearFilters}>
                <Text className="text-blue-600 text-sm font-medium">Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Status Filter */}
          <View className="mb-3">
            <Text className="text-xs font-medium text-gray-600 mb-2">Status</Text>
            <View className="flex-row gap-2">
              {['all', 'active', 'inactive'].map(status => (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFilters({ ...filters, status: status as any })}
                  className={`px-4 py-2 rounded-lg border ${filters.status === status
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-200'
                    }`}
                >
                  <Text
                    className={`text-sm font-medium capitalize ${filters.status === status ? 'text-white' : 'text-gray-700'
                      }`}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Role Filter */}
          <View className="mb-3">
            <Text className="text-xs font-medium text-gray-600 mb-2">Role</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, role: '' })}
                className={`mr-2 px-4 py-2 rounded-lg border ${!filters.role ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-200'
                  }`}
              >
                <Text className={!filters.role ? 'text-white font-medium' : 'text-gray-600 font-medium'}>
                  All Roles
                </Text>
              </TouchableOpacity>
              {AVAILABLE_ROLES.map(role => (
                <TouchableOpacity
                  key={role.value}
                  onPress={() => setFilters({ ...filters, role: role.value })}
                  className={`mr-2 px-4 py-2 rounded-lg border`}
                  style={{
                    backgroundColor: filters.role === role.value ? role.color : 'white',
                    borderColor: filters.role === role.value ? role.color : '#E5E7EB',
                  }}
                >
                  <Text
                    className="font-medium"
                    style={{ color: filters.role === role.value ? 'white' : '#374151' }}
                  >
                    {role.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Branch Filter */}
          <View>
            <Text className="text-xs font-medium text-gray-600 mb-2">Branch</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, branch: '' })}
                className={`mr-2 px-4 py-2 rounded-lg border ${!filters.branch ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-200'
                  }`}
              >
                <Text className={!filters.branch ? 'text-white font-medium' : 'text-gray-600 font-medium'}>
                  All Branches
                </Text>
              </TouchableOpacity>
              {branches.map(branch => (
                <TouchableOpacity
                  key={branch.id}
                  onPress={() => setFilters({ ...filters, branch: branch.id })}
                  className={`mr-2 px-4 py-2 rounded-lg border ${filters.branch === branch.id
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-200'
                    }`}
                >
                  <Text
                    className={`font-medium ${filters.branch === branch.id ? 'text-white' : 'text-gray-600'
                      }`}
                  >
                    {branch.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Search Bar */}
      <View className="px-6 py-4">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {filteredUsers.length > 0 && (
            <TouchableOpacity onPress={toggleSelectAll} className="ml-2">
              {selectedUsers.size === filteredUsers.length ? (
                <CheckSquare size={22} color="#2563EB" />
              ) : (
                <Square size={22} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <View className="px-6 py-3 bg-blue-50 border-t border-b border-blue-100">
          <View className="flex-row items-center justify-between">
            <Text className="text-blue-900 font-semibold">
              {selectedUsers.size} selected
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => handleBulkAction('activate')}
                className="px-3 py-2 bg-green-600 rounded-lg"
              >
                <Text className="text-white text-sm font-medium">Activate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleBulkAction('deactivate')}
                className="px-3 py-2 bg-orange-600 rounded-lg"
              >
                <Text className="text-white text-sm font-medium">Deactivate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* User List */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={initialize} />}
      >
        {filteredUsers.map(user => {
          const roleConfig = AVAILABLE_ROLES.find(r => r.value === user.role?.name);
          const branchName = branches.find(b => b.id === user.branch_id)?.name;
          const isSelected = selectedUsers.has(user.id);

          return (
            <TouchableOpacity
              key={user.id}
              onPress={() => toggleUserSelection(user.id)}
              className={`bg-white rounded-xl p-4 mb-4 shadow-sm border ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100'
                }`}
            >
              {/* Card Header */}
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-row items-center flex-1">
                  {/* Selection Checkbox */}
                  <View className="mr-3">
                    {isSelected ? (
                      <CheckSquare size={24} color="#2563EB" />
                    ) : (
                      <Square size={24} color="#D1D5DB" />
                    )}
                  </View>

                  {/* Avatar */}
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: `${roleConfig?.color || '#6B7280'}20` }}
                  >
                    <Text className="text-lg font-bold" style={{ color: roleConfig?.color || '#6B7280' }}>
                      {getInitials(user.full_name || user.email)}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                        {user.full_name || 'Unknown User'}
                      </Text>
                      {/* Status Indicator */}
                      <View
                        className={`ml-2 w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                      />
                    </View>
                    <View className="flex-row items-center mt-1">
                      <View
                        className="px-2 py-0.5 rounded-md mr-2"
                        style={{ backgroundColor: `${roleConfig?.color || '#6B7280'}15` }}
                      >
                        <Text
                          className="text-xs font-semibold capitalize"
                          style={{ color: roleConfig?.color || '#6B7280' }}
                        >
                          {roleConfig?.label || user.role?.name || 'No Role'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Action Menu */}
                <View className="relative">
                  <TouchableOpacity
                    onPress={() => setActiveMenuUserId(activeMenuUserId === user.id ? null : user.id)}
                    className="p-2 bg-gray-50 rounded-lg"
                  >
                    <MoreVertical size={18} color="#4B5563" />
                  </TouchableOpacity>

                  {activeMenuUserId === user.id && (
                    <View className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-[160px]">
                      <TouchableOpacity
                        onPress={() => {
                          setActiveMenuUserId(null);
                          openEditModal(user);
                        }}
                        className="flex-row items-center px-4 py-3 border-b border-gray-100"
                      >
                        <Edit2 size={16} color="#4B5563" />
                        <Text className="ml-2 text-gray-700 font-medium">Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setActiveMenuUserId(null);
                          handleToggleStatus(user);
                        }}
                        className="flex-row items-center px-4 py-3 border-b border-gray-100"
                      >
                        {user.is_active ? (
                          <>
                            <UserX size={16} color="#F59E0B" />
                            <Text className="ml-2 text-orange-600 font-medium">Deactivate</Text>
                          </>
                        ) : (
                          <>
                            <UserCheck size={16} color="#10B981" />
                            <Text className="ml-2 text-green-600 font-medium">Activate</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setActiveMenuUserId(null);
                          handleDeleteUser(user);
                        }}
                        className="flex-row items-center px-4 py-3"
                      >
                        <Trash2 size={16} color="#EF4444" />
                        <Text className="ml-2 text-red-600 font-medium">Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Card Body */}
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Mail size={16} color="#9CA3AF" className="mr-2" />
                  <Text className="text-gray-600 text-sm ml-2">{user.email}</Text>
                </View>

                {user.phone && (
                  <View className="flex-row items-center">
                    <Phone size={16} color="#9CA3AF" className="mr-2" />
                    <Text className="text-gray-600 text-sm ml-2">{user.phone}</Text>
                  </View>
                )}

                <View className="flex-row items-center">
                  <Building2 size={16} color="#9CA3AF" className="mr-2" />
                  <Text className={`text-sm ml-2 ${branchName ? 'text-gray-600' : 'text-gray-400 italic'}`}>
                    {branchName || 'No Branch Assigned'}
                  </Text>
                </View>

                {/* Last Login */}
                <View className="flex-row items-center">
                  <Clock size={16} color="#9CA3AF" className="mr-2" />
                  <Text className="text-gray-500 text-xs ml-2">
                    Last login: {formatLastLogin(user.last_login_at)}
                  </Text>
                </View>

                {/* Inactive Warning */}
                {!user.is_active && (
                  <View className="flex-row items-center mt-2 bg-orange-50 px-3 py-2 rounded-lg">
                    <AlertCircle size={16} color="#F59E0B" />
                    <Text className="text-orange-700 text-xs ml-2 font-medium">
                      This user is deactivated
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <View className="items-center py-12">
            <Users size={48} color="#E5E7EB" />
            <Text className="text-gray-400 mt-4 text-center">
              {searchQuery || activeFiltersCount > 0 ? 'No matching users found' : 'No team members yet'}
            </Text>
            {(searchQuery || activeFiltersCount > 0) && (
              <TouchableOpacity onPress={clearFilters} className="mt-3">
                <Text className="text-blue-600 font-medium">Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={openAddModal}
        className="absolute bottom-6 right-6 w-14 h-14 bg-[#4682B4] rounded-full items-center justify-center shadow-lg mb-16"
      >
        <UserPlus size={24} color="white" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
            <Text className="text-xl font-bold text-gray-900">
              {editingUser ? 'Edit Profile' : 'New Team Member'}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)} className="p-2 bg-gray-100 rounded-full">
              <X size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 py-6">
            {/* Full Name */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Full Name</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <Users size={20} color="#9CA3AF" />
                <TextInput
                  value={form.full_name}
                  onChangeText={t => setForm({ ...form, full_name: t })}
                  placeholder="e.g. John Doe"
                  className="flex-1 ml-3 text-base text-gray-900"
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Email Address</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <Mail size={20} color="#9CA3AF" />
                <TextInput
                  value={form.email}
                  onChangeText={t => setForm({ ...form, email: t.trim().toLowerCase() })}
                  placeholder="john@company.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 ml-3 text-base text-gray-900"
                />
              </View>
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-1.5">Phone (Optional)</Text>
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                <Phone size={20} color="#9CA3AF" />
                <TextInput
                  value={form.phone}
                  onChangeText={t => setForm({ ...form, phone: t })}
                  placeholder="+1 (555) 000-0000"
                  keyboardType="phone-pad"
                  className="flex-1 ml-3 text-base text-gray-900"
                />
              </View>
            </View>

            {/* Password (Only for New Users) */}
            {!editingUser && (
              <View className="mb-6">
                <Text className="text-sm font-medium text-gray-700 mb-1.5">Temporary Password</Text>
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                  <Shield size={20} color="#9CA3AF" />
                  <TextInput
                    value={form.password}
                    onChangeText={t => setForm({ ...form, password: t })}
                    placeholder="Create a secure password"
                    secureTextEntry
                    className="flex-1 ml-3 text-base text-gray-900"
                  />
                </View>
              </View>
            )}

            {/* Role Selection */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Role</Text>
              <View className="flex-row flex-wrap">
                {AVAILABLE_ROLES.map(role => {
                  const isSelected = form.role === role.value;
                  return (
                    <TouchableOpacity
                      key={role.value}
                      onPress={() => setForm({ ...form, role: role.value })}
                      className="mr-2 mb-2 px-4 py-2 rounded-full border"
                      style={{
                        backgroundColor: isSelected ? role.color : 'white',
                        borderColor: isSelected ? role.color : '#E5E7EB'
                      }}
                    >
                      <Text
                        className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}
                      >
                        {role.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Branch Selection */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Assign Branch</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  onPress={() => setForm({ ...form, branch_id: '' })}
                  className={`mr-2 px-4 py-3 rounded-xl border ${!form.branch_id ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-200'}`}
                >
                  <Text className={!form.branch_id ? 'text-white font-medium' : 'text-gray-600 font-medium'}>
                    No Branch
                  </Text>
                </TouchableOpacity>
                {branches.map(branch => (
                  <TouchableOpacity
                    key={branch.id}
                    onPress={() => setForm({ ...form, branch_id: branch.id })}
                    className={`mr-2 px-4 py-3 rounded-xl border ${form.branch_id === branch.id ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                  >
                    <Text className={form.branch_id === branch.id ? 'text-white font-medium' : 'text-gray-600 font-medium'}>
                      {branch.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

          </ScrollView>

          {/* Footer Actions */}
          <View className="p-6 border-t border-gray-100">
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className={`w-full py-4 rounded-xl items-center flex-row justify-center ${saving ? 'bg-blue-400' : 'bg-blue-600'}`}
            >
              {saving ? (
                <Text className="text-white font-bold text-lg">Saving...</Text>
              ) : (
                <>
                  <Check size={20} color="white" className="mr-2" />
                  <Text className="text-white font-bold text-lg ml-2">
                    {editingUser ? 'Save Changes' : 'Create User'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
