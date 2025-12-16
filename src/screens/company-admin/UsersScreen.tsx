// ============================================
// USER MANAGEMENT SCREEN (Company Admin)
// Shows which user works in which branch
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, TextInput } from 'react-native';
import { UserProfile, RoleName } from '@/types';
import { AuthService } from '@/services/auth.service';
import { supabase } from '@/lib/supabase';

const AVAILABLE_ROLES: { value: RoleName; label: string }[] = [
  { value: 'manager', label: 'Manager' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'technician_group_manager', label: 'Technician Group Manager' },
  { value: 'technician', label: 'Technician' },
  { value: 'customer', label: 'Customer' },
];

export default function UsersScreen() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    role: '' as RoleName | '',
  });

  useEffect(() => {
    const initialize = async () => {
      await loadUsers();
    };
    initialize();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const profiles = await AuthService.getAllUserProfiles();
      setUsers(profiles);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, roleName: RoleName) => {
    try {
      await AuthService.assignRoleToUser(userId, roleName);
      Alert.alert('Success', `Role assigned successfully!`);
      setEditingUserId(null);
      await loadUsers(); // Reload users
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to assign role');
    }
  };

  const refreshData = async () => {
    await loadUsers();
  };

  const validateForm = () => {
    if (!form.full_name.trim()) {
      Alert.alert('Validation', 'Please enter a name.');
      return false;
    }
    if (!form.email.trim()) {
      Alert.alert('Validation', 'Please enter an email.');
      return false;
    }
    if (!form.role) {
      Alert.alert('Validation', 'Please select a role.');
      return false;
    }
    return true;
  };

  const handleAddEmployee = async () => {
    if (!validateForm()) return;

    try {
      setAdding(true);

      // Call the Edge Function (must be deployed; uses service role on the server)
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }

      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: form.email.trim().toLowerCase(),
          password: form.password,
          full_name: form.full_name,
          phone: form.phone,
          company_id: null, // replace if you collect company_id; server should validate
          role_name: form.role,
        },
      });

      if (error || (data as any)?.error) {
        console.error('create-user error', { data, error });
      }

      Alert.alert('Success', 'User created and role assigned.');
      setForm({ full_name: '', phone: '', email: '', password: '', role: '' });
      setShowAddForm(false);
      await loadUsers();
    } catch (err: any) {
      const message = err?.message || 'Failed to add employee.';
      Alert.alert('Error', message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refreshData} />
      }
    >
      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          User Management
        </Text>
        <Text className="text-gray-600 text-sm mb-4">
          View and manage users. Add new employees from here.
        </Text>

        {/* Add Employee button */}
        <TouchableOpacity
          className="bg-blue-600 rounded-lg px-4 py-3 mb-4"
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text className="text-white font-semibold text-center">
            {showAddForm ? 'Close Add Employee' : 'Add Employee'}
          </Text>
        </TouchableOpacity>

        {/* Add Employee form */}
        {showAddForm && (
          <View className="bg-white rounded-lg p-4 mb-6 shadow-sm border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Add Employee</Text>

            <View className="mb-3">
              <Text className="text-sm text-gray-700 mb-1">Name*</Text>
              <TextInput
                value={form.full_name}
                onChangeText={(text) => setForm({ ...form, full_name: text })}
                placeholder="Enter name"
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </View>

            <View className="mb-3">
              <Text className="text-sm text-gray-700 mb-1">Phone</Text>
              <TextInput
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
                placeholder="Enter phone"
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </View>

            <View className="mb-3">
              <Text className="text-sm text-gray-700 mb-1">Email*</Text>
              <TextInput
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text.trim().toLowerCase() })}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </View>

            <View className="mb-3">
              <Text className="text-sm text-gray-700 mb-1">Password</Text>
              <TextInput
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
                placeholder="(User sets this when signing up)"
                secureTextEntry
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </View>

            <View className="mb-3">
              <Text className="text-sm text-gray-700 mb-2">Role*</Text>
              {AVAILABLE_ROLES.map((role) => {
                const selected = form.role === role.value;
                return (
                  <TouchableOpacity
                    key={role.value}
                    onPress={() => setForm({ ...form, role: role.value })}
                    className={`p-3 mb-2 rounded-lg border ${selected ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'
                      }`}
                  >
                    <Text className={`${selected ? 'text-blue-700 font-semibold' : 'text-gray-900'}`}>
                      {role.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              className="bg-blue-600 rounded-lg px-4 py-3"
              onPress={handleAddEmployee}
              disabled={adding}
            >
              <Text className="text-white font-semibold text-center">
                {adding ? 'Adding...' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {users.map((user) => {
          const currentRole = user.role?.name as RoleName | undefined;
          const isPending = !currentRole || user.role_id === 'pending';

          return (
            <View
              key={user.id}
              className={`bg-white rounded-lg p-4 mb-4 shadow-sm ${isPending ? 'border-2 border-yellow-400' : ''
                }`}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900 mb-1">
                    {user.full_name || user.email}
                  </Text>
                  <Text className="text-gray-600 text-sm mb-1">
                    {user.email}
                  </Text>
                  {user.phone && (
                    <Text className="text-gray-600 text-sm mb-2">
                      📞 {user.phone}
                    </Text>
                  )}

                  {/* Branch Information (basic display using branch_id) */}
                  <View className="mt-2 mb-2">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-gray-500 text-sm font-medium mr-2">
                        Branch:
                      </Text>
                      <View className="px-3 py-1 rounded-full bg-gray-100">
                        <Text className="text-sm font-semibold text-gray-600">
                          {user.branch_id || 'No Branch Assigned'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Role Information */}
                  {currentRole && (
                    <View className="mt-1">
                      <View className="flex-row items-center">
                        <Text className="text-gray-500 text-sm font-medium mr-2">
                          Role:
                        </Text>
                        <Text className="text-gray-900 text-sm font-semibold capitalize">
                          {currentRole.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
                {isPending && (
                  <View className="bg-yellow-100 px-2 py-1 rounded">
                    <Text className="text-yellow-800 text-xs font-semibold">
                      PENDING
                    </Text>
                  </View>
                )}
              </View>

              {currentRole ? (
                <View className="mt-2">
                  <Text className="text-gray-600 text-sm mb-2 capitalize">
                    Current Role: {currentRole.replace('_', ' ')}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setEditingUserId(editingUserId === user.id ? null : user.id)}
                    className="bg-blue-50 border border-blue-200 rounded-lg p-2"
                  >
                    <Text className="text-blue-600 text-sm font-medium text-center">
                      {editingUserId === user.id ? 'Cancel' : 'Change Role'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="mt-2">
                  <Text className="text-yellow-700 text-sm mb-2 font-medium">
                    ⚠️ No role assigned - Please assign a role
                  </Text>
                  <TouchableOpacity
                    onPress={() => setEditingUserId(editingUserId === user.id ? null : user.id)}
                    className="bg-blue-500 rounded-lg p-2"
                  >
                    <Text className="text-white text-sm font-medium text-center">
                      {editingUserId === user.id ? 'Cancel' : 'Assign Role'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {editingUserId === user.id && (
                <View className="mt-3 border-t border-gray-200 pt-3">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Select Role:
                  </Text>
                  {AVAILABLE_ROLES.map((role) => (
                    <TouchableOpacity
                      key={role.value}
                      onPress={() => assignRole(user.id, role.value)}
                      className={`p-3 mb-2 rounded-lg border ${currentRole === role.value
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      <Text className={`${currentRole === role.value
                          ? 'text-blue-700 font-semibold'
                          : 'text-gray-900'
                        }`}>
                        {role.label}
                        {currentRole === role.value && ' (Current)'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {users.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-gray-500">No users found</Text>
            <Text className="text-gray-400 text-sm mt-2">
              Users will appear here after they sign up
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

