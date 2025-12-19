// ============================================
// COMPANY ADMIN DASHBOARD
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { CustomerService } from '@/services/customer.service';
import { JobCardService } from '@/services/jobCard.service';
import { VehicleService } from '@/services/vehicle.service';

export default function CompanyAdminDashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme, themeName } = useTheme();
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
            <Text style={[styles.legendText, { color: theme.text }]}>branch 1</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
            <Text style={[styles.legendText, { color: theme.text }]}>branch 2</Text>
          </View>
        </View>

        <View style={styles.chartContent}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            {[15, 10, 5, 0].map((value) => (
              <Text key={value} style={[styles.yAxisLabel, { color: theme.text }]}>
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
                <Text style={[styles.xAxisLabel, { color: theme.text }]}>{item.month}</Text>
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
                  <Ionicons name="construct-outline" size={32} color="#ffffff" />
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
                  <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Customers</Text>
                  <Text style={[styles.cardValue, { color: theme.text }]}>{stats.customers}</Text>
                  <Text style={styles.cardTrend}>+12%</Text>
                </View>
                <View style={styles.cardIcon}>
                  <Ionicons name="people-outline" size={32} color={theme.text} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Second Row Cards */}
          <View style={styles.cardRow}>
            {/* Vehicle Card */}
            <TouchableOpacity
              style={[styles.largeCard, { backgroundColor: theme.surface }]}
              onPress={() => navigation.navigate('Vehicles' as never)}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.cardTitle, { color: theme.textMuted }]}>Vehicle</Text>
                  <Text style={[styles.cardValue, { color: theme.text }]}>{stats.vehicles}</Text>
                  <Text style={styles.cardTrend}>+9%</Text>
                </View>
                <View style={styles.cardIcon}>
                  <Ionicons name="car-outline" size={32} color={theme.text} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Revenue Card */}
            <View style={[styles.largeCard, styles.revenueCard]}>
              <View style={styles.cardContent}>
                <View style={styles.cardTextContainer}>
                  <Text style={[styles.cardTitle, styles.whiteText]}>Revenue</Text>
                  <Text style={[styles.cardValue, styles.whiteText]}>₹{stats.revenue}L</Text>
                  <Text style={[styles.cardTrend, styles.whiteText]}>+10%</Text>
                </View>
                <View style={styles.cardIcon}>
                  <Ionicons name="cash-outline" size={32} color="#ffffff" />
                </View>
              </View>
            </View>
          </View>

          {/* Bar Chart Card */}
          <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
            <BarChart />
          </View>

          {/* Third Row - Status Cards */}
          <View style={styles.statusRow}>
            <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statusTitle, { color: theme.textMuted }]}>Check-in</Text>
              <Text style={[styles.statusValue, { color: theme.text }]}>{stats.checkIn}</Text>
            </View>
            <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statusTitle, { color: theme.textMuted }]}>Processing</Text>
              <Text style={[styles.statusValue, { color: theme.text }]}>{stats.processing}</Text>
            </View>
            <View style={[styles.statusCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statusTitle, { color: theme.textMuted }]}>Delivery</Text>
              <Text style={[styles.statusValue, { color: theme.text }]}>{stats.delivery}</Text>
            </View>
          </View>

          {/* Bottom Row - Staff and New Customers */}
          <View style={styles.bottomRow}>
            {/* Staff Card */}
            <View style={[styles.bottomCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.bottomCardTitle, { color: theme.text }]}>Staff</Text>
              <View style={styles.staffList}>
                <View style={styles.staffItem}>
                  <Text style={[styles.staffLabel, { color: theme.textMuted }]}>Branch Manager:</Text>
                  <Text style={[styles.staffValue, { color: theme.text }]}>{staffData.branchManager}</Text>
                </View>
                <View style={styles.staffItem}>
                  <Text style={[styles.staffLabel, { color: theme.textMuted }]}>Supervisor:</Text>
                  <Text style={[styles.staffValue, { color: theme.text }]}>{staffData.supervisor}</Text>
                </View>
                <View style={styles.staffItem}>
                  <Text style={[styles.staffLabel, { color: theme.textMuted }]}>Technician Manager:</Text>
                  <Text style={[styles.staffValue, { color: theme.text }]}>{staffData.technicianManager}</Text>
                </View>
                <View style={styles.staffItem}>
                  <Text style={[styles.staffLabel, { color: theme.textMuted }]}>Technician:</Text>
                  <Text style={[styles.staffValue, { color: theme.text }]}>{staffData.technician}</Text>
                </View>
              </View>
            </View>

            {/* New Customers Card */}
            <View style={[styles.bottomCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.bottomCardTitle, { color: theme.text }]}>New Customers</Text>
              <Text style={[styles.bottomCardSubtitle, { color: theme.textMuted }]}>This month</Text>
              <Text style={[styles.newCustomersValue, { color: theme.text }]}>{stats.newCustomers}</Text>
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
    elevation: 0,
    shadowOpacity: 0,
  },
  activeJobsCard: {
    backgroundColor: '#4682B4',
  },
  revenueCard: {
    backgroundColor: '#C37125',
  },
  whiteCard: {
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
    fontSize: 12,
    color: '#272727a0',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 30,
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
    // Kept for backward compatibility if needed, but not used for Ionicons
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    minHeight: 200,
    elevation: 0,
    shadowOpacity: 0,
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
    elevation: 0,
    shadowOpacity: 0,
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
    elevation: 0,
    shadowOpacity: 0,
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
