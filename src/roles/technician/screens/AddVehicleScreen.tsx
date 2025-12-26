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

// --- Mock Data for Dropdowns ---
const SERVICE_DATA: Record<string, string[]> = {
    'General Service': ['Standard Service', 'Premium Service', 'Oil Change', 'General Inspection'],
    'Engine & Mechanical': ['Engine Noise', 'Starting Issue', 'Overheating', 'Belt Replacement'],
    'Body & Paint': ['Dent Repair', 'Scratch Removal', 'Full Paint', 'Polishing'],
    'Electrical': ['Battery Issue', 'Light Failure', 'AC Repair', 'Wiring Fault'],
    'Wheels & Tyres': ['Wheel Alignment', 'Wheel Balancing', 'Tyre Puncture', 'Tyre Replacement'],
    'Other': ['Custom Request', 'Consultation']
};

const DropdownModal = ({ visible, onClose, title, items, onSelect }: any) => {
    if (!visible) return null;
    return (
        <View className="absolute top-0 bottom-0 left-0 right-0 bg-black/50 justify-center items-center z-50 p-5">
            <View className="bg-white w-full rounded-2xl max-h-[80%] overflow-hidden">
                <View className="p-4 border-b border-gray-100 flex-row justify-between items-center bg-gray-50">
                    <Text className="text-lg font-bold text-slate-800">{title}</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>
                <ScrollView contentContainerStyle={{ padding: 10 }}>
                    {items.map((item: string, idx: number) => (
                        <TouchableOpacity
                            key={idx}
                            onPress={() => { onSelect(item); onClose(); }}
                            className="p-4 border-b border-gray-100 active:bg-blue-50"
                        >
                            <Text className="text-slate-700 font-medium text-base">{item}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

export default function AddVehicleScreen() {
    const navigation = useNavigation();
    const route: any = useRoute();
    const editingVehicle = route.params?.vehicle;

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

    // Service Request State
    const [issue, setIssue] = useState(''); // Kept for final output
    const [selectedCategory, setSelectedCategory] = useState('');
    // Multiple services state
    const [selectedServices, setSelectedServices] = useState<string[]>([]);

    // UI state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showItemModal, setShowItemModal] = useState(false);

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
        }
    }, [editingVehicle]);

    // Handle Dropdown Selection
    const handleCategorySelect = (cat: string) => {
        setSelectedCategory(cat);
        // We don't reset items anymore, we just allow adding from new category
    };

    const handleItemSelect = (item: string) => {
        const fullItem = `${selectedCategory} - ${item}`;
        if (!selectedServices.includes(fullItem)) {
            setSelectedServices([...selectedServices, fullItem]);
        }
        setShowItemModal(false);
    };

    const removeService = (index: number) => {
        const newServices = [...selectedServices];
        newServices.splice(index, 1);
        setSelectedServices(newServices);
    };

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
            status: editingVehicle ? editingVehicle.status : 'In Shop',
            service_status: editingVehicle ? editingVehicle.service_status : 'Inspection Required',
            last_service: 'Just Now',
            assigned_to: 'Me',
        };

        if (editingVehicle) {
            await vehicleService.update(editingVehicle.id, vehicleData);
            Alert.alert('Success', 'Vehicle updated successfully');
        } else {
            // New Vehicle Logic
            await vehicleService.add({
                ...vehicleData,
                tasks: selectedServices.length > 0
                    ? selectedServices.map((svc, idx) => ({ id: Date.now() + idx, name: svc, status: 'Pending', time: 'Pending', cost: 0 }))
                    : issue ? [{ id: Date.now(), name: issue, status: 'Pending', time: 'Pending', cost: 0 }] : [],
                timeline: [{ time: 'Just Now', event: 'Vehicle Registered', date: 'Today' }]
            } as any);
            Alert.alert('Success', 'Vehicle added successfully');
        }

        navigation.goBack();
    };

    return (
        <View className="flex-1 bg-[#f8fafc]">
            {/* Modals placed at root of View to cover screen */}
            <DropdownModal
                visible={showCategoryModal}
                onClose={() => setShowCategoryModal(false)}
                title="Select Category"
                items={Object.keys(SERVICE_DATA)}
                onSelect={handleCategorySelect}
            />
            <DropdownModal
                visible={showItemModal}
                onClose={() => setShowItemModal(false)}
                title="Select Service Item"
                items={selectedCategory ? SERVICE_DATA[selectedCategory] : []}
                onSelect={handleItemSelect}
            />

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

                        {/* Custom Dropdown Triggers */}
                        <View className="mb-4">
                            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Service Category</Text>
                            <TouchableOpacity
                                onPress={() => setShowCategoryModal(true)}
                                className="bg-white border border-slate-200 rounded-xl p-4 flex-row justify-between items-center"
                            >
                                <Text className={selectedCategory ? "text-slate-800 font-medium text-base" : "text-slate-400 text-base"}>
                                    {selectedCategory || "Select Category"}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-4">
                            <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Service Item</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    if (!selectedCategory) {
                                        Alert.alert('Select Category First', 'Please select a service category to see available items.');
                                        return;
                                    }
                                    setShowItemModal(true);
                                }}
                                className={`bg-white border border-slate-200 rounded-xl p-4 flex-row justify-between items-center ${!selectedCategory ? 'opacity-50' : ''}`}
                            >
                                <Text className={"text-slate-400 text-base"}>
                                    Select Service Item to Add...
                                </Text>
                                <Ionicons name="add-circle" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        {/* Selected Services List (Chips) */}
                        {selectedServices.length > 0 && (
                            <View className="flex-row flex-wrap gap-2 mt-2">
                                {selectedServices.map((service, index) => (
                                    <View key={index} className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 flex-row items-center">
                                        <Text className="text-blue-700 font-medium mr-2">{service}</Text>
                                        <TouchableOpacity onPress={() => removeService(index)}>
                                            <Ionicons name="close-circle" size={18} color="#93c5fd" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Read-only preview or Additional Input could go here if needed, but requirements said "Instead of text" */}
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
