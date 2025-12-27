import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function InventoryScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');

    // Mock Inventory Data
    const inventoryItems = [
        { id: '1', name: 'Synthentic Oil 5W-30', sku: 'OIL-SYN-530', category: 'Engine', qty: 45, price: '$45.00', status: 'In Stock', location: 'Aisle 3' },
        { id: '2', name: 'Oil Filter Type A', sku: 'FLT-OIL-A', category: 'Engine', qty: 12, price: '$12.50', status: 'Low Stock', location: 'Aisle 3' },
        { id: '3', name: 'Brake Pads (Front)', sku: 'BRK-PAD-F', category: 'Body', qty: 8, price: '$85.00', status: 'Low Stock', location: 'Aisle 4' },
        { id: '4', name: 'Spark Plug Iridium', sku: 'SPK-PLG-IR', category: 'Electrical', qty: 120, price: '$18.00', status: 'In Stock', location: 'Aisle 2' },
        { id: '5', name: 'Car Battery 12V', sku: 'BAT-12V-STD', category: 'Electrical', qty: 3, price: '$150.00', status: 'Critical', location: 'Aisle 5' },
        { id: '6', name: 'Air Filter', sku: 'FLT-AIR-STD', category: 'Engine', qty: 25, price: '$22.00', status: 'In Stock', location: 'Aisle 3' },
        { id: '7', name: 'Headlight Bulb H7', sku: 'LGT-BLB-H7', category: 'Electrical', qty: 15, price: '$14.00', status: 'In Stock', location: 'Aisle 2' },
    ];

    const filters = ['All', 'Engine', 'Body', 'Electrical', 'Low Stock'];

    const filteredItems = inventoryItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedFilter === 'All') return matchesSearch;
        if (selectedFilter === 'Low Stock') return matchesSearch && (item.status === 'Low Stock' || item.status === 'Critical');
        return matchesSearch && item.category === selectedFilter;
    });

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            {/* Header */}
            <View className="px-5 pt-2 pb-4 flex-row justify-between items-center bg-white border-b border-slate-100">
                <Text className="text-xl font-bold text-slate-900">Inventory</Text>
                <TouchableOpacity className="bg-slate-100 p-2 rounded-full">
                    <Ionicons name="notifications-outline" size={24} color="#0f172a" />
                </TouchableOpacity>
            </View>

            {/* Search & Filter */}
            <View className="p-4 bg-white/50">
                <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-3 py-2.5 mb-4 shadow-sm">
                    <Ionicons name="search-outline" size={20} color="#64748b" />
                    <TextInput
                        placeholder="Search parts by name or SKU..."
                        placeholderTextColor="#94a3b8"
                        className="flex-1 ml-2 text-slate-900 font-medium"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            onPress={() => setSelectedFilter(filter)}
                            className={`px-4 py-1.5 rounded-full mr-2 border ${selectedFilter === filter
                                    ? 'bg-slate-900 border-slate-900'
                                    : 'bg-white border-slate-200'
                                }`}
                        >
                            <Text className={`text-xs font-semibold ${selectedFilter === filter ? 'text-white' : 'text-slate-600'
                                }`}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* List */}
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {filteredItems.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-3 flex-row items-center"
                    >
                        <View className="w-12 h-12 bg-slate-50 rounded-lg items-center justify-center mr-4 border border-slate-100">
                            <Ionicons
                                name={item.category === 'Engine' ? 'construct-outline' : item.category === 'Electrical' ? 'flash-outline' : 'car-outline'}
                                size={24}
                                color="#64748b"
                            />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row justify-between items-start mb-1">
                                <Text className="text-sm font-bold text-slate-900">{item.name}</Text>
                                <Text className="text-sm font-bold text-slate-900">{item.price}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-xs text-slate-400 font-medium">{item.sku}</Text>
                                <View className={`px-2 py-0.5 rounded text-[10px] ${item.status === 'In Stock' ? 'bg-green-100' :
                                        item.status === 'Low Stock' ? 'bg-amber-100' : 'bg-red-100'
                                    }`}>
                                    <Text className={`text-[10px] font-bold ${item.status === 'In Stock' ? 'text-green-700' :
                                            item.status === 'Low Stock' ? 'text-amber-700' : 'text-red-700'
                                        }`}>
                                        {item.status} ({item.qty})
                                    </Text>
                                </View>
                            </View>
                            <View className="flex-row items-center mt-2">
                                <Ionicons name="location-outline" size={12} color="#94a3b8" />
                                <Text className="text-[10px] text-slate-500 ml-1">{item.location}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {filteredItems.length === 0 && (
                    <View className="items-center justify-center py-20 opacity-50">
                        <Ionicons name="cube-outline" size={48} color="#94a3b8" />
                        <Text className="text-slate-500 font-medium mt-3">No parts found</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
