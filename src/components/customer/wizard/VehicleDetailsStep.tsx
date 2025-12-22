import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Button from '@/components/shared/Button';
import { DELIVERY_TYPES, YEAR_OF_PURCHASE, YEARS_OF_MANUFACTURE } from '@/constants/vehicleData';

interface VehicleDetailsStepProps {
    data: {
        year_manufacture: number | undefined;
        year_purchase: number | undefined;
        fuel_type: string;
        delivery_type: string;
    };
    onUpdate: (data: any) => void;
    onFinish: () => void;
    loading: boolean;
}

export default function VehicleDetailsStep({ data, onUpdate, onFinish, loading }: VehicleDetailsStepProps) {
    // State for Manufacture Year
    const [showCustomYearMan, setShowCustomYearMan] = useState(
        data.year_manufacture !== undefined && !YEARS_OF_MANUFACTURE.includes(data.year_manufacture.toString())
    );
    const [customYearMan, setCustomYearMan] = useState(showCustomYearMan ? data.year_manufacture?.toString() || '' : '');

    // State for Purchase Year
    const [showCustomYearPur, setShowCustomYearPur] = useState(
        data.year_purchase !== undefined && !YEAR_OF_PURCHASE.includes(data.year_purchase.toString())
    );
    const [customYearPur, setCustomYearPur] = useState(showCustomYearPur ? data.year_purchase?.toString() || '' : '');

    const handleYearManSelect = (year: string) => {
        onUpdate({ ...data, year_manufacture: parseInt(year) });
        setShowCustomYearMan(false);
        setCustomYearMan('');
    };

    const handleYearPurSelect = (year: string) => {
        onUpdate({ ...data, year_purchase: parseInt(year) });
        setShowCustomYearPur(false);
        setCustomYearPur('');
    };

    const handleCustomYearManChange = (text: string) => {
        setCustomYearMan(text);
        onUpdate({ ...data, year_manufacture: text.trim() ? parseInt(text) : undefined });
    };

    const handleCustomYearPurChange = (text: string) => {
        setCustomYearPur(text);
        onUpdate({ ...data, year_purchase: text.trim() ? parseInt(text) : undefined });
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
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={true}
                >
                    {/* Year of Manufacture */}
                    <Text className="text-lg font-bold text-gray-900 mb-3">Year of Manufacture</Text>
                    <View className="flex-row flex-wrap mb-4" style={{ gap: 12 }}>
                        {YEARS_OF_MANUFACTURE.slice(0, 3).map((year) => (
                            <TouchableOpacity
                                key={`man-${year}`}
                                onPress={() => handleYearManSelect(year)}
                                style={{ width: '30%' }}
                                className={`py-3 rounded-xl border items-center justify-center ${data.year_manufacture === parseInt(year) && !showCustomYearMan ? 'bg-[#4682B4] border-[#4682B4]' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-medium text-sm ${data.year_manufacture === parseInt(year) && !showCustomYearMan ? 'text-white' : 'text-gray-900'}`}>{year}</Text>
                            </TouchableOpacity>
                        ))}

                        {/* Others Button for Manufacture Year */}
                        <TouchableOpacity
                            onPress={() => {
                                setShowCustomYearMan(true);
                                onUpdate({ ...data, year_manufacture: undefined });
                            }}
                            style={{ width: '30%' }}
                            className={`py-3 rounded-xl border items-center justify-center ${showCustomYearMan ? 'bg-[#4682B4] border-[#4682B4]' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-medium text-sm ${showCustomYearMan ? 'text-white' : 'text-gray-900'}`}>Others</Text>
                        </TouchableOpacity>
                    </View>

                    {showCustomYearMan && (
                        <View className="border border-gray-200 rounded-2xl px-4 py-3 mb-6 bg-white">
                            <TextInput
                                placeholder="Type Manufacture Year"
                                value={customYearMan}
                                onChangeText={handleCustomYearManChange}
                                className="text-gray-900 text-base"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                maxLength={4}
                                autoFocus={showCustomYearMan}
                            />
                        </View>
                    )}

                    {/* Year of Purchase */}
                    <Text className="text-lg font-bold text-gray-900 mb-3">Year of Purchase</Text>
                    <View className="flex-row flex-wrap mb-4" style={{ gap: 12 }}>
                        {YEAR_OF_PURCHASE.map((year) => (
                            <TouchableOpacity
                                key={`pur-${year}`}
                                onPress={() => handleYearPurSelect(year)}
                                style={{ width: '30%' }}
                                className={`py-3 rounded-xl border items-center justify-center ${data.year_purchase === parseInt(year) && !showCustomYearPur ? 'bg-[#4682B4] border-[#4682B4]' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-medium text-sm ${data.year_purchase === parseInt(year) && !showCustomYearPur ? 'text-white' : 'text-gray-900'}`}>{year}</Text>
                            </TouchableOpacity>
                        ))}

                        {/* Others Button for Purchase Year */}
                        <TouchableOpacity
                            onPress={() => {
                                setShowCustomYearPur(true);
                                onUpdate({ ...data, year_purchase: undefined });
                            }}
                            style={{ width: '30%' }}
                            className={`py-3 rounded-xl border items-center justify-center ${showCustomYearPur ? 'bg-[#4682B4] border-[#4682B4]' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-medium text-sm ${showCustomYearPur ? 'text-white' : 'text-gray-900'}`}>Others</Text>
                        </TouchableOpacity>
                    </View>

                    {showCustomYearPur && (
                        <View className="border border-gray-200 rounded-2xl px-4 py-3 mb-6 bg-white">
                            <TextInput
                                placeholder="Type Purchase Year"
                                value={customYearPur}
                                onChangeText={handleCustomYearPurChange}
                                className="text-gray-900 text-base"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                maxLength={4}
                                autoFocus={showCustomYearPur}
                            />
                        </View>
                    )}

                    {/* Delivery Type */}
                    <Text className="text-lg font-bold text-gray-900 mb-3">Delivery type</Text>
                    <View className="flex-row gap-4 mb-6">
                        {DELIVERY_TYPES.map((type: string) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => onUpdate({ ...data, delivery_type: type })}
                                className={`flex-1 py-4 rounded-xl border items-center justify-center ${data.delivery_type === type ? 'bg-[#4682B4] border-[#4682B4]' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-medium text-sm ${data.delivery_type === type ? 'text-white' : 'text-gray-900'}`}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                <View className="px-6 pb-6 pt-3 bg-white border-t border-gray-200">
                    <Button
                        title="Finish"
                        onPress={onFinish}
                        loading={loading}
                        disabled={!data.year_manufacture || !data.year_purchase || !data.delivery_type}
                    />
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
