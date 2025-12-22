// ============================================
// ACTIVE JOBS SCREEN (Company Admin)
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { JobCard } from '@/types';
import { JobCardService } from '@/services/jobCard.service';
import { supabase } from '@/lib/supabase';

export default function ActiveJobsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const loadActiveJobs = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      // Statuses that represent "Active"
      const activeStatuses: any[] = ['pending', 'in_progress', 'on_hold'];
      const data = await JobCardService.getAll({
        status: activeStatuses
      });
      setJobCards(data || []);
    } catch (error) {
      console.error('Error loading active jobs:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadActiveJobs(false);
    }, [loadActiveJobs])
  );

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('active-jobs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_cards' },
        () => {
          loadActiveJobs(false);
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadActiveJobs]);

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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleJobCardPress = (jobCard: JobCard) => {
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
    <View className="flex-1 bg-gray-50">
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={require('../../assets/Arrow.png')} style={styles.backIcon} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Active Jobs</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setDarkMode(!darkMode)}
            style={styles.headerButton}
          >
            <Text style={styles.darkModeIcon}>{darkMode ? '☀️' : '🌙'}</Text>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => loadActiveJobs(true)} />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBarRow}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search Active Jobs"
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
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

            return (
              <TouchableOpacity
                key={jobCard.id}
                style={styles.jobCard}
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
                  <Text style={styles.jobNumber}>Job Card {jobCard.job_number}</Text>

                  {/* Price Tag */}
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>₹{jobCard.estimated_cost?.toLocaleString('en-IN') || '0'}</Text>
                  </View>
                </View>

                {/* Vehicle Section with Icon */}
                <View style={styles.vehicleSection}>
                  <Text style={styles.carIcon}>🚗</Text>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleModel}>{jobCard.vehicle?.make} {jobCard.vehicle?.model || 'N/A'}</Text>
                    <Text style={styles.licensePlate}>{jobCard.vehicle?.license_plate || 'N/A'}</Text>
                  </View>
                </View>

                {/* Customer and Technician Info */}
                <View style={styles.infoSection}>
                  <Text style={styles.infoText}>
                    Customer : {jobCard.customer?.full_name || 'N/A'}
                  </Text>
                  <Text style={styles.infoText}>
                    Assigned tech: {jobCard.assigned_user?.full_name || 'N/A'}
                  </Text>
                </View>

                {/* Delivery Info */}
                <View style={styles.deliveryRow}>
                  <Text style={styles.deliveryText}>
                    Date: {formatDate(jobCard.created_at)}
                  </Text>
                  <Text style={styles.deliveryText}>
                    Priority: {jobCard.priority}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {filteredJobCards.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active job cards found</Text>
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    color: '#000000',
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    color: '#111827',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
    color: '#111827',
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
    color: '#111827',
    marginBottom: 4,
  },
  licensePlate: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoSection: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  deliveryText: {
    fontSize: 13,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});

