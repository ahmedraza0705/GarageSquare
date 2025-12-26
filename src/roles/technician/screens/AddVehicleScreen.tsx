import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { vehicleService } from '../services/VehicleService';

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
    const route: any = useRoute();
    const editingVehicle = route.params?.vehicle; // Check if we are editing

    // Form State
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [regNumber, setRegNumber] = useState('');
    const [vin, setVin] = useState('');
    const [color, setColor] = useState('');
    const [mileage, setMileage] = useState('');
    const [fuel, setFuel] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [issue, setIssue] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (editingVehicle) {
            setMake(editingVehicle.make);
            setModel(editingVehicle.model);
            setYear(editingVehicle.year);
            setRegNumber(editingVehicle.reg_number);
            setVin(editingVehicle.vin || '');
            setColor(editingVehicle.color || '');
            setMileage(editingVehicle.mileage || '');
            setFuel(editingVehicle.fuel_level || '');
            setOwnerName(editingVehicle.owner);
            setNotes(editingVehicle.notes || '');
            // Issue is usually for a new job card, but could pre-fill if editing a draft
        }
    }, [editingVehicle]);

    const handleSubmit = async () => {
        if (!make || !model || !regNumber) {
            Alert.alert('Missing Fields', 'Please fill in at least Make, Model, and Registration Number.');
            return;
        }

        const vehicleData = {
            make,
            model,
            year,
            reg_number: regNumber,
            vin,
            color,
            mileage,
            fuel_level: fuel,
            owner: ownerName,
            notes,
            // Only update these if creating new, or specific logic for edits
            status: editingVehicle ? editingVehicle.status : 'In Shop',
            service_status: editingVehicle ? editingVehicle.service_status : 'Inspection Required',
            last_service: 'Just Now',
            assigned_to: 'Me', // Auto-assign to current tech
        };

        if (editingVehicle) {
            await vehicleService.update(editingVehicle.id, vehicleData);
            Alert.alert('Success', 'Vehicle updated successfully');
        } else {
            await vehicleService.add({
                ...vehicleData,
                // Add initial generic task for the reported issue
                tasks: issue ? [{ id: Date.now(), name: issue, status: 'Pending', time: 'Pending', cost: 0 }] : [],
                timeline: [{ time: 'Just Now', event: 'Vehicle Registered', date: 'Today' }]
            } as any);
            Alert.alert('Success', 'Vehicle added successfully');
        }

        navigation.goBack();
    };

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <SafeAreaView className="bg-white" edges={['top']}>
                <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                        <Ionicons name="close" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-900">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</Text>
                </View>
            </SafeAreaView>

            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <Text className="text-lg font-bold text-slate-800 mb-6">Vehicle Details</Text>

                    <InputField
                        label="Registration Number *"
                        placeholder="e.g. MH-02-AZ-1234"
                        value={regNumber}
                        onChange={(text: string) => setRegNumber(text.toUpperCase())}
                        autoCapitalize="characters"
                    />
                    <View className="flex-row gap-4 mb-2">
                        <View className="flex-1">
                            <InputField label="Make *" placeholder="e.g. Toyota" value={make} onChange={setMake} />
                        </View>
                        <View className="flex-1">
                            <InputField label="Model *" placeholder="e.g. Fortuner" value={model} onChange={setModel} />
                        </View>
                    </View>
                    <View className="flex-row gap-4 mb-2">
                        <View className="flex-1">
                            <InputField label="Year" placeholder="e.g. 2023" value={year} onChange={setYear} keyboardType="numeric" />
                        </View>
                        <View className="flex-1">
                            <InputField label="Color" placeholder="e.g. White" value={color} onChange={setColor} />
                        </View>
                    </View>

                    <InputField
                        label="VIN / Chassis Number"
                        placeholder="e.g. 1HGCM..."
                        value={vin}
                        onChange={(text: string) => setVin(text.toUpperCase())}
                        autoCapitalize="characters"
                    />

                    <View className="flex-row gap-4 mb-2">
                        <View className="flex-1">
                            <InputField label="Mileage (km)" placeholder="e.g. 45000" value={mileage} onChange={setMileage} keyboardType="numeric" />
                        </View>
                        <View className="flex-1">
                            <InputField label="Fuel Level" placeholder="e.g. 50%" value={fuel} onChange={setFuel} />
                        </View>
                    </View>
                </View>

                <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                    <Text className="text-lg font-bold text-slate-800 mb-6">Owner Information</Text>
                    <InputField label="Owner Name" placeholder="Full Customer Name" value={ownerName} onChange={setOwnerName} />
                </View>

                {!editingVehicle && (
                    <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                        <Text className="text-lg font-bold text-slate-800 mb-6">Initial Service Request</Text>
                        <InputField
                            label="Reported Issues"
                            placeholder="Describe the main issue..."
                            value={issue}
                            onChange={setIssue}
                            multiline={true}
                        />
                    </View>
                )}

                <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                    <Text className="text-lg font-bold text-slate-800 mb-6">Internal Notes</Text>
                    <InputField
                        label="Notes"
                        placeholder="Any hidden scratches, dents, or special instructions..."
                        value={notes}
                        onChange={setNotes}
                        multiline={true}
                    />
                </View>

            </ScrollView>

            <View className="p-5 bg-white border-t border-slate-100">
                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-[#4682b4] py-4 rounded-xl items-center shadow-lg active:bg-[#3a6d96]"
                >
                    <Text className="text-white font-bold text-lg">{editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
