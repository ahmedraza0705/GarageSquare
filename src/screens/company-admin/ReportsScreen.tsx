// ============================================
// REPORTS SCREEN (Company Admin)
// ============================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, LineChart } from 'react-native-chart-kit';
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  AlertTriangle,
} from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

type TimePeriod = 'Today' | 'Week' | 'Month' | 'Quarter' | 'Year';

interface ReportData {
  totalRevenue: number;
  totalCustomers: number;
  returnCustomerPercent: number;
  newCustomerPercent: number;
  revenueTrendData: {
    labels: string[];
    datasets: any[];
    legend: string[];
  };
  customChartData: { label: string; branch1: number; branch2: number }[];
  branchRevenue: { branch: string; jobs: number; revenue: number }[];
}

const staticReportData: Record<TimePeriod, ReportData> = {
  'Today': {
    totalRevenue: 85000,
    totalCustomers: 12,
    returnCustomerPercent: 40,
    newCustomerPercent: 60,
    revenueTrendData: {
      labels: ['10am', '12pm', '2pm', '4pm', '6pm', '8pm'],
      datasets: [
        { data: [5, 8, 7, 10, 12, 8], color: (opacity = 1) => `rgba(169, 204, 227, ${opacity})`, strokeWidth: 2 },
        { data: [6, 9, 8, 11, 13, 9], color: (opacity = 1) => `rgba(46, 134, 193, ${opacity})`, strokeWidth: 2 },
        { data: [15], color: (opacity = 1) => `rgba(0,0,0,0)`, strokeWidth: 0, withDots: false }
      ],
      legend: ['Yesterday', 'Today']
    },
    customChartData: [
      { label: '10am', branch1: 2, branch2: 3 },
      { label: '12pm', branch1: 4, branch2: 4 },
      { label: '2pm', branch1: 3, branch2: 5 },
      { label: '4pm', branch1: 5, branch2: 4 },
      { label: '6pm', branch1: 6, branch2: 5 },
    ],
    branchRevenue: [
      { branch: 'Surat', jobs: 5, revenue: 35000 },
      { branch: 'Mumbai', jobs: 7, revenue: 50000 },
    ]
  },
  'Week': {
    totalRevenue: 650000,
    totalCustomers: 85,
    returnCustomerPercent: 55,
    newCustomerPercent: 45,
    revenueTrendData: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      datasets: [
        { data: [20, 25, 22, 30, 28, 35], color: (opacity = 1) => `rgba(169, 204, 227, ${opacity})`, strokeWidth: 2 },
        { data: [22, 28, 25, 32, 30, 38], color: (opacity = 1) => `rgba(46, 134, 193, ${opacity})`, strokeWidth: 2 },
        { data: [40], color: (opacity = 1) => `rgba(0,0,0,0)`, strokeWidth: 0, withDots: false }
      ],
      legend: ['Last Week', 'This Week']
    },
    customChartData: [
      { label: 'Mon', branch1: 5, branch2: 6 },
      { label: 'Tue', branch1: 6, branch2: 7 },
      { label: 'Wed', branch1: 5, branch2: 5 },
      { label: 'Thu', branch1: 8, branch2: 7 },
      { label: 'Fri', branch1: 7, branch2: 8 },
    ],
    branchRevenue: [
      { branch: 'Surat', jobs: 40, revenue: 300000 },
      { branch: 'Mumbai', jobs: 45, revenue: 350000 },
    ]
  },
  'Month': {
    totalRevenue: 2450000,
    totalCustomers: 156,
    returnCustomerPercent: 65,
    newCustomerPercent: 35,
    revenueTrendData: {
      labels: ['5', '10', '15', '20', '25', '30'],
      datasets: [
        { data: [125, 130, 90, 105, 95, 95], color: (opacity = 1) => `rgba(169, 204, 227, ${opacity})`, strokeWidth: 2 },
        { data: [130, 110, 110, 95, 115, 95], color: (opacity = 1) => `rgba(46, 134, 193, ${opacity})`, strokeWidth: 2 },
        { data: [150], color: (opacity = 1) => `rgba(255, 255, 255, 0)`, strokeWidth: 0, withDots: false }
      ],
      legend: ['Last Month', 'This Month']
    },
    customChartData: [
      { label: 'Jan', branch1: 13, branch2: 10 },
      { label: 'Feb', branch1: 13, branch2: 10 },
      { label: 'Mar', branch1: 10, branch2: 9 },
      { label: 'Apr', branch1: 10, branch2: 11 },
      { label: 'May', branch1: 9, branch2: 12 },
    ],
    branchRevenue: [
      { branch: 'Surat', jobs: 28, revenue: 1050000 },
      { branch: 'Mumbai', jobs: 28, revenue: 1050000 },
    ]
  },
  'Quarter': {
    totalRevenue: 7800000,
    totalCustomers: 450,
    returnCustomerPercent: 70,
    newCustomerPercent: 30,
    revenueTrendData: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        { data: [200, 210, 190, 220], color: (opacity = 1) => `rgba(169, 204, 227, ${opacity})`, strokeWidth: 2 },
        { data: [210, 220, 200, 240], color: (opacity = 1) => `rgba(46, 134, 193, ${opacity})`, strokeWidth: 2 },
        { data: [250], color: (opacity = 1) => `rgba(0,0,0,0)`, strokeWidth: 0, withDots: false }
      ],
      legend: ['Last Year', 'This Year']
    },
    customChartData: [
      { label: 'Q1', branch1: 12, branch2: 11 },
      { label: 'Q2', branch1: 14, branch2: 13 },
      { label: 'Q3', branch1: 11, branch2: 14 },
      { label: 'Q4', branch1: 15, branch2: 15 },
    ],
    branchRevenue: [
      { branch: 'Surat', jobs: 200, revenue: 3800000 },
      { branch: 'Mumbai', jobs: 250, revenue: 4000000 },
    ]
  },
  'Year': {
    totalRevenue: 32000000,
    totalCustomers: 1800,
    returnCustomerPercent: 75,
    newCustomerPercent: 25,
    revenueTrendData: {
      labels: ['2021', '2022', '2023', '2024'],
      datasets: [
        { data: [280, 290, 310, 300], color: (opacity = 1) => `rgba(169, 204, 227, ${opacity})`, strokeWidth: 2 },
        { data: [300, 320, 340, 350], color: (opacity = 1) => `rgba(46, 134, 193, ${opacity})`, strokeWidth: 2 },
        { data: [400], color: (opacity = 1) => `rgba(0,0,0,0)`, strokeWidth: 0, withDots: false }
      ],
      legend: ['Previous', 'Current']
    },
    customChartData: [
      { label: '21', branch1: 10, branch2: 12 },
      { label: '22', branch1: 12, branch2: 13 },
      { label: '23', branch1: 14, branch2: 14 },
      { label: '24', branch1: 15, branch2: 15 },
    ],
    branchRevenue: [
      { branch: 'Surat', jobs: 800, revenue: 15000000 },
      { branch: 'Mumbai', jobs: 1000, revenue: 17000000 },
    ]
  }
};

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
    </View>
  );
};

export default function ReportsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('Month');
  const data = staticReportData[selectedPeriod];

  const periods: TimePeriod[] = ['Today', 'Week', 'Month', 'Quarter', 'Year'];

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
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#F8F9FA' }}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30, paddingTop: 0 }}>
        {/* Header */}
        {/* <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-2xl font-bold text-gray-900">Reports</Text>
            <Text className="text-sm text-gray-500">Business Performance</Text>
          </View>
          <View className="bg-white p-2 rounded-full shadow-sm">
            <LayoutDashboard size={20} color="#4A90E2" />
          </View>
        </View> */}

        {/* Time Period Tabs - Pill Style */}
        <View className="flex-row mb-6 bg-gray-100 p-1 rounded-full">
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 rounded-full items-center justify-center ${selectedPeriod === period ? 'bg-white shadow-sm' : ''}`}
            >
              <Text
                className={`text-xs ${selectedPeriod === period ? 'font-bold text-blue-600' : 'font-medium text-gray-500'}`}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
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
                {formatCurrency(data.totalRevenue)}
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
              {/* <View className="bg-gray-100 px-3 py-1 rounded-full">
                <Text className="text-xs text-gray-500">Last 6 Months</Text>
              </View> */}
            </View>
            <LineChart
              data={data.revenueTrendData}
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
              yAxisSuffix="k"
              style={{ marginLeft: -10 }}
            />
          </View>



          {/* Branch Comparison Chart */}
          <View style={[styles.chartContainer, styles.cardShadow]}>
            <View className="flex-row justify-between items-center mb-0">
              <Text className="text-lg font-bold text-gray-900">Branch Performance</Text>
            </View>
            <CustomBarChart data={data.customChartData} />
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
                  <Text className="text-sm font-bold text-gray-900">{data.returnCustomerPercent}%</Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View className="h-full rounded-full bg-blue-500" style={{ width: `${data.returnCustomerPercent}%` }} />
                </View>
              </View>

              <View>
                <View className="flex-row justify-between mb-2 items-center">
                  <View className="flex-row items-center gap-2">
                    <View className="w-2 h-2 rounded-full bg-emerald-400" />
                    <Text className="text-xs font-medium text-gray-500">New</Text>
                  </View>
                  <Text className="text-sm font-bold text-gray-900">{data.newCustomerPercent}%</Text>
                </View>
                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <View className="h-full rounded-full bg-emerald-400" style={{ width: `${data.newCustomerPercent}%` }} />
                </View>
              </View>
            </View>

            {/* Customers Card */}
            <View className="flex-1 bg-white rounded-2xl p-4 items-center justify-center shadow-sm" style={styles.cardShadow}>
              <View className="bg-purple-50 p-3 rounded-full mb-3">
                <Users size={24} color="#8B5CF6" />
              </View>
              <Text className="text-3xl font-bold text-gray-900 mb-1">{data.totalCustomers}</Text>
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

              {data.branchRevenue.map((item, index) => (
                <View key={index} className="flex-row justify-between items-center py-3 border-b border-gray-50 last:border-0">
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
      </ScrollView>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-around py-4" style={{ backgroundColor: '#4A90E2' }}>
        <TouchableOpacity className="items-center">
          <LayoutDashboard size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Building2 size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <Users size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <BarChart3 size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
