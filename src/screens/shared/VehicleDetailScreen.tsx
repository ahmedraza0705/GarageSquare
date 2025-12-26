import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image, Modal, TextInput, SafeAreaView, Alert, StatusBar, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { VehicleService } from '@/services/vehicle.service';
import { Vehicle } from '@/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function VehicleDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { theme, themeName } = useTheme();
  const { vehicleId, onUpdate } = route.params as { vehicleId: string; onUpdate?: (v: any) => void };
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editBranch, setEditBranch] = useState('');
  const [editLastVisit, setEditLastVisit] = useState('');

  useEffect(() => {
    if (vehicle) {
      setEditBranch(vehicle.branch_name || 'Surat');
      setEditLastVisit(vehicle.last_visit || '20-08-2025');
    }
  }, [vehicle]);

  const handleSaveEdit = async () => {
    if (vehicle) {
      try {
        setLoading(true);
        const updated = await VehicleService.update(vehicle.id, {
          branch_name: editBranch,
          last_visit: editLastVisit
        });
        // Manually merge the existing customer data back into the updated object
        // because the update operation doesn't return the joined relations
        const fullUpdated = { ...updated, customer: vehicle.customer };

        setVehicle(fullUpdated);
        if (onUpdate) onUpdate(fullUpdated);
        Alert.alert("Success", "Vehicle details updated");
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to update details");
      } finally {
        setLoading(false);
        setIsEditModalVisible(false);
      }
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Vehicle", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          if (vehicle) {
            try {
              await VehicleService.delete(vehicle.id);
              navigation.goBack();
            } catch (e) { Alert.alert("Error", "Failed to delete"); }
          }
        }
      }
    ]);
  };

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const data = await VehicleService.getById(vehicleId || 'v1');
      setVehicle(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    loadVehicle();
  }, []);

  if (loading || !vehicle) return (
    <View style={styles.center}><Text style={{ color: '#64748B' }}>Loading...</Text></View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={theme.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Vehicle Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleDelete} style={[styles.deleteBtn, { backgroundColor: theme.errorOpacity }]}><Ionicons name="trash" size={18} color={theme.error} /></TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditModalVisible(true)} style={[styles.addBtn, { backgroundColor: theme.successOpacity }]}><Ionicons name="add" size={24} color={theme.success} /></TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadVehicle} tintColor={theme.primary} />}>
        <View style={styles.content}>
          <View style={[styles.mainCard, { backgroundColor: theme.surface, shadowColor: themeName === 'dark' ? '#000' : '#4A5568' }]}>
            <View style={styles.carCircle}>
              <Ionicons name="car-sport" size={60} color={theme.text} />
            </View>
            <View style={styles.mainCardInfo}>
              <Text style={[styles.brandText, { color: theme.text }]}>{vehicle.brand} {vehicle.model}</Text>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[styles.plateText, { color: theme.textMuted }]}>{vehicle.license_plate}</Text>
            </View>
          </View>

          <InfoItem icon="person-outline" label="Customer Name" value={vehicle.customer?.full_name || 'N/A'} theme={theme} />
          <InfoItem icon="call-outline" label="Phone Number" value={vehicle.customer?.phone || 'N/A'} theme={theme} />
          <InfoItem icon="location-outline" label="Address" value={vehicle.customer?.address || 'N/A'} theme={theme} />

          <View style={styles.row}>
            <View style={[styles.infoCard, { flex: 1, backgroundColor: theme.surface, shadowColor: themeName === 'dark' ? '#000' : '#4A5568' }]}>
              <MaterialCommunityIcons name="office-building" size={22} color={theme.text} />
              <View style={styles.cardCol}>
                <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Branch</Text>
                <Text style={[styles.cardValueSmall, { color: theme.text }]}>{vehicle.branch_name || 'Surat'}</Text>
              </View>
            </View>
            <View style={[styles.infoCard, { flex: 1, backgroundColor: theme.surface, shadowColor: themeName === 'dark' ? '#000' : '#4A5568' }]}>
              <MaterialCommunityIcons name="calendar-month" size={22} color={theme.text} />
              <View style={styles.cardCol}>
                <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Last Visit</Text>
                <Text style={[styles.cardValueSmall, { color: theme.text }]}>{vehicle.last_visit || '20-08-2025'}</Text>
              </View>
            </View>
          </View>

          <InfoItem icon="clipboard-text-outline" mc label="Last odometer reading" value={`${vehicle.odometer?.toLocaleString() || '0'} KM`} theme={theme} />
        </View>
      </ScrollView>


      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Details</Text>
            <Input
              label="Branch"
              value={editBranch}
              onChangeText={setEditBranch}
              theme={theme}
            />
            <Input
              label="Last Visit"
              value={editLastVisit}
              onChangeText={(text: string) => {
                const cleaned = text.replace(/[^0-9]/g, '');
                let formatted = cleaned;
                if (cleaned.length > 2) {
                  formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
                }
                if (cleaned.length > 4) {
                  formatted = formatted.slice(0, 5) + '-' + cleaned.slice(4, 8);
                }
                setEditLastVisit(formatted);
              }}
              keyboardType="numeric"
              maxLength={10}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={theme.textMuted}
              theme={theme}
            />
            <View style={styles.row}>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={[styles.cancelBtn, { backgroundColor: theme.surfaceAlt }]}><Text style={[styles.cancelText, { color: theme.textMuted }]}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSaveEdit} style={[styles.saveBtn, { backgroundColor: theme.primary }]}><Text style={[styles.saveText, { color: theme.onPrimary }]}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1 bg-[#EEF2F3] px-5"
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadVehicle} />
          }
        >
          {/* Car Image and Name Header */}
          <View className="flex-row items-center gap-1 py-5 px-1 mt-1 mb-4">
            <View>
              <FontAwesome5 name="car-alt" size={100} color="black" style={{ marginLeft: 30, marginRight: 10 }} />
            </View>
            <View>
              <View>
                <Text className="text-2xl font-bold text-gray-900 leading-tight">
                  {vehicle.brand} {vehicle.model}
                </Text>
                <View className="h-[2px] bg-[#979797] w-full mt-0.5" />
              </View>
              <Text className="text-base text-gray-500 font-bold mt-1">
                {vehicle.license_plate}
              </Text>
            </View>
          </View>

          {/* Information Cards */}
          <View className="bg-white rounded-full py-2.5 px-6 mb-3 shadow-sm flex-row items-center gap-1">
            <View className="w-8 items-center justify-center">
              <MaterialCommunityIcons name="account-outline" size={28} color="black" />
            </View>
            <View className="ml-2">
              <Text className="text-xs text-gray-400 font-bold tracking-widest mb-1">Customer Name</Text>
              <Text className="text-xl font-bold text-gray-900">{vehicle.customer?.full_name}</Text>
            </View>
          </View>

          <View className="bg-white rounded-full py-2.5 px-6 mb-3 shadow-sm flex-row items-center gap-1">
            <View className="w-8 items-center justify-center">
              <Ionicons name="call" size={24} color="black" />
            </View>
            <View className="ml-2">
              <Text className="text-xs text-gray-400 font-bold tracking-widest mb-1">Phone Number</Text>
              <Text className="text-xl font-bold text-gray-900">91 9033786017</Text>
            </View>
          </View>

          <View className="bg-white rounded-full py-2.5 px-6 mb-3 shadow-sm flex-row items-center gap-1">
            <View className="w-8 items-center justify-center">
              <Ionicons name="location" size={26} color="black" />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-xs text-gray-400 font-bold tracking-widest mb-1">Address</Text>
              <Text className="text-lg font-bold text-gray-900 leading-tight">1234 Boulevard Street, Adajan, Surat</Text>
            </View>
          </View>

          {/* Vehicle Info Row */}
          {/* Vehicle Info Row */}
          <View className="flex-row gap-2 mb-4">
            <View className="flex-1 bg-white rounded-[40px] py-2.5 px-5 shadow-sm flex-row items-center gap-1">
              <View className="w-8 items-center"><MaterialCommunityIcons name="office-building" size={24} color="black" /></View>
              <View>
                <Text className="text-[10px] text-gray-400 font-bold tracking-widest mb-0.5">Branch</Text>
                <Text className="text-base font-bold text-gray-900">{vehicle.branch_name || 'Surat'}</Text>
              </View>
            </View>
            <View className="flex-1 bg-white rounded-[40px] py-2.5 px-5 shadow-sm flex-row items-center gap-1">
              <View className="w-8 items-center"><Ionicons name="calendar" size={24} color="black" /></View>
              <View>
                <Text className="text-[10px] text-gray-400 font-bold tracking-widest mb-0.5">Last Visit</Text>
                <Text className="text-base font-bold text-gray-900">{vehicle.last_visit || '20-08-2025'}</Text>
              </View>
            </View>
          </View>

          {/* Odometer */}
          <View className="bg-white rounded-full py-2.5 px-6 mb-8 shadow-sm flex-row items-center gap-1">
            <View className="w-8 items-center justify-center">
              <MaterialCommunityIcons name="clipboard-text-outline" size={26} color="black" />
            </View>
            <View className="ml-2">
              <Text className="text-xs text-gray-400 font-bold tracking-widest mb-1">Last Odometer Reading</Text>
              <Text className="text-xl font-bold text-gray-900">{vehicle.odometer?.toLocaleString() || '0'} KM</Text>
            </View>
          </View>
        </ScrollView>

        {/* Edit Modal */}
        <Modal
          visible={isEditModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 items-center justify-center px-4">
            <View className="bg-white p-6 rounded-2xl w-full shadow-lg">
              <Text className="text-xl font-bold text-gray-900 mb-4">Edit Details</Text>

              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2">Branch</Text>
                <TextInput
                  value={editBranch}
                  onChangeText={setEditBranch}
                  className="bg-gray-100 p-3 rounded-lg text-gray-900"
                  placeholder="Enter Branch Name"
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-bold text-gray-700 mb-2">Last Visit</Text>
                <TextInput
                  value={editLastVisit}
                  onChangeText={setEditLastVisit}
                  className="bg-gray-100 p-3 rounded-lg text-gray-900"
                  placeholder="DD-MM-YYYY"
                />
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setIsEditModalVisible(false)}
                  className="flex-1 bg-gray-200 p-3 rounded-xl items-center"
                >
                  <Text className="text-gray-700 font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveEdit}
                  className="flex-1 bg-[#A7F3D0] p-3 rounded-xl items-center"
                >
                  <Text className="text-[#065F46] font-bold">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const InfoItem = ({ icon, label, value, style, mc, theme }: any) => (
  <View style={[styles.infoCard, style, { backgroundColor: theme?.surface || '#FFF' }]}>
    <View style={styles.cardIconBox}>
      {mc ? <MaterialCommunityIcons name={icon} size={22} color={theme?.text || '#000'} /> : <Ionicons name={icon} size={22} color={theme?.text || '#000'} />}
    </View>
    <View style={styles.cardCol}>
      <Text style={[styles.cardLabel, { color: theme?.textMuted || '#94A3B8' }]}>{label}</Text>
      <Text style={[styles.cardValue, { color: theme?.text || '#000' }]}>{value}</Text>
    </View>
  </View>
);

const Input = ({ label, value, onChangeText, theme, ...props }: any) => (
  <View style={styles.inputWrap}>
    <Text style={[styles.inputLabel, { color: theme?.textMuted || '#94A3B8' }]}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      style={[styles.input, { backgroundColor: theme?.background || '#F8FAFC', borderColor: theme?.border || '#E2E8F0', color: theme?.text || '#000' }]}
      {...props}
    />
  </View>
);


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', flex: 1, marginLeft: 24 },
  headerActions: { flexDirection: 'row', gap: 8 },
  deleteBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FCA5A5', alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#A7F3D0', alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 20 },
  mainCard: {
    backgroundColor: '#FFF', borderRadius: 45, padding: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 20,
    shadowColor: '#4A5568', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8
  },
  carCircle: {
    width: 100, height: 100, alignItems: 'center', justifyContent: 'center',
  },
  carImg: { width: 80, height: 60 },
  mainCardInfo: { flex: 1, marginLeft: 24, justifyContent: 'center' },
  brandText: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  divider: { height: 1.5, backgroundColor: '#E2E8F0', width: '100%', marginVertical: 6 },
  plateText: { fontSize: 16, fontWeight: '600', color: '#64748B' },
  infoCard: {
    backgroundColor: '#FFF', borderRadius: 30, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 16,
    shadowColor: '#4A5568', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5
  },
  cardIconBox: { width: 30, alignItems: 'center' },
  cardCol: { marginLeft: 16, flex: 1 },
  cardLabel: { fontSize: 12, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' },
  cardValue: { fontSize: 17, color: '#000', fontWeight: 'bold' },
  cardValueSmall: { fontSize: 15, color: '#000', fontWeight: 'bold' },
  row: { flexDirection: 'row', gap: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  modalContent: { backgroundColor: 'white', padding: 24, borderRadius: 35, width: '100%', shadowOpacity: 0.2, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 24, color: '#000' },
  inputWrap: { marginBottom: 16 },
  inputLabel: { fontSize: 12, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 6 },
  input: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', color: '#000', fontSize: 16 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#EDF2F7', alignItems: 'center' },
  cancelText: { fontWeight: 'bold', color: '#4A5568' },
  saveBtn: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#3182CE', alignItems: 'center' },
  saveText: { fontWeight: 'bold', color: 'white' }
});
