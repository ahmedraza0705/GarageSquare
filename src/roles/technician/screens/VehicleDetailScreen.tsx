import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { vehicleService, CURRENT_TECHNICIAN } from '../services/VehicleService';

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
            {/* Header: Icon Placeholder & Overlay Badge */}
            <View className="h-64 bg-slate-900 items-center justify-center relative overflow-hidden">
                {/* Background Pattern/Icon */}
                <Ionicons name="car-sport" size={180} color="#1e293b" style={{ opacity: 0.5, transform: [{ scale: 1.2 }] }} />

                <View className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                {/* Back Button */}
                <SafeAreaView className="absolute top-0 left-0 right-0 z-10">
                    <View className="flex-row justify-between items-center px-4 py-2">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full items-center justify-center"
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>

                        <View className="flex-row space-x-2">
                            <TouchableOpacity
                                onPress={() => {
                                    Alert.alert(
                                        'Delete Vehicle',
                                        'Are you sure you want to delete this vehicle? This action cannot be undone.',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: 'Delete',
                                                style: 'destructive',
                                                onPress: async () => {
                                                    const success = await vehicleService.delete(vehicle.id);
                                                    if (success) {
                                                        navigation.goBack();
                                                    } else {
                                                        Alert.alert('Error', 'Could not delete vehicle');
                                                    }
                                                }
                                            }
                                        ]
                                    );
                                }}
                                className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full items-center justify-center mr-2"
                            >
                                <Ionicons name="trash-outline" size={20} color="white" />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => (navigation as any).navigate('AddVehicle', { vehicle })}
                                className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full items-center justify-center"
                            >
                                <Ionicons name="create-outline" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
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

                    {vehicle.vin && <DetailItem label="VIN" value={vehicle.vin} icon="finger-print-outline" />}
                    {vehicle.color && <DetailItem label="Color" value={vehicle.color} icon="color-palette-outline" />}
                    {vehicle.mileage && <DetailItem label="Mileage" value={`${vehicle.mileage} km`} icon="speedometer-outline" />}
                    {vehicle.fuel_level && <DetailItem label="Fuel" value={vehicle.fuel_level} icon="water-outline" />}
                </View>

                {vehicle.notes && (
                    <View className="mb-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        <Text className="text-xs font-bold text-yellow-600 uppercase mb-1">Notes</Text>
                        <Text className="text-slate-700">{vehicle.notes}</Text>
                    </View>
                )}

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

                {/* 2. Tasks List - Grouped by Technician */}
                {vehicle.tasks && vehicle.tasks.length > 0 && (
                    <View className="mb-8">
                        <Text className="text-xl font-bold text-slate-900 mb-4">Service History</Text>

                        {/* Helper to render a task item */}
                        {(() => {
                            const renderTaskItem = (task: any, showPerformer: boolean = false) => {
                                const isCompleted = task.status === 'Completed';
                                const isRejected = task.status === 'Rejected';
                                const isPending = task.status === 'Pending' || task.status === 'In Progress';

                                let iconName = 'time-outline';
                                let iconColor = '#94a3b8';
                                let bgColor = 'bg-slate-50';
                                let borderColor = 'border-slate-100';
                                let badgeColor = 'text-slate-500';
                                let badgeBg = 'bg-slate-100';

                                if (isCompleted) {
                                    iconName = 'checkmark';
                                    iconColor = '#10b981';
                                    bgColor = 'bg-white';
                                    borderColor = 'border-slate-100';
                                    badgeColor = 'text-emerald-600';
                                    badgeBg = 'bg-emerald-50';
                                } else if (isRejected) {
                                    iconName = 'close';
                                    iconColor = '#ef4444';
                                    bgColor = 'bg-white';
                                    borderColor = 'border-red-50';
                                    badgeColor = 'text-red-600';
                                    badgeBg = 'bg-red-50';
                                } else if (task.status === 'In Progress') {
                                    iconName = 'construct';
                                    iconColor = '#3b82f6';
                                    bgColor = 'bg-blue-50';
                                    borderColor = 'border-blue-100';
                                    badgeColor = 'text-blue-600';
                                    badgeBg = 'bg-blue-100';
                                }

                                return (
                                    <View key={task.id} className={`flex-row items-center p-4 mb-3 rounded-2xl border shadow-sm ${bgColor} ${borderColor}`}>
                                        <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${badgeBg}`}>
                                            <Ionicons name={iconName as any} size={20} color={iconColor} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-base font-bold text-slate-800">{task.name}</Text>
                                            <Text className="text-xs text-slate-400 mt-0.5">
                                                {task.time} {showPerformer && task.performedBy ? `• ${task.performedBy}` : ''}
                                            </Text>
                                            {task.completedAt && <Text className="text-[10px] text-slate-400 mt-0.5">{task.completedAt}</Text>}
                                        </View>
                                        <View className={`px-3 py-1 rounded-lg ${badgeBg}`}>
                                            <Text className={`text-xs font-bold ${badgeColor}`}>{task.status}</Text>
                                        </View>
                                    </View>
                                );
                            };

                            const myTasks = vehicle.tasks.filter((t: any) => t.performedBy === CURRENT_TECHNICIAN);
                            const otherTasks = vehicle.tasks.filter((t: any) => t.performedBy !== CURRENT_TECHNICIAN);

                            // Collect other technicians names for headers
                            const otherTechnicians = Array.from(new Set(otherTasks.map((t: any) => t.performedBy).filter(Boolean)));

                            return (
                                <View>
                                    {/* MY WORK SECTION */}
                                    <View className="mb-6">
                                        <View className="flex-row items-center mb-3">
                                            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                                                <Ionicons name="person" size={16} color="#2563eb" />
                                            </View>
                                            <Text className="text-lg font-bold text-slate-800">My Work</Text>
                                            <View className="bg-slate-100 px-2 py-0.5 rounded-full ml-2">
                                                <Text className="text-xs font-bold text-slate-500">{myTasks.length}</Text>
                                            </View>
                                        </View>

                                        {myTasks.length > 0 ? (
                                            myTasks.map((task: any) => renderTaskItem(task, false))
                                        ) : (
                                            <Text className="text-slate-400 text-sm italic pl-2">No tasks assigned to you.</Text>
                                        )}
                                    </View>

                                    {/* OTHERS WORK SECTION */}
                                    {otherTasks.length > 0 && (
                                        <View>
                                            <View className="flex-row items-center mb-3 mt-2">
                                                <View className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center mr-2">
                                                    <Ionicons name="people" size={16} color="#64748b" />
                                                </View>
                                                <Text className="text-lg font-bold text-slate-800">Team's Work</Text>
                                                <View className="bg-slate-100 px-2 py-0.5 rounded-full ml-2">
                                                    <Text className="text-xs font-bold text-slate-500">{otherTasks.length}</Text>
                                                </View>
                                            </View>

                                            {/* We can group by person or just list them showing names */}
                                            {otherTechnicians.length > 0 ? (
                                                otherTechnicians.map((techName: any) => {
                                                    const techTasks = otherTasks.filter((t: any) => t.performedBy === techName);
                                                    return (
                                                        <View key={techName} className="mb-4 pl-4 border-l-2 border-slate-100 ml-2">
                                                            <Text className="text-sm font-bold text-slate-500 uppercase mb-2">{techName}</Text>
                                                            {techTasks.map((task: any) => renderTaskItem(task, false))}
                                                        </View>
                                                    );
                                                })
                                            ) : (
                                                // Fallback for tasks with no performedBy or just display flat list if grouping logic fails
                                                otherTasks.map((task: any) => renderTaskItem(task, true))
                                            )}
                                        </View>
                                    )}
                                </View>
                            );
                        })()}
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
                        Alert.alert(
                            'Update Status',
                            'Select new status for this vehicle:',
                            [
                                { text: 'In Shop', onPress: async () => { await vehicleService.update(vehicle.id, { status: 'In Shop' }); navigation.goBack(); } },
                                { text: 'Completed', onPress: async () => { await vehicleService.update(vehicle.id, { status: 'Completed' }); navigation.goBack(); } },
                                { text: 'Ready', onPress: async () => { await vehicleService.update(vehicle.id, { status: 'Ready' }); navigation.goBack(); } },
                                { text: 'Cancel', style: 'cancel' }
                            ]
                        );
                    }}
                    className="bg-slate-900 py-4 rounded-xl items-center shadow-lg active:bg-slate-800 mb-10 mt-2"
                >
                    <Text className="text-white font-bold text-base">Update Status</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}
