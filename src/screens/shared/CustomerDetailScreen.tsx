// ============================================
// CUSTOMER DETAIL SCREEN
// ============================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { CustomerService } from '@/services/customer.service';
import { Customer } from '@/types';
import { getInitials } from '@/utils/string';
import {
  ArrowLeft,
  Trash2,
  Plus,
  Mail,
  Phone,
  MapPin,
  Car,
  FileText,
  ClipboardList,
  Calendar,
  X,
  Save,
  Edit3
} from 'lucide-react-native';

// Helper for Stats Card - Defined outside to prevent remount loops on scroll
const StatsCard = ({ icon, label, count, theme }: { icon: any, label: string, count: string, theme: any }) => (
  <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="p-4 rounded-2xl shadow-sm flex-1 mr-2 mb-2 items-start justify-center min-w-[45%] border">
    <View className="mb-2">
      {icon}
    </View>
    <View className="flex-row items-center">
      <Text style={{ color: theme.text }} className="font-bold mr-1">{label}</Text>
    </View>
    <Text style={{ color: theme.textMuted }} className="text-xs">{count}</Text>
  </View>
);

// Helper for Info Card
const InfoCard = ({ icon, label, value, theme }: { icon: any, label: string, value: string, theme: any }) => (
  <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="p-4 rounded-2xl shadow-sm mb-3 flex-row items-center border">
    <View style={{ backgroundColor: theme.surfaceAlt }} className="w-10 h-10 rounded-xl items-center justify-center mr-4">
      {icon}
    </View>
    <View className="flex-1">
      <Text style={{ color: theme.textMuted }} className="text-[10px] uppercase font-bold mb-0.5">{label}</Text>
      <Text style={{ color: theme.text }} className="font-bold text-sm">{value}</Text>
    </View>
  </View>
);

export default function CustomerDetailScreen() {
  const { theme, themeName } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { customerId } = route.params as { customerId: string };
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadCustomer();
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const data = await CustomerService.getById(customerId);
      if (data) {
        setCustomer(data);
        setEditForm({
          full_name: data.full_name,
          email: data.email || '',
          phone: data.phone,
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      Alert.alert('Error', 'Customer not found or failed to load');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await CustomerService.delete(customerId);

              // Simulate small delay for better UX
              setTimeout(() => {
                navigation.goBack();
                Alert.alert('Deleted', 'Customer has been removed successfully');
              }, 300);
            } catch (error) {
              console.error(error);
              setLoading(false);
              Alert.alert('Error', 'Failed to delete customer');
            }
          }
        },
      ]
    );
  };

  const handleUpdate = async () => {
    if (!editForm.full_name || !editForm.phone) {
      Alert.alert('Error', 'Name and Phone are required');
      return;
    }

    try {
      setLoading(true);
      const updated = await CustomerService.update(customerId, editForm);
      setCustomer(updated);
      setEditModalVisible(false);
      Alert.alert('Success', 'Customer details updated successfully');
    } catch (error) {
      console.error('Error updating customer:', error);
      Alert.alert('Error', 'Failed to update customer');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !customer) {
    return (
      <View style={{ backgroundColor: theme.background }} className="flex-1 items-center justify-center">
        <Text style={{ color: theme.textMuted }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: theme.background }} className="flex-1" edges={['left', 'right']}>
      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-6 pt-2 pb-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <ArrowLeft color={theme.text} size={24} />
        </TouchableOpacity>

        <Text style={{ color: theme.text }} className="text-xl font-bold">Customer Details</Text>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleDelete}
            style={{ backgroundColor: themeName === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2' }}
            className="w-10 h-10 rounded-xl items-center justify-center"
          >
            <Trash2 color="#ef4444" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            style={{ backgroundColor: themeName === 'dark' ? 'rgba(195, 113, 37, 0.2)' : 'rgba(70, 130, 180, 0.2)' }}
            className="w-10 h-10 rounded-xl items-center justify-center"
          >
            <Edit3 color={themeName === 'dark' ? '#C37125' : '#4682B4'} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View className="items-center py-6">
          <View style={{ borderColor: theme.surface, backgroundColor: themeName === 'dark' ? '#C37125' : '#4682B4' }} className="w-32 h-32 rounded-full mb-4 border-4 shadow-lg items-center justify-center">
            <Text className="text-white text-4xl font-bold ">
              {getInitials(customer.full_name)}
            </Text>
          </View>
          <Text style={{ color: theme.text }} className="text-3xl font-bold mb-1 text-center px-4">{customer.full_name}</Text>
        </View>

        <View className="px-6 pb-6">
          {/* Info Cards */}
          <InfoCard
            icon={<Mail color={theme.text} size={20} />}
            label="Email Address"
            value={customer.email || 'N/A'}
            theme={theme}
          />

          <InfoCard
            icon={<Phone color={theme.text} size={20} />}
            label="Phone Number"
            value={customer.phone}
            theme={theme}
          />

          <InfoCard
            icon={<MapPin color={theme.text} size={20} />}
            label="Address"
            value={customer.address || 'N/A'}
            theme={theme}
          />

          {/* Stats Grid */}
          <View className="flex-row flex-wrap mt-4">
            <StatsCard
              icon={<Car color={theme.text} size={24} />}
              label="Vehicles"
              count={`(${customer.vehicles?.length || 0})`}
              theme={theme}

            />
            <StatsCard
              icon={<FileText color={theme.text} size={24} />}
              label="Invoices"
              count="(9)"
              theme={theme}
            />
            <StatsCard
              icon={<ClipboardList color={theme.text} size={24} />}
              label="Job Cards"
              count="(7)"
              theme={theme}
            />
            <StatsCard
              icon={<Calendar color={theme.text} size={24} />}
              label="Last Visit"
              count={(() => {
                if (!customer.vehicles || customer.vehicles.length === 0) return 'Never';

                const dates = customer.vehicles
                  .map(v => v.last_visit)
                  .filter(d => d) as string[];

                if (dates.length === 0) return 'Never';

                // Parse DD-MM-YYYY to Date objects
                const parsedDates = dates.map(dateStr => {
                  const [day, month, year] = dateStr.split('-').map(Number);
                  return new Date(year, month - 1, day);
                });

                // Find the latest date
                const latestDate = new Date(Math.max(...parsedDates.map(d => d.getTime())));

                // Calculate "days ago"
                const diffTime = Math.abs(new Date().getTime() - latestDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 0) return 'Today';
                if (diffDays === 1) return 'Yesterday';
                return `${diffDays} Days Ago`;
              })()}
              theme={theme}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ backgroundColor: theme.surface }}
            className="rounded-t-[40px] shadow-2xl"
          >
            <SafeAreaView edges={['bottom']}>
              <View className="px-6 pt-8 pb-10">
                <View className="flex-row items-center justify-between mb-8">
                  <Text style={{ color: theme.text }} className="text-2xl font-bold">Edit Details</Text>
                  <TouchableOpacity
                    onPress={() => setEditModalVisible(false)}
                    style={{ backgroundColor: theme.surfaceAlt }}
                    className="w-10 h-10 rounded-full items-center justify-center"
                  >
                    <X color={theme.text} size={20} />
                  </TouchableOpacity>
                </View>

                <View className="space-y-4">
                  <View>
                    <Text style={{ color: theme.textMuted }} className="text-xs font-bold uppercase mb-2 ml-1">Full Name</Text>
                    <TextInput
                      style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.border }}
                      className="p-4 rounded-2xl font-semibold border"
                      placeholderTextColor={theme.textMuted}
                      value={editForm.full_name}
                      onChangeText={(text) => setEditForm({ ...editForm, full_name: text })}
                      placeholder="Enter full name"
                    />
                  </View>

                  <View className="mt-4">
                    <Text style={{ color: theme.textMuted }} className="text-xs font-bold uppercase mb-2 ml-1">Email Address</Text>
                    <TextInput
                      style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.border }}
                      className="p-4 rounded-2xl font-semibold border"
                      placeholderTextColor={theme.textMuted}
                      value={editForm.email}
                      onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                      placeholder="Enter email address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View className="mt-4">
                    <Text style={{ color: theme.textMuted }} className="text-xs font-bold uppercase mb-2 ml-1">Phone Number</Text>
                    <TextInput
                      style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.border }}
                      className="p-4 rounded-2xl font-semibold border"
                      placeholderTextColor={theme.textMuted}
                      value={editForm.phone}
                      onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                      placeholder="Enter phone number"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View className="mt-4">
                    <Text style={{ color: theme.textMuted }} className="text-xs font-bold uppercase mb-2 ml-1">Address</Text>
                    <TextInput
                      style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.border }}
                      className="p-4 rounded-2xl font-semibold border"
                      placeholderTextColor={theme.textMuted}
                      value={editForm.address}
                      onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                      placeholder="Enter address"
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleUpdate}
                  className="bg-[#22c55e] mt-10 p-5 rounded-2xl flex-row items-center justify-center shadow-lg"
                >
                  <Save color="#fff" size={20} />
                  <Text className="text-white font-bold text-lg ml-2">Save Changes</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
