import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image, Modal, TextInput, SafeAreaView, Alert, StatusBar, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { VehicleService } from '@/services/vehicle.service';
import { Vehicle } from '@/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function VehicleDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
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

  const handleSaveEdit = () => {
    if (vehicle) {
      const updated = { ...vehicle, branch_name: editBranch, last_visit: editLastVisit };
      setVehicle(updated);
      if (onUpdate) onUpdate(updated);
    }
    setIsEditModalVisible(false);
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color="#000" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}><Ionicons name="trash" size={18} color="#991B1B" /></TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditModalVisible(true)} style={styles.addBtn}><Ionicons name="add" size={24} color="#065F46" /></TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={loading} onRefresh={loadVehicle} tintColor="#3182CE" />}>
        <View style={styles.content}>
          <View style={styles.mainCard}>
            <View style={styles.carCircle}>
              <Image source={require('@/assets/car_icon_final.png')} style={styles.carImg} resizeMode="contain" />
            </View>
            <View style={styles.mainCardInfo}>
              <Text style={styles.brandText}>{vehicle.brand} {vehicle.model}</Text>
              <View style={styles.divider} />
              <Text style={styles.plateText}>{vehicle.license_plate}</Text>
            </View>
          </View>

          <InfoItem icon="person-outline" label="Customer Name" value={vehicle.customer?.full_name} />
          <InfoItem icon="call-outline" label="Phone Number" value="91 9033786017" />
          <InfoItem icon="location-outline" label="Address" value="1234 Boulevard Street, Adajan, Surat" />

          <View style={styles.row}>
            <View style={[styles.infoCard, { flex: 1 }]}>
              <MaterialCommunityIcons name="office-building" size={22} color="#000" />
              <View style={styles.cardCol}>
                <Text style={styles.cardLabel}>Branch</Text>
                <Text style={styles.cardValueSmall}>{vehicle.branch_name || 'Surat'}</Text>
              </View>
            </View>
            <View style={[styles.infoCard, { flex: 1 }]}>
              <MaterialCommunityIcons name="calendar-month" size={22} color="#000" />
              <View style={styles.cardCol}>
                <Text style={styles.cardLabel}>Last Visit</Text>
                <Text style={styles.cardValueSmall}>{vehicle.last_visit || '20-08-2025'}</Text>
              </View>
            </View>
          </View>

          <InfoItem icon="clipboard-text-outline" mc label="Last odometer reading" value={`${vehicle.odometer?.toLocaleString() || '0'} KM`} />
        </View>
      </ScrollView>


      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Details</Text>
            <Input label="Branch" value={editBranch} onChangeText={setEditBranch} />
            <Input label="Last Visit" value={editLastVisit} onChangeText={setEditLastVisit} />
            <View style={styles.row}>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.cancelBtn}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSaveEdit} style={styles.saveBtn}><Text style={styles.saveText}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const InfoItem = ({ icon, label, value, style, mc }: any) => (
  <View style={[styles.infoCard, style]}>
    <View style={styles.cardIconBox}>
      {mc ? <MaterialCommunityIcons name={icon} size={22} color="#000" /> : <Ionicons name={icon} size={22} color="#000" />}
    </View>
    <View style={styles.cardCol}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  </View>
);

const Input = ({ label, value, onChangeText }: any) => (
  <View style={styles.inputWrap}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput value={value} onChangeText={onChangeText} style={styles.input} />
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
    width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4
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
