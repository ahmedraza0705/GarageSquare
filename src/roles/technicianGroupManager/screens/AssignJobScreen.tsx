import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { vehicleService } from '@/roles/technician/services/VehicleService';
import Header from '@/roles/technician/components/Header';

export default function AssignJobScreen() {
    const navigation = useNavigation();
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Mock Team
    const TEAM = ['Ahmed Raza', 'Rahul Kumar', 'Sarah Smith', 'John Doe'];

    const loadJobs = () => {
        const allJobs = vehicleService.getAll();
        // Allow re-assigning any active or scheduled job
        const assignable = allJobs.filter(j => j.status === 'Scheduled' || j.status === 'In Shop');
        setJobs(assignable);
    };

    useFocusEffect(
        useCallback(() => {
            loadJobs();
        }, [])
    );

    const handleAssign = async (techName: string) => {
        if (!selectedJob) return;

        await vehicleService.update(selectedJob.id, { assigned_to: techName });

        Alert.alert('Success', `Job assigned to ${techName}`);
        setModalVisible(false);
        setSelectedJob(null);
        loadJobs(); // Refresh list
    };

    const renderJobItem = ({ item }: any) => (
        <TouchableOpacity
            onPress={() => { setSelectedJob(item); setModalVisible(true); }}
            className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-slate-100 flex-row justify-between items-center"
        >
            <View>
                <Text className="font-bold text-slate-800 text-base">{item.make} {item.model}</Text>
                <Text className="text-slate-500 text-sm">{item.reg_number}</Text>
                <Text className="text-xs text-slate-400 mt-1">Status: {item.status}</Text>
            </View>
            <View className="items-end">
                <Text className="text-xs font-semibold text-slate-500 uppercase">Assigned To</Text>
                <View className="bg-slate-100 px-3 py-1 rounded-full mt-1">
                    <Text className="font-bold text-slate-700">{item.assigned_to || 'Unassigned'}</Text>
                </View>
                <Text className="text-[10px] text-blue-500 mt-2 font-bold">RE-ASSIGN</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <Header title="Assign Jobs" />

            <FlatList
                data={jobs}
                keyExtractor={item => item.id}
                renderItem={renderJobItem}
                contentContainerStyle={{ padding: 20 }}
                ListHeaderComponent={<Text className="text-slate-500 mb-4 px-1">Select a job to assign or re-assign a technician.</Text>}
            />

            {/* Assignment Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 min-h-[40%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-slate-900">Select Technician</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {selectedJob && (
                            <Text className="text-slate-500 mb-4">
                                Assigning: <Text className="font-bold text-slate-800">{selectedJob.make} {selectedJob.model} ({selectedJob.reg_number})</Text>
                            </Text>
                        )}

                        <ScrollView>
                            {TEAM.map((tech, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => handleAssign(tech)}
                                    className="p-4 border-b border-slate-100 flex-row items-center gap-4 active:bg-slate-50"
                                >
                                    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                                        <Text className="font-bold text-blue-700">{tech.charAt(0)}</Text>
                                    </View>
                                    <Text className="text-lg font-medium text-slate-700">{tech}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
