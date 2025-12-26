import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, SafeAreaView, Platform, StatusBar, Modal, ActivityIndicator, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { VehicleService } from '@/services/vehicle.service';
import { CustomerService } from '@/services/customer.service';
import { Vehicle, Customer } from '@/types';
import { Search, Plus, X, CheckCircle, User } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function VehiclesScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', id: '' });

  // Customer Search States
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);

  const loadVehicles = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await VehicleService.getAll({ search: searchQuery });

      // DEBUG: Log first vehicle to see structure
      if (data && data.length > 0) {
        console.log('🚗 First Vehicle Data:', JSON.stringify(data[0], null, 2));
      }

      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [searchQuery]);

  const loadCustomers = async () => {
    try {
      setSearchingCustomers(true);
      const data = await CustomerService.getAll();
      setAllCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setSearchingCustomers(false);
    }
  };

  useEffect(() => {
    if (showIdentityModal) {
      loadCustomers();
      // Reset if starting fresh (optional, but keep it for now if needed)
    }
  }, [showIdentityModal]);

  useFocusEffect(
    useCallback(() => {
      loadVehicles(false);
    }, [loadVehicles])
  );

  // Realtime subscription
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('vehicles-list-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        () => {
          loadVehicles(false);
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadVehicles]);

  const handleCustomerNameChange = (text: string) => {
    setCustomerInfo(prev => ({ ...prev, name: text }));
    if (text.length > 0) {
      const filtered = allCustomers.filter(c =>
        c.full_name.toLowerCase().includes(text.toLowerCase()) ||
        c.id.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setCustomerInfo({
      name: customer.full_name,
      id: customer.id
    });
    setShowSuggestions(false);
  };

  const handleIdentitySubmit = () => {
    if (!customerInfo.name || !customerInfo.id) {
      return; // Basic validation
    }
    setShowIdentityModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmContinue = () => {
    const { name, id } = customerInfo;
    setShowConfirmModal(false);
    // Don't clear here! Capture values and pass to navigation.
    // Clearing it here might trigger a re-render that affects navigation params.
    navigation.navigate('CreateVehicle', {
      customerName: name,
      customerId: id
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* Search and Add Bar */}
      <View className="px-5 py-4 flex-row items-center bg-gray-50 border-b border-gray-100">
        <View className="flex-1 flex-row items-center bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm mr-3">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search User"
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-base text-gray-900"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          className="bg-[#A7F3D0] p-2 rounded-lg items-center justify-center w-11 h-11 border border-[#6EE7B7]"
          onPress={() => {
            setCustomerInfo({ name: '', id: '' });
            setShowSuggestions(false);
            setShowIdentityModal(true);
          }}
        >
          <Plus size={28} color="#059669" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 bg-[#F9FAFB]"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => loadVehicles(true)} />
        }
      >
        {vehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            className="bg-white rounded-xl p-5 mb-4 border border-gray-100"
            onPress={() => navigation.navigate('VehicleDetail', {
              vehicleId: vehicle.id
            })}
            style={{
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-bold text-gray-900">
                  {vehicle.brand} {vehicle.model}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {vehicle.license_plate}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-gray-600 text-xs">
                  {vehicle.branch_name || vehicle.customer?.branch?.name || 'Surat'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {vehicles.length === 0 && !loading && (
          <View className="items-center py-20">
            <Text className="text-gray-400 text-lg">No vehicles found</Text>
            <TouchableOpacity
              className="mt-4 bg-blue-50 px-6 py-2 rounded-full"
              onPress={() => setSearchQuery('')}
            >
              <Text className="text-blue-600 font-medium">Clear Search</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Identity Modal (Form like Pic 2) */}
      <Modal
        visible={showIdentityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowIdentityModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => {
          setShowSuggestions(false);
          Keyboard.dismiss();
        }}>
          <View className="flex-1 bg-black/40 justify-center p-6">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="w-full"
            >
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View className="bg-white rounded-2xl p-6 shadow-xl">
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-lg font-bold text-gray-900">Add Vehicle</Text>
                    <TouchableOpacity onPress={() => setShowIdentityModal(false)}>
                      <X size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View className="mb-4 relative z-50">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Customer Name</Text>
                    <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                      <TextInput
                        placeholder="Enter Customer Name"
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 text-gray-900 text-base"
                        value={customerInfo.name}
                        onChangeText={handleCustomerNameChange}
                        onFocus={() => {
                          if (customerInfo.name.length > 0) setShowSuggestions(true);
                        }}
                      />
                      {searchingCustomers ? (
                        <ActivityIndicator size="small" color="#9CA3AF" />
                      ) : (
                        <Search size={20} color="#9CA3AF" />
                      )}
                    </View>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && filteredCustomers.length > 0 && (
                      <View
                        className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-lg mt-1 max-h-48 z-[100]"
                        style={{
                          elevation: 10,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.2,
                          shadowRadius: 8,
                        }}
                      >
                        <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                          {filteredCustomers.map((customer) => (
                            <TouchableOpacity
                              key={customer.id}
                              className="flex-row items-center p-4 border-b border-gray-50"
                              onPress={() => handleSelectCustomer(customer)}
                            >
                              <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
                                <User size={16} color="#3B82F6" />
                              </View>
                              <View className="flex-1">
                                <Text className="text-gray-900 font-medium">{customer.full_name}</Text>
                                <Text className="text-gray-500 text-xs" numberOfLines={1}>{customer.id}</Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  <View className="mb-6">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Customer ID</Text>
                    <View className="flex-row items-center border border-gray-200 rounded-xl px-4 py-3 bg-gray-50">
                      <TextInput
                        placeholder="Enter Customer ID"
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 text-gray-900 text-base"
                        value={customerInfo.id}
                        onChangeText={(text) => {
                          setCustomerInfo(prev => ({ ...prev, id: text }));
                          setShowSuggestions(false);
                        }}
                      />
                      <Search size={20} color="#9CA3AF" />
                    </View>
                  </View>

                  <TouchableOpacity
                    className={`py-3 rounded-xl items-center ${customerInfo.name && customerInfo.id ? 'bg-white border border-gray-300' : 'bg-gray-100'
                      }`}
                    onPress={handleIdentitySubmit}
                    disabled={!customerInfo.name || !customerInfo.id}
                  >
                    <Text className={`font-bold text-base ${customerInfo.name && customerInfo.id ? 'text-gray-900' : 'text-gray-400'
                      }`}>Add Vehicle</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Confirmation Modal (Success check like Pic 2) */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center p-6">
          <View className="bg-white rounded-3xl p-8 w-full max-w-sm items-center shadow-xl">
            <TouchableOpacity
              onPress={() => setShowConfirmModal(false)}
              className="absolute right-4 top-4"
            >
              <X size={24} color="#6B7280" />
            </TouchableOpacity>

            <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-6">
              <CheckCircle size={48} color="#3B82F6" />
            </View>

            <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">Please Add new Vehicle</Text>
            <Text className="text-gray-500 text-center mb-8 leading-5">
              If You Add new Vehicle, then Click on Continue
            </Text>

            <TouchableOpacity
              onPress={handleConfirmContinue}
              className="w-full bg-[#4A86B2] py-4 rounded-xl items-center"
            >
              <Text className="text-white font-bold text-lg">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

