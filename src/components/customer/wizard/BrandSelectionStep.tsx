import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Button from '@/components/shared/Button';
import { CAR_BRANDS } from '@/constants/vehicleData';

interface BrandSelectionStepProps {
    selectedBrand: string;
    onSelect: (brand: string) => void;
    onNext: () => void;
    onBack?: () => void;
}

export default function BrandSelectionStep({ selectedBrand, onSelect, onNext }: BrandSelectionStepProps) {
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customBrand, setCustomBrand] = useState('');

    const handleBrandSelect = (brandName: string) => {
        onSelect(brandName);
        setShowCustomInput(false);
        setCustomBrand('');
    };

    const handleOtherClick = () => {
        setShowCustomInput(true);
        onSelect('Other'); // Set brand to "Other" so it shows the static models
    };

    const handleCustomBrandChange = (text: string) => {
        setCustomBrand(text);
        // Keep "Other" as the selected brand for routing, but store custom name
        onSelect('Other');
    };

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
                        {CAR_BRANDS.map((brand: any) => (
                            <TouchableOpacity
                                key={brand.id}
                                onPress={() => {
                                    if (brand.name === 'Other') {
                                        handleOtherClick();
                                    } else {
                                        handleBrandSelect(brand.name);
                                    }
                                }}
                                className={`p-4 mb-3 rounded-xl border ${(selectedBrand === brand.name || (brand.name === 'Other' && showCustomInput))
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-white border-gray-200'
                                    }`}
                            >
                                <Text className={`text-base font-medium ${(selectedBrand === brand.name || (brand.name === 'Other' && showCustomInput))
                                    ? 'text-white'
                                    : 'text-gray-900'
                                    }`}>
                                    {brand.name}
                                </Text>
                            </TouchableOpacity>
                        ))}

                        {/* Custom Brand Input - Shows below when Other is clicked */}
                        {showCustomInput && (
                            <View className="bg-gray-100 rounded-xl px-4 py-3 mb-6">
                                <TextInput
                                    placeholder="Type Brand Name"
                                    value={customBrand}
                                    onChangeText={handleCustomBrandChange}
                                    className="text-gray-900 text-base"
                                    placeholderTextColor="#9CA3AF"
                                    autoFocus
                                />
                            </View>
                        )}
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>

            <View className="px-6 pb-6 pt-3 bg-white border-t border-gray-200">
                <Button
                    title="Next"
                    onPress={onNext}
                    disabled={!selectedBrand}
                />
            </View>
        </View>
    );
}
