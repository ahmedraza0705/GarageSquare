// ============================================
// MANAGER DASHBOARD
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useRole } from '@/hooks/useRole';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { JobCardService } from '@/services/jobCard.service';
import { CustomerService } from '@/services/customer.service';
import { VehicleService } from '@/services/vehicle.service';
import { useJobs } from '@/context/JobContext';

export default function ManagerDashboard() {
  const { branchId } = useRole();
  const { jobs } = useJobs();
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    jobCards: 0,
    revenue: 0,
    checkIn: 0,
    processing: 0,
    delivery: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      if (!branchId) return;

      // Run all queries in parallel
      const [
        customerCount,
        vehicleCount,
        jobCardCount,
        dashboardStats,
        paymentsResult
      ] = await Promise.all([
        CustomerService.getAll({ branch_id: branchId }).then(data => data.length),
        VehicleService.getAll({ branch_id: branchId }).then(data => data.length),
        JobCardService.getAll({ branch_id: branchId }).then(data => data.length),
        JobCardService.getDashboardStats(branchId),
        supabase!
          .from('payments')
          .select('amount')
          .eq('status', 'completed'),
      ]);

      const revenue = paymentsResult.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      setStats({
        customers: customerCount,
        vehicles: vehicleCount,
        jobCards: jobCardCount,
        revenue,
        checkIn: dashboardStats.checkIn,
        processing: dashboardStats.processing,
        delivery: dashboardStats.delivery,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [branchId]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  useEffect(() => {
    if (!supabase || !branchId) return;

    const channel = supabase
      .channel('manager-dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => loadStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => loadStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_cards' }, () => loadStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => loadStats())
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadStats, branchId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  const StatCard = ({ title, value }: { title: string; value: string | number }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#4682B4"
          colors={['#4682B4']}
        />
      }
    >
      <View style={styles.content}>
        <Text style={styles.title}>Branch Dashboard</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statRow}>
            <StatCard title="Customers" value={stats.customers} />
            <StatCard title="Vehicles" value={stats.vehicles} />
          </View>
          <View style={styles.statRow}>
            <StatCard title="Job Cards" value={stats.jobCards} />
            <StatCard title="Revenue" value={`₹${stats.revenue.toFixed(2)}`} />
          </View>
        </View>

        {/* Check-in, Processing, Delivery Cards */}
        <View style={styles.statusRow}>
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Check-in</Text>
            <Text style={styles.statusValue}>{stats.checkIn}</Text>
          </View>
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Processing</Text>
            <Text style={styles.statusValue}>{stats.processing}</Text>
          </View>
          <View style={styles.statusCard}>
            <Text style={styles.statusTitle}>Delivery</Text>
            <Text style={styles.statusValue}>{stats.delivery}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#272727',
    marginBottom: 24,
  },
  statsGrid: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#272727',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
    color: 'rgba(39, 39, 39, 0.63)',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#272727',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  statusCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#272727',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 14,
    color: 'rgba(39, 39, 39, 0.63)',
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#272727',
  },
});

