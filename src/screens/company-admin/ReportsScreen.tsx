// ============================================
// REPORTS SCREEN (Company Admin)
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
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
  theme: any;
}

const CustomBarChart = ({ data, theme }: CustomBarChartProps) => {
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
              <Text style={[styles.legendText, { color: theme.textMuted }]}>Branch 1</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#35C56A' }]} />
              <Text style={[styles.legendText, { color: theme.textMuted }]}>Branch 2</Text>
            </View>
          </View>

          <View style={styles.chartContent}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              {ticks.map((value, i) => (
                <Text key={i} style={[styles.yAxisLabel, { color: theme.textMuted }]}>
                  {value}
                </Text>
              ))}
            </View>

            {/* Chart bars */}
            <View style={[styles.barsContainer, { borderBottomColor: theme.border }]}>
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
                  <Text style={[styles.xAxisLabel, { color: theme.textMuted }]}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      ) : (
        <View style={{ height: 150, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.textMuted }}>No data available for this period</Text>
        </View>
      )}
    </View>
  );
};

export default function ReportsScreen() {
  const { theme, themeName } = useTheme();
  const { user } = useAuth();
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
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    color: (opacity = 1) => themeName === 'dark' ? `rgba(74, 144, 226, ${opacity})` : `rgba(74, 144, 226, ${opacity})`,
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
    <SafeAreaView className="flex-1" edges={['left', 'right', 'bottom']} style={{ backgroundColor: theme.background }}>
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text className="mt-4 font-medium" style={{ color: theme.textMuted }}>Loading reports...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30, paddingTop: 20 }}
        >
          {/* Time Period Tabs - Pill Style */}
          <View className="flex-row mb-6 p-1 rounded-full items-center" style={{ backgroundColor: theme.surfaceAlt }}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                className="flex-1 py-2 rounded-full items-center justify-center"
                style={{
                  backgroundColor: selectedPeriod === period ? theme.primary : 'transparent',
                  // Elevation/Shadow only for selected in light mode
                  ...(selectedPeriod === period && themeName === 'light' ? { elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 } : {})
                }}
              >
                <Text
                  className="text-xs"
                  style={{ color: selectedPeriod === period ? '#ffffff' : theme.textMuted, fontWeight: selectedPeriod === period ? 'bold' : '500' }}
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
              <RefreshCw size={16} color={refreshing ? theme.border : theme.primary} />
            </TouchableOpacity>
          </View>

          {reportData ? (
            <>
              {/* Top Cards Row */}
              <View className="flex-row gap-4 mb-6">
                {/* Total Revenue - Hero Card */}
                <View className="flex-[1.6] rounded-2xl p-5" style={[styles.cardShadow, { backgroundColor: theme.surface, borderStyle: 'solid', borderWidth: themeName === 'dark' ? 1 : 0, borderColor: theme.border }]}>
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="p-2 rounded-xl" style={{ backgroundColor: themeName === 'dark' ? 'rgba(74, 144, 226, 0.1)' : '#EFF6FF' }}>
                      <BarChart3 size={20} color="#4A90E2" />
                    </View>
                    <View className="bg-green-50 px-2 py-1 rounded-full">
                      <Text className="text-[10px] font-bold text-green-700">+12%</Text>
                    </View>
                  </View>
                  <Text className="text-sm font-medium mb-1" style={{ color: theme.textMuted }}>Total Revenue</Text>
                  <Text className="text-2xl font-bold" style={{ color: theme.text }}>
                    {formatCurrency(reportData.totalRevenue)}
                  </Text>
                </View>

                {/* Alert Card - Compact */}
                <View className="flex-1 rounded-2xl p-4 justify-between" style={[styles.cardShadow, { backgroundColor: theme.surface, borderStyle: 'solid', borderWidth: themeName === 'dark' ? 1 : 0, borderColor: theme.border }]}>
                  <View className="items-end">
                    <View className="bg-amber-50 p-2 rounded-full">
                      <AlertTriangle size={20} color="#F59E0B" />
                    </View>
                  </View>
                  <View>
                    <Text className="text-2xl font-bold" style={{ color: theme.text }}>3</Text>
                    <Text className="text-xs font-medium" style={{ color: theme.textMuted }}>Alerts</Text>
                  </View>
                </View>
              </View>

              {/* Revenue Trend Chart */}
              <View style={[styles.chartContainer, styles.cardShadow, { backgroundColor: theme.surface, borderStyle: 'solid', borderWidth: themeName === 'dark' ? 1 : 0, borderColor: theme.border }]}>
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold" style={{ color: theme.text }}>Revenue Trend</Text>
                </View>
                <LineChart
                  data={reportData.revenueTrendData}
                  width={screenWidth - 72} // Adjusted for padding
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
              <View style={[styles.chartContainer, styles.cardShadow, { backgroundColor: theme.surface, borderStyle: 'solid', borderWidth: themeName === 'dark' ? 1 : 0, borderColor: theme.border }]}>
                <View className="flex-row justify-between items-center mb-0">
                  <Text className="text-lg font-bold" style={{ color: theme.text }}>Branch Performance</Text>
                </View>
                <CustomBarChart data={reportData.customChartData} theme={theme} />
              </View>

              {/* Stats Row */}
              <View className="flex-row gap-4 mb-6">
                {/* Return vs New Customer */}
                <View className="flex-[1.6] rounded-2xl p-5" style={[styles.cardShadow, { backgroundColor: theme.surface, borderStyle: 'solid', borderWidth: themeName === 'dark' ? 1 : 0, borderColor: theme.border }]}>
                  <Text className="font-bold text-base mb-4" style={{ color: theme.text }}>Customer Mix</Text>

                  <View className="mb-4">
                    <View className="flex-row justify-between mb-2 items-center">
                      <View className="flex-row items-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-blue-500" />
                        <Text className="text-xs font-medium" style={{ color: theme.textMuted }}>Returning</Text>
                      </View>
                      <Text className="text-sm font-bold" style={{ color: theme.text }}>{reportData.returnCustomerPercent}%</Text>
                    </View>
                    <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.surfaceAlt }}>
                      <View className="h-full rounded-full bg-blue-500" style={{ width: `${reportData.returnCustomerPercent}%` }} />
                    </View>
                  </View>

                  <View>
                    <View className="flex-row justify-between mb-2 items-center">
                      <View className="flex-row items-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-emerald-400" />
                        <Text className="text-xs font-medium" style={{ color: theme.textMuted }}>New</Text>
                      </View>
                      <Text className="text-sm font-bold" style={{ color: theme.text }}>{reportData.newCustomerPercent}%</Text>
                    </View>
                    <View className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.surfaceAlt }}>
                      <View className="h-full rounded-full bg-emerald-400" style={{ width: `${reportData.newCustomerPercent}%` }} />
                    </View>
                  </View>
                </View>

                {/* Customers Card */}
                <View className="flex-1 rounded-2xl p-4 items-center justify-center" style={[styles.cardShadow, { backgroundColor: theme.surface, borderStyle: 'solid', borderWidth: themeName === 'dark' ? 1 : 0, borderColor: theme.border }]}>
                  <View className="p-3 rounded-full mb-3" style={{ backgroundColor: themeName === 'dark' ? 'rgba(139, 92, 246, 0.1)' : '#F5F3FF' }}>
                    <Users size={24} color="#8B5CF6" />
                  </View>
                  <Text className="text-3xl font-bold mb-1" style={{ color: theme.text }}>{reportData.totalCustomers}</Text>
                  <Text className="text-xs font-medium" style={{ color: theme.textMuted }}>Total Customers</Text>
                </View>
              </View>

              {/* Branch-Wise Revenue List */}
              <View style={[styles.chartContainer, styles.cardShadow, { backgroundColor: theme.surface, borderStyle: 'solid', borderWidth: themeName === 'dark' ? 1 : 0, borderColor: theme.border, marginBottom: 32 }]}>
                <View className="mb-4">
                  <Text className="text-lg font-bold" style={{ color: theme.text }}>Branch Performance</Text>
                  <Text className="text-xs" style={{ color: theme.textMuted }}>Revenue per location</Text>
                </View>

                <View>
                  {/* Header Row */}
                  <View className="flex-row justify-between pb-2 mb-2 border-b" style={{ borderBottomColor: theme.border }}>
                    <Text className="text-xs font-semibold uppercase tracking-wider flex-1" style={{ color: theme.border }}>Branch</Text>
                    <Text className="text-xs font-semibold uppercase tracking-wider text-right w-24" style={{ color: theme.border }}>Revenue</Text>
                  </View>

                  {reportData.branchRevenue.map((item: any, index: number) => (
                    <View key={index} className="flex-row justify-between items-center py-3 border-b last:border-0" style={{ borderBottomColor: theme.surfaceAlt }}>
                      <View className="flex-1 flex-row items-center gap-3">
                        <View className="p-2 rounded-lg" style={{ backgroundColor: theme.surfaceAlt }}>
                          <Building2 size={16} color={theme.textMuted} />
                        </View>
                        <View>
                          <Text className="text-sm font-bold" style={{ color: theme.text }}>{item.branch}</Text>
                          <Text className="text-xs" style={{ color: theme.textMuted }}>{item.jobs} Jobs Completed</Text>
                        </View>
                      </View>
                      <View className="items-end">
                        <Text className="text-sm font-bold" style={{ color: theme.text }}>{formatCurrency(item.revenue)}</Text>
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
              <Text className="font-medium" style={{ color: theme.textMuted }}>No data available for this period</Text>
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
    textAlign: 'right',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
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
    width: 30,
    textAlign: 'center',
  },
});
