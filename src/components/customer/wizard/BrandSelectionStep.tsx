import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import Button from '@/components/shared/Button';
import { CAR_BRANDS } from '@/constants/vehicleData';

interface BrandSelectionStepProps {
    selectedBrand: string;
    onSelect: (brand: string) => void;
    onNext: () => void;
    error?: string;
}

export default function BrandSelectionStep({ selectedBrand, onSelect, onNext, error }: BrandSelectionStepProps) {
    const [showCustomInput, setShowCustomInput] = useState(selectedBrand === 'Other' || (selectedBrand !== '' && !CAR_BRANDS.some(b => b.name === selectedBrand)));
    const [customBrand, setCustomBrand] = useState(showCustomInput ? selectedBrand : '');

    const handleBrandSelect = (brandName: string) => {
        onSelect(brandName);
        setShowCustomInput(false);
        setCustomBrand('');
    };

    const handleOtherClick = () => {
        setShowCustomInput(true);
        onSelect('Other'); // Use 'Other' as a placeholder to show validation error if customBrand is empty
    };

    const handleCustomBrandChange = (text: string) => {
        setCustomBrand(text);
        onSelect(text || 'Other'); // If empty, set back to 'Other' to trigger validation error
    };

    const isOtherSelected = showCustomInput || selectedBrand === 'Other';

    return (
        <View className="flex-1 bg-white">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 150}
            >
                <View className="px-6 py-4 flex-1">
                    <Text className="text-xl font-bold text-gray-900 mb-4">Pick your Car Brand</Text>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        keyboardShouldPersistTaps="handled"
                    >
                        {CAR_BRANDS.map((brand: any) => {
                            const isSelected = (selectedBrand === brand.name && !showCustomInput) || (brand.name === 'Other' && showCustomInput);
                            return (
                                <TouchableOpacity
                                    key={brand.id}
                                    onPress={() => {
                                        if (brand.name === 'Other') {
                                            handleOtherClick();
                                        } else {
                                            handleBrandSelect(brand.name);
                                        }
                                    }}
                                    className={`p-4 mb-3 rounded-xl border ${isSelected
                                        ? 'bg-[#4682B4] border-[#4682B4]'
                                        : 'bg-white border-gray-200'
                                        } ${error && !selectedBrand && brand.name === 'Other' ? 'border-red-500' : ''}`}
                                >
                                    <Text className={`text-base font-medium ${isSelected
                                        ? 'text-white'
                                        : 'text-gray-900'
                                        }`}>
                                        {brand.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}

                        {/* Custom Brand Input */}
                        {showCustomInput && (
                            <View className="mb-6">
                                <View className={`flex-row items-center border rounded-2xl px-4 py-3 bg-white ${error ? 'border-red-500' : 'border-gray-200'}`}>
                                    <TextInput
                                        placeholder="Type Brand Name"
                                        value={customBrand}
                                        onChangeText={handleCustomBrandChange}
                                        className="flex-1 text-gray-900 text-base"
                                        placeholderTextColor="#9CA3AF"
                                        autoFocus
                                    />
                                    {error && (
                                        <AlertCircle size={20} color="#EF4444" />
                                    )}
                                </View>
                                {error && (
                                    <Text className="text-red-500 text-xs mt-1 ml-2">Mandatory field</Text>
                                )}
                            </View>
                        )}

                        {error && !selectedBrand && (
                            <View className="flex-row items-center mt-2 px-2">
                                <AlertCircle size={16} color="#EF4444" />
                                <Text className="text-red-500 text-sm ml-2">Please select a brand</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>

            <View className="px-6 pb-6 pt-3 bg-white border-t border-gray-200">
                <Button
                    title="Next"
                    onPress={onNext}
                    disabled={!selectedBrand || selectedBrand === 'Other'}
                />
            </View>
        </View>
    );
}
