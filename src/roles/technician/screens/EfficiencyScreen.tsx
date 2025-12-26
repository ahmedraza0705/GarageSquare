import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function EfficiencyScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-[#f1f5f9]">
            {/* Header */}
            <View className="flex-row items-center px-5 pt-12 pb-4 bg-white border-b border-slate-200">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">My Efficiency</Text>
            </View>

            <ScrollView className="p-5">
                {/* Main Stats */}
                <View className="bg-white rounded-2xl p-6 items-center border border-slate-200 mb-6">
                    <Text className="text-slate-500 text-sm font-medium mb-2">Overall Efficiency</Text>
                    <Text className="text-5xl font-bold text-orange-500 mb-2">94%</Text>
                    <Text className="text-slate-400 text-xs text-center">Based on on-time completion and quality checks</Text>
                </View>

                <Text className="text-lg font-bold text-slate-900 mb-3">Breakdown</Text>

                {/* Breakdown Cards */}
                <View className="bg-white rounded-xl p-4 mb-3 border border-slate-200 flex-row justify-between items-center">
                    <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                            <Ionicons name="time" size={20} color="#3b82f6" />
                        </View>
                        <View>
                            <Text className="text-slate-900 font-bold">On-Time Delivery</Text>
                            <Text className="text-slate-500 text-xs">Jobs finished before due time</Text>
                        </View>
                    </View>
                    <Text className="text-xl font-bold text-slate-900">96%</Text>
                </View>

                <View className="bg-white rounded-xl p-4 mb-3 border border-slate-200 flex-row justify-between items-center">
                    <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center">
                            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                        </View>
                        <View>
                            <Text className="text-slate-900 font-bold">First Time Fix</Text>
                            <Text className="text-slate-500 text-xs">No rework required</Text>
                        </View>
                    </View>
                    <Text className="text-xl font-bold text-slate-900">92%</Text>
                </View>

            </ScrollView>
        </View>
    );
}
