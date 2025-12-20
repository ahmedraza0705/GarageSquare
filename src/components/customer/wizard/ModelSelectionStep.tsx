import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Button from '@/components/shared/Button';
import { CAR_MODELS, FUEL_TYPES, YEARS_OF_MANUFACTURE } from '@/constants/vehicleData';

interface ModelSelectionStepProps {
    selectedBrand: string;
    selectedModel: string;
    selectedFuelType: string;
    selectedYear: string;
    onSelectModel: (model: string) => void;
    onSelectFuelType: (fuelType: string) => void;
    onSelectYear: (year: string) => void;
    onNext: () => void;
}

export default function ModelSelectionStep({
    selectedBrand,
    selectedModel,
    selectedFuelType,
    selectedYear,
    onSelectModel,
    onSelectFuelType,
    onSelectYear,
    onNext
}: ModelSelectionStepProps) {
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customModel, setCustomModel] = useState('');
    const [showCustomYear, setShowCustomYear] = useState(false);
    const [customYear, setCustomYear] = useState('');

    const models = CAR_MODELS[selectedBrand] || [];

    const handleModelSelect = (model: string) => {
        onSelectModel(model);
        setShowCustomInput(false);
        setCustomModel('');
    };

    const handleOthersClick = () => {
        setShowCustomInput(true);
        onSelectModel('');
    };

    const handleCustomModelChange = (text: string) => {
        setCustomModel(text);
        onSelectModel(text);
    };

    const handleYearOthersClick = () => {
        setShowCustomYear(true);
        onSelectYear('');
    };

    const handleCustomYearChange = (text: string) => {
        setCustomYear(text);
        onSelectYear(text);
    };

    const handleYearSelect = (year: string) => {
        onSelectYear(year);
        setShowCustomYear(false);
        setCustomYear('');
    };

    return (
        <View className="flex-1 bg-white">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 150}
            >
                <ScrollView
                    className="flex-1 px-6 py-4"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <Text className="text-xl font-bold text-gray-900 mb-4">Car Model</Text>

                    {/* Car Models Grid - 3 columns */}
                    <View className="flex-row flex-wrap justify-between mb-6">
                        {models.map((model: string) => (
                            <TouchableOpacity
                                key={model}
                                onPress={() => handleModelSelect(model)}
                                className={`w-[31%] py-3 mb-3 rounded-xl border items-center justify-center ${selectedModel === model ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-medium text-sm ${selectedModel === model ? 'text-white' : 'text-gray-900'}`}>
                                    {model}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        {/* Others Button */}
                        <TouchableOpacity
                            onPress={handleOthersClick}
                            className={`w-[31%] py-3 mb-3 rounded-xl border items-center justify-center ${showCustomInput ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-medium text-sm ${showCustomInput ? 'text-white' : 'text-gray-900'}`}>
                                Others
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Custom Model Input - Shows when Others is clicked */}
                    {showCustomInput && (
                        <View className="bg-gray-100 rounded-xl px-4 py-3 mb-6">
                            <TextInput
                                placeholder="Type Model Name"
                                value={customModel}
                                onChangeText={handleCustomModelChange}
                                className="text-gray-900 text-base"
                                placeholderTextColor="#9CA3AF"
                                autoFocus
                            />
                        </View>
                    )}

                    {/* Fuel Type Section */}
                    <Text className="text-lg font-bold text-gray-900 mb-3">Fuel type</Text>
                    <View className="flex-row flex-wrap mb-6" style={{ gap: 12 }}>
                        {FUEL_TYPES.map((fuelType: string) => (
                            <TouchableOpacity
                                key={fuelType}
                                onPress={() => onSelectFuelType(fuelType)}
                                style={{ width: '30%' }}
                                className={`py-3 rounded-xl border items-center justify-center ${selectedFuelType === fuelType ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-medium text-sm ${selectedFuelType === fuelType ? 'text-white' : 'text-gray-900'}`}>
                                    {fuelType}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Year of Manufacture Section */}
                    <Text className="text-lg font-bold text-gray-900 mb-3">Year of Manufacture</Text>
                    <View className="flex-row flex-wrap mb-6" style={{ gap: 12 }}>
                        {YEARS_OF_MANUFACTURE.slice(0, 3).map((year: string) => (
                            <TouchableOpacity
                                key={year}
                                onPress={() => handleYearSelect(year)}
                                style={{ width: '30%' }}
                                className={`py-3 rounded-xl border items-center justify-center ${selectedYear === year ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-medium text-sm ${selectedYear === year ? 'text-white' : 'text-gray-900'}`}>
                                    {year}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        {/* Others Button for Year */}
                        <TouchableOpacity
                            onPress={handleYearOthersClick}
                            style={{ width: '30%' }}
                            className={`py-3 rounded-xl border items-center justify-center ${showCustomYear ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-medium text-sm ${showCustomYear ? 'text-white' : 'text-gray-900'}`}>
                                Others
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Custom Year Input - Shows when Others is clicked */}
                    {showCustomYear && (
                        <View className="bg-gray-100 rounded-xl px-4 py-3 mb-6">
                            <TextInput
                                placeholder="Type Year"
                                value={customYear}
                                onChangeText={handleCustomYearChange}
                                className="text-gray-900 text-base"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                maxLength={4}
                                autoFocus
                            />
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            <View className="px-6 pb-6 pt-3 bg-white border-t border-gray-200">
                <Button
                    title="Next"
                    onPress={onNext}
                    disabled={!selectedModel || !selectedFuelType || !selectedYear}
                />
            </View>
        </View>
    );
}
