// ============================================
// ENHANCED USER MANAGEMENT SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, TextInput, Modal, Platform, Switch } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
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
  const { theme, themeName } = useTheme();
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

      return matchesSearch;
    });
  }, [users, searchQuery]);

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

  const clearSearch = () => {
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

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Search Bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center gap-2">
          {/* Search Input */}
          <View style={{ backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }} className="flex-1 flex-row items-center rounded-lg px-3 py-2.5">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              style={{ color: theme.text }}
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
            onPress={openAddModal}
            className="w-11 h-11 rounded-lg items-center justify-center"
            style={{ backgroundColor: '#4CAF50' }}
          >
            <UserPlus size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>



      {/* User List */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={initialize} />}
      >
        {filteredUsers.map(user => {
          const roleConfig = AVAILABLE_ROLES.find(r => r.value === user.role?.name);
          const branchName = branches.find(b => b.id === user.branch_id)?.name;

          return (
            <TouchableOpacity
              key={user.id}
              onPress={() => openEditModal(user)}
              className="rounded-xl p-4 mb-3 flex-row items-center justify-between"
              style={{ backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
            >
              {/* Left: Avatar + Info */}
              <View className="flex-row items-center flex-1">
                {/* Circular Avatar */}
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: '#4A90E2' }}
                >
                  <Text className="text-white font-bold text-base">
                    {getInitials(user.full_name || user.email)}
                  </Text>
                </View>

                {/* User Info */}
                <View className="flex-1">
                  <Text className="font-semibold text-base" style={{ color: theme.text }} numberOfLines={1}>
                    {user.full_name || 'Unknown User'}
                  </Text>
                  <Text className="text-sm" style={{ color: theme.textMuted }} numberOfLines={1}>
                    {branchName || 'No Branch'} , {roleConfig?.label || user.role?.name || 'No Role'}
                  </Text>
                </View>
              </View>

              {/* Right: Chevron */}
              <ChevronRight size={20} color={theme.textMuted} />
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



      {/* Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }}>
          <View style={{ borderBottomColor: theme.border }} className="px-6 py-4 border-b flex-row justify-between items-center">
            <Text style={{ color: theme.text }} className="text-xl font-bold">
              {editingUser ? 'Edit Profile' : 'New Team Member'}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)} style={{ backgroundColor: theme.surfaceAlt }} className="p-2 rounded-full">
              <X size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 py-6">
            {/* Full Name */}
            <View className="mb-4">
              <Text style={{ color: theme.textMuted }} className="text-sm font-medium mb-1.5">Full Name</Text>
              <View style={{ borderColor: theme.border, backgroundColor: theme.surface }} className="flex-row items-center border rounded-xl px-4 py-3">
                <Users size={20} color="#9CA3AF" />
                <TextInput
                  value={form.full_name}
                  onChangeText={t => setForm({ ...form, full_name: t })}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={theme.textMuted}
                  style={{ color: theme.text }}
                  className="flex-1 ml-3 text-base"
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text style={{ color: theme.textMuted }} className="text-sm font-medium mb-1.5">Email Address</Text>
              <View style={{ borderColor: theme.border, backgroundColor: theme.surface }} className="flex-row items-center border rounded-xl px-4 py-3">
                <Mail size={20} color="#9CA3AF" />
                <TextInput
                  value={form.email}
                  onChangeText={t => setForm({ ...form, email: t.trim().toLowerCase() })}
                  placeholder="john@company.com"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ color: theme.text }}
                  className="flex-1 ml-3 text-base"
                />
              </View>
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text style={{ color: theme.textMuted }} className="text-sm font-medium mb-1.5">Phone (Optional)</Text>
              <View style={{ borderColor: theme.border, backgroundColor: theme.surface }} className="flex-row items-center border rounded-xl px-4 py-3">
                <Phone size={20} color="#9CA3AF" />
                <TextInput
                  value={form.phone}
                  onChangeText={t => setForm({ ...form, phone: t })}
                  placeholder="+1 (555) 000-0000"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="phone-pad"
                  style={{ color: theme.text }}
                  className="flex-1 ml-3 text-base"
                />
              </View>
            </View>

            {/* Password (Only for New Users) */}
            {!editingUser && (
              <View className="mb-6">
                <Text style={{ color: theme.textMuted }} className="text-sm font-medium mb-1.5">Temporary Password</Text>
                <View style={{ borderColor: theme.border, backgroundColor: theme.surface }} className="flex-row items-center border rounded-xl px-4 py-3">
                  <Shield size={20} color="#9CA3AF" />
                  <TextInput
                    value={form.password}
                    onChangeText={t => setForm({ ...form, password: t })}
                    placeholder="Create a secure password"
                    placeholderTextColor={theme.textMuted}
                    secureTextEntry
                    style={{ color: theme.text }}
                    className="flex-1 ml-3 text-base"
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
                    style={{
                      backgroundColor: form.branch_id === branch.id ? '#1e40af' : theme.surface,
                      borderColor: form.branch_id === branch.id ? '#1e40af' : theme.border,
                      borderWidth: 1
                    }}
                    className={`mr-2 px-4 py-3 rounded-xl`}
                  >
                    <Text
                      style={{ color: form.branch_id === branch.id ? '#ffffff' : theme.text }}
                      className="font-medium"
                    >
                      {branch.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

          </ScrollView>

          {/* Footer Actions */}
          <View style={{ borderTopColor: theme.border, backgroundColor: theme.surface }} className="p-6 border-t font-medium">
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
