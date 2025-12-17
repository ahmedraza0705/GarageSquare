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
  const [newPassword, setNewPassword] = useState('');

  const navigation = useNavigation();
  const { theme, toggleTheme, themeName } = useTheme();

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
    setNewPassword('');

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
          <RefreshControl refreshing={loading} onRefresh={() => { }} />
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
                  <View>
                    <Text style={{
                      color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                      fontWeight: 'bold',
                      marginBottom: 6,
                      fontSize: 14,
                    }}>Branch Name*</Text>
                    <TextInput
                      placeholder="Enter Branch Name"
                      style={{
                        borderWidth: 1,
                        borderColor: themeName === 'dark' ? '#444444' : '#D1D5DB',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                        backgroundColor: themeName === 'dark' ? '#272727' : '#F9FAFB',
                      }}
                      placeholderTextColor='#9CA3AF'
                      value={newBranchName}
                      onChangeText={setNewBranchName}
                    />
                  </View>

                  <View>
                    <Text style={{
                      color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                      fontWeight: 'bold',
                      marginBottom: 6,
                      fontSize: 14,
                    }}>Branch Address*</Text>
                    <TextInput
                      placeholder="Enter Branch Address"
                      style={{
                        borderWidth: 1,
                        borderColor: themeName === 'dark' ? '#444444' : '#D1D5DB',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                        backgroundColor: themeName === 'dark' ? '#272727' : '#F9FAFB',
                      }}
                      placeholderTextColor='#9CA3AF'
                      value={newBranchAddress}
                      onChangeText={setNewBranchAddress}
                    />
                  </View>

                  <View>
                    <Text style={{
                      color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                      fontWeight: 'bold',
                      marginBottom: 6,
                      fontSize: 14,
                    }}>Branch Manager Name*</Text>
                    <TextInput
                      placeholder="Enter Manager Name"
                      style={{
                        borderWidth: 1,
                        borderColor: themeName === 'dark' ? '#444444' : '#D1D5DB',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                        backgroundColor: themeName === 'dark' ? '#272727' : '#F9FAFB',
                      }}
                      placeholderTextColor='#9CA3AF'
                      value={newManagerName}
                      onChangeText={setNewManagerName}
                    />
                  </View>

                  <View>
                    <Text style={{
                      color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                      fontWeight: 'bold',
                      marginBottom: 6,
                      fontSize: 14,
                    }}>Phone No.*</Text>
                    <TextInput
                      placeholder="Enter Phone Number"
                      style={{
                        borderWidth: 1,
                        borderColor: themeName === 'dark' ? '#444444' : '#D1D5DB',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                        backgroundColor: themeName === 'dark' ? '#272727' : '#F9FAFB',
                      }}
                      placeholderTextColor='#9CA3AF'
                      keyboardType="phone-pad"
                      value={newPhone}
                      onChangeText={setNewPhone}
                    />
                  </View>

                  <View>
                    <Text style={{
                      color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                      fontWeight: 'bold',
                      marginBottom: 6,
                      fontSize: 14,
                    }}>Gmail*</Text>
                    <View style={{
                      borderWidth: 1,
                      borderColor: themeName === 'dark' ? '#444444' : '#D1D5DB',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: themeName === 'dark' ? '#272727' : '#F9FAFB',
                    }}>
                      <TextInput
                        placeholder="Enter Gmail"
                        style={{
                          flex: 1,
                          color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                          padding: 0,
                        }}
                        placeholderTextColor='#9CA3AF'
                        value={newEmail}
                        onChangeText={setNewEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                  <View>
                    <Text style={{
                      color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                      fontWeight: 'bold',
                      marginBottom: 6,
                      fontSize: 14,
                    }}>Password*</Text>
                    <View style={{
                      borderWidth: 1,
                      borderColor: themeName === 'dark' ? '#444444' : '#D1D5DB',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: themeName === 'dark' ? '#272727' : '#F9FAFB',
                    }}>
                      <TextInput
                        placeholder="Enter Password"
                        style={{
                          flex: 1,
                          color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                          padding: 0,
                        }}
                        placeholderTextColor='#9CA3AF'
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={true}
                        keyboardType="default"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: themeName === 'dark' ? '#444444' : '#D1D5DB',
                      borderRadius: 12,
                      paddingVertical: 12,
                      alignItems: 'center',
                      marginTop: 8,
                      width: 128,
                      backgroundColor: themeName === 'dark' ? '#272727' : '#F9FAFB',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 1,
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

