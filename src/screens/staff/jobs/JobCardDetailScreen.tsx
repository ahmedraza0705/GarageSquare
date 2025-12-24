// ============================================
// JOB CARD DETAIL SCREEN
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { JobCardService } from '@/services/jobCard.service';
import { JobCard } from '@/types';

// Mock tasks data - replace with actual data from your service
const mockTasks = [
  {
    id: 'task_1',
    title: 'Replace Battery',
    status: 'completed',
    assigned_to: 'Ahmed Raza',
    estimate: '20 min',
    cost: 7000,
  },
  {
    id: 'task_2',
    title: 'Engine oil change',
    status: 'pending',
    assigned_to: 'Ahmed Raza',
    estimate: '30 min',
    cost: 2000,
  },
  {
    id: 'task_3',
    title: 'Paint Job',
    status: 'need_approval',
    assigned_to: 'Saafir',
    estimate: '1 hour',
    cost: 10000,
  },
  {
    id: 'task_4',
    title: 'Change Tires',
    status: 'rejected',
    assigned_to: 'Ahmed Raza',
    estimate: '30 min',
    cost: 0,
  },
  {
    id: 'task_5',
    title: 'AC repair',
    status: 'pending',
    assigned_to: 'Ahmed Raza',
    estimate: '45 min',
    cost: 1000,
  },
  {
    id: 'task_6',
    title: 'denting',
    status: 'pending',
    assigned_to: 'Ahmed Raza',
    estimate: '1 hour',
    cost: 1500,
  },
];

export default function JobCardDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { jobCardId } = route.params as { jobCardId: string };
  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadJobCard();
  }, []);

  const loadJobCard = async () => {
    try {
      setLoading(true);

      // Try to load from service first
      try {
        const data = await JobCardService.getById(jobCardId);
        if (data) {
          setJobCard(data);
        }
      } catch (serviceError) {
        // If service fails, use static data for demo
        console.log('Service unavailable, using static data');
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
            description: 'Engine repair and maintenance. Complete engine overhaul required.',
            estimated_cost: 21500,
            actual_cost: 22000,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            customer: {
              id: 'customer_001',
              full_name: 'Ahmed',
              phone: '+919890938291',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            vehicle: {
              id: 'vehicle_001',
              customer_id: 'customer_001',
              make: 'Honda',
              model: 'City',
              year: 2020,
              license_plate: 'GJ-05-RT-2134',
              vin: 'GJ-05-RT-2134',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            assigned_user: {
              id: 'tech_001',
              email: 'ahmed.raza@example.com',
              full_name: 'Ahmed Raza',
              role_id: null,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        ];

        const foundJobCard = staticJobCards.find(jc => jc.id === jobCardId);
        if (foundJobCard) {
          setJobCard(foundJobCard);
        } else {
          throw new Error('Job card not found');
        }
      }
    } catch (error) {
      console.error('Error loading job card:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Complete', color: '#10b981', bgColor: '#d1fae5' };
      case 'pending':
        return { label: 'PENDING', color: '#6b7280', bgColor: '#f3f4f6' };
      case 'need_approval':
        return { label: 'Need Approval', color: '#f97316', bgColor: '#ffedd5' };
      case 'rejected':
        return { label: 'Rejected', color: '#ef4444', bgColor: '#fee2e2' };
      default:
        return { label: 'Pending', color: '#6b7280', bgColor: '#f3f4f6' };
    }
  };

  const getTaskActionButton = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'done', disabled: true, color: '#9ca3af' };
      case 'pending':
        return { label: 'Mark done', disabled: false, color: '#6b7280' };
      case 'need_approval':
        return { label: 'Need Approval', disabled: true, color: '#9ca3af' };
      case 'rejected':
        return { label: 'Rejected', disabled: true, color: '#9ca3af' };
      default:
        return { label: 'Mark done', disabled: false, color: '#6b7280' };
    }
  };

  const taskSummary = {
    total: mockTasks.length,
    complete: mockTasks.filter(t => t.status === 'completed').length,
    pending: mockTasks.filter(t => t.status === 'pending').length,
    approval: mockTasks.filter(t => t.status === 'need_approval').length,
    rejected: mockTasks.filter(t => t.status === 'rejected').length,
  };

  const totalCharges = mockTasks.reduce((sum, task) => sum + task.cost, 0);

  if (loading || !jobCard) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Image source={require('../../../assets/Arrow.png')} style={styles.backIcon} />
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
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Image source={require('../../../assets/Arrow.png')} style={styles.backIcon} />
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Job Card Container */}
        <View style={styles.jobCardContainer}>
          {/* Job Card Header */}
          <View style={styles.jobCardHeader}>
            <Text style={styles.jobCardTitle}>Job Card: {jobCard.job_number}</Text>
            {jobCard.priority === 'urgent' && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            )}
          </View>

          {/* Vehicle and Customer Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>VIN:</Text>
              <Text style={styles.infoValue}>{jobCard.vehicle?.license_plate || jobCard.vehicle?.vin || 'N/A'}</Text>
            </View>

            <View style={styles.vehicleRow}>
              <Text style={styles.vehicleModel}>
                {jobCard.vehicle?.make} {jobCard.vehicle?.model}
              </Text>
              <Text style={styles.carIcon}>🚗</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer:</Text>
              <Text style={styles.infoValue}>{jobCard.customer?.full_name || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone No.:</Text>
              <Text style={styles.infoValue}>{jobCard.customer?.phone || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Assigned tech:</Text>
              <Text style={styles.infoValue}>{jobCard.assigned_user?.full_name || 'N/A'}</Text>
            </View>
          </View>

          {/* Two Column Layout */}
          <View style={styles.twoColumnLayout}>
            {/* Left Column - Job Tasks */}
            <View style={styles.leftColumn}>
              <Text style={styles.sectionTitle}>Job Tasks</Text>

              {mockTasks.map((task) => {
                const statusBadge = getTaskStatusBadge(task.status);
                const actionButton = getTaskActionButton(task.status);

                return (
                  <View key={task.id} style={styles.taskItem}>
                    <View style={styles.taskHeader}>
                      <Text style={styles.taskTitle}>{task.title}:</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusBadge.bgColor }]}>
                        <Text style={[styles.statusText, { color: statusBadge.color }]}>
                          {statusBadge.label}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.taskDetail}>Assigned: {task.assigned_to}</Text>
                    <Text style={styles.taskDetail}>Estimate: {task.estimate}</Text>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: actionButton.color, opacity: actionButton.disabled ? 0.5 : 1 }]}
                      disabled={actionButton.disabled}
                    >
                      <Text style={styles.actionButtonText}>{actionButton.label}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Right Column - Summaries */}
            <View style={styles.rightColumn}>
              {/* Task Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Task Summary:</Text>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Tasks:</Text>
                  <Text style={styles.summaryValue}>{taskSummary.total}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Complete:</Text>
                  <Text style={styles.summaryValue}>{taskSummary.complete}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Pending:</Text>
                  <Text style={styles.summaryValue}>{taskSummary.pending}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Approval:</Text>
                  <Text style={styles.summaryValue}>{taskSummary.approval}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Rejected:</Text>
                  <Text style={styles.summaryValue}>{taskSummary.rejected}</Text>
                </View>
              </View>

              {/* Charges Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Charges Summary:</Text>
                {mockTasks.map((task) => (
                  <View key={task.id} style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>{task.title}:</Text>
                    <Text style={styles.summaryValue}>{task.cost.toLocaleString('en-IN')}</Text>
                  </View>
                ))}
                <View style={[styles.summaryItem, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>{totalCharges.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quality Check Section */}
          <View style={styles.qualitySection}>
            <Text style={styles.sectionTitle}>Quality Check Complete:</Text>
            <View style={styles.qualityRow}>
              <View style={styles.qualityItem}>
                <Text style={styles.qualityLabel}>Technician Manager:</Text>
                <TouchableOpacity style={[styles.qualityButton, styles.disabledButton]}>
                  <Text style={styles.qualityButtonText}>Not Done</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.qualityItem}>
                <Text style={styles.qualityLabel}>Technician:</Text>
                <TouchableOpacity style={[styles.qualityButton, styles.disabledButton]}>
                  <Text style={styles.qualityButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Ready to Delivery Section */}
          <View style={styles.deliverySection}>
            <Text style={styles.sectionTitle}>Ready to delivery:</Text>
            <Text style={styles.deliveryValue}>False</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
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
    color: '#000000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  darkModeIcon: {
    fontSize: 20,
    color: '#ffffff',
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  jobCardContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  jobCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  urgentBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  infoSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginRight: 8,
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleModel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  carIcon: {
    fontSize: 24,
  },
  twoColumnLayout: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  taskItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  taskDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
  summaryValue: {
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  qualitySection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  qualityRow: {
    flexDirection: 'row',
    gap: 16,
  },
  qualityItem: {
    flex: 1,
  },
  qualityLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  qualityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#9ca3af',
  },
  disabledButton: {
    opacity: 0.5,
  },
  qualityButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  deliverySection: {
    marginBottom: 8,
  },
  deliveryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
});
