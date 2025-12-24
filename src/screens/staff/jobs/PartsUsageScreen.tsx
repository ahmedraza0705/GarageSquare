// ============================================
// PARTS USAGE SCREEN
// ============================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import StatusBadge from '@/components/StatusBadge';

export default function PartsUsageScreen() {
    const navigation = useNavigation();
    const [parts, setParts] = useState([
        { id: 1, name: 'Brake Pads (Front)', qty: 1, status: 'available', req_no: 'REQ-001' },
        { id: 2, name: 'Synthetic Oil 5W-30', qty: 4, status: 'available', req_no: 'REQ-001' },
        { id: 3, name: 'Oil Filter', qty: 1, status: 'out_of_stock', req_no: 'REQ-002' },
        { id: 4, name: 'Air Filter', qty: 1, status: 'low_stock', req_no: 'REQ-003' }
    ]);

    const handleRequestPart = () => {
        Alert.alert('Request Part', 'This feature allows technicians to request new parts from inventory. (Mock Action)');
    };

    const getStockStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800';
            case 'low_stock': return 'bg-yellow-100 text-yellow-800';
            case 'out_of_stock': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white px-4 py-4 border-b border-gray-200 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                        <Image source={require('../../../assets/Arrow.png')} className="w-6 h-6 tint-gray-900" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Parts Usage</Text>
                </View>
                <TouchableOpacity
                    className="bg-blue-600 px-4 py-2 rounded-lg"
                    onPress={handleRequestPart}
                >
                    <Text className="text-white font-bold text-xs">+ Request Part</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                {/* Parts List */}
                {parts.map((part) => (
                    <View key={part.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-start mb-2">
                            <View className="flex-1 mr-2">
                                <Text className="text-base font-bold text-gray-900">{part.name}</Text>
                                <Text className="text-xs text-gray-400 mt-1">Req No: {part.req_no}</Text>
                            </View>
                            <View className={`px-2 py-1 rounded-md ${getStockStatusColor(part.status).split(' ')[0]}`}>
                                <Text className={`text-[10px] font-bold uppercase ${getStockStatusColor(part.status).split(' ')[1]}`}>
                                    {part.status.replace(/_/g, ' ')}
                                </Text>
                            </View>
                        </View>

                        <View className="h-[1px] bg-gray-50 my-2" />

                        <View className="flex-row justify-between items-center">
                            <Text className="text-sm text-gray-600">Quantity Required:</Text>
                            <Text className="text-lg font-bold text-gray-900">{part.qty} Unit(s)</Text>
                        </View>
                    </View>
                ))}

                <View className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <Text className="text-blue-800 text-sm leading-5">
                        <Text className="font-bold">Note:</Text> Parts marked as "Available" can be collected from the inventory. For "Out of Stock" items, please contact the inventory manager.
                    </Text>
                </View>

            </ScrollView>
        </View>
    );
}
