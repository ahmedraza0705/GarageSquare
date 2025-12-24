// ============================================
// TECHNICIAN JOB DETAIL SCREEN
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import StatusBadge from '@/components/StatusBadge';

export default function TechnicianJobDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { jobCardId } = route.params as { jobCardId: string } || {};

    const [activeTab, setActiveTab] = useState('overview'); // overview, services, parts
    const [jobStatus, setJobStatus] = useState('pending'); // pending, in_progress, waiting_parts, completed
    const [loading, setLoading] = useState(true);
    const [jobData, setJobData] = useState<any>(null);

    useEffect(() => {
        // Mock fetch job details
        setTimeout(() => {
            setJobData({
                id: jobCardId,
                job_number: 'JOB-2023-001',
                client: { name: 'John Doe', phone: '+91 98765 43210' },
                vehicle: {
                    make: 'Toyota',
                    model: 'Camry',
                    year: '2022',
                    plate: 'GJ-01-AB-1234',
                    vin: 'JT11234567890',
                    color: 'Silver'
                },
                status: 'in_progress',
                complaint: 'Customer reports engine knocking sound when accelerating above 60km/h. Also brake squeaking.',
                instructions: 'Check spark plugs, inspect brake pads, change oil filter if needed.',
                services: [
                    { id: 1, name: 'Engine Diagnostic', status: 'completed' },
                    { id: 2, name: 'Brake Pad Replacement', status: 'pending' },
                    { id: 3, name: 'Oil Change', status: 'pending' }
                ],
                parts: [
                    { id: 1, name: 'Brake Pads (Front)', qty: 1, status: 'available' },
                    { id: 2, name: 'Synthetic Oil 5W-30', qty: 4, status: 'available' }
                ]
            });
            setJobStatus('in_progress'); // Sync with data
            setLoading(false);
        }, 1000);
    }, [jobCardId]);

    const handleStatusChange = (newStatus: string) => {
        Alert.alert(
            'Update Status',
            `Change job status to ${newStatus.replace('_', ' ')}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => setJobStatus(newStatus)
                }
            ]
        );
    };

    if (loading || !jobData) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <Text className="text-gray-500">Loading Job Details...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 pt-12 pb-4 border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                        <Image source={require('../../../assets/Arrow.png')} className="w-6 h-6 tint-gray-800" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-900">{jobData.job_number}</Text>
                    <View className="w-8" />
                </View>

                {/* Vehicle Header Card */}
                <View className="flex-row items-center">
                    <View className="w-12 h-12 bg-blue-100 rounded-lg justify-center items-center mr-3">
                        <Text className="text-2xl">🚗</Text>
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-gray-900">
                            {jobData.vehicle.make} {jobData.vehicle.model}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                            {jobData.vehicle.plate} • {jobData.vehicle.year}
                        </Text>
                    </View>
                </View>

                {/* Status Actions - Quick Toggle */}
                <View className="flex-row mt-6 bg-gray-100 p-1 rounded-lg">
                    {['pending', 'in_progress', 'completed'].map((status) => (
                        <TouchableOpacity
                            key={status}
                            className={`flex-1 py-2 rounded-md ${jobStatus === status ? 'bg-white shadow-sm' : ''}`}
                            onPress={() => handleStatusChange(status)}
                        >
                            <Text className={`text-center text-xs font-bold uppercase ${jobStatus === status ? 'text-blue-600' : 'text-gray-500'}`}>
                                {status.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView className="flex-1">

                {/* Quick Actions Grid */}
                <View className="px-4 py-6 flex-row flex-wrap justify-between">
                    <QuickActionCard
                        title="Work Progress"
                        icon="🛠️"
                        color="bg-blue-50"
                        onPress={() => navigation.navigate('WorkProgress' as never)}
                    />
                    <QuickActionCard
                        title="Inspection"
                        icon="📋"
                        color="bg-green-50"
                        onPress={() => navigation.navigate('InspectionChecklist' as never)}
                    />
                    <QuickActionCard
                        title="Parts Used"
                        icon="⚙️"
                        color="bg-orange-50"
                        onPress={() => navigation.navigate('PartsUsage' as never)}
                    />
                    <QuickActionCard
                        title="Add Notes"
                        icon="📷"
                        color="bg-purple-50"
                        onPress={() => navigation.navigate('AddNotesImages' as never)}
                    />
                </View>

                {/* Customer Complaint Section */}
                <View className="mx-4 mb-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <Text className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">Customer Complaint</Text>
                    <Text className="text-gray-700 leading-5">{jobData.complaint}</Text>
                </View>

                {/* Supervisor Instructions */}
                <View className="mx-4 mb-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <Text className="text-sm font-bold text-yellow-800 mb-2 uppercase tracking-wide">Supervisor Instructions</Text>
                    <Text className="text-yellow-900 leading-5">{jobData.instructions}</Text>
                </View>

                {/* Vehicle Details */}
                <View className="mx-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <Text className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Vehicle Info</Text>
                    <Row label="VIN" value={jobData.vehicle.vin} />
                    <Row label="Color" value={jobData.vehicle.color} />
                    <Row label="Owner" value={jobData.client.name} />
                    <Row label="Contact" value={jobData.client.phone} isLast />
                </View>

                {/* Submit Button */}
                <View className="mx-4 mb-8">
                    <TouchableOpacity
                        className="bg-blue-600 py-4 rounded-xl shadow-sm active:bg-blue-700"
                        onPress={() => navigation.navigate('JobSubmission' as never)}
                    >
                        <Text className="text-white text-center font-bold text-lg">Submit Job</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>

        </View>
    );
}

const QuickActionCard = ({ title, icon, color, onPress }: any) => (
    <TouchableOpacity
        className={`${color} w-[48%] p-4 rounded-xl mb-4 border border-gray-100 items-center justify-center h-28`}
        onPress={onPress}
    >
        <Text className="text-3xl mb-2">{icon}</Text>
        <Text className="font-bold text-gray-800 text-center">{title}</Text>
    </TouchableOpacity>
);

const Row = ({ label, value, isLast }: any) => (
    <View className={`flex-row justify-between py-2 ${!isLast ? 'border-b border-gray-100' : ''}`}>
        <Text className="text-gray-500">{label}</Text>
        <Text className="text-gray-900 font-medium">{value}</Text>
    </View>
);
