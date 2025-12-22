// ============================================
// ACTIVE JOBS SCREEN (Company Admin)
// ============================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { JobCard } from '@/types';

// Static job cards data
const staticJobCards: JobCard[] = [
  {
    id: 'job_001',
    job_number: 'SA0001',
    customer_id: 'customer_001',
    vehicle_id: 'vehicle_001',
    branch_id: 'branch_1',
    assigned_to: 'tech_001',
    status: 'in_progress',
    priority: 'urgent',
    description: 'Engine repair and maintenance',
    estimated_cost: 21500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: {
      id: 'customer_001',
      full_name: 'Ahmed',
      phone: '+1234567890',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    vehicle: {
      id: 'vehicle_001',
      customer_id: 'customer_001',
      make: 'Honda',
      model: 'City',
      license_plate: 'GJ-05-RT-2134',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    assigned_user: {
      id: 'tech_001',
      email: 'ahmed.raza@example.com',
      full_name: 'Ahmed raza',
      role_id: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'job_002',
    job_number: 'SA0002',
    customer_id: 'customer_001',
    vehicle_id: 'vehicle_002',
    branch_id: 'branch_1',
    assigned_to: 'tech_001',
    status: 'in_progress',
    priority: 'high',
    description: 'Regular service and oil change',
    estimated_cost: 10000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: {
      id: 'customer_001',
      full_name: 'Ahmed',
      phone: '+1234567890',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    vehicle: {
      id: 'vehicle_002',
      customer_id: 'customer_001',
      make: 'Hyundai',
      model: 'i10',
      license_plate: 'GJ-UD-KI-2234',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    assigned_user: {
      id: 'tech_001',
      email: 'ahmed.raza@example.com',
      full_name: 'Ahmed raza',
      role_id: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

export default function ActiveJobsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme, toggleTheme, themeName } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [jobCards] = useState<JobCard[]>(staticJobCards);

  const getStatusBadge = (status: string, priority?: string) => {
    if (priority === 'urgent') {
      return { label: 'Urgent', color: '#ffffff', bgColor: '#ef4444' };
    }
    if (status === 'in_progress') {
      return { label: 'Progress', color: '#ffffff', bgColor: '#2563eb' };
    }
    if (status === 'completed') {
      return { label: 'Ready', color: '#ffffff', bgColor: '#10b981' };
    }
    return { label: 'Pending', color: '#ffffff', bgColor: '#6b7280' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleJobCardPress = (jobCard: JobCard) => {
    // @ts-ignore
    navigation.navigate('JobCardDetail', { jobCardId: jobCard.id });
  };

  const filteredJobCards = jobCards.filter(jobCard => {
    const searchLower = searchQuery.toLowerCase();
    return (
      jobCard.job_number.toLowerCase().includes(searchLower) ||
      jobCard.customer?.full_name?.toLowerCase().includes(searchLower) ||
      jobCard.vehicle?.make?.toLowerCase().includes(searchLower) ||
      jobCard.vehicle?.model?.toLowerCase().includes(searchLower) ||
      jobCard.assigned_user?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.border, borderBottomWidth: 0 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={require('../../assets/Arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>Active Jobs</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={styles.headerButton}
          >
            <Text style={styles.darkModeIcon}>{themeName === 'dark' ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarButton}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.background, borderBottomWidth: 0 }]}>
          <View style={styles.searchBarRow}>
            <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search User"
                placeholderTextColor={theme.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.filterButton}>
                <Text style={styles.filterIcon}>🔽</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                // @ts-ignore
                navigation.navigate('CreateJobCard');
              }}
            >
              <Text style={styles.addIcon}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Job Cards */}
        <View style={styles.cardsContainer}>
          {filteredJobCards.map((jobCard) => {
            const badge = getStatusBadge(jobCard.status, jobCard.priority);
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + 2);
            const deliveryTime = '3:00 PM';

            return (
              <TouchableOpacity
                key={jobCard.id}
                style={[styles.jobCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => handleJobCardPress(jobCard)}
                activeOpacity={0.7}
              >
                {/* Top Row: Status, Job Number, Price */}
                <View style={styles.topRow}>
                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: badge.bgColor }]}>
                    <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                      {badge.label}
                    </Text>
                  </View>

                  {/* Job Card Number - Centered */}
                  <Text style={[styles.jobNumber, { color: theme.text }]}>Job Card {jobCard.job_number}</Text>

                  {/* Price Tag */}
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>₹{jobCard.estimated_cost?.toLocaleString('en-IN') || '0'}</Text>
                  </View>
                </View>

                {/* Vehicle Section with Icon */}
                <View style={styles.vehicleSection}>
                  <Text style={styles.carIcon}>🚗</Text>
                  <View style={styles.vehicleInfo}>
                    <Text style={[styles.vehicleModel, { color: theme.text }]}>{jobCard.vehicle?.model || 'N/A'}</Text>
                    <Text style={[styles.licensePlate, { color: theme.textMuted }]}>{jobCard.vehicle?.license_plate || 'N/A'}</Text>
                  </View>
                </View>

                {/* Customer and Technician Info */}
                <View style={styles.infoSection}>
                  <Text style={[styles.infoText, { color: theme.textMuted }]}>
                    Customer : {jobCard.customer?.full_name || 'N/A'}
                  </Text>
                  <Text style={[styles.infoText, { color: theme.textMuted }]}>
                    Assigned tech: {jobCard.assigned_user?.full_name || 'N/A'}
                  </Text>
                </View>

                {/* Delivery Info */}
                <View style={[styles.deliveryRow, { borderTopColor: theme.border }]}>
                  <Text style={[styles.deliveryText, { color: theme.textMuted }]}>
                    Delivery date: {formatDate(deliveryDate.toISOString())}
                  </Text>
                  <Text style={[styles.deliveryText, { color: theme.textMuted }]}>
                    Delivery due: {deliveryTime}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredJobCards.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No job cards found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  backButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  darkModeIcon: {
    fontSize: 20,
  },
  avatarButton: {
    padding: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: {
    fontSize: 18,
    color: '#000000',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    padding: 4,
  },
  filterIcon: {
    fontSize: 16,
    color: '#000000',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#d1fae5',
    borderWidth: 2,
    borderColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  cardsContainer: {
    padding: 16,
    gap: 12,
  },
  jobCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  jobNumber: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  priceTag: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  carIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  licensePlate: {
    fontSize: 14,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  deliveryText: {
    fontSize: 13,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
