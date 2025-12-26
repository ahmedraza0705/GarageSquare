import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function VehicleDetailScreen() {
    const navigation = useNavigation();
    const route: any = useRoute();
    const { vehicle } = route.params;

    const DetailItem = ({ label, value, icon }: any) => (
        <View className="flex-row items-center mb-4 w-[48%] bg-slate-50 p-3 rounded-xl border border-slate-100">
            <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-3 shadow-sm">
                <Ionicons name={icon} size={16} color="#475569" />
            </View>
            <View>
                <Text className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{label}</Text>
                <Text className="text-sm font-semibold text-slate-800">{value}</Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            {/* Header Image Area */}
            <View className="h-64 relative">
                <Image
                    source={{ uri: vehicle.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute inset-0 bg-black/30" />

                {/* Back Button */}
                <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
                    <View className="flex-row justify-between items-center px-4 py-2">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full items-center justify-center"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full items-center justify-center"
                        >
                            <Ionicons name="create-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                {/* Title Overlay */}
                <View className="absolute bottom-6 left-6 right-6">
                    <View className="flex-row items-center mb-2">
                        <View className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 mr-2">
                            <Text className="text-white text-[10px] font-bold uppercase tracking-wider">{vehicle.year}</Text>
                        </View>
                        <View className={`px-3 py-1 rounded-full border border-white/30 ${vehicle.status === 'In Shop' ? 'bg-blue-500/80' : 'bg-green-500/80'}`}>
                            <Text className="text-white text-[10px] font-bold uppercase tracking-wider">{vehicle.status}</Text>
                        </View>
                    </View>
                    <Text className="text-3xl font-bold text-white shadow-sm mb-1">{vehicle.model}</Text>
                    <Text className="text-lg font-medium text-slate-200">{vehicle.make}</Text>
                </View>
            </View>

            {/* Content Body */}
            <ScrollView className="flex-1 -mt-6 bg-white rounded-t-3xl pt-8 px-6" showsVerticalScrollIndicator={false}>

                {/* Highlights Grid */}
                <View className="flex-row flex-wrap justify-between mb-6">
                    <DetailItem label="Registration" value={vehicle.reg_number} icon="card-outline" />
                    <DetailItem label="Owner" value={vehicle.owner} icon="person-outline" />
                    <DetailItem label="Technician" value={vehicle.assigned_to || 'Unassigned'} icon="construct-outline" />
                    <DetailItem label="Status" value={vehicle.service_status} icon="information-circle-outline" />
                </View>

                <View className="h-[1px] bg-slate-100 mb-6" />

                {/* 1. Performance Stats */}
                {vehicle.performance_stats && (
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-slate-900 mb-4">Performance</Text>
                        <View className="flex-row justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <View className="items-center flex-1 border-r border-slate-200 pr-2">
                                <Text className="text-[10px] text-slate-400 font-bold uppercase mb-1">Estimated</Text>
                                <Text className="text-base font-bold text-slate-800">{vehicle.performance_stats.estimated_time}</Text>
                            </View>
                            <View className="items-center flex-1 border-r border-slate-200 px-2">
                                <Text className="text-[10px] text-slate-400 font-bold uppercase mb-1">Time Spent</Text>
                                <Text className="text-base font-bold text-slate-800">{vehicle.performance_stats.time_spent}</Text>
                            </View>
                            <View className="items-center flex-1 pl-2">
                                <Text className="text-[10px] text-slate-400 font-bold uppercase mb-1">Efficiency</Text>
                                <Text className={`text-base font-bold ${vehicle.performance_stats.efficiency === 'Delayed' ? 'text-red-500' : 'text-green-600'}`}>
                                    {vehicle.performance_stats.efficiency}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* 2. Tasks List */}
                {/* 2. Professional Service History Breakdown */}
                {vehicle.tasks && vehicle.tasks.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-xl font-bold text-slate-900 mb-4">Service History</Text>

                        {/* Stats Row */}
                        <View className="flex-row justify-between mb-6">
                            <View className="items-center bg-emerald-50 px-4 py-3 rounded-2xl w-[30%] border border-emerald-100">
                                <Text className="text-2xl font-bold text-emerald-600">
                                    {vehicle.tasks.filter((t: any) => t.status === 'Completed').length}
                                </Text>
                                <Text className="text-[10px] font-bold text-emerald-800 uppercase tracking-wide mt-1">Repaired</Text>
                            </View>
                            <View className="items-center bg-red-50 px-4 py-3 rounded-2xl w-[30%] border border-red-100">
                                <Text className="text-2xl font-bold text-red-600">
                                    {vehicle.tasks.filter((t: any) => t.status === 'Rejected').length}
                                </Text>
                                <Text className="text-[10px] font-bold text-red-800 uppercase tracking-wide mt-1">Rejected</Text>
                            </View>
                            <View className="items-center bg-slate-50 px-4 py-3 rounded-2xl w-[30%] border border-slate-100">
                                <Text className="text-2xl font-bold text-slate-600">
                                    {vehicle.tasks.filter((t: any) => t.status === 'Pending').length}
                                </Text>
                                <Text className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">Pending</Text>
                            </View>
                        </View>

                        {/* List - Repaired */}
                        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 pl-1">Confirmed Repairs</Text>
                        {vehicle.tasks.filter((t: any) => t.status === 'Completed').map((task: any) => (
                            <View key={task.id} className="flex-row items-center p-4 mb-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mr-4">
                                    <Ionicons name="checkmark" size={20} color="#10b981" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-bold text-slate-800">{task.name}</Text>
                                    <Text className="text-xs text-slate-400 mt-0.5">Completed in {task.time}</Text>
                                </View>
                                <View className="px-3 py-1 bg-emerald-50 rounded-lg">
                                    <Text className="text-xs font-bold text-emerald-600">Done</Text>
                                </View>
                            </View>
                        ))}
                        {vehicle.tasks.filter((t: any) => t.status === 'Completed').length === 0 && (
                            <Text className="text-slate-400 text-sm italic mb-4 pl-1">No repairs completed yet.</Text>
                        )}

                        {/* List - Rejected */}
                        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 mt-4 pl-1">Rejected / Cancelled</Text>
                        {vehicle.tasks.filter((t: any) => t.status === 'Rejected').map((task: any) => (
                            <View key={task.id} className="flex-row items-center p-4 mb-3 bg-white rounded-2xl border border-red-50 shadow-sm">
                                <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center mr-4">
                                    <Ionicons name="close" size={20} color="#ef4444" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-bold text-slate-800">{task.name}</Text>
                                    <Text className="text-xs text-slate-400 mt-0.5">Estimated: {task.time}</Text>
                                </View>
                                <View className="px-3 py-1 bg-red-50 rounded-lg">
                                    <Text className="text-xs font-bold text-red-600">Rejected</Text>
                                </View>
                            </View>
                        ))}
                        {vehicle.tasks.filter((t: any) => t.status === 'Rejected').length === 0 && (
                            <Text className="text-slate-400 text-sm italic mb-4 pl-1">No items rejected.</Text>
                        )}

                        {/* List - Pending */}
                        <Text className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 mt-4 pl-1">Pending Approval / Work</Text>
                        {vehicle.tasks.filter((t: any) => t.status === 'Pending').map((task: any) => (
                            <View key={task.id} className="flex-row items-center p-4 mb-3 bg-slate-50 rounded-2xl border border-slate-100">
                                <View className="w-10 h-10 rounded-full bg-white items-center justify-center mr-4 shadow-sm">
                                    <Ionicons name="time-outline" size={20} color="#94a3b8" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-base font-bold text-slate-700">{task.name}</Text>
                                    <Text className="text-xs text-slate-400 mt-0.5">Estimated: {task.time}</Text>
                                </View>
                                <View className="px-3 py-1 bg-white rounded-lg border border-slate-100">
                                    <Text className="text-xs font-bold text-slate-500">Pending</Text>
                                </View>
                            </View>
                        ))}

                    </View>
                )}

                {/* 3. Timeline */}
                {vehicle.timeline && vehicle.timeline.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-lg font-bold text-slate-900 mb-4">Activity Timeline</Text>
                        <View className="pl-2">
                            {vehicle.timeline.map((item: any, index: number) => (
                                <View key={index} className="flex-row mb-0 relative pb-6 last:pb-0">
                                    {/* Line */}
                                    {index !== vehicle.timeline.length - 1 && (
                                        <View className="absolute left-[5px] top-6 bottom-[-24px] w-[2px] bg-slate-200" />
                                    )}

                                    {/* Dot */}
                                    <View className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 mr-4 ring-4 ring-blue-50" />

                                    <View>
                                        <Text className="text-sm font-bold text-slate-800">{item.event}</Text>
                                        <Text className="text-xs text-slate-400 mt-0.5">{item.date} • {item.time}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    onPress={() => {
                        // Demo Update Status Action
                        alert('Status Update Feature\n\nOptions:\n1. In Shop\n2. Work in Progress\n3. Completed');
                    }}
                    className="bg-slate-900 py-4 rounded-xl items-center shadow-lg active:bg-slate-800 mb-10 mt-2"
                >
                    <Text className="text-white font-bold text-base">Update Status</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}
