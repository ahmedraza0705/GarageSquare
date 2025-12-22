// ============================================
// REPORTS SCREEN (Company Admin)
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-chart-kit';
import {
  BarChart3,
} from 'lucide-react-native';
import { ReportsService, RevenueData } from '@/services/reports.service';
import { useAuth } from '@/hooks/useAuth';

const screenWidth = Dimensions.get('window').width;

type TimePeriod = 'Today' | 'Week' | 'Month' | 'Quarter' | 'Year';

export default function ReportsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('Month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<RevenueData | null>(null);

  const periods: TimePeriod[] = ['Today', 'Week', 'Month', 'Quarter', 'Year'];

  // Load reports from Supabase
  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const branchId = user?.profile?.branch_id;
      const data = await ReportsService.getRevenueByPeriod(selectedPeriod, branchId);

      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Use loaded data or fallback to empty state
  const currentData = reportData || {
    totalRevenue: 0,
    totalCustomers: 0,
    returnCustomerPercent: 0,
    newCustomerPercent: 0,
    revenueTrendData: { labels: [], datasets: [], legend: [] },
    branchComparisonData: { labels: [], datasets: [], legend: [] },
    branchRevenue: [],
  };

  const totalRevenue = currentData.totalRevenue;
  const totalCustomers = currentData.totalCustomers;
  const returnCustomerPercent = currentData.returnCustomerPercent;
  const newCustomerPercent = currentData.newCustomerPercent;
  const revenueTrendData = currentData.revenueTrendData;
  const branchComparisonData = currentData.branchComparisonData;
  const branchRevenue = currentData.branchRevenue;

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 100000).toFixed(2).replace(/\.?0+$/, '')},${(amount % 100000).toString().padStart(5, '0')}`;
  };

  const chartConfig = {
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    labelColor: (opacity = 1) => theme.textMuted,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    },
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Time Period Tabs */}
        <View className="flex-row mb-4">
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              className="flex-1 py-2 mx-1 rounded-lg items-center"
              style={{
                backgroundColor: selectedPeriod === period ? theme.primary : theme.surface,
                borderWidth: 1,
                borderColor: selectedPeriod === period ? theme.primary : theme.border,
              }}
            >
              <Text
                className="font-medium text-sm"
                style={{ color: selectedPeriod === period ? '#FFFFFF' : theme.text }}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading State */}
        {loading ? (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color={theme.primary} />
            <Text className="text-sm mt-4" style={{ color: '#9E9E9E' }}>
              Loading reports...
            </Text>
          </View>
        ) : error ? (
          /* Error State */
          <View className="items-center justify-center py-20">
            <BarChart3 size={64} color="#EF5350" />
            <Text className="text-base mt-4 mb-2" style={{ color: '#EF5350' }}>
              {error}
            </Text>
            <TouchableOpacity
              className="px-6 py-3 rounded-lg"
              style={{ backgroundColor: theme.primary }}
              onPress={loadReports}
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Total Revenue Card */}
            <View className="rounded-lg p-4 mb-4 flex-row justify-between items-center" style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }}>
              <View>
                <Text className="text-sm" style={{ color: theme.textMuted }}>Total Revenue</Text>
                <Text className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {formatCurrency(totalRevenue)}
                </Text>
              </View>
            </View>

            {/* Revenue Trend Chart */}
            {revenueTrendData.labels.length > 0 && (
              <View className="rounded-lg p-3 mb-4" style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }}>
                <BarChart
                  data={revenueTrendData}
                  width={screenWidth - 48}
                  height={200}
                  chartConfig={chartConfig}
                  showValuesOnTopOfBars={false}
                  fromZero
                  yAxisLabel=""
                  yAxisSuffix="k"
                  style={{ marginLeft: -10 }}
                />
              </View>
            )}

            {/* Branch Comparison Chart */}
            {branchComparisonData.labels.length > 0 && (
              <View className="rounded-lg p-3 mb-4" style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }}>
                <BarChart
                  data={branchComparisonData}
                  width={screenWidth - 48}
                  height={200}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                  }}
                  showValuesOnTopOfBars={false}
                  fromZero
                  yAxisLabel=""
                  yAxisSuffix=""
                  style={{ marginLeft: -10 }}
                />
              </View>
            )}

            {/* Stats Row */}
            <View className="flex-row gap-3 mb-4">
              {/* Return vs New Customer */}
              <View className="flex-1 rounded-lg p-4" style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }}>
                <Text className="font-semibold mb-3" style={{ color: theme.text }}>Return VS New Customer</Text>

                <View className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs" style={{ color: '#FFFFFF', backgroundColor: theme.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                      Return
                    </Text>
                    <Text className="text-xs font-semibold" style={{ color: theme.text }}>{returnCustomerPercent}%</Text>
                  </View>
                  <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.surfaceAlt }}>
                    <View className="h-full rounded-full" style={{ width: `${returnCustomerPercent}%`, backgroundColor: theme.primary }} />
                  </View>
                </View>

                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-xs" style={{ color: '#FFFFFF', backgroundColor: theme.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                      New Customer
                    </Text>
                    <Text className="text-xs font-semibold" style={{ color: theme.text }}>{newCustomerPercent}%</Text>
                  </View>
                  <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.surfaceAlt }}>
                    <View className="h-full rounded-full" style={{ width: `${newCustomerPercent}%`, backgroundColor: theme.primary }} />
                  </View>
                </View>
              </View>

              {/* Customers Card */}
              <View className="rounded-lg p-4 items-center justify-center" style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, minWidth: 120 }}>
                <Text className="text-sm mb-2" style={{ color: theme.textMuted }}>Customers</Text>
                <Text className="text-3xl font-bold" style={{ color: theme.text }}>{totalCustomers}</Text>
              </View>
            </View>

            {/* Branch-Wise Revenue Table */}
            <View className="rounded-lg p-4 mb-20" style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }}>
              <Text className="font-semibold mb-3" style={{ color: theme.text }}>Branch-Wise Revenue</Text>

              {/* Table Header */}
              <View className="flex-row pb-2 border-b" style={{ borderBottomColor: theme.border }}>
                <Text className="flex-1 font-semibold text-xs" style={{ color: theme.textMuted }}>Branch</Text>
                <Text className="w-16 font-semibold text-xs text-center" style={{ color: theme.textMuted }}>Jobs</Text>
                <Text className="w-24 font-semibold text-xs text-right" style={{ color: theme.textMuted }}>Revenue</Text>
              </View>

              {/* Table Rows */}
              {branchRevenue.map((item, index) => (
                <View key={index} className="flex-row py-3 border-b" style={{ borderBottomColor: theme.surfaceAlt }}>
                  <Text className="flex-1 text-sm" style={{ color: theme.text }}>{item.branch}</Text>
                  <Text className="w-16 text-sm text-center" style={{ color: theme.text }}>{item.jobs}</Text>
                  <Text className="w-24 text-sm text-right" style={{ color: theme.text }}>
                    ₹{(item.revenue / 100000).toFixed(1)}L
                  </Text>
                </View>
              ))}
            </View>

            {/* Empty State */}
            {!loading && !error && branchRevenue.length === 0 && (
              <View className="items-center justify-center py-10">
                <BarChart3 size={64} color="#E0E0E0" />
                <Text className="text-base mt-4" style={{ color: '#9E9E9E' }}>
                  No data available for this period
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
