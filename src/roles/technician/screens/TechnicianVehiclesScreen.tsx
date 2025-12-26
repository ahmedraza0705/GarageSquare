import React, { useState } from 'react';
import {
    View,
    Text,
    StatusBar,
    FlatList,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { technicianVehicles } from '../services/mockData';
import VehicleCard from '../components/VehicleCard';

export default function TechnicianVehiclesScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');

    // Calculate Stats
    const totalVehicles = technicianVehicles.length;
    const inShopCount = technicianVehicles.filter(v => v.status === 'In Shop').length;
    const completedCount = technicianVehicles.filter(v => v.status === 'Completed').length;

    const navigation = useNavigation(); // Hook for navigation

    const filteredVehicles = technicianVehicles.filter(vehicle => {
        const matchesFilter = selectedFilter === 'All' || vehicle.status === selectedFilter;
        const matchesSearch =
            vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.reg_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.owner.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const StatsBadge = ({ label, count, icon, color, active }: any) => (
        <View className="items-center mr-6">
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-1 shadow-sm ${active ? 'bg-slate-800' : 'bg-white'}`}>
                <Ionicons name={icon} size={24} color={active ? '#fff' : color} />
            </View>
            <Text className="text-lg font-bold text-slate-800">{count}</Text>
            <Text className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {label}
            </Text>
        </View>
    );

    const FilterTab = ({ label }: { label: string }) => (
        <TouchableOpacity
            onPress={() => setSelectedFilter(label)}
            className={`px-5 py-2.5 mr-3 rounded-xl border ${selectedFilter === label
                ? 'bg-slate-900 border-slate-900 shadow-md'
                : 'bg-white border-slate-100 shadow-sm'
                }`}
        >
            <Text
                className={`text-xs font-bold ${selectedFilter === label
                    ? 'text-white'
                    : 'text-slate-500'
                    }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <StatusBar barStyle="dark-content" />
            <Header title="My Vehicles" />

            {/* List with Header Component to scroll together */}
            <FlatList
                data={filteredVehicles}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={
                    <View className="p-5 pb-0">
                        {/* Summary Stats */}
                        <View className="flex-row justify-between items-center mb-6 px-2">
                            <StatsBadge label="Total" count={totalVehicles} icon="car-sport" color="#4682b4" active={selectedFilter === 'All'} />
                            <StatsBadge label="In Shop" count={inShopCount} icon="construct" color="#3b82f6" active={selectedFilter === 'In Shop'} />
                            <StatsBadge label="Done" count={completedCount} icon="checkmark-done-circle" color="#22c55e" active={selectedFilter === 'Completed'} />
                            <StatsBadge label="Alerts" count={0} icon="alert-circle" color="#ef4444" />
                        </View>

                        {/* Search Bar */}
                        <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl px-4 py-3 mb-5 shadow-sm">
                            <Ionicons name="search" size={22} color="#94a3b8" />
                            <TextInput
                                placeholder="Search vehicles..."
                                placeholderTextColor="#cbd5e1"
                                className="flex-1 ml-3 text-slate-800 text-base font-medium h-6 p-0"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <View className="bg-slate-100 rounded-full p-1">
                                        <Ionicons name="close" size={14} color="#64748b" />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Filters */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-1 px-1">
                            <FilterTab label="All" />
                            <FilterTab label="In Shop" />
                            <FilterTab label="Scheduled" />
                            <FilterTab label="Completed" />
                        </ScrollView>

                        {/* Section Title */}
                        <Text className="text-lg font-bold text-slate-800 mb-4 px-1">
                            {selectedFilter} Vehicles <Text className="text-slate-400 text-base font-normal">({filteredVehicles.length})</Text>
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View className="px-5">
                        <VehicleCard
                            vehicle={item}
                            onPress={() => (navigation as any).navigate('VehicleDetail', { vehicle: item })}
                        />
                    </View>
                )}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20 opacity-40">
                        <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="car-sport-outline" size={40} color="#94a3b8" />
                        </View>
                        <Text className="text-slate-400 font-bold text-lg">No vehicles found</Text>
                        <Text className="text-slate-400 text-sm mt-1">Try adjusting your search</Text>
                    </View>
                }
            />

            {/* Premium FAB */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 w-16 h-16 bg-[#0f172a] rounded-2xl items-center justify-center shadow-2xl z-50 active:scale-95 transform transition-all"
                style={{ shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 }}
                onPress={() => (navigation as any).navigate('AddVehicle')}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
}
