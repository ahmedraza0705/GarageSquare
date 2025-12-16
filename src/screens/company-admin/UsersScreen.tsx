// ============================================
// USER MANAGEMENT SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, TextInput, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserProfile, RoleName } from '@/types';
import { AuthService } from '@/services/auth.service';
import { supabase } from '@/lib/supabase';
// Icons
import {
  Users,
  UserPlus,
  Search,
  MapPin,
  Phone,
  Mail,
  Shield,
  Edit2,
  X,
  Check,
  Building2,
  ChevronDown
} from 'lucide-react-native';

// Constants
const AVAILABLE_ROLES: { value: RoleName; label: string; color: string }[] = [
  { value: 'manager', label: 'Manager', color: '#2563EB' },
  { value: 'supervisor', label: 'Supervisor', color: '#7C3AED' },
  { value: 'technician_group_manager', label: 'Tech Lead', color: '#059669' },
  { value: 'technician', label: 'Technician', color: '#D97706' },
  { value: 'customer', label: 'Customer', color: '#4B5563' },
];

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

  // Search/Filter State (Bonus UX)
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
    return users.filter(u =>
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const roleColor = (role?: string) => {
    const found = AVAILABLE_ROLES.find(r => r.value === role);
    return found ? found.color : '#6B7280';
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-gray-900">Team Members</Text>
          <Text className="text-gray-500 text-sm">
            {users.length} {users.length === 1 ? 'user' : 'users'} total
          </Text>
        </View>
        <View className="bg-blue-50 p-2 rounded-full">
          <Users size={24} color="#2563EB" />
        </View>
      </View>

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
        </View>
      </View>

      {/* User List */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={initialize} />}
      >
        {filteredUsers.map(user => {
          const roleConfig = AVAILABLE_ROLES.find(r => r.value === user.role?.name);
          const branchName = branches.find(b => b.id === user.branch_id)?.name;

          return (
            <View key={user.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
              {/* Card Header */}
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-row items-center flex-1">
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
                    <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                      {user.full_name || 'Unknown User'}
                    </Text>
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
                      {/* Status Dot */}
                      {/* <Virew className={`w-2 h-2 rounded-full ${user.role?.name ? 'bg-green-500' : 'bg-yellow-400'}`} /> */}
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => openEditModal(user)}
                  className="p-2 bg-gray-50 rounded-lg"
                >
                  <Edit2 size={18} color="#4B5563" />
                </TouchableOpacity>
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
              </View>
            </View>
          );
        })}

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <View className="items-center py-12">
            <Users size={48} color="#E5E7EB" />
            <Text className="text-gray-400 mt-4 text-center">
              {searchQuery ? 'No matching users found' : 'No team members yet'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={openAddModal}
        className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg elevation-5"
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
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 focus:border-blue-500 focus:bg-white text-gray-700 font-bold">
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
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-700 font-bold">
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
              <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-700 font-bold">
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
                <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 text-gray-700 font-bold">
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
                      className={`mr-2 mb-2 px-4 py-2 rounded-full border ${isSelected
                        ? `bg-[${role.color}] border-[${role.color}]`
                        : 'bg-white border-gray-200'
                        }`}
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
