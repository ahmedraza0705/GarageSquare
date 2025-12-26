import React, { useEffect, useState, useMemo, useCallback, useLayoutEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, SafeAreaView, Platform, StatusBar, Modal, ActivityIndicator, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { VehicleService } from '@/services/vehicle.service';
import { useTheme, typography } from '@/context/ThemeContext';
import { CustomerService } from '@/services/customer.service';
import { Vehicle, Customer } from '@/types';
import { Search, Plus, X, CheckCircle, User } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function VehiclesScreen() {
  const navigation = useNavigation<any>();
  const { theme, themeName } = useTheme();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
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

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadVehicles(false); // Don't show full loading spinner on focus refetch
    }, [])
  );

  // Realtime subscription - stable reference
  useEffect(() => {
    if (!supabase) return;

    const reloadVehicles = async () => {
      try {
        const data = await VehicleService.getAll({ search: searchQuery });
        setVehicles(data);
      } catch (error) {
        console.error('Error reloading vehicles:', error);
      }
    };

    const channel = supabase
      .channel('vehicles-list-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        () => {
          reloadVehicles();
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [searchQuery]);

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

  useLayoutEffect(() => {
    // Hide bottom tab bar if it's within a Tab Navigator
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' }
    });

    return () => {
      // Re-enable on unmount (optional, but good practice if it was visible)
      navigation.getParent()?.setOptions({
        tabBarStyle: undefined
      });
    };
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Search and Add Bar */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background, borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: theme.border, marginRight: 12 }}>
          <Search size={20} color={theme.textMuted} />
          <TextInput
            placeholder="Search Vehicle"
            placeholderTextColor={theme.textMuted}
            style={{ flex: 1, marginLeft: 8, fontSize: typography.body1.fontSize, fontFamily: typography.body1.fontFamily, color: theme.text }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: theme.successOpacity,
            borderRadius: 12,
            width: 48,
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.success
          }}
          onPress={() => {
            setCustomerInfo({ name: '', id: '' });
            setShowSuggestions(false);
            setShowIdentityModal(true);
          }}
        >
          <Plus size={24} color={themeName === 'dark' ? '#FFFFFF' : theme.success} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => loadVehicles(true)} tintColor={theme.primary} />
        }
      >
        {vehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            style={{
              backgroundColor: theme.surface,
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: theme.border,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
            onPress={() => navigation.navigate('VehicleDetail', {
              vehicleId: vehicle.id,
              onUpdate: (updated: Vehicle) => {
                setVehicles(current => current.map(v => v.id === updated.id ? { ...v, ...updated } : v));
              }
            })}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text className="text-lg font-bold text-gray-900">
                  {vehicle.brand} {vehicle.model}
                </Text>
                <Text style={{ color: theme.textMuted, fontSize: typography.body2.fontSize, fontFamily: typography.body2.fontFamily, marginTop: 4 }}>
                  {vehicle.license_plate}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: theme.textMuted, fontSize: 12, fontFamily: typography.body2.fontFamily }}>
                  {vehicle.branch_name || vehicle.branch?.name || 'Surat'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {vehicles.length === 0 && !loading && (
          <View style={{ alignItems: 'center', paddingVertical: 80 }}>
            <Text style={{ color: theme.textMuted, fontSize: typography.title2.fontSize, fontFamily: typography.title2.fontFamily }}>No vehicles found</Text>
            <TouchableOpacity
              style={{ marginTop: 16, backgroundColor: theme.surface, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 9999, borderWidth: 1, borderColor: theme.primary }}
              onPress={() => setSearchQuery('')}
            >
              <Text style={{ color: theme.primary, fontFamily: typography.body1.fontFamily, fontWeight: '600' }}>Clear Search</Text>
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

