// ============================================
// COMPANY ADMIN DASHBOARD
// ============================================

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import * as SecureStore from 'expo-secure-store';
import { CustomerService } from '@/services/customer.service';
import { VehicleService } from '@/services/vehicle.service';
import { JobCardService } from '@/services/jobCard.service';
import { UserService } from '@/services/user.service';
import { useJobs } from '../../context/JobContext';

// Bar Chart Component (Moved outside to prevent unnecessary remounts)
const BarChart = ({ data }: { data: any[] }) => {
  const maxValue = 15;
  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#4682B4' }]} />
          <Text style={styles.legendText}>branch 1</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#35C56A' }]} />
          <Text style={styles.legendText}>branch 2</Text>
        </View>
      </View>
      <View style={styles.chartContent}>
        <View style={styles.yAxis}>
          {[15, 10, 5, 0].map((value) => (
            <Text key={value} style={styles.yAxisLabel}>{value}</Text>
          ))}
        </View>
        <View style={styles.barsContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.barGroup}>
              <View style={styles.bars}>
                <View style={[styles.bar, { height: (item.branch1 / maxValue) * 120, backgroundColor: '#4682B4' }]} />
                <View style={[styles.bar, { height: (item.branch2 / maxValue) * 120, backgroundColor: '#35C56A' }]} />
              </View>
              <Text style={styles.xAxisLabel}>{item.month}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default function CompanyAdminDashboard() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { jobs, getJobsByStatus } = useJobs();

  const activeJobs = getJobsByStatus('active');
  const totalJobs = jobs.length;

  const [stats, setStats] = useState({
    activeJobs: 0,
    customers: 0,
    vehicles: 0,
    revenue: 0,
    checkIn: 0,
    processing: 0,
    delivery: 0,
    newCustomers: 0,
    staff: {
      branchManager: 0,
      supervisor: 0,
      technicianManager: 0,
      technician: 0,
    }
  });

  const [refreshing, setRefreshing] = useState(false);

  const chartData = useMemo(() => [
    { month: 'Jan', branch1: 8, branch2: 6 },
    { month: 'Feb', branch1: 10, branch2: 8 },
    { month: 'Mar', branch1: 12, branch2: 10 },
    { month: 'Apr', branch1: 14, branch2: 12 },
    { month: 'May', branch1: 15, branch2: 13 },
  ], []);

  const staffData = useMemo(() => ({
    branchManager: 2,
    supervisor: 4,
    technicianManager: 10,
    technician: 40,
  }), []);

  const loadStats = useCallback(async () => {
    try {
      const branchId = user?.profile?.branch_id || undefined;

      const [
        vehicleCount,
        customerCount,
        activeJobCount,
        dashboardStats,
        staffStats,
        newCustomersCount
      ] = await Promise.all([
        VehicleService.getCount(),
        CustomerService.getCount(),
        JobCardService.getActiveCount(),
        JobCardService.getDashboardStats(branchId),
        UserService.getStaffStats(branchId),
        CustomerService.getNewCustomersCount(branchId)
      ]);

      setStats({
        vehicles: vehicleCount,
        customers: customerCount,
        activeJobs: activeJobCount,
        checkIn: dashboardStats.checkIn,
        processing: dashboardStats.processing,
        delivery: dashboardStats.delivery,
        revenue: dashboardStats.revenue,
        staff: staffStats,
        newCustomers: newCustomersCount
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [user]);

  const showLoginCredentials = useCallback(async () => {
    try {
      const usersJson = await SecureStore.getItemAsync('garage_square_users');
      if (usersJson) {
        const parsed = JSON.parse(usersJson);
        const users = Array.isArray(parsed) ? parsed : [];
        const adminUser = users.find((u: any) => u.userData?.profile?.role?.name === 'company_admin');
        if (adminUser) {
          console.log('\n=== COMPANY ADMIN LOGIN CREDENTIALS ===');
          console.log(`Email: ${adminUser.email}`);
          console.log(`Password: ${adminUser.password}`);
          console.log('========================================\n');
        }
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
      showLoginCredentials();
    }, [loadStats, showLoginCredentials])
  );

  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => loadStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => loadStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_cards' }, () => loadStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => loadStats())
      .subscribe();

    return () => {
      // Explicitly check if supabase exists before calling removeChannel
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4682B4"
            colors={['#4682B4']} // Android support
          />
        }
      >
        <View style={styles.container}>
          <View style={styles.cardRow}>
            {/* Active Jobs Card */}
            <TouchableOpacity
              style={[styles.largeCard, styles.activeJobsCard]}
              onPress={() => navigation.navigate('ActiveJobs')}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.cardTitle, styles.whiteText]}>Active Jobs</Text>
                  <Text style={[styles.cardValue, styles.whiteText]}>{activeJobs.length}</Text>
                  <Text style={[styles.cardTrend, styles.whiteText]}>+10%</Text>
                </View>
                <View style={styles.cardIcon}>
                  <Text style={styles.iconEmoji}>🔧</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Customers Card */}
            <TouchableOpacity
              style={[styles.largeCard, styles.whiteCard]}
              onPress={() => navigation.navigate('Customers')} // Original navigation
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Customers</Text>
                  <Text style={styles.cardValue}>{stats.customers}</Text>
                  <Text style={styles.cardTrend}>+12%</Text>
                </View>
                <View style={styles.cardIcon}>
                  <Text style={styles.iconEmoji}>👥</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.cardRow}>
            {/* Vehicle Card */}
            <TouchableOpacity
              style={[styles.largeCard, styles.whiteCard]}
              onPress={() => navigation.navigate('Vehicles')}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>Vehicle</Text>
                  <Text style={styles.cardValue}>{stats.vehicles}</Text>
                  <Text style={styles.cardTrend}>+9%</Text>
                </View>
                <View style={styles.cardIcon}>
                  <Text style={styles.iconEmoji}>🚗</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Revenue Card (Static for now) */}
            <View style={[styles.largeCard, styles.revenueCard]}>
              <View style={styles.cardContent}>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.cardTitle, styles.whiteText]}>Revenue</Text>
                  <Text style={[styles.cardValue, styles.whiteText]}>₹{stats.revenue >= 100000 ? `${(stats.revenue / 100000).toFixed(1)}L` : stats.revenue.toLocaleString()}</Text>
                  <Text style={[styles.cardTrend, styles.whiteText]}>+10%</Text>
                </View>
                <View style={styles.cardIcon}>
                  <Text style={styles.iconEmoji}>💰</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.chartCard, styles.whiteCard]}>
            <BarChart data={chartData} />
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusCard, styles.whiteCard]}>
              <Text style={styles.statusTitle}>Check-in</Text>
              <Text style={styles.statusValue}>{stats.checkIn}</Text>
            </View>
            <View style={[styles.statusCard, styles.whiteCard]}>
              <Text style={styles.statusTitle}>Processing</Text>
              <Text style={styles.statusValue}>{stats.processing}</Text>
            </View>
            <View style={[styles.statusCard, styles.whiteCard]}>
              <Text style={styles.statusTitle}>Delivery</Text>
              <Text style={styles.statusValue}>{stats.delivery}</Text>
            </View>
          </View>

          <View style={styles.bottomRow}>
            <View style={[styles.bottomCard, styles.whiteCard]}>
              <Text style={styles.bottomCardTitle}>Staff</Text>
              <View style={styles.staffList}>
                <View style={styles.staffItem}>
                  <Text style={styles.staffLabel}>Branch Manager:</Text>
                  <Text style={styles.staffValue}>{stats.staff.branchManager}</Text>
                </View>
                <View style={styles.staffItem}>
                  <Text style={styles.staffLabel}>Supervisor:</Text>
                  <Text style={styles.staffValue}>{stats.staff.supervisor}</Text>
                </View>
                <View style={styles.staffItem}>
                  <Text style={styles.staffLabel}>Technician Manager:</Text>
                  <Text style={styles.staffValue}>{stats.staff.technicianManager}</Text>
                </View>
                <View style={styles.staffItem}>
                  <Text style={styles.staffLabel}>Technician:</Text>
                  <Text style={styles.staffValue}>{stats.staff.technician}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.bottomCard, styles.whiteCard]}>
              <Text style={styles.bottomCardTitle}>New Customers</Text>
              <Text style={styles.bottomCardSubtitle}>This month</Text>
              <Text style={styles.newCustomersValue}>{stats.newCustomers}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  largeCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
  },
  activeJobsCard: {
    backgroundColor: '#4682B4',
  },
  revenueCard: {
    backgroundColor: '#C37125',
  },
  whiteCard: {
    backgroundColor: '#ffffff',
    shadowColor: '#272727',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flex: 1,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    color: 'rgba(39, 39, 39, 0.63)',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#272727',
    marginBottom: 4,
  },
  cardTrend: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  whiteText: {
    color: '#ffffff',
  },
  cardIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 32,
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 200,
  },
  chartContainer: {
    flex: 1,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: '#272727',
  },
  chartContent: {
    flexDirection: 'row',
    height: 150,
  },
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#272727',
    textAlign: 'right',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingLeft: 8,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 120,
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  xAxisLabel: {
    fontSize: 10,
    color: '#272727',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statusCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
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
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  bottomCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#272727',
    marginBottom: 12,
  },
  bottomCardSubtitle: {
    fontSize: 12,
    color: '#272727',
    marginBottom: 8,
  },
  staffList: {
    gap: 8,
  },
  staffItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  staffLabel: {
    fontSize: 14,
    color: 'rgba(39, 39, 39, 0.63)',
  },
  staffValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#272727',
  },
  newCustomersValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#272727',
    marginTop: 8,
  },
});
