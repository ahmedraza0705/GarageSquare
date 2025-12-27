import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function InventoryScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('All');

    // Mock Inventory Data
    const inventory = [
        { id: '1', name: '5W-30 Synthetic Oil', partNumber: 'OIL-5W30-SYN', stock: 120, unit: 'L', status: 'In Stock', price: '$8.50' },
        { id: '2', name: 'Oil Filter (Toyota)', partNumber: 'FIL-TOY-001', stock: 45, unit: 'pcs', status: 'In Stock', price: '$12.00' },
        { id: '3', name: 'Brake Pads (Front)', partNumber: 'BRK-PAD-F', stock: 8, unit: 'sets', status: 'Low Stock', price: '$45.00' },
        { id: '4', name: 'Spark Plug (Iridium)', partNumber: 'SPK-NGK-IR', stock: 0, unit: 'pcs', status: 'Out of Stock', price: '$18.00' },
        { id: '5', name: 'Air Filter', partNumber: 'FIL-AIR-GEN', stock: 22, unit: 'pcs', status: 'In Stock', price: '$15.50' },
    ];

    const getFilteredInventory = () => {
        let result = inventory;
        if (filter === 'Low Stock') result = result.filter(i => i.stock < 10 && i.stock > 0);
        if (filter === 'Out of Stock') result = result.filter(i => i.stock === 0);

        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(i =>
                i.name.toLowerCase().includes(lower) ||
                i.partNumber.toLowerCase().includes(lower)
            );
        }
        return result;
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white p-4 mb-3 rounded-xl border border-slate-200 shadow-sm flex-row justify-between items-center">
            <View className="flex-1">
                <Text className="font-bold text-slate-900 text-base">{item.name}</Text>
                <Text className="text-xs text-slate-500 mb-1">{item.partNumber}</Text>
                <Text className="text-sm font-medium text-slate-700">{item.price}</Text>
            </View>
            <View className="items-end">
                <View className={`px-2 py-1 rounded-md mb-1 ${item.stock === 0 ? 'bg-red-100' :
                        item.stock < 10 ? 'bg-amber-100' : 'bg-green-100'
                    }`}>
                    <Text className={`text-[10px] font-bold uppercase ${item.stock === 0 ? 'text-red-700' :
                            item.stock < 10 ? 'text-amber-700' : 'text-green-700'
                        }`}>
                        {item.stock === 0 ? 'No Stock' : item.stock < 10 ? 'Low Stock' : 'In Stock'}
                    </Text>
                </View>
                <Text className="text-xs text-slate-500">Qty: <Text className="font-bold text-slate-900">{item.stock} {item.unit}</Text></Text>
            </View>
        </View>
    );

    const FilterTab = ({ label }: { label: string }) => (
        <TouchableOpacity
            onPress={() => setFilter(label)}
            className={`px-4 py-2 rounded-full mr-2 border ${filter === label ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-200'}`}
        >
            <Text className={`text-xs font-bold ${filter === label ? 'text-white' : 'text-slate-600'}`}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <StatusBar barStyle="dark-content" />
            <View className="bg-white px-5 pt-12 pb-4 border-b border-slate-200">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xl font-bold text-slate-900">Inventory</Text>
                    <TouchableOpacity>
                        <Ionicons name="scan-outline" size={24} color="#3b82f6" />
                    </TouchableOpacity>
                </View>
                <View className="flex-row bg-slate-100 rounded-lg px-3 py-2 items-center">
                    <Ionicons name="search" size={20} color="#94a3b8" />
                    <TextInput
                        placeholder="Search parts #"
                        className="flex-1 ml-2 text-sm text-slate-900"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View className="py-4">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    data={['All', 'Low Stock', 'Out of Stock']}
                    renderItem={({ item }) => <FilterTab label={item} />}
                />
            </View>

            <FlatList
                data={getFilteredInventory()}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20, paddingTop: 0 }}
            />

            <TouchableOpacity className="absolute bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full shadow-lg items-center justify-center">
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
}
