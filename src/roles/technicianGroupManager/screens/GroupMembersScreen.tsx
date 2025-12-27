import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function GroupMembersScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { groupName } = route.params as any || { groupName: 'Group Members' };

    // Mock Members Data
    const members = [
        { id: 'm1', name: 'Ahmed Raza', role: 'Senior Technician', status: 'Online', activeJob: 'Toyota Camry (Engine)', avatar: 'A' },
        { id: 'm2', name: 'Rahul Kumar', role: 'Technician', status: 'Busy', activeJob: 'Honda Civic (Oil Change)', avatar: 'R' },
        { id: 'm3', name: 'Sarah Smith', role: 'Apprentice', status: 'Online', activeJob: null, avatar: 'S' },
        { id: 'm4', name: 'John Doe', role: 'Technician', status: 'Offline', activeJob: null, avatar: 'J' },
    ];

    const renderMemberCard = ({ item }: { item: any }) => (
        <View className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-slate-100 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1">
                <View className={`w-12 h-12 rounded-full items-center justify-center ${item.status === 'Offline' ? 'bg-slate-200' : 'bg-blue-100'}`}>
                    <Text className={`font-bold text-lg ${item.status === 'Offline' ? 'text-slate-500' : 'text-blue-600'}`}>
                        {item.avatar}
                    </Text>
                    {item.status !== 'Offline' && (
                        <View className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${item.status === 'Busy' ? 'bg-amber-500' : 'bg-green-500'}`} />
                    )}
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-slate-900 text-base">{item.name}</Text>
                    <Text className="text-xs text-slate-500">{item.role}</Text>
                    {item.activeJob && (
                        <View className="flex-row items-center mt-1">
                            <Ionicons name="construct-outline" size={12} color="#64748b" />
                            <Text className="text-[10px] text-slate-600 ml-1 italic">{item.activeJob}</Text>
                        </View>
                    )}
                </View>
            </View>

            <View className="flex-row gap-2">
                <TouchableOpacity className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <Ionicons name="call-outline" size={20} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <Ionicons name="chatbubble-outline" size={20} color="#64748b" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-[#f8fafc]">
            {/* Header with Back Button */}
            <View className="bg-white px-5 pt-14 pb-4 border-b border-slate-200 flex-row items-center cursor-pointer mb-2">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-bold text-slate-900">{groupName}</Text>
                    <Text className="text-xs text-slate-500">{members.length} Members</Text>
                </View>
            </View>

            <FlatList
                data={members}
                keyExtractor={item => item.id}
                renderItem={renderMemberCard}
                contentContainerStyle={{ padding: 20 }}
            />
        </View>
    );
}
