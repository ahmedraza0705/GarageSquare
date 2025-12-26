import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface JobCardProps {
    job: any;
    onPress?: () => void;
}

export default function JobCard({ job, onPress }: JobCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            className="bg-white rounded-xl p-4 mb-4 border border-slate-200 shadow-sm"
        >
            <View className="flex-row justify-between mb-2">
                <Text className="font-bold text-slate-900">
                    Job Card {job.job_card_no}
                </Text>
                <Text className="font-bold text-slate-900">
                    {job.price}
                </Text>
            </View>

            <View className="h-[1px] bg-slate-100 my-2" />

            <View className="flex-row justify-between mb-2">
                <View>
                    <Text className="font-semibold text-slate-800 text-base">
                        {job.vehicle.make} {job.vehicle.model}
                    </Text>
                    <Text className="text-sm text-slate-500 font-medium">
                        {job.vehicle.reg}
                    </Text>
                </View>
                <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
                    <Ionicons name="car-sport" size={20} color="#64748b" />
                </View>
            </View>

            <View className="flex-row items-center mb-4 bg-slate-50 p-2 rounded-lg self-start">
                <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center mr-2">
                    <Text className="text-white text-[10px] font-bold">
                        {job.assigned_to.split(' ').map((n: any) => n[0]).join('')}
                    </Text>
                </View>
                <Text className="text-xs text-slate-600 font-medium">
                    Assigned to <Text className="text-slate-900 font-bold">{job.assigned_to}</Text>
                </Text>
            </View>

            <View className="flex-row items-center gap-3 mb-4">
                <View className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <View
                        className={`h-full rounded-full ${job.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${job.progress}%` }}
                    />
                </View>
                <Text className="text-xs font-bold text-slate-700 w-10 text-right">
                    {job.progress}%
                </Text>
            </View>

            <View className="flex-row justify-between items-center pt-2 border-t border-slate-50">
                <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={14} color="#64748b" style={{ marginRight: 4 }} />
                    <Text className="text-xs text-slate-500 font-medium">Due: {job.delivery_due}</Text>
                </View>
                <View className={`px-2 py-1 rounded-md ${job.priority === 'Urgent' ? 'bg-red-50' : 'bg-green-50'}`}>
                    <Text className={`text-[10px] font-bold uppercase ${job.priority === 'Urgent' ? 'text-red-600' : 'text-green-600'}`}>
                        {job.priority}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}
