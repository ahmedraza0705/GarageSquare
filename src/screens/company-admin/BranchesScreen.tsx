// ============================================
// BRANCHES SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Branch } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { branchService } from '@/services/branchService';

export default function BranchesScreen() {
  // State - now fetched from Supabase
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newManagerName, setNewManagerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const navigation = useNavigation();
  const { theme, toggleTheme, themeName } = useTheme();

  // Fetch branches from Supabase
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await branchService.getAllBranches();
      setBranches(data);
    } catch (error) {
      console.error('Error loading branches:', error);
      Alert.alert('Error', 'Failed to load branches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load branches on mount
  useEffect(() => {
    fetchBranches();
  }, []);

  // Handle new branch from navigation params
  const route = useRoute();
  useEffect(() => {
    // @ts-ignore
    if (route.params?.newBranch) {
      // Refresh the entire list to get latest data from Supabase
      fetchBranches();
      navigation.setParams({ newBranch: undefined } as any);
      Alert.alert('Success', 'New branch added successfully!');
    }
  }, [route.params]);

  const handleDeleteBranch = async (id: string) => {
    try {
      await branchService.deleteBranch(id);
      setBranches(prev => prev.filter(b => b.id !== id));
      Alert.alert('Success', 'Branch deleted successfully');
    } catch (error) {
      console.error('Error deleting branch:', error);
      Alert.alert('Error', 'Failed to delete branch. Please try again.');
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {};
    if (!newBranchName) newErrors.name = true;
    if (!newBranchAddress) newErrors.address = true;
    if (!newManagerName) newErrors.manager = true;
    if (!newPhone) newErrors.phone = true;
    if (!newEmail) newErrors.email = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoToUpload = () => {
    if (!validateForm()) {
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
    resetForm();

    // @ts-ignore
    navigation.navigate('BranchFileUpload', { branchData: tempBranchData });
  };


  const handleFinish = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log('Creating branch with data:', { newBranchName, newBranchAddress, newPhone, newEmail });

      const newBranchData = {
        name: newBranchName,
        address: newBranchAddress,
        phone: newPhone,
        email: newEmail,
        is_active: true,
        manager_id: undefined // Explicitly undefined to avoid FK constraint issues
      };

      await branchService.createBranch(newBranchData);

      setModalVisible(false);
      resetForm();

      // Refresh list
      await fetchBranches();
      Alert.alert('Success', 'Branch created successfully');
    } catch (error: any) {
      console.error('Error creating branch:', error);
      Alert.alert('Error', 'Failed to create branch: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewBranchName('');
    setNewBranchAddress('');
    setNewManagerName('');
    setNewPhone('');
    setNewEmail('');
    setErrors({});
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

  const renderInput = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    placeholder: string,
    errorKey: string,
    keyboardType: any = 'default',
    secureTextEntry: boolean = false
  ) => (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{
          color: themeName === 'dark' ? '#F9FAFB' : '#111827',
          fontWeight: 'bold',
          fontSize: 14,
        }}>{label}*</Text>
        {errors[errorKey] && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="information-circle" size={16} color="#EF4444" style={{ marginRight: 4 }} />
            <Text style={{ color: '#EF4444', fontSize: 12 }}>Mandatory field</Text>
          </View>
        )}
      </View>
      <View style={{
        borderWidth: 1,
        borderColor: errors[errorKey] ? '#EF4444' : (themeName === 'dark' ? '#444444' : '#D1D5DB'),
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: themeName === 'dark' ? '#272727' : '#F9FAFB',
      }}>
        <TextInput
          placeholder={placeholder}
          style={{
            flex: 1,
            color: themeName === 'dark' ? '#F9FAFB' : '#111827',
            padding: 0,
          }}
          placeholderTextColor='#9CA3AF'
          value={value}
          onChangeText={(text) => {
            onChange(text);
            if (errors[errorKey]) {
              setErrors(prev => ({ ...prev, [errorKey]: false }));
            }
          }}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
        />
        {errors[errorKey] && <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: themeName === 'dark' ? '#272727' : '#F3F4F6' }}>
      {/* Custom Header - Toggleable Dark Mode */}
      <View style={{
        backgroundColor: themeName === 'dark' ? '#333333' : '#E5E7EB',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: themeName === 'dark' ? '#444444' : '#D1D5DB',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={() => (navigation as any).openDrawer()}>
            <Ionicons name="menu" size={28} color={themeName === 'dark' ? '#F9FAFB' : '#111827'} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: themeName === 'dark' ? '#F9FAFB' : '#111827',
          }}>
            Branch Management
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={{
              backgroundColor: themeName === 'dark' ? '#60A5FA' : '#DBEAFE',
              width: 44,
              height: 44,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={themeName === 'dark' ? 'sunny' : 'moon'}
              size={22}
              color={themeName === 'dark' ? '#1E3A8A' : '#1E40AF'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: themeName === 'dark' ? '#FCA5A5' : '#FECACA',
              width: 44,
              height: 44,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: themeName === 'dark' ? '#7F1D1D' : '#991B1B',
            }}>
              A
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: themeName === 'dark' ? '#272727' : '#F3F4F6' }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchBranches} />
        }
      >
        <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
          {/* Search Bar and Add Button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginRight: 12,
              borderWidth: 1,
              borderColor: themeName === 'dark' ? '#444444' : '#D1D5DB'
            }}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Search Branch"
                style={{ flex: 1, marginLeft: 8, color: themeName === 'dark' ? '#F9FAFB' : '#111827', fontWeight: '500' }}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={{
                // backgroundColor: '#35C56A',
                backgroundColor: 'rgba(53, 197, 106, 0.4)',
                padding: 12,
                borderRadius: 12,
                width: 48,
                height: 48,
                // alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: '#35C56A'
              }}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {/* Branch List */}
          <View>
            {filteredBranches.map((branch) => (
              <TouchableOpacity
                key={branch.id}
                style={{
                  backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: themeName === 'dark' ? '#444444' : '#D1D5DB'
                }}
                onPress={() => (navigation as any).navigate('BranchDetails', { branch, onDelete: handleDeleteBranch })}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#3B82F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>{getInitials(branch.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: themeName === 'dark' ? '#F9FAFB' : '#111827', marginBottom: 2 }}>
                    {branch.name}
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 12, fontWeight: '500' }} numberOfLines={1}>
                    {branch.manager_id || 'No Manager'} , {branch.address?.split(',')[1]?.trim() || 'Location'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>

          {filteredBranches.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Text style={{ color: '#9CA3AF' }}>No branches found</Text>
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
              <View style={{
                backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                width: '100%',
                borderRadius: 20,
                padding: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  marginBottom: 16,
                  color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                }}>Add New Branch</Text>

                <View className="space-y-4">
                  {renderInput('Branch Name', newBranchName, setNewBranchName, 'Enter Branch Name', 'name')}
                  {renderInput('Branch Address', newBranchAddress, setNewBranchAddress, 'Enter Branch Address', 'address')}
                  {renderInput('Branch Manager Name', newManagerName, setNewManagerName, 'Enter Manager Name', 'manager')}
                  {renderInput('Phone No.', newPhone, setNewPhone, 'Enter Phone Number', 'phone', 'phone-pad')}
                  {renderInput('Gmail', newEmail, setNewEmail, 'Enter Gmail', 'email', 'email-address')}
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: themeName === 'dark' ? '#272727' : '#35C56A',
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      backgroundColor: themeName === 'dark' ? '#272727' : '#35c56a58',
                    }}
                    onPress={handleFinish}
                    disabled={loading}>
                    <Text style={{
                      fontWeight: 'bold',
                      color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                    }}>Skip & Finish</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: themeName === 'dark' ? '#444444' : '#D1D5DB',
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      backgroundColor: themeName === 'dark' ? '#272727' : '#F9FAFB',
                    }}
                    onPress={handleGoToUpload}
                  >
                    <Text style={{
                      fontWeight: 'bold',
                      color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                    }}>Add File</Text>
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

