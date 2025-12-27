import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { vehicleService } from '@/roles/technician/services/VehicleService';
import Header from '@/roles/technician/components/Header';
import { BarChart, PieChart } from 'react-native-chart-kit'; // Assuming installed

export default function TechnicianPerformanceScreen() {
    const [refreshing, setRefreshing] = useState(false);
    const [performanceData, setPerformanceData] = useState<any>(null);

    const loadPerformance = () => {
        const jobs = vehicleService.getAll();
        const completed = jobs.filter(j => j.status === 'Completed').length;
        const active = jobs.filter(j => j.status === 'In Shop').length;
        const pending = jobs.filter(j => j.status === 'Scheduled').length;

        setPerformanceData({
            labels: ["Pending", "Active", "Done"],
            data: [pending, active, completed]
        });
    };

    useFocusEffect(
        useCallback(() => {
            loadPerformance();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        loadPerformance();
        setRefreshing(false);
    };

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <Header title="Performance" />
            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{ padding: 20 }}
            >
                <View className="bg-white p-5 rounded-2xl shadow-sm mb-6">
                    <Text className="text-lg font-bold text-slate-800 mb-4">Job Distribution</Text>
                    {performanceData && (
                        <BarChart
                            data={{
                                labels: performanceData.labels,
                                datasets: [{ data: performanceData.data }]
                            }}
                            width={Dimensions.get("window").width - 80}
                            height={220}
                            yAxisLabel=""
                            yAxisSuffix=""
                            chartConfig={{
                                backgroundColor: "#ffffff",
                                backgroundGradientFrom: "#ffffff",
                                backgroundGradientTo: "#ffffff",
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
                            }}
                            style={{ borderRadius: 16 }}
                        />
                    )}
                </View>

                <View className="bg-white p-5 rounded-2xl shadow-sm">
                    <Text className="text-lg font-bold text-slate-800 mb-2">Team Efficiency</Text>
                    <Text className="text-3xl font-bold text-green-500">94%</Text>
                    <Text className="text-slate-500">On-time completion rate.</Text>
                </View>
            </ScrollView>
        </View>
    );
}
