import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header'; // Or Custom header

const InputField = ({ label, placeholder, value, onChange, keyboardType = 'default', multiline = false, autoCapitalize = 'none' }: any) => (
    <View className="mb-5">
        <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">{label}</Text>
        <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            keyboardType={keyboardType}
            multiline={multiline}
            autoCapitalize={autoCapitalize}
            className={`bg-white border border-slate-200 rounded-xl p-4 text-slate-800 text-base font-medium shadow-sm ${multiline ? 'h-24 text-top' : ''}`}
        />
    </View>
);

export default function AddVehicleScreen() {
    const navigation = useNavigation();

    // Form State
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [regNumber, setRegNumber] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [issue, setIssue] = useState('');

    const handleSubmit = () => {
        // Create Mock Vehicle with Job Card Data
        const newVehicle = {
            id: Math.random().toString(),
            make: make || 'Toyota',
            model: model || 'Corolla',
            year: year || '2024',
            reg_number: regNumber || 'MH-04-AB-1234',
            owner: ownerName || 'New Customer',
            status: 'In Shop',
            service_status: 'Inspection Required',
            last_service: 'Just Now',
            image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/41564/hyundai-creta-right-front-three-quarter5.jpeg?q=80', // Placeholder
            assigned_to: 'Unassigned',
            tasks: [
                { id: 1, name: 'Vehicle Inspection', status: 'Pending', time: '30m' },
                { id: 2, name: issue || 'General Checkup', status: 'Pending', time: '1h' },
            ],
            timeline: [
                { time: 'Just Now', event: 'Job Card Created', date: 'Today' },
            ],
            performance_stats: {
                estimated_time: '1h 30m',
                time_spent: '0m',
                efficiency: '-',
            }
        };

        // Navigate directly to Detail Screen to show "Features"
        // Using replace to avoid going back to add screen on back press
        (navigation as any).navigate('VehicleDetail', { vehicle: newVehicle });
    };

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <SafeAreaView className="bg-white" edges={['top']}>
                <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                        <Ionicons name="close" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900">Create New Job Card</Text>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <Text className="text-lg font-bold text-slate-800 mb-6">Vehicle Information</Text>

                    <InputField
                        label="Registration Number"
                        placeholder="e.g. MH-02-AZ-1234"
                        value={regNumber}
                        onChange={(text: string) => setRegNumber(text.toUpperCase())}
                        autoCapitalize="characters"
                    />
                    <View className="flex-row gap-4 mb-2">
                        <View className="flex-1">
                            <InputField label="Make" placeholder="e.g. Toyota" value={make} onChange={setMake} />
                        </View>
                        <View className="flex-1">
                            <InputField label="Year" placeholder="e.g. 2023" value={year} onChange={setYear} keyboardType="numeric" />
                        </View>
                    </View>
                    <InputField label="Model" placeholder="e.g. Fortuner Legender" value={model} onChange={setModel} />
                </View>

                <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <Text className="text-lg font-bold text-slate-800 mb-6">Service Request</Text>
                    <InputField
                        label="Reported Issues / Instructions"
                        placeholder="Describe the issue (e.g. Engine Noise, Brake Failure)..."
                        value={issue}
                        onChange={setIssue}
                        multiline={true}
                    />
                </View>

                <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                    <Text className="text-lg font-bold text-slate-800 mb-6">Owner Details</Text>
                    <InputField label="Owner Name" placeholder="Full Name" value={ownerName} onChange={setOwnerName} />
                </View>

            </ScrollView>

            <View className="p-5 bg-white border-t border-slate-100">
                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-[#4682b4] py-4 rounded-xl items-center shadow-lg active:bg-[#3a6d96]"
                >
                    <Text className="text-white font-bold text-lg">Create Job Card & View</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
