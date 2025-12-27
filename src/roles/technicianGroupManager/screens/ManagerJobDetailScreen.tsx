import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ManagerJobDetailScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { job } = route.params as any; // Passed from TeamJobsScreen

    // Mock Timeline Data
    const timeline = [
        { id: '1', time: '10:00 AM', event: 'Job Assigned', user: 'Manager (You)', icon: 'person-add', color: '#3b82f6' },
        { id: '2', time: '10:15 AM', event: 'Vehicle Check-in', user: job?.assigned_to || 'Ahmed Raza', icon: 'enter', color: '#f59e0b' },
        { id: '3', time: '11:30 AM', event: 'Oil Change Completed', user: job?.assigned_to || 'Ahmed Raza', icon: 'build', color: '#10b981' },
        { id: '4', time: '12:45 PM', event: 'Brake Inspection', user: job?.assigned_to || 'Ahmed Raza', icon: 'eye', color: '#6366f1' },
    ];

    const ActionButton = ({ label, icon, color, onPress }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-1 flex-row items-center justify-center p-3 rounded-xl border mr-2 last:mr-0 ${color === 'red' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}
        >
            <Ionicons name={icon} size={18} color={color === 'red' ? '#dc2626' : '#475569'} />
            <Text className={`ml-2 font-bold text-xs ${color === 'red' ? 'text-red-700' : 'text-slate-700'}`}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-white border-b border-slate-100 mb-0">
                <View className="px-5 py-3 flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="font-bold text-lg text-slate-900">{job?.jobIdDisplay || 'JOB-1234'}</Text>
                        <Text className="text-xs text-slate-500">{job?.status || 'Active'}</Text>
                    </View>
                    <TouchableOpacity className="p-2 -mr-2">
                        <Ionicons name="ellipsis-horizontal" size={24} color="#0f172a" />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Vehicle Info */}
                <View className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
                    <Text className="text-xl font-bold text-slate-900 mb-1">{job?.vehicleText || `${job?.make} ${job?.model}`}</Text>
                    <Text className="text-slate-500 mb-4">{job?.reg_number || 'ABC-123'} • {job?.service_type || 'General Service'}</Text>

                    <View className="flex-row justify-between">
                        <View>
                            <Text className="text-[10px] text-slate-400 uppercase font-bold mb-1">Assigned Tech</Text>
                            <View className="flex-row items-center">
                                <View className="w-5 h-5 bg-blue-100 rounded-full mr-2 items-center justify-center">
                                    <Text className="text-[10px] font-bold text-blue-700">{(job?.assigned_to || 'A').charAt(0)}</Text>
                                </View>
                                <Text className="font-bold text-slate-700 text-sm">{job?.assigned_to || 'Unassigned'}</Text>
                            </View>
                        </View>
                        <View>
                            <Text className="text-[10px] text-slate-400 uppercase font-bold mb-1">Time Elapsed</Text>
                            <Text className="font-bold text-slate-700 text-sm">2h 45m</Text>
                        </View>
                        <View>
                            <Text className="text-[10px] text-slate-400 uppercase font-bold mb-1">Est. Completion</Text>
                            <Text className="font-bold text-slate-700 text-sm">03:00 PM</Text>
                        </View>
                    </View>
                </View>

                {/* Timeline */}
                <Text className="text-lg font-bold text-slate-900 mb-4">Activity Timeline</Text>
                <View className="pl-4 border-l-2 border-slate-100 ml-2">
                    {timeline.map((item, index) => (
                        <View key={index} className="mb-6 relative">
                            {/* Dot */}
                            <View className={`absolute -left-[25px] w-4 h-4 rounded-full border-2 border-white`} style={{ backgroundColor: item.color }} />

                            <View className="flex-row justify-between items-start mb-1">
                                <Text className="font-bold text-slate-800 text-sm">{item.event}</Text>
                                <Text className="text-xs text-slate-400">{item.time}</Text>
                            </View>
                            <Text className="text-xs text-slate-500">by {item.user}</Text>
                        </View>
                    ))}
                    {/* Pending Item */}
                    <View className="mb-6 relative opacity-50">
                        <View className="absolute -left-[25px] w-4 h-4 rounded-full border-2 border-white bg-slate-300" />
                        <Text className="font-bold text-slate-800 text-sm">Final Inspection</Text>
                        <Text className="text-xs text-slate-500">Pending</Text>
                    </View>
                </View>

                {/* Technician Contribution (Mock) */}
                <Text className="text-lg font-bold text-slate-900 mb-4 mt-2">Work Breakdown</Text>
                <View className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
                    <View className="flex-row p-3 border-b border-slate-100 bg-slate-50">
                        <Text className="flex-1 text-xs font-bold text-slate-500">TASK</Text>
                        <Text className="text-xs font-bold text-slate-500 w-20 text-right">TIME</Text>
                        <Text className="text-xs font-bold text-slate-500 w-20 text-right">COST</Text>
                    </View>
                    <View className="p-3 flex-row border-b border-slate-100">
                        <Text className="flex-1 text-sm font-medium text-slate-700">Engine Oil Replacement</Text>
                        <Text className="text-sm text-slate-600 w-20 text-right">45m</Text>
                        <Text className="text-sm text-slate-600 w-20 text-right">$50</Text>
                    </View>
                    <View className="p-3 flex-row border-b border-slate-100">
                        <Text className="flex-1 text-sm font-medium text-slate-700">Filter Change</Text>
                        <Text className="text-sm text-slate-600 w-20 text-right">15m</Text>
                        <Text className="text-sm text-slate-600 w-20 text-right">$20</Text>
                    </View>
                    <View className="p-3 flex-row bg-blue-50">
                        <Text className="flex-1 text-sm font-bold text-blue-800">TOTAL</Text>
                        <Text className="text-sm font-bold text-blue-800 w-20 text-right">1h 00m</Text>
                        <Text className="text-sm font-bold text-blue-800 w-20 text-right">$70</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Sticky Actions Footer */}
            <View className="p-5 border-t border-slate-200 bg-white shadow-lg flex-row gap-2">
                <ActionButton label="Reassign" icon="people-outline" onPress={() => navigation.navigate('AssignJob' as never)} />
                <ActionButton label="Flag Issue" icon="alert-circle-outline" color="red" onPress={() => { }} />
                <TouchableOpacity
                    className="flex-1 bg-blue-600 rounded-xl justify-center items-center py-3"
                    onPress={() => { }}
                >
                    <Text className="text-white font-bold">Approve Job</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
