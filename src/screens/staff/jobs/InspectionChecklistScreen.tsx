// ============================================
// INSPECTION CHECKLIST SCREEN
// ============================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function InspectionChecklistScreen() {
    const navigation = useNavigation();

    // Mock inspection data
    const [categories, setCategories] = useState([
        {
            id: 'engine',
            title: 'Engine & Transmission',
            items: [
                { id: 1, name: 'Engine Oil Level', status: true },
                { id: 2, name: 'Coolant Level', status: true },
                { id: 3, name: 'Belts & Hoses', status: false },
                { id: 4, name: 'Transmission Fluid', status: true },
            ]
        },
        {
            id: 'brakes',
            title: 'Brakes & Tires',
            items: [
                { id: 5, name: 'Brake Pads Wear', status: true },
                { id: 6, name: 'Tire Pressure', status: false },
                { id: 7, name: 'Tire Tread Depth', status: true },
            ]
        },
        {
            id: 'electrical',
            title: 'Electrical System',
            items: [
                { id: 8, name: 'Headlights & Tail Lights', status: true },
                { id: 9, name: 'Battery Health', status: true },
                { id: 10, name: 'Wipers & Washers', status: true },
            ]
        }
    ]);

    const toggleItem = (categoryId: string, itemId: number) => {
        setCategories(categories.map(cat => {
            if (cat.id !== categoryId) return cat;
            return {
                ...cat,
                items: cat.items.map(item =>
                    item.id === itemId ? { ...item, status: !item.status } : item
                )
            };
        }));
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white px-4 py-4 border-b border-gray-200 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Image source={require('../../../assets/Arrow.png')} className="w-6 h-6 tint-gray-900" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Inspection Checklist</Text>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {categories.map((category) => (
                    <View key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                        <View className="bg-gray-100 px-4 py-3 border-b border-gray-100">
                            <Text className="font-bold text-gray-800 uppercase tracking-wide text-xs">{category.title}</Text>
                        </View>
                        <View className="p-4">
                            {category.items.map((item) => (
                                <View key={item.id} className="flex-row justify-between items-center py-3 border-b border-gray-50 last:border-0">
                                    <Text className="text-gray-700 font-medium flex-1">{item.name}</Text>
                                    <View className="flex-row items-center">
                                        <Text className={`mr-3 text-xs font-bold ${item.status ? 'text-green-600' : 'text-red-500'} uppercase`}>
                                            {item.status ? 'Pass' : 'Fail/Attn'}
                                        </Text>
                                        <Switch
                                            value={item.status}
                                            onValueChange={() => toggleItem(category.id, item.id)}
                                            trackColor={{ false: '#fee2e2', true: '#dcfce7' }}
                                            thumbColor={item.status ? '#166534' : '#ef4444'}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    className="bg-blue-600 py-4 rounded-xl mb-8"
                    onPress={() => navigation.goBack()}
                >
                    <Text className="text-white text-center font-bold text-lg">Save Inspection Report</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
