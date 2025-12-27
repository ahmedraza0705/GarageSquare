import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { vehicleService } from '@/roles/technician/services/VehicleService';

export default function AutoAssignScreen() {
    const navigation = useNavigation();
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]); // Job IDs
    const [algorithm, setAlgorithm] = useState<'RoundRobin' | 'LeastLoad' | 'Nearest'>('RoundRobin');

    const loadPendingJobs = () => {
        const all = vehicleService.getAll();
        // Only scheduled (unassigned/pending) jobs
        const pending = all.filter(j => j.status === 'Scheduled');
        setJobs(pending);
    };

    useFocusEffect(
        useCallback(() => { loadPendingJobs() }, [])
    );

    const toggleSelection = (id: string) => {
        if (selectedJobs.includes(id)) {
            setSelectedJobs(selectedJobs.filter(j => j !== id));
        } else {
            setSelectedJobs([...selectedJobs, id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedJobs.length === jobs.length) setSelectedJobs([]);
        else setSelectedJobs(jobs.map(j => j.id));
    };

    const runAutoAssign = async () => {
        if (selectedJobs.length === 0) {
            Alert.alert("No jobs selected", "Please select at least one job to assign.");
            return;
        }

        // Mock Algorithm Execution
        // In real app, this would fetch technician loads and distribute
        const mockTechs = ['Ahmed Raza', 'Rahul Kumar', 'Sarah Smith'];
        let assignments = 0;

        for (const jobId of selectedJobs) {
            const tech = mockTechs[assignments % mockTechs.length]; // Simple Round Robin
            await vehicleService.update(jobId, { assigned_to: tech, status: 'In Shop' });
            assignments++;
        }

        Alert.alert(
            "Auto-Assign Complete",
            `Successfully assigned ${assignments} jobs using ${algorithm} strategy.`,
            [{ text: "OK", onPress: () => navigation.goBack() }]
        );
    };

    const renderJobRow = ({ item }: { item: any }) => {
        const isSelected = selectedJobs.includes(item.id);
        return (
            <TouchableOpacity
                onPress={() => toggleSelection(item.id)}
                className={`flex-row items-center p-4 mb-2 rounded-xl border ${isSelected ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-100'}`}
            >
                <View className={`w-5 h-5 rounded border mr-3 items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}>
                    {isSelected && <Ionicons name="checkmark" size={14} color="white" />}
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-slate-900">{item.make} {item.model}</Text>
                    <Text className="text-xs text-slate-500">{item.service_type || 'General Service'}</Text>
                </View>
                <View className="bg-amber-50 px-2 py-1 rounded">
                    <Text className="text-[10px] font-bold text-amber-700">PENDING</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const AlgorithmCard = ({ type, label, desc, icon }: any) => (
        <TouchableOpacity
            onPress={() => setAlgorithm(type)}
            className={`flex-1 p-3 rounded-xl border mr-2 ${algorithm === type ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-200'}`}
        >
            <Ionicons name={icon} size={20} color={algorithm === type ? '#fff' : '#475569'} />
            <Text className={`font-bold mt-2 text-xs ${algorithm === type ? 'text-white' : 'text-slate-800'}`}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#f8fafc]">
            {/* Header */}
            <View className="bg-white px-5 pt-12 pb-4 border-b border-slate-200 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Auto Assign</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Select Strategy</Text>
                <View className="flex-row mb-6">
                    <AlgorithmCard type="RoundRobin" label="Round Robin" icon="git-compare-outline" />
                    <AlgorithmCard type="LeastLoad" label="Least Load" icon="bar-chart-outline" />
                </View>

                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-sm font-bold text-slate-900 uppercase tracking-wide">Pending Jobs ({jobs.length})</Text>
                    <TouchableOpacity onPress={toggleSelectAll}>
                        <Text className="text-blue-600 font-bold text-xs">{selectedJobs.length === jobs.length ? 'Deselect All' : 'Select All'}</Text>
                    </TouchableOpacity>
                </View>

                {jobs.length > 0 ? (
                    jobs.map(job => <View key={job.id}>{renderJobRow({ item: job })}</View>)
                ) : (
                    <View className="items-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
                        <Text className="text-slate-400">No pending jobs available.</Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Action Bar */}
            <View className="p-5 bg-white border-t border-slate-200">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-slate-500 text-xs">Selected: <Text className="font-bold text-slate-900">{selectedJobs.length}</Text></Text>
                    <Text className="text-slate-500 text-xs">Strategy: <Text className="font-bold text-slate-900">{algorithm}</Text></Text>
                </View>
                <TouchableOpacity
                    onPress={runAutoAssign}
                    className={`p-4 rounded-xl items-center ${selectedJobs.length > 0 ? 'bg-blue-600' : 'bg-slate-200'}`}
                    disabled={selectedJobs.length === 0}
                >
                    <Text className={`font-bold ${selectedJobs.length > 0 ? 'text-white' : 'text-slate-400'}`}>
                        Run Auto-Assign
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
