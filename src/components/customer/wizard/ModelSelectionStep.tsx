import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import Button from '@/components/shared/Button';
import { CAR_MODELS, FUEL_TYPES } from '@/constants/vehicleData';

interface ModelSelectionStepProps {
    selectedBrand: string;
    selectedModel: string;
    selectedFuelType: string;
    selectedLicensePlate: string;
    onSelectModel: (model: string) => void;
    onSelectFuelType: (fuelType: string) => void;
    onSelectLicensePlate: (licensePlate: string) => void;
    onNext: () => void;
    errors?: Record<string, string>;
}

export default function ModelSelectionStep({
    selectedBrand,
    selectedModel,
    selectedFuelType,
    selectedLicensePlate,
    onSelectModel,
    onSelectFuelType,
    onSelectLicensePlate,
    onNext,
    errors = {}
}: ModelSelectionStepProps) {
    const models = CAR_MODELS[selectedBrand] || CAR_MODELS['Other'];

    // Determine if custom model input was active based on selectedModel value
    const [showCustomInput, setShowCustomInput] = useState(
        selectedModel === 'Other' ||
        (selectedModel !== '' && !models.includes(selectedModel))
    );
    const [customModel, setCustomModel] = useState(
        (selectedModel === 'Other' || selectedModel === 'NaN') ? '' : selectedModel
    );

    const handleModelSelect = (model: string) => {
        onSelectModel(model);
        setShowCustomInput(false);
        setCustomModel('');
    };

    const handleOthersClick = () => {
        setShowCustomInput(true);
        onSelectModel('Other');
    };

    const handleCustomModelChange = (text: string) => {
        setCustomModel(text);
        onSelectModel(text || 'Other');
    };

    const formatLicensePlate = (text: string) => {
        // Strip everything except alphanumeric
        const clean = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10);

        let formatted = clean;
        if (clean.length > 2) {
            formatted = clean.slice(0, 2) + '-' + clean.slice(2);
        }
        if (clean.length > 4) {
            formatted = formatted.slice(0, 5) + '-' + formatted.slice(5);
        }
        if (clean.length > 6) {
            formatted = formatted.slice(0, 8) + '-' + formatted.slice(8);
        }

        return formatted;
    };

    const handleLicensePlateChange = (text: string) => {
        // If the user deleted a character and we ended up with a trailing hyphen,
        // it means they deleted the character after a hyphen. We should delete the hyphen too.
        // Actually, the stripping logic handles most cases, but we want to make sure 
        // backspacing works intuitively.

        const formatted = formatLicensePlate(text);
        onSelectLicensePlate(formatted);
    };

    return (
        <View className="flex-1 bg-white">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 80}
            >
                <ScrollView
                    className="flex-1 px-6 py-4"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    automaticallyAdjustKeyboardInsets={true}
                >
                    <Text className="text-xl font-bold text-gray-900 mb-4">Car Model</Text>

                    {/* Car Models Grid - 3 columns */}
                    <View className="flex-row flex-wrap justify-between mb-2">
                        {models.map((model: string) => {
                            const isSelected = selectedModel === model && !showCustomInput;
                            return (
                                <TouchableOpacity
                                    key={model}
                                    onPress={() => handleModelSelect(model)}
                                    className={`w-[31%] py-3 mb-3 rounded-xl border items-center justify-center ${isSelected ? 'bg-[#4682B4] border-[#4682B4]' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                        {model}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}

                        {/* Others Button */}
                        <TouchableOpacity
                            onPress={handleOthersClick}
                            className={`w-[31%] py-3 mb-3 rounded-xl border items-center justify-center ${showCustomInput ? 'bg-[#4682B4] border-[#4682B4]' : 'bg-white border-gray-200'} ${errors.model && selectedModel === 'Other' ? 'border-red-500' : ''}`}
                        >
                            <Text className={`font-medium text-sm ${showCustomInput ? 'text-white' : 'text-gray-900'}`}>
                                Others
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Custom Model Input */}
                    {showCustomInput && (
                        <View className="mb-6">
                            <View className={`flex-row items-center border rounded-2xl px-4 py-3 bg-white ${errors.model ? 'border-red-500' : 'border-gray-200'}`}>
                                <TextInput
                                    placeholder="Type Model Name"
                                    value={customModel === 'Other' ? '' : customModel}
                                    onChangeText={handleCustomModelChange}
                                    className="flex-1 text-gray-900 text-base"
                                    placeholderTextColor="#9CA3AF"
                                    autoFocus
                                />
                                {errors.model && (
                                    <AlertCircle size={20} color="#EF4444" />
                                )}
                            </View>
                            {errors.model && (
                                <Text className="text-red-500 text-xs mt-1 ml-2">Mandatory field</Text>
                            )}
                        </View>
                    )}

                    {!showCustomInput && errors.model && (
                        <View className="flex-row items-center mb-6 px-2">
                            <AlertCircle size={16} color="#EF4444" />
                            <Text className="text-red-500 text-sm ml-2">Please select a model</Text>
                        </View>
                    )}

                    {/* Fuel Type Section */}
                    <Text className="text-lg font-bold text-gray-900 mb-3">Fuel type</Text>
                    <View className="flex-row flex-wrap mb-4" style={{ gap: 12 }}>
                        {FUEL_TYPES.map((fuelType: string) => (
                            <TouchableOpacity
                                key={fuelType}
                                onPress={() => onSelectFuelType(fuelType)}
                                style={{ width: '30%' }}
                                className={`py-3 rounded-xl border items-center justify-center ${selectedFuelType === fuelType ? 'bg-[#4682B4] border-[#4682B4]' : 'bg-white border-gray-200'} ${errors.fuel_type && !selectedFuelType ? 'border-red-500' : ''}`}
                            >
                                <Text className={`font-medium text-sm ${selectedFuelType === fuelType ? 'text-white' : 'text-gray-900'}`}>
                                    {fuelType}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    {errors.fuel_type && !selectedFuelType && (
                        <View className="flex-row items-center mb-6 px-2">
                            <AlertCircle size={16} color="#EF4444" />
                            <Text className="text-red-500 text-sm ml-2">Please select fuel type</Text>
                        </View>
                    )}

                    {/* Vehicle Number  Section */}
                    <Text className="text-lg font-bold text-gray-900 mb-3">License Plate No.</Text>
                    <View className="mb-6">
                        <View className={`flex-row items-center border rounded-2xl px-4 py-3 bg-white ${errors.license_plate ? 'border-red-500' : 'border-gray-200'}`}>
                            <TextInput
                                placeholder="GJ-05-AA-1234"
                                value={selectedLicensePlate}
                                onChangeText={handleLicensePlateChange}
                                className="flex-1 text-gray-900 text-base"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="characters"
                                maxLength={13} // 10 chars + 3 hyphens
                            />
                            {errors.license_plate && (
                                <AlertCircle size={20} color="#EF4444" />
                            )}
                        </View>
                        {errors.license_plate && (
                            <Text className="text-red-500 text-xs mt-1 ml-2">{errors.license_plate}</Text>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View className="px-6 pb-6 pt-3 bg-white border-t border-gray-200">
                <Button
                    title="Next"
                    onPress={onNext}
                    disabled={
                        !selectedModel ||
                        selectedModel === 'Other' ||
                        selectedModel === 'NaN' ||
                        selectedModel.trim() === '' ||
                        !selectedFuelType ||
                        !selectedLicensePlate?.trim()
                    }
                />
            </View>
        </View>
    );
}
