// ============================================
// REPORTS SCREEN (Company Admin)
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import {
  Building2,
  Users,
  BarChart3,
  AlertTriangle,
  RefreshCw
} from 'lucide-react-native';
import { ReportsService, ReportData, TimePeriod } from '@/services/reports.service';

const screenWidth = Dimensions.get('window').width;


interface CustomBarChartProps {
  data: { label: string; branch1: number; branch2: number }[];
}

const CustomBarChart = ({ data }: CustomBarChartProps) => {
  // Calculate max value from data, defaulting to 15 if empty or 0
  const dataMax = Math.max(...data.flatMap(d => [d.branch1, d.branch2]), 0);
  // Round up to nearest 5 for a nice scale, minimum 5
  const maxValue = Math.max(Math.ceil(dataMax / 5) * 5, 5);

  // Generate 4 ticks: maxValue, 2/3, 1/3, 0
  const ticks = [maxValue, Math.round(maxValue * 0.66), Math.round(maxValue * 0.33), 0];

  return (
    <View style={{ marginTop: 20 }}>
      {data && data.length > 0 ? (
        <>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4682B4' }]} />
              <Text style={styles.legendText}>Branch 1</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#35C56A' }]} />
              <Text style={styles.legendText}>Branch 2</Text>
            </View>
          </View>

          <View style={styles.chartContent}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              {ticks.map((value, i) => (
                <Text key={i} style={styles.yAxisLabel}>
                  {value}
                </Text>
              ))}
            </View>

            {/* Chart bars */}
            <View style={styles.barsContainer}>
              {data.map((item, index) => (
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
                  <Text style={styles.xAxisLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      ) : (
        <View style={{ height: 150, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#9CA3AF' }}>No data available for this period</Text>
        </View>
      )}
    </View>
  );
};

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('Month');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const periods: TimePeriod[] = ['Today', 'Week', 'Month', 'Quarter', 'Year'];

  const fetchReportData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await ReportsService.getRevenueByPeriod(selectedPeriod);
      setReportData(data);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(74, 144, 226, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
    },
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <SafeAreaView className="flex-1" edges={['left', 'right', 'bottom']} style={{ backgroundColor: '#F8F9FA' }}>
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4682B4" />
          <Text className="mt-4 text-gray-500 font-medium">Loading reports...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30, paddingTop: 20 }}
        >
          {/* Time Period Tabs - Pill Style */}
          <View className="flex-row mb-6 bg-gray-100 p-1 rounded-full items-center">
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                className="flex-1 py-2 rounded-full items-center justify-center shadow-sm"
                style={{ backgroundColor: selectedPeriod === period ? '#4682B4' : 'transparent' }}
              >
                <Text
                  className="text-xs"
                  style={{ color: selectedPeriod === period ? '#ffffff' : '#6B7280', fontWeight: selectedPeriod === period ? 'bold' : '500' }}
                >
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => fetchReportData(true)}
              className="px-3 items-center justify-center"
              disabled={refreshing}
            >
              <RefreshCw size={16} color={refreshing ? "#9CA3AF" : "#4682B4"} />
            </TouchableOpacity>
          </View>

          {reportData ? (
            <>
              {/* Top Cards Row */}
              <View className="flex-row gap-4 mb-6">
                {/* Total Revenue - Hero Card */}
                <View className="flex-[1.6] bg-white rounded-2xl p-5 shadow-sm" style={styles.cardShadow}>
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="bg-blue-50 p-2 rounded-xl">
                      <BarChart3 size={20} color="#4A90E2" />
                    </View>
                    <View className="bg-green-50 px-2 py-1 rounded-full">
                      <Text className="text-[10px] font-bold text-green-700">+12%</Text>
                    </View>
                  </View>
                  <Text className="text-sm font-medium text-gray-500 mb-1">Total Revenue</Text>
                  <Text className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reportData.totalRevenue)}
                  </Text>
                </View>

                {/* Alert Card - Compact */}
                <View className="flex-1 bg-white rounded-2xl p-4 justify-between shadow-sm" style={styles.cardShadow}>
                  <View className="items-end">
                    <View className="bg-amber-50 p-2 rounded-full">
                      <AlertTriangle size={20} color="#F59E0B" />
                    </View>
                  </View>
                  <View>
                    <Text className="text-2xl font-bold text-gray-900">3</Text>
                    <Text className="text-xs font-medium text-gray-500">Alerts</Text>
                  </View>
                </View>
              </View>

              {/* Revenue Trend Chart */}
              <View style={[styles.chartContainer, styles.cardShadow]}>
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold text-gray-900">Revenue Trend</Text>
                </View>
                <LineChart
                  data={reportData.revenueTrendData}
                  width={screenWidth - 48}
                  height={220}
                  chartConfig={{
                    ...chartConfig,
                    propsForDots: {
                      r: "4",
                    },
                  }}
                  fromZero
                  segments={3}
                  yAxisLabel=""
                  yAxisSuffix=""
                  style={{ marginLeft: -10 }}
                />
              </View>

              {/* Branch Comparison Chart */}
              <View style={[styles.chartContainer, styles.cardShadow]}>
                <View className="flex-row justify-between items-center mb-0">
                  <Text className="text-lg font-bold text-gray-900">Branch Performance</Text>
                </View>
                <CustomBarChart data={reportData.customChartData} />
              </View>

              {/* Stats Row */}
              <View className="flex-row gap-4 mb-6">
                {/* Return vs New Customer */}
                <View className="flex-[1.6] bg-white rounded-2xl p-5 shadow-sm" style={styles.cardShadow}>
                  <Text className="font-bold text-base text-gray-900 mb-4">Customer Mix</Text>

                  <View className="mb-4">
                    <View className="flex-row justify-between mb-2 items-center">
                      <View className="flex-row items-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-blue-500" />
                        <Text className="text-xs font-medium text-gray-500">Returning</Text>
                      </View>
                      <Text className="text-sm font-bold text-gray-900">{reportData.returnCustomerPercent}%</Text>
                    </View>
                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <View className="h-full rounded-full bg-blue-500" style={{ width: `${reportData.returnCustomerPercent}%` }} />
                    </View>
                  </View>

                  <View>
                    <View className="flex-row justify-between mb-2 items-center">
                      <View className="flex-row items-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-emerald-400" />
                        <Text className="text-xs font-medium text-gray-500">New</Text>
                      </View>
                      <Text className="text-sm font-bold text-gray-900">{reportData.newCustomerPercent}%</Text>
                    </View>
                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <View className="h-full rounded-full bg-emerald-400" style={{ width: `${reportData.newCustomerPercent}%` }} />
                    </View>
                  </View>
                </View>

                {/* Customers Card */}
                <View className="flex-1 bg-white rounded-2xl p-4 items-center justify-center shadow-sm" style={styles.cardShadow}>
                  <View className="bg-purple-50 p-3 rounded-full mb-3">
                    <Users size={24} color="#8B5CF6" />
                  </View>
                  <Text className="text-3xl font-bold text-gray-900 mb-1">{reportData.totalCustomers}</Text>
                  <Text className="text-xs font-medium text-gray-400">Total Customers</Text>
                </View>
              </View>

              {/* Branch-Wise Revenue List */}
              <View style={[styles.chartContainer, styles.cardShadow, { marginBottom: 32 }]}>
                <View className="mb-4">
                  <Text className="text-lg font-bold text-gray-900">Branch Performance</Text>
                  <Text className="text-xs text-gray-400">Revenue per location</Text>
                </View>

                <View>
                  {/* Header Row */}
                  <View className="flex-row justify-between pb-2 mb-2 border-b border-gray-100">
                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex-1">Branch</Text>
                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-right w-24">Revenue</Text>
                  </View>

                  {reportData.branchRevenue.map((item: any, index: number) => (
                    <View key={index} className="flex-row justify-between items-center py-3 border-b border-gray-50 last:border-0 border-b-gray-100">
                      <View className="flex-1 flex-row items-center gap-3">
                        <View className="bg-gray-50 p-2 rounded-lg">
                          <Building2 size={16} color="#6B7280" />
                        </View>
                        <View>
                          <Text className="text-sm font-bold text-gray-900">{item.branch}</Text>
                          <Text className="text-xs text-gray-400">{item.jobs} Jobs Completed</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm font-bold text-gray-900">{formatCurrency(item.revenue)}</Text>
                        <View className="bg-green-50 px-2 py-0.5 rounded-full mt-1">
                          <Text className="text-[10px] font-bold text-green-700">Top Rated</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <View className="flex-1 items-center justify-center mt-10">
              <Text className="text-gray-400 font-medium">No data available for this period</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 5,
  },
  legendText: {
    fontSize: 10,
    color: '#666',
  },
  chartContent: {
    flexDirection: 'row',
    height: 150,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingRight: 10,
    height: 135,
  },
  yAxisLabel: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 28, // Space for labels
  },
  barGroup: {
    alignItems: 'center',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 0,
    height: 120,
  },
  bar: {
    width: 10,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  xAxisLabel: {
    position: 'absolute',
    bottom: -24,
    fontSize: 9,
    color: '#999',
    width: 30,
    textAlign: 'center',
  },
});
