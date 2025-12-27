import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ManagerNotificationsScreen() {
    const navigation = useNavigation();

    const notifications = [
        { id: '1', title: 'Job Overdue', message: 'Toyota Camry (ABC-123) is 30 mins overdue.', time: '10m ago', type: 'alert' },
        { id: '2', title: 'Approval Needed', message: 'Engine repair completed by Ahmed Raza. Review needed.', time: '1h ago', type: 'info' },
        { id: '3', title: 'Job Assigned', message: 'You assigned Honda Civic to Rahul Kumar.', time: '2h ago', type: 'success' },
    ];

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity className="bg-white p-4 mb-3 rounded-xl border border-slate-100 shadow-sm flex-row items-start">
            <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 mt-1 ${item.type === 'alert' ? 'bg-red-100' :
                    item.type === 'info' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                <Ionicons
                    name={item.type === 'alert' ? 'alert' : item.type === 'info' ? 'information' : 'checkmark'}
                    size={16}
                    color={item.type === 'alert' ? '#dc2626' : item.type === 'info' ? '#2563eb' : '#16a34a'}
                />
            </View>
            <View className="flex-1">
                <View className="flex-row justify-between mb-1">
                    <Text className="font-bold text-slate-900">{item.title}</Text>
                    <Text className="text-xs text-slate-400 ml-2">{item.time}</Text>
                </View>
                <Text className="text-sm text-slate-600 leading-5">{item.message}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <StatusBar barStyle="dark-content" />
            <View className="bg-white px-5 pt-12 pb-4 border-b border-slate-200 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Notifications</Text>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20 }}
            />
        </View>
    );
}
