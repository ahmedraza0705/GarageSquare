// ============================================
// JOB CARD DETAIL SCREEN
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { JobCardService } from '@/services/jobCard.service';
import { JobCard } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

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
  const { theme, themeName, toggleTheme } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { jobCardId } = route.params as { jobCardId: string };
  const [jobCard, setJobCard] = useState<JobCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobCard();
  }, []);

  const loadJobCard = async () => {
    try {
      setLoading(true);

      // Try to load from service first
      try {
        const data = await JobCardService.getById(jobCardId);
        setJobCard(data);
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
      <View style={{ flex: 1, backgroundColor: theme.background }} className="items-center justify-center">
        <Text style={{ color: theme.textMuted }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }} className="flex-row items-center justify-between px-4 py-3 border-b">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.headerText} />
          </TouchableOpacity>
          <Text style={{ color: theme.headerText }} className="text-lg font-bold">Active Jobs</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={toggleTheme}>
            <View style={{ backgroundColor: theme.surfaceAlt }} className="p-1 rounded-full w-8 h-8 items-center justify-center">
              <Ionicons name={themeName === 'dark' ? 'sunny' : 'moon'} size={16} color={theme.headerText} />
            </View>
          </TouchableOpacity>
          <View className="bg-red-300 w-8 h-8 rounded-lg items-center justify-center">
            <Text className="text-red-800 font-bold">
              {user?.profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Job Card Container */}
        <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="margin-4 rounded-xl p-4 border shadow-sm m-4">
          {/* Job Card Header */}
          <View className="flex-row justify-between items-center mb-4">
            <Text style={{ color: theme.text }} className="text-xl font-bold">Job Card: {jobCard.job_number}</Text>
            {jobCard.priority === 'urgent' && (
              <View className="bg-red-100 px-3 py-1 rounded-full">
                <Text className="text-red-600 text-xs font-bold uppercase">Urgent</Text>
              </View>
            )}
          </View>

          {/* Vehicle and Customer Info */}
          <View style={{ borderBottomColor: theme.border }} className="mb-5 pb-4 border-b">
            <View className="flex-row mb-2">
              <Text style={{ color: theme.textMuted }} className="text-sm mr-2 min-w-[100px]">VIN:</Text>
              <Text style={{ color: theme.text }} className="text-sm font-medium">{jobCard.vehicle?.license_plate || jobCard.vehicle?.vin || 'N/A'}</Text>
            </View>

            <View className="flex-row items-center mb-2">
              <Text style={{ color: theme.text }} className="text-lg font-semibold mr-2">
                {jobCard.vehicle?.make} {jobCard.vehicle?.model}
              </Text>
              <Text className="text-2xl">🚗</Text>
            </View>

            <View className="flex-row mb-2">
              <Text style={{ color: theme.textMuted }} className="text-sm mr-2 min-w-[100px]">Customer:</Text>
              <Text style={{ color: theme.text }} className="text-sm font-medium">{jobCard.customer?.full_name || 'N/A'}</Text>
            </View>

            <View className="flex-row mb-2">
              <Text style={{ color: theme.textMuted }} className="text-sm mr-2 min-w-[100px]">Phone No.:</Text>
              <Text style={{ color: theme.text }} className="text-sm font-medium">{jobCard.customer?.phone || 'N/A'}</Text>
            </View>

            <View className="flex-row">
              <Text style={{ color: theme.textMuted }} className="text-sm mr-2 min-w-[100px]">Assigned tech:</Text>
              <Text style={{ color: theme.text }} className="text-sm font-medium">{jobCard.assigned_user?.full_name || 'N/A'}</Text>
            </View>
          </View>

          {/* Two Column Layout */}
          <View className="flex-row gap-4 mb-5">
            {/* Left Column - Job Tasks */}
            <View className="flex-1">
              <Text style={{ color: theme.text }} className="text-base font-bold mb-3">Job Tasks</Text>

              {mockTasks.map((task) => {
                const statusBadge = getTaskStatusBadge(task.status);
                const actionButton = getTaskActionButton(task.status);

                return (
                  <View key={task.id} style={{ borderBottomColor: theme.border }} className="mb-4 pb-3 border-b">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text style={{ color: theme.text }} className="text-sm font-semibold flex-1">{task.title}:</Text>
                      <View style={{ backgroundColor: statusBadge.bgColor }} className="px-2 py-1 rounded-lg">
                        <Text style={{ color: statusBadge.color }} className="text-[10px] font-bold uppercase">
                          {statusBadge.label}
                        </Text>
                      </View>
                    </View>
                    <Text style={{ color: theme.textMuted }} className="text-xs mb-1">Assigned: {task.assigned_to}</Text>
                    <Text style={{ color: theme.textMuted }} className="text-xs">Estimate: {task.estimate}</Text>
                    <TouchableOpacity
                      style={{ backgroundColor: actionButton.color, opacity: actionButton.disabled ? 0.5 : 1 }}
                      className="px-3 py-1.5 rounded-lg mt-2 self-start"
                      disabled={actionButton.disabled}
                    >
                      <Text className="text-white text-xs font-semibold">{actionButton.label}</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Right Column - Summaries */}
            <View className="flex-1">
              {/* Task Summary */}
              <View style={{ backgroundColor: theme.surfaceAlt }} className="p-3 rounded-xl mb-4">
                <Text style={{ color: theme.text }} className="text-sm font-bold mb-3">Task Summary:</Text>
                <View className="flex-row justify-between mb-2">
                  <Text style={{ color: theme.textMuted }} className="text-xs flex-1">Total Tasks:</Text>
                  <Text style={{ color: theme.text }} className="text-xs font-bold">{taskSummary.total}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text style={{ color: theme.textMuted }} className="text-xs flex-1">Complete:</Text>
                  <Text style={{ color: theme.text }} className="text-xs font-bold">{taskSummary.complete}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text style={{ color: theme.textMuted }} className="text-xs flex-1">Pending:</Text>
                  <Text style={{ color: theme.text }} className="text-xs font-bold">{taskSummary.pending}</Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text style={{ color: theme.textMuted }} className="text-xs flex-1">Approval:</Text>
                  <Text style={{ color: theme.text }} className="text-xs font-bold">{taskSummary.approval}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text style={{ color: theme.textMuted }} className="text-xs flex-1">Rejected:</Text>
                  <Text style={{ color: theme.text }} className="text-xs font-bold">{taskSummary.rejected}</Text>
                </View>
              </View>

              {/* Charges Summary */}
              <View style={{ backgroundColor: theme.surfaceAlt }} className="p-3 rounded-xl">
                <Text style={{ color: theme.text }} className="text-sm font-bold mb-3">Charges Summary:</Text>
                {mockTasks.map((task) => (
                  <View key={task.id} className="flex-row justify-between mb-2">
                    <Text style={{ color: theme.textMuted }} className="text-xs flex-1">{task.title}:</Text>
                    <Text style={{ color: theme.text }} className="text-xs font-bold">{task.cost.toLocaleString('en-IN')}</Text>
                  </View>
                ))}
                <View style={{ borderTopColor: theme.border }} className="mt-2 pt-2 border-t flex-row justify-between">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">Total:</Text>
                  <Text style={{ color: theme.text }} className="text-sm font-bold">{totalCharges.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quality Check Section */}
          <View style={{ borderBottomColor: theme.border }} className="mb-5 pb-4 border-b">
            <Text style={{ color: theme.text }} className="text-base font-bold mb-3">Quality Check Complete:</Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text style={{ color: theme.textMuted }} className="text-xs mb-2">Technician Manager:</Text>
                <TouchableOpacity style={{ opacity: 0.5 }} className="px-3 py-2 rounded-lg bg-gray-400">
                  <Text className="text-white text-xs font-semibold text-center">Not Done</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-1">
                <Text style={{ color: theme.textMuted }} className="text-xs mb-2">Technician:</Text>
                <TouchableOpacity style={{ opacity: 0.5 }} className="px-3 py-2 rounded-lg bg-gray-400">
                  <Text className="text-white text-xs font-semibold text-center">Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Ready to Delivery Section */}
          <View>
            <Text style={{ color: theme.text }} className="text-base font-bold">Ready to delivery:</Text>
            <Text style={{ color: theme.text }} className="text-2xl font-bold mt-2">False</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}


