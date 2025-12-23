// ============================================
// BRANCHES SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Branch } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { BranchService } from '@/services/branch.service';
import { AuthService } from '@/services/auth.service';
import { useAuth } from '@/hooks/useAuth';

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
  const [managers, setManagers] = useState<any[]>([]);
  const [selectedManager, setSelectedManager] = useState<any>(null);
  const [showManagerDropdown, setShowManagerDropdown] = useState(false);

  // Validation State
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const navigation = useNavigation();
  const { theme, toggleTheme, themeName } = useTheme();
  const { user } = useAuth();

  // Fetch branches from Supabase
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const data = await BranchService.getAllBranches();
      setBranches(data);
    } catch (error) {
      console.error('Error loading branches:', error);
      Alert.alert('Error', 'Failed to load branches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load branches and managers on mount
  useEffect(() => {
    fetchBranches();
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      // Fetch users with 'manager' role from user_profiles
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*, role:roles!inner(name)')
        .eq('roles.name', 'manager');

      if (error) throw error;
      setManagers(data || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

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
      await BranchService.deleteBranch(id);
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
      const companyId = user?.profile?.company_id;

      console.log('Creating branch with data:', { newBranchName, newBranchAddress, newPhone, newEmail, companyId });

      const newBranchData = {
        name: newBranchName,
        address: newBranchAddress,
        phone: newPhone,
        email: newEmail,
        is_active: true,
        company_id: companyId,
        manager_id: undefined
      };

      const createdBranch = await BranchService.createBranch(newBranchData);

      // 2. Create Manager Profile
      if (newManagerName && newEmail) {
        try {
          // Use a temporary password for new managers
          const tempPassword = 'Manager@' + Math.random().toString(36).slice(-8);

          const managerResult = await AuthService.createUserWithProfile({
            email: newEmail,
            password: tempPassword,
            full_name: newManagerName,
            phone: newPhone,
            role: 'manager',
            branch_id: createdBranch.id,
            company_id: companyId
          });

          if (managerResult.success) {
            // Updated branch with the new manager_id
            await BranchService.updateBranch(createdBranch.id, {
              manager_id: managerResult.userId
            });
          }
        } catch (mgrError) {
          console.error('Error creating manager profile:', mgrError);
          // Don't fail the whole branch creation if manager creation fails (e.g. email exists)
          Alert.alert('Warning', 'Branch created, but manager profile could not be created. They might already have an account.');
        }
      }

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
    setSelectedManager(null);
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

  const allBranches = branches;

  const filteredBranches = allBranches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (branch.address && branch.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (branch.manager_id && branch.manager_id.toLowerCase().includes(searchQuery.toLowerCase()))
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
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{
          color: theme.text,
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
        borderColor: errors[errorKey] ? '#EF4444' : theme.border,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.background,
      }}>
        <TextInput
          placeholder={placeholder}
          style={{
            flex: 1,
            color: theme.text,
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
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchBranches} />
        }
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 12 }}>
          {/* Search Bar and Add Button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.surface,
              borderRadius: 12,
              paddingHorizontal: 16,
              height: 48,
              marginRight: 12,
              borderWidth: 1,
              borderColor: theme.border
            }}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Search Branch"
                style={{ flex: 1, marginLeft: 8, color: theme.text, fontWeight: '500' }}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(53, 197, 106, 0.4)',
                borderRadius: 12,
                width: 48,
                height: 48,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#35C56A'
              }}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={24} color={themeName === 'light' ? '#000000' : '#FFFFFF'} />
            </TouchableOpacity>
          </View>

          {/* Branch List */}
          <View>
            {filteredBranches.map((branch) => (
              <TouchableOpacity
                key={branch.id}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => (navigation as any).navigate('BranchDetails', { branch, onDelete: handleDeleteBranch })}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: themeName === 'dark' ? '#C37125' : '#4682B4',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16
                }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>{getInitials(branch.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 2 }}>
                    {branch.name}
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 12, fontWeight: '500' }} numberOfLines={1}>
                    {branch.manager_id || 'No Manager'} , {branch.address || 'Location'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {(branch.id === 'mock-1' || branch.id === 'mock-3') && (
                    <Ionicons name="warning-outline" size={20} color="#EF4444" />
                  )}
                  {/* <Ionicons name="chevron-forward" size={20} color="#9CA3AF" /> */}
                </View>
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
                backgroundColor: theme.surface,
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
                  color: theme.text,
                }}>Add New Branch</Text>

                <View>
                  {renderInput('Branch Name', newBranchName, setNewBranchName, 'Enter Branch Name', 'name')}
                  {renderInput('Branch Address', newBranchAddress, setNewBranchAddress, 'Enter Branch Address', 'address')}
                  {/* Manager Selection Dropdown */}
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 14, marginBottom: 6 }}>Branch Manager Name*</Text>
                    <TouchableOpacity
                      style={{
                        borderWidth: 1,
                        borderColor: errors.manager ? '#EF4444' : theme.border,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: theme.background,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onPress={() => setShowManagerDropdown(!showManagerDropdown)}
                    >
                      <Text style={{ color: selectedManager ? theme.text : '#9CA3AF' }}>
                        {selectedManager ? selectedManager.full_name : 'Select Manager'}
                      </Text>
                      <Ionicons name={showManagerDropdown ? "chevron-up" : "chevron-down"} size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    {showManagerDropdown && (
                      <View style={{
                        marginTop: 4,
                        maxHeight: 150,
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: 12,
                        backgroundColor: theme.surface,
                        zIndex: 1000,
                        overflow: 'hidden'
                      }}>
                        <ScrollView nestedScrollEnabled={true}>
                          {managers.map((mgr) => (
                            <TouchableOpacity
                              key={mgr.id}
                              style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}
                              onPress={() => {
                                setSelectedManager(mgr);
                                setNewManagerName(mgr.full_name);
                                setNewPhone(mgr.phone || '');
                                setNewEmail(mgr.email || '');
                                setShowManagerDropdown(false);
                              }}
                            >
                              <Text style={{ color: theme.text }}>{mgr.full_name}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {renderInput('Phone No.', newPhone, setNewPhone, 'Phone number will auto-fill', 'phone', 'phone-pad')}
                  {renderInput('Gmail', newEmail, setNewEmail, 'Email will auto-fill', 'email', 'email-address')}
                </View>

                {/* Action Buttons */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: themeName === 'dark' ? '#444444' : '#35C56A',
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      backgroundColor: themeName === 'dark' ? '#272727' : '#35c56a58',
                    }}
                    onPress={handleFinish}
                    disabled={loading}>
                    <Text style={{
                      fontWeight: 'bold',
                      color: theme.text,
                    }}>Skip & Finish</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: theme.border,
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      backgroundColor: theme.background,
                    }}
                    onPress={handleGoToUpload}
                  >
                    <Text style={{
                      fontWeight: 'bold',
                      color: theme.text,
                    }}>Add File</Text>
                  </TouchableOpacity>
                </View>

              </View>

            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
