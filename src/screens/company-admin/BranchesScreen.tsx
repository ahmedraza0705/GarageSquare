// ============================================
// BRANCHES SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { BranchService } from '@/services/branch.service';
import { Branch } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function BranchesScreen() {
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      if (!supabase) {
        setBranches([]);
        return;
      }
      const data = await BranchService.getAllBranches();
      setBranches(data);
    } catch (error) {
      console.error('Error loading branches:', error);
      Alert.alert('Error', 'Failed to load branches');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBranches();
    setRefreshing(false);
  };

  const handleCreateBranch = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Branch Name is required');
      return;
    }

    try {
      setLoading(true);
      await BranchService.createBranch({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        company_id: user?.profile?.company_id,
        is_active: true,
      });

      Alert.alert('Success', 'Branch created successfully');
      setFormData({ name: '', address: '', phone: '', email: '' });
      setIsModalVisible(false);
      loadBranches();
    } catch (error) {
      console.error('Error creating branch:', error);
      Alert.alert('Error', 'Failed to create branch');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View className="flex-row justify-between items-center mb-6">
      <View>
        <Text className="text-2xl font-bold text-gray-900">Branch Management</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Manage your company branches and locations
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        className="bg-blue-600 px-6 py-3 rounded-lg flex-row items-center shadow-sm active:bg-blue-700"
      >
        <Text className="text-white font-semibold text-base">+ Add New Branch</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTable = () => (
    <View className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <View className="flex-row bg-gray-50 border-b border-gray-200 py-4 px-4 bg-gray-50">
        <View className="flex-2 w-1/3 pr-2"><Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name</Text></View>
        <View className="flex-2 w-1/3 pr-2"><Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</Text></View>
        <View className="flex-1 w-1/4 items-center"><Text className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</Text></View>
      </View>

      {/* Table Body */}
      {branches.length === 0 ? (
        <View className="py-12 items-center">
          <Text className="text-gray-400 text-base">No branches found. Add one to get started.</Text>
        </View>
      ) : (
        branches.map((branch, index) => (
          <View
            key={branch.id}
            className={`flex-row py-4 px-4 items-center ${index !== branches.length - 1 ? 'border-b border-gray-100' : ''
              }`}
          >
            {/* Name & Contact */}
            <View className="flex-2 w-1/3 pr-2">
              <Text className="text-sm font-semibold text-gray-900">{branch.name}</Text>
              {(branch.phone || branch.email) && (
                <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
                  {branch.phone || branch.email}
                </Text>
              )}
            </View>

            {/* Address */}
            <View className="flex-2 w-1/3 pr-2">
              <Text className="text-sm text-gray-600" numberOfLines={2}>
                {branch.address || '-'}
              </Text>
            </View>

            {/* Status */}
            <View className="flex-1 w-1/4 items-center">
              <View className={`px-2 py-1 rounded-full ${branch.is_active ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                <Text className={`text-[10px] font-bold ${branch.is_active ? 'text-green-800' : 'text-gray-600'
                  }`}>
                  {branch.is_active ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {renderHeader()}
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#2563eb" className="mt-12" />
        ) : (
          renderTable()
        )}
      </ScrollView>

      {/* Add Branch Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60 p-4">
          <View className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Modal Header */}
            <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
              <Text className="text-xl font-bold text-gray-900">Add New Branch</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)} className="p-2 bg-gray-100 rounded-full">
                <Text className="text-gray-500 font-bold text-xs">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Form */}
            <ScrollView className="p-6 max-h-[80%]">
              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Branch Name <Text className="text-red-500">*</Text></Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 focus:bg-white"
                  placeholder="e.g. Main Office"
                  value={formData.name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                />
              </View>

              <View className="mb-5">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Address</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 focus:bg-white"
                  placeholder="e.g. 123 Business Rd, Tech City"
                  multiline
                  numberOfLines={2}
                  style={{ textAlignVertical: 'top' }}
                  value={formData.address}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                />
              </View>

              <View className="flex-row gap-4 mb-2">
                <View className="flex-1 mb-5">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Phone</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 focus:bg-white"
                    placeholder="(555) 123-4567"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                  />
                </View>
                <View className="flex-1 mb-5">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-blue-500 focus:bg-white"
                    placeholder="branch@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row pt-4 justify-end gap-3 border-t border-gray-100">
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  className="px-6 py-3 rounded-xl bg-gray-100 active:bg-gray-200"
                >
                  <Text className="font-semibold text-gray-700">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreateBranch}
                  className="px-6 py-3 rounded-xl bg-blue-600 shadow-sm active:bg-blue-700"
                >
                  <Text className="font-semibold text-white">Create Branch</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
