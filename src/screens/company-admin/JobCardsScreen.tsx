// ============================================
// JOB CARDS SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { JobCardService } from '@/services/jobCard.service';
import { JobCard } from '@/types';
import { useJobs } from '@/context/JobContext';
import { useTheme } from '@/context/ThemeContext';

export default function JobCardsScreen() {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [filteredJobCards, setFilteredJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { jobs } = useJobs();

  // Get delivered jobs from JobContext
  const deliveredJobs = jobs.filter(job =>
    job.status.toLowerCase() === 'delivered'
  );

  useEffect(() => {
    loadJobCards();
  }, []);

  const loadJobCards = async () => {
    try {
      setLoading(true);
      const data = await JobCardService.getAll();
      setJobCards(data);
    } catch (error: any) {
      // If table doesn't exist, just use JobContext data (no error shown)
      if (error?.code === 'PGRST205' || error?.message?.includes('schema cache')) {
        console.log('Job cards table not found in database, using JobContext data only');
        setJobCards([]);
      } else {
        console.error('Error loading job cards:', error);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadJobCards();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadJobCards();
    }, [])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredJobCards(jobCards);
      return;
    }

    const filtered = jobCards.filter((jc) =>
      jc.job_number.toLowerCase().includes(query.toLowerCase()) ||
      jc.customer?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
      jc.vehicle?.license_plate?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredJobCards(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'done':
        return '#22c55e'; // Green
      case 'in_progress':
      case 'progress':
        return '#3b82f6'; // Blue
      case 'on_hold':
        return '#f59e0b'; // Yellow
      case 'cancelled':
        return '#ef4444'; // Red
      default:
        return '#9ca3af'; // Gray
    }
  };

  const renderJobItem = (job: any, isContextJob: boolean) => {
    const status = isContextJob ? 'Delivered' : job.status;
    const color = getStatusColor(status);

    return (
      <TouchableOpacity
        key={job.id}
        style={styles.card}
        onPress={() => {
          navigation.navigate('JobCardDetail', { jobCardId: job.id });
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.jobNumber}>{isContextJob ? job.jobId : job.job_number}</Text>
          <View style={[styles.statusBadge, { backgroundColor: color + '20' }]}>
            <Text style={[styles.statusText, { color: color }]}>
              {status.replace('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.label}>Customer:</Text>
          <Text style={styles.value}>
            {isContextJob ? job.customer : job.customer?.full_name}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.label}>Vehicle:</Text>
          <Text style={styles.value}>
            {isContextJob ? job.vehicle : `${job.vehicle?.brand} ${job.vehicle?.model}`}
          </Text>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.value}>
            {isContextJob ? job.amount : `₹${job.estimated_cost?.toLocaleString('en-IN')}`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadJobCards} />
        }
      >
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateJobCard')}
        >
          <Text style={styles.createButtonText}>+ Create Job Card</Text>
        </TouchableOpacity>

        {deliveredJobs.length === 0 && jobCards.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No job cards found</Text>
          </View>
        ) : (
          <>
            {deliveredJobs.map((job) => renderJobItem(job, true))}
            {jobCards.map((jobCard) => renderJobItem(jobCard, false))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  createButton: {
    backgroundColor: '#0087c9', // Pic 3 Blue
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
  },
});

