import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StatusBar,
    FlatList,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { vehicleService, Vehicle } from '../services/VehicleService';
import VehicleCard from '../components/VehicleCard';

export default function TechnicianVehiclesScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('Completed');
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            const loadVehicles = async () => {
                await vehicleService.init();
                setVehicles(vehicleService.getAll());
            };
            loadVehicles();
        }, [])
    );

    // Calculate Stats
    const totalVehicles = vehicles.length;
    const completedCount = vehicles.filter(v => v.status === 'Completed').length;

    const filteredVehicles = vehicles.filter(vehicle => {
        // Enforce only Completed vehicles are shown based on user request
        const isCompleted = vehicle.status === 'Completed';
        const matchesSearch =
            vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.reg_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.owner.toLowerCase().includes(searchQuery.toLowerCase());
        return isCompleted && matchesSearch;
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

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <StatusBar barStyle="dark-content" />
            <Header title="Completed Vehicles" />

            {/* List with Header Component to scroll together */}
            <FlatList
                data={filteredVehicles}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={
                    <View className="p-5 pb-0">
                        {/* Search Bar */}
                        {/* Search Bar & Add Button Row */}
                        <View className="flex-row items-center mb-5 space-x-3">
                            <View className="flex-1 flex-row items-center bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm h-14">
                                <Ionicons name="search" size={22} color="#94a3b8" />
                                <TextInput
                                    placeholder="Search completed vehicles..."
                                    placeholderTextColor="#cbd5e1"
                                    className="flex-1 ml-3 text-slate-800 text-base font-medium h-full p-0"
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

                            <TouchableOpacity
                                onPress={() => (navigation as any).navigate('AddVehicle')}
                                className="w-12 h-12 bg-[#bbf7d0] rounded-2xl items-center justify-center border border-green-400 shadow-sm active:scale-95"
                            >
                                <Ionicons name="add" size={32} color="#1e293b" />
                            </TouchableOpacity>
                        </View>

                        {/* Summary Stats */}
                        <View className="flex-row justify-between items-center mb-6 px-2">
                            <StatsBadge label="Total" count={completedCount} icon="checkmark-done-circle" color="#22c55e" active={true} />
                        </View>

                        {/* Section Title */}
                        <Text className="text-lg font-bold text-slate-800 mb-4 px-1">
                            Completed Vehicles <Text className="text-slate-400 text-base font-normal">({filteredVehicles.length})</Text>
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
            {/* <TouchableOpacity
                className="absolute bottom-6 right-6 w-16 h-16 bg-[#0f172a] rounded-2xl items-center justify-center shadow-2xl z-50 active:scale-95 transform transition-all"
                style={{ shadowColor: '#0f172a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 10 }}
                onPress={() => (navigation as any).navigate('AddVehicle')}
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity> */}
        </View>
    );
}
