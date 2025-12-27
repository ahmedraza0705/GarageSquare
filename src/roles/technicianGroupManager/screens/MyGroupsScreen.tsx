import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function MyGroupsScreen() {
    const navigation = useNavigation();

    // Mock Groups Data
    const groups = [
        {
            id: 'g1',
            name: 'Alpha Tech Team',
            branch: 'Downtown Center',
            members: 12,
            activeJobs: 8,
            shift: '09:00 AM - 06:00 PM',
            status: 'Active'
        },
        {
            id: 'g2',
            name: 'Night Squad',
            branch: 'Downtown Center',
            members: 4,
            activeJobs: 3,
            shift: '06:00 PM - 02:00 AM',
            status: 'Offline'
        }
    ];

    const renderGroupCard = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => (navigation as any).navigate('GroupMembers', { groupId: item.id, groupName: item.name })}
            className="bg-white p-5 rounded-xl mb-4 shadow-sm border border-slate-200"
        >
            <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center gap-3">
                    <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center">
                        <Ionicons name="people" size={24} color="#334155" />
                    </View>
                    <View>
                        <Text className="text-lg font-bold text-slate-900">{item.name}</Text>
                        <Text className="text-xs text-slate-500">{item.branch}</Text>
                    </View>
                </View>
                <View className={`px-2 py-1 rounded-md ${item.status === 'Active' ? 'bg-green-100' : 'bg-slate-100'}`}>
                    <Text className={`text-[10px] font-bold ${item.status === 'Active' ? 'text-green-700' : 'text-slate-500'}`}>
                        {item.status}
                    </Text>
                </View>
            </View>

            <View className="flex-row justify-between bg-slate-50 p-3 rounded-lg">
                <View className="items-center flex-1 border-r border-slate-200">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Members</Text>
                    <Text className="text-slate-800 font-bold">{item.members}</Text>
                </View>
                <View className="items-center flex-1 border-r border-slate-200">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Active Jobs</Text>
                    <Text className="text-slate-800 font-bold">{item.activeJobs}</Text>
                </View>
                <View className="items-center flex-1">
                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Shift</Text>
                    <Text className="text-slate-800 font-bold text-xs">{item.shift.split(' - ')[0]}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#f8fafc]">
            {/* Header */}
            <View className="bg-white px-5 pt-14 pb-4 border-b border-slate-200 flex-row justify-between items-center">
                <Text className="text-xl font-bold text-slate-900">My Groups</Text>
                <TouchableOpacity>
                    <Ionicons name="add-circle-outline" size={28} color="#2563eb" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={groups}
                keyExtractor={item => item.id}
                renderItem={renderGroupCard}
                contentContainerStyle={{ padding: 20 }}
            />
        </View>
    );
}
