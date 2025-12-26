import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, SafeAreaView, Platform, StatusBar, Modal, ActivityIndicator, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { useRole } from '@/hooks/useRole';
import { useTheme } from '@/context/ThemeContext';
import { VehicleService } from '@/services/vehicle.service';
import { CustomerService } from '@/services/customer.service';
import { Vehicle, Customer } from '@/types';
import { Menu, Search, Plus, Moon, Sun, Car, User, X, CheckCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function VehiclesScreen() {
  const navigation = useNavigation<any>();
  const { branchId, userProfile } = useRole();
  const { theme, themeName, toggleTheme } = useTheme();
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
      const data = await VehicleService.getAll({ branch_id: branchId, search: searchQuery });
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [branchId, searchQuery]);

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
      .channel('vehicles-list-changes-manager')
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
      return;
    }
    setShowIdentityModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmContinue = () => {
    const { name, id } = customerInfo;
    setShowConfirmModal(false);
    navigation.navigate('CreateVehicle', {
      customerName: name,
      customerId: id
    });
  };

  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles;
    const lowerQuery = searchQuery.toLowerCase();
    return vehicles.filter(v =>
      v.brand.toLowerCase().includes(lowerQuery) ||
      v.model.toLowerCase().includes(lowerQuery) ||
      v.license_plate?.toLowerCase().includes(lowerQuery) ||
      (v.customer?.full_name && v.customer.full_name.toLowerCase().includes(lowerQuery))
    );
  }, [vehicles, searchQuery]);

  const initials = useMemo(() => {
    if (!userProfile?.full_name) return 'A';
    return userProfile.full_name.charAt(0).toUpperCase();
  }, [userProfile]);

  return (
    <SafeAreaView className="flex-1" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, backgroundColor: theme.background }}>
      <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between border-b" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            className="mr-4"
          >
            <Menu size={24} color={theme.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: theme.text }}>Vehicles Management</Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4" onPress={toggleTheme}>
            {themeName === 'dark' ? (
              <Sun size={24} color={theme.warning} fill={theme.warning} />
            ) : (
              <Moon size={24} color={theme.text} />
            )}
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-xl shadow-sm" style={{ backgroundColor: theme.primary }}>
            <Text className="font-bold text-lg" style={{ color: theme.onPrimary }}>{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Add Bar */}
      <View className="px-5 py-4 flex-row items-center border-b" style={{ backgroundColor: theme.surfaceAlt, borderColor: theme.border }}>
        <View className="flex-1 flex-row items-center rounded-lg px-3 py-2 border shadow-sm mr-3" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
          <Search size={20} color={theme.textMuted} />
          <TextInput
            placeholder="Search User"
            placeholderTextColor={theme.textMuted}
            className="flex-1 ml-2 text-base"
            style={{ color: theme.text }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

        </View>
        <TouchableOpacity
          className="p-2 rounded-lg items-center justify-center w-11 h-11 border"
          style={{ backgroundColor: themeName === 'dark' ? theme.primaryOpacity : '#A7F3D0', borderColor: themeName === 'dark' ? theme.primary : '#6EE7B7' }}
          onPress={() => {
            setCustomerInfo({ name: '', id: '' });
            setShowSuggestions(false);
            setShowIdentityModal(true);
          }}
        >
          <Plus size={28} color={themeName === 'dark' ? theme.primary : "#059669"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadVehicles} tintColor={theme.primary} />
        }
      >
        {filteredVehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            className="rounded-xl p-5 mb-4 border"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
            onPress={() => (navigation.navigate as any)('VehicleDetail', {
              vehicleId: vehicle.id,
              onUpdate: (updatedVehicle: Vehicle) => {
                setVehicles(currentVehicles =>
                  currentVehicles.map(v => v.id === updatedVehicle.id ? { ...v, ...updatedVehicle } : v)
                );
              }
            })}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View className="flex-1 mr-2">
                <Text className="text-lg font-bold" style={{ color: theme.text }}>
                  {vehicle.brand} {vehicle.model}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Text style={{ color: theme.textMuted, fontSize: 14 }}>
                    {vehicle.license_plate || 'No Plate'}
                  </Text>
                  {vehicle.year_manufacture && (
                    <>
                      <Text style={{ color: theme.border, marginHorizontal: 6 }}>•</Text>
                      <Text style={{ color: theme.textMuted, fontSize: 14 }}>{vehicle.year_manufacture}</Text>
                    </>
                  )}
                </View>
                {vehicle.customer && (
                  <View className="flex-row items-center mt-2">
                    <User size={12} color={theme.border} />
                    <Text className="ml-1 text-xs" style={{ color: theme.textMuted }}>{vehicle.customer.full_name}</Text>
                  </View>
                )}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <View className="bg-blue-50 px-2 py-1 rounded-md" style={{ backgroundColor: themeName === 'dark' ? 'rgba(74, 130, 180, 0.1)' : '#EFF6FF' }}>
                  <Text style={{ color: '#4682B4', fontSize: 10, fontWeight: 'bold' }}>
                    {vehicle.branch_name || vehicle.customer?.branch?.name || 'Local Branch'}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredVehicles.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-lg" style={{ color: theme.textMuted }}>No vehicles found</Text>
          </View>
        )}
      </ScrollView>

      {/* Identity Modal */}
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
                <View className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: theme.surface }}>
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-lg font-bold" style={{ color: theme.text }}>Add Vehicle</Text>
                    <TouchableOpacity onPress={() => setShowIdentityModal(false)}>
                      <X size={24} color={theme.textMuted} />
                    </TouchableOpacity>
                  </View>

                  <View className="mb-4 relative z-50">
                    <Text className="text-sm font-semibold mb-2" style={{ color: theme.text }}>Customer Name</Text>
                    <View className="flex-row items-center border rounded-xl px-4 py-3" style={{ backgroundColor: theme.surfaceAlt, borderColor: theme.border }}>
                      <TextInput
                        placeholder="Enter Customer Name"
                        placeholderTextColor={theme.textMuted}
                        className="flex-1 text-base"
                        style={{ color: theme.text }}
                        value={customerInfo.name}
                        onChangeText={handleCustomerNameChange}
                        onFocus={() => {
                          if (customerInfo.name.length > 0) setShowSuggestions(true);
                        }}
                      />
                      {searchingCustomers ? (
                        <ActivityIndicator size="small" color={theme.textMuted} />
                      ) : (
                        <Search size={20} color={theme.textMuted} />
                      )}
                    </View>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && filteredCustomers.length > 0 && (
                      <View
                        className="absolute top-full left-0 right-0 border rounded-xl shadow-lg mt-1 max-h-48 z-[100]"
                        style={{
                          backgroundColor: theme.surface,
                          borderColor: theme.border,
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
                              className="flex-row items-center p-4 border-b"
                              style={{ borderColor: theme.border }}
                              onPress={() => handleSelectCustomer(customer)}
                            >
                              <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: theme.primaryOpacity }}>
                                <User size={16} color={theme.primary} />
                              </View>
                              <View className="flex-1">
                                <Text className="font-medium" style={{ color: theme.text }}>{customer.full_name}</Text>
                                <Text className="text-xs" style={{ color: theme.textMuted }} numberOfLines={1}>{customer.id}</Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  <View className="mb-6">
                    <Text className="text-sm font-semibold mb-2" style={{ color: theme.text }}>Customer ID</Text>
                    <View className="flex-row items-center border rounded-xl px-4 py-3" style={{ backgroundColor: theme.surfaceAlt, borderColor: theme.border }}>
                      <TextInput
                        placeholder="Enter Customer ID"
                        placeholderTextColor={theme.textMuted}
                        className="flex-1 text-base"
                        style={{ color: theme.text }}
                        value={customerInfo.id}
                        onChangeText={(text) => {
                          setCustomerInfo(prev => ({ ...prev, id: text }));
                          setShowSuggestions(false);
                        }}
                      />
                      <Search size={20} color={theme.textMuted} />
                    </View>
                  </View>

                  <TouchableOpacity
                    className={`py-3 rounded-xl items-center ${customerInfo.name && customerInfo.id ? 'border' : ''}`}
                    style={{
                      backgroundColor: customerInfo.name && customerInfo.id ? theme.surface : theme.disabledBg,
                      borderColor: theme.border
                    }}
                    onPress={handleIdentitySubmit}
                    disabled={!customerInfo.name || !customerInfo.id}
                  >
                    <Text className={`font-bold text-base`} style={{ color: customerInfo.name && customerInfo.id ? theme.text : theme.textMuted }}>Add Vehicle</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-center p-6">
          <View className="rounded-3xl p-8 w-full max-w-sm items-center shadow-xl" style={{ backgroundColor: theme.surface }}>
            <TouchableOpacity
              onPress={() => setShowConfirmModal(false)}
              className="absolute right-4 top-4"
            >
              <X size={24} color={theme.textMuted} />
            </TouchableOpacity>

            <View className="w-20 h-20 rounded-full items-center justify-center mb-6" style={{ backgroundColor: theme.primaryOpacity }}>
              <CheckCircle size={48} color={theme.primary} />
            </View>

            <Text className="text-2xl font-bold mb-3 text-center" style={{ color: theme.text }}>Please Add new Vehicle</Text>
            <Text className="text-center mb-8 leading-5" style={{ color: theme.textMuted }}>
              If You Add new Vehicle, then Click on Continue
            </Text>

            <TouchableOpacity
              onPress={handleConfirmContinue}
              className="w-full py-4 rounded-xl items-center"
              style={{ backgroundColor: theme.primary }}
            >
              <Text className="font-bold text-lg" style={{ color: theme.onPrimary }}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

