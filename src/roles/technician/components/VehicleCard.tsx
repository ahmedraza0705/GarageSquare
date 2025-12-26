import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VehicleCardProps {
    vehicle: any;
    onPress?: () => void;
}

export default function VehicleCard({ vehicle, onPress }: VehicleCardProps) {
    // Status Logic for Colors
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'In Shop': return { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', border: 'border-blue-100' };
            case 'Completed': return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', border: 'border-emerald-100' };
            case 'Scheduled': return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500', border: 'border-amber-100' };
            default: return { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-500', border: 'border-slate-100' };
        }
    };

    const statusStyle = getStatusStyle(vehicle.status);

    // Calculate Progress
    const totalTasks = vehicle.tasks?.length || 0;
    const completedTasks = vehicle.tasks?.filter((t: any) => t.status === 'Completed').length || 0;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const progressColor = progress === 100 ? 'bg-emerald-500' : progress > 50 ? 'bg-blue-500' : 'bg-amber-500';

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            className="bg-white rounded-2xl mb-5 shadow-sm border border-slate-100 overflow-hidden"
            style={{ elevation: 3 }}
        >
            {/* Header: Image & Overlay Badge */}
            <View className="h-40 bg-slate-100 relative">
                <Image
                    source={{ uri: vehicle.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute top-0 left-0 w-full h-full bg-black/10" />

                {/* Status Badge - Floating */}
                <View className={`absolute top-3 right-3 px-3 py-1.5 rounded-full flex-row items-center ${statusStyle.bg} border-white/50 border`}>
                    <View className={`w-1.5 h-1.5 rounded-full mr-2 ${statusStyle.dot}`} />
                    <Text className={`text-[10px] font-bold uppercase tracking-wide ${statusStyle.text}`}>
                        {vehicle.status}
                    </Text>
                </View>

                {/* Registration - Floating Bottom Left */}
                <View className="absolute bottom-3 left-3 bg-white/95 px-2.5 py-1 rounded-md shadow-sm">
                    <Text className="text-xs font-bold text-slate-900 font-mono">
                        {vehicle.reg_number}
                    </Text>
                </View>
            </View>

            {/* Content Body */}
            <View className="p-4">
                {/* Title Section */}
                <View className="flex-row justify-between items-start mb-3">
                    <View>
                        <Text className="text-lg font-bold text-slate-900 leading-6">
                            {vehicle.model}
                        </Text>
                        <Text className="text-sm text-slate-500 font-medium">
                            {vehicle.year} • {vehicle.make}
                        </Text>
                    </View>
                    {/* Detailed Status Pill */}
                    {vehicle.service_status && (
                        <View className={`px-2 py-0.5 rounded border ${statusStyle.border} ${statusStyle.bg} mt-1`}>
                            <Text className={`text-[10px] font-semibold ${statusStyle.text}`}>
                                {vehicle.service_status}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Progress Bar Section */}
                {totalTasks > 0 && (
                    <View className="mb-4">
                        <View className="flex-row justify-between items-end mb-1.5">
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Work Progress
                            </Text>
                            <Text className="text-xs font-bold text-slate-700">
                                {Math.round(progress)}% <Text className="text-slate-400 font-medium">({completedTasks}/{totalTasks} tasks)</Text>
                            </Text>
                        </View>
                        <View className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <View
                                className={`h-full rounded-full ${progressColor}`}
                                style={{ width: `${progress}%` }}
                            />
                        </View>
                    </View>
                )}

                {/* Divider */}
                <View className="h-[1px] bg-slate-100 mb-3" />

                {/* Meta Data Grid */}
                <View className="flex-row justify-between items-center">
                    {/* Owner */}
                    <View className="flex-row items-center flex-1">
                        <View className="w-6 h-6 rounded-full bg-slate-50 items-center justify-center mr-2 border border-slate-100">
                            <Ionicons name="person-outline" size={12} color="#64748b" />
                        </View>
                        <View>
                            <Text className="text-[10px] text-slate-400 font-medium uppercase">Owner</Text>
                            <Text className="text-xs font-semibold text-slate-700" numberOfLines={1}>{vehicle.owner}</Text>
                        </View>
                    </View>

                    {/* Assigned To */}
                    {vehicle.assigned_to && (
                        <View className="flex-row items-center">
                            <View className="w-6 h-6 rounded-full bg-indigo-50 items-center justify-center mr-2 border border-indigo-100">
                                <Ionicons name="construct-outline" size={12} color="#6366f1" />
                            </View>
                            <View>
                                <Text className="text-[10px] text-slate-400 font-medium uppercase">Tech</Text>
                                <Text className="text-xs font-semibold text-slate-700">{vehicle.assigned_to}</Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
