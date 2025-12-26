// ============================================
// ACTIVE JOBS SCREEN (Company Admin)
// ============================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ProgressBarAndroid, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Building2, Users, FileBarChart } from 'lucide-react-native';
import { useJobs } from '../../context/JobContext';

// --- STATIC DATA REMOVED ---

export default function ActiveJobsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { getJobsByStatus } = useJobs();
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  // Get active jobs from global context and filter based on search query
  const allActiveJobs = getJobsByStatus('active');
  // Helper to parse DD-MM-YYYY to timestamp
  const parseDate = (dateStr?: string) => {
    if (!dateStr) return 0;
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).getTime();
  };

  const jobs = [...allActiveJobs]
    .sort((a, b) => {
      // 1. Priority: Urgent first
      const aUrgent = a.priority === 'Urgent';
      const bUrgent = b.priority === 'Urgent';
      if (aUrgent && !bUrgent) return -1;
      if (!aUrgent && bUrgent) return 1;

      // 2. Sort by Delivery Date (Newest to Oldest)
      // "Newest" means latest date (e.g. 2025 > 2024) -> Descending
      const dateA = parseDate(a.deliveryDate);
      const dateB = parseDate(b.deliveryDate);

      // If dates are equal, fallback to updatedAt
      if (dateA === dateB) {
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      }
      return dateB - dateA;
    })
    .filter(job => {
      const query = searchQuery.toLowerCase();
      return (
        (job.customer?.toLowerCase() || '').includes(query) ||
        (job.regNo?.toLowerCase() || '').includes(query) ||
        (job.vehicle?.toLowerCase() || '').includes(query) ||
        (job.jobId?.toLowerCase() || '').includes(query)
      );
    });

  // Helper to calculate progress percentage (Excluding Rejected)
  const calculateProgress = (job: any) => {
    if (!job.taskStatuses) return 0;
    const statuses = Object.values(job.taskStatuses) as string[];
    if (statuses.length === 0) return 0;

    const totalValid = statuses.filter(s => s !== 'rejected').length;
    const complete = statuses.filter(s => s === 'complete').length;

    // If everyone is rejected, technically there's no work left, so 100%?
    // Or if there are no valid tasks, progress is 0?
    // User request: "if total task is 6 and 1 is rejected then also the %complete should be 100%" implies 100% if remaining are done.
    // If ALL are rejected, we can consider it 100% complete (nothing left to do).
    if (totalValid === 0) return statuses.length > 0 ? 1 : 0;

    return complete / totalValid;
  };

  // Simple progress bar component since ProgressBarAndroid is Android only
  const ProgressBar = ({ progress, color }: { progress: number; color: string }) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
    </View>
  );

  // Calculate time left from now until delivery date/time
  const calculateTimeLeft = (dateStr?: string, timeStr?: string) => {
    if (!dateStr || !timeStr) return timeStr || 'N/A';

    try {
      // Parse Date: DD-MM-YYYY
      const [day, month, year] = dateStr.split('-').map(Number);

      // Parse Time: HH:MM AM/PM
      const timeParts = timeStr.toUpperCase().trim().split(' ');
      // Handle cases like "5:00PM" (no space) or "5:00 PM"
      let time, modifier;
      if (timeParts.length === 1) {
        // Try splitting by AM/PM if attached
        if (timeParts[0].includes('PM')) {
          modifier = 'PM';
          time = timeParts[0].replace('PM', '');
        } else if (timeParts[0].includes('AM')) {
          modifier = 'AM';
          time = timeParts[0].replace('AM', '');
        } else {
          // Assume 24h or missing modifier, treat as is for 24h or default AM
          time = timeParts[0];
          modifier = 'AM'; // Default
        }
      } else {
        [time, modifier] = timeParts;
      }

      let [hours, minutes] = time.split(':').map(Number);

      if (isNaN(hours) || isNaN(minutes)) throw new Error('Invalid Time');

      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;

      const targetDate = new Date(year, month - 1, day, hours, minutes);
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) return 'Overdue';

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) return `${days}d ${hrs}h left`;
      if (hrs > 0) return `${hrs}h ${mins}m left`;
      return `${mins}m left`;
    } catch (e) {
      return timeStr; // Fallback to original string if parse fails
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Job Cards"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateJobCard')}
          >
            <Text style={styles.addIcon}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Job Cards */}
        {jobs.map((job) => {
          const progress = calculateProgress(job);
          return (
            <TouchableOpacity
              key={job.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('JobCardDetail', { jobCardId: job.id })}
            >
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.jobCardTitle}>{job.jobId}</Text>
                  {job.priority === 'Urgent' && (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>Urgent</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.priceText}>{job.amount}</Text>
              </View>

              <View style={styles.separator} />

              {/* Vehicle Info */}
              <View style={styles.vehicleRow}>
                <View>
                  <Text style={styles.vehicleName}>{job.vehicle}</Text>
                  <Text style={styles.licensePlate}>{job.regNo}</Text>
                </View>
                <Text style={styles.carIcon}>🚗</Text>
              </View>

              <View style={styles.separator} />

              {/* Assignment & Progress */}
              <View style={styles.assignmentSection}>
                <View style={styles.assignedRow}>
                  <View style={styles.assignedAvatar}>
                    <Text style={styles.assignedInitials}>AR</Text>
                  </View>
                  <Text style={styles.assignedText}>Assigned to: <Text style={styles.boldText}>{job.assignedTech}</Text></Text>
                </View>

                <View style={styles.progressRow}>
                  <ProgressBar
                    progress={progress}
                    color={progress >= 1 ? '#22c55e' : '#3b82f6'}
                  />
                  <Text style={styles.progressText}>{Math.round(progress * 100)}% completed</Text>
                </View>
              </View>

              {/* Delivery Info */}
              <View style={styles.deliveryRow}>
                <View>
                  <Text style={styles.deliveryLabel}>Delivery due:</Text>
                  <Text style={styles.deliveryTimeLeft}>
                    {calculateTimeLeft(job.deliveryDate || '', job.deliveryDue)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.deliveryLabel}>Delivery date:</Text>
                  <Text style={styles.deliveryDate}>{job.deliveryDate || ''}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff0f1', // Light gray background
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 120, // Increased extra space for tab bar
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 48,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#000',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#a7f3d0', // Light green
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  addIcon: {
    fontSize: 24,
    color: '#000',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 12,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  licensePlate: {
    fontSize: 14,
    color: '#6b7280',
  },
  carIcon: {
    fontSize: 28,
  },
  assignmentSection: {
    marginBottom: 12,
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  assignedInitials: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  assignedText: {
    fontSize: 14,
    color: '#000',
  },
  boldText: {
    fontWeight: 'bold',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 10,
    color: '#6b7280',
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  deliveryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  deliveryTimeLeft: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444', // Red
  },
  deliveryDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444', // Red
  },
  statusBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
