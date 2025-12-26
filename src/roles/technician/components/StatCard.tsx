import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    onPress?: () => void;
}

export default function StatCard({ label, value, icon, color, onPress }: StatCardProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="w-[150px] bg-white rounded-xl border border-slate-200 p-4 h-[100px] mr-3 shadow-sm"
        >
            <View className="flex-row justify-between mb-2">
                <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</Text>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text className="text-2xl font-bold text-slate-900">
                {value}
            </Text>
        </TouchableOpacity>
    );
}
