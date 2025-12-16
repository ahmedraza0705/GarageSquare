// ============================================
// BRANCHES SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Branch } from '@/types';
import { Ionicons } from '@expo/vector-icons';

export default function BranchesScreen() {
  // Initialize with Mock Data for Demo
  const [branches, setBranches] = useState<Branch[]>([
    { id: '1', name: 'Surat Branch', address: '1234, Main St. Vesu, Surat, Gujarat', manager_id: 'Ahmed Raza', is_active: true, created_at: '', updated_at: '', phone: '+91 96622 80843', email: 'ahmed.raza@gmail.com' },
    { id: '2', name: 'Surat Branch', address: 'Mustafa Noorani, Adajan', manager_id: 'Mustafa Noorani', is_active: true, created_at: '', updated_at: '', phone: '', email: '' },
    { id: '3', name: 'Mumbai Branch', address: 'Saafir Bhimani, Jogeshwari West', manager_id: 'Saafir Bhimani', is_active: true, created_at: '', updated_at: '', phone: '', email: '' },
    { id: '4', name: 'Mumbai Branch', address: 'Varun Makwana, Jogeshwari East', manager_id: 'Varun Makwana', is_active: true, created_at: '', updated_at: '', phone: '', email: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newManagerName, setNewManagerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    // Check for returning new branch data
    // @ts-ignore
    const unsubscribe = navigation.addListener('focus', () => {
      // We can't easily access route params here unless we use useRoute, 
      // but simpler is to use a global store or just check if we have a way to pass data back.
      // Actually, standard params passing: 
      // We need to use useRoute().params, but this is a top level screen. 
      // Let's assume we can get it via standard navigation prop access if typed, strictly speaking we need useRoute.
    });
    return unsubscribe;
  }, [navigation]);

  // Better way: useRoute()
  // But wait, we are in a tab navigator usually. 
  // Let's try to grab params from route 
  const route = useRoute();
  useEffect(() => {
    // @ts-ignore
    if (route.params?.newBranch) {
      // @ts-ignore
      setBranches(prev => [route.params.newBranch, ...prev]);
      // Clear param so we don't add it again on re-render?
      navigation.setParams({ newBranch: undefined } as any);
      Alert.alert('Success', 'New branch added successfully!');
    }
  }, [route.params]);

  const handleDeleteBranch = (id: string) => {
    const updatedBranches = branches.filter(b => b.id !== id);
    setBranches(updatedBranches);
  };

  const handleGoToUpload = () => {
    if (!newBranchName || !newBranchAddress || !newManagerName || !newPhone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const tempBranchData = {
      name: newBranchName,
      address: newBranchAddress,
      manager_id: newManagerName,
      phone: newPhone,
      is_active: true,
      email: newEmail
    };

    setModalVisible(false);

    // Reset form
    setNewBranchName('');
    setNewBranchAddress('');
    setNewManagerName('');
    setNewPhone('');
    setNewEmail('');

    // @ts-ignore
    navigation.navigate('BranchFileUpload', { branchData: tempBranchData });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (branch.address && branch.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => { }} />
        }
      >
        <View className="px-5 py-4">
          {/* Search Bar and Add Button */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-1 flex-row items-center bg-white rounded-xl px-4 py-3 mr-3 shadow-sm border border-gray-100">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Search Branch"
                className="flex-1 ml-2 text-gray-700 font-medium"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              className="bg-green-100 p-3 rounded-xl border border-green-200 shadow-sm"
              style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={24} color="#166534" />
            </TouchableOpacity>
          </View>

          {/* Branch List */}
          <View>
            {filteredBranches.map((branch) => (
              <TouchableOpacity
                key={branch.id}
                className="bg-white rounded-2xl p-4 mb-4 shadow-sm flex-row items-center border border-gray-100"
                onPress={() => (navigation as any).navigate('BranchDetails', { branch, onDelete: handleDeleteBranch })}
              >
                <View className="w-12 h-12 rounded-full bg-[#3B82F6] items-center justify-center mr-4">
                  <Text className="text-white font-bold text-sm">{getInitials(branch.name)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-0.5">
                    {branch.name}
                  </Text>
                  <Text className="text-gray-500 text-xs font-medium" numberOfLines={1}>
                    {branch.manager_id || 'No Manager'} , {branch.address?.split(',')[1]?.trim() || 'Location'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          {filteredBranches.length === 0 && (
            <View className="items-center py-12">
              <Text className="text-gray-500">No branches found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ADD BRANCH MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View className="bg-white w-full rounded-[20px] p-6 shadow-xl">
                <Text className="text-lg font-bold mb-4">Add New Branch</Text>

                <View className="space-y-4">
                  <View>
                    <Text className="text-gray-900 font-bold mb-1.5 text-sm">Branch Name*</Text>
                    <TextInput
                      placeholder="Enter Branch Name"
                      className="border border-gray-300 rounded-xl px-4 py-3 text-gray-700"
                      value={newBranchName}
                      onChangeText={setNewBranchName}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-900 font-bold mb-1.5 text-sm">Branch Address*</Text>
                    <TextInput
                      placeholder="Enter Branch Address"
                      className="border border-gray-300 rounded-xl px-4 py-3 text-gray-700"
                      value={newBranchAddress}
                      onChangeText={setNewBranchAddress}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-900 font-bold mb-1.5 text-sm">Branch Manager Name*</Text>
                    <TextInput
                      placeholder="Enter Manager Name"
                      className="border border-gray-300 rounded-xl px-4 py-3 text-gray-700"
                      value={newManagerName}
                      onChangeText={setNewManagerName}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-900 font-bold mb-1.5 text-sm">Phone NO*</Text>
                    <TextInput
                      placeholder="Enter Phone Number"
                      className="border border-gray-300 rounded-xl px-4 py-3 text-gray-700"
                      keyboardType="phone-pad"
                      value={newPhone}
                      onChangeText={setNewPhone}
                    />
                  </View>

                  <View>
                    <Text className="text-gray-900 font-bold mb-1.5 text-sm">Gmail*</Text>
                    <View className="border border-gray-300 rounded-xl px-4 py-3 flex-row justify-between items-center">
                      <TextInput
                        placeholder="Enter Gmail"
                        className="flex-1 text-gray-700 p-0"
                        value={newEmail}
                        onChangeText={setNewEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    className="border border-gray-300 rounded-xl py-3 items-center mt-2 w-32 content-center justify-center bg-white shadow-sm"
                    onPress={handleGoToUpload}
                  >
                    <Text className="font-bold text-gray-700">Add File</Text>
                  </TouchableOpacity>

                </View>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View >
  );
}