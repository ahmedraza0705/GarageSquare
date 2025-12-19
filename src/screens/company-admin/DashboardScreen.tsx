// ============================================
// COMPANY ADMIN DASHBOARD
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import * as SecureStore from 'expo-secure-store';
import { CustomerService } from '@/services/customer.service';
import { JobCardService } from '@/services/jobCard.service';
import { VehicleService } from '@/services/vehicle.service';

export default function CompanyAdminDashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeJobs: 56,
    customers: 156,
    vehicles: 100,
    revenue: 24.5, // in Lakhs
    checkIn: 12,
    processing: 20,
    delivery: 40,
    newCustomers: 12,
  });
  const [refreshing, setRefreshing] = useState(false);

  const [chartData] = useState([
    { month: 'Jan', branch1: 8, branch2: 6 },
    { month: 'Feb', branch1: 10, branch2: 8 },
    { month: 'Mar', branch1: 12, branch2: 10 },
    { month: 'Apr', branch1: 14, branch2: 12 },
    { month: 'May', branch1: 15, branch2: 13 },
  ]);

  const [staffData] = useState({
    branchManager: 2,
    supervisor: 4,
    technicianManager: 10,
    technician: 40,
  });

  useEffect(() => {
    showLoginCredentials();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, []);

  const showLoginCredentials = async () => {
    try {
      const usersJson = await SecureStore.getItemAsync('garage_square_users');
      if (usersJson) {
        const users: Array<{ email: string; password: string; userData: any }> = JSON.parse(usersJson);
        const adminUser = users.find(u => u.userData?.profile?.role?.name === 'company_admin');

        if (adminUser) {
          console.log('\n=== COMPANY ADMIN LOGIN CREDENTIALS ===');
          console.log(`Email: ${adminUser.email}`);
          console.log(`Password: ${adminUser.password}`);
          console.log('========================================\n');
        } else {
          console.log('\n=== NO COMPANY ADMIN FOUND ===');
          console.log('Please sign up first. The first user becomes Company Admin.');
          console.log('================================\n');
        }
      } else {
        console.log('\n=== NO USERS FOUND ===');
        console.log('Please sign up first. The first user becomes Company Admin.');
        console.log('========================\n');
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Check if Supabase is disabled
      if (!supabase) {
        console.warn('Supabase is disabled - using default stats');
        return;
      }

      // Load actual stats from database
      const customerCount = await CustomerService.getCount();

      setStats(prev => ({
        ...prev,
        customers: customerCount
      }));
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Bar Chart Component
  const BarChart = () => {
    const maxValue = 15;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2563eb' }]} />
            <Text style={styles.legendText}>branch 1</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>branch 2</Text>
          </View>
        </View>

        <View style={styles.chartContent}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            {[15, 10, 5, 0].map((value) => (
              <Text key={value} style={styles.yAxisLabel}>
                {value}
              </Text>
            ))}
          </View>

          {/* Chart bars */}
          <View style={styles.barsContainer}>
            {chartData.map((item, index) => (
              <View key={index} style={styles.barGroup}>
                <View style={styles.bars}>
                  <View
                    style={[
                      styles.bar,
                      { height: (item.branch1 / maxValue) * 120, backgroundColor: '#4682B4' },
                    ]}
                  />
                  <View
                    style={[
                      styles.bar,
                      { height: (item.branch2 / maxValue) * 120, backgroundColor: '#35C56A' },
                    ]}
                  />
                </View>
                <Text style={styles.xAxisLabel}>{item.month}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4682B4" />
        }
      >
        <View style={styles.container}>
          {/* Top Row Cards */}
          <View style={styles.cardRow}>
            {/* Active Jobs Card */}
            <TouchableOpacity
              style={[styles.largeCard, styles.activeJobsCard]}
              onPress={() => navigation.navigate('ActiveJobs' as never)}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.cardTitle, styles.whiteText]}>Active Jobs</Text>
                  <Text style={[styles.cardValue, styles.whiteText]}>{stats.activeJobs}</Text>
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
              onPress={() => navigation.navigate('Customers' as never)}
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

          {/* Second Row Cards */}
          <View style={styles.cardRow}>
            {/* Vehicle Card */}
            <View style={[styles.largeCard, styles.whiteCard]}>
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
            </View>

            {/* Revenue Card */}
            <View style={[styles.largeCard, styles.revenueCard]}>
              <View style={styles.cardContent}>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.cardTitle, styles.whiteText]}>Revenue</Text>
                  <Text style={[styles.cardValue, styles.whiteText]}>₹{stats.revenue}L</Text>
                  <Text style={[styles.cardTrend, styles.whiteText]}>+10%</Text>
                </View>
                <View style={styles.cardIcon}>
                  <Text style={styles.iconEmoji}>💰</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bar Chart Card */}
          <View style={[styles.chartCard, styles.whiteCard]}>
            <BarChart />
          </View>

          {/* Third Row - Status Cards */}
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

          {/* Bottom Row - Staff and New Customers */}
          <View style={styles.bottomRow}>
            {/* Staff Card */}
            <View style={[styles.bottomCard, styles.whiteCard]}>
              <Text style={styles.bottomCardTitle}>Staff</Text>
              <View style={styles.staffList}>
                <View style={styles.staffItem}>
                  <Text style={styles.staffLabel}>Branch Manager:</Text>
                  <Text style={styles.staffValue}>{staffData.branchManager}</Text>
                </View>
                <View style={styles.staffItem}>
                  <Text style={styles.staffLabel}>Supervisor:</Text>
                  <Text style={styles.staffValue}>{staffData.supervisor}</Text>
                </View>
                <View style={styles.staffItem}>
                  <Text style={styles.staffLabel}>Technician Manager:</Text>
                  <Text style={styles.staffValue}>{staffData.technicianManager}</Text>
                </View>
                <View style={styles.staffItem}>
                  <Text style={styles.staffLabel}>Technician:</Text>
                  <Text style={styles.staffValue}>{staffData.technician}</Text>
                </View>
              </View>
            </View>

            {/* New Customers Card */}
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
    paddingBottom: 100, // Space for bottom navigation
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
    color: '#272727a0',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#272727',
    marginBottom: 4,
  },
  revenueValue: {
    color: '#ffffff',
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
    color: '#272727a0',
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
    color: '#272727a0',
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
