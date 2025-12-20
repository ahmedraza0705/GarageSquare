import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import Button from '@/components/shared/Button';
import { FUEL_TYPES, DELIVERY_TYPES, YEAR_OF_PURCHASE } from '@/constants/vehicleData';

interface VehicleDetailsStepProps {
    data: {
        year: number | undefined;
        fuel_type: string;
        delivery_type: string;
    };
    onUpdate: (data: any) => void;
    onFinish: () => void;
    loading: boolean;
}

export default function VehicleDetailsStep({ data, onUpdate, onFinish, loading }: VehicleDetailsStepProps) {
    const [showCustomYear, setShowCustomYear] = useState(false);
    const [customYear, setCustomYear] = useState('');

    const handleYearSelect = (year: string) => {
        onUpdate({ ...data, year: parseInt(year) });
        setShowCustomYear(false);
        setCustomYear('');
    };

    const handleYearOthersClick = () => {
        setShowCustomYear(true);
    };

    const handleCustomYearChange = (text: string) => {
        setCustomYear(text);
        if (text.trim()) {
            onUpdate({ ...data, year: parseInt(text) });
        }
    };

    return (
        <View className="flex-1 bg-white px-6 py-4">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Year of Purchase */}
                <Text className="text-lg font-bold text-gray-900 mb-3">Year of Purchase</Text>
                <View className="flex-row flex-wrap mb-6" style={{ gap: 12 }}>
                    {YEAR_OF_PURCHASE.map((year) => (
                        <TouchableOpacity
                            key={year}
                            onPress={() => handleYearSelect(year)}
                            style={{ width: '30%' }}
                            className={`py-3 rounded-xl border items-center justify-center ${data.year === parseInt(year) ? 'bg-blue-600 border-blue-600' : 'bg-gray-50 border-gray-200'}`}
                        >
                            <Text className={`${data.year === parseInt(year) ? 'text-white' : 'text-gray-900'}`}>{year}</Text>
                        </TouchableOpacity>
                    ))}

                    {/* Others Button for Year */}
                    <TouchableOpacity
                        onPress={handleYearOthersClick}
                        style={{ width: '30%' }}
                        className={`py-3 rounded-xl border items-center justify-center ${showCustomYear ? 'bg-blue-600 border-blue-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                        <Text className={`${showCustomYear ? 'text-white' : 'text-gray-900'}`}>Others</Text>
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

                {/* Delivery Type */}
                <Text className="text-lg font-bold text-gray-900 mb-3">Delivery type</Text>
                <View className="flex-row gap-4 mb-6">
                    {DELIVERY_TYPES.map((type: string) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => onUpdate({ ...data, delivery_type: type })}
                            className={`flex-1 px-2 py-4 rounded-xl border items-center justify-center ${data.delivery_type === type ? 'bg-blue-600 border-blue-600' : 'bg-gray-50 border-gray-200'}`}
                        >
                            <Text className={`text-center ${data.delivery_type === type ? 'text-white' : 'text-gray-900'}`}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View className="absolute bottom-6 left-6 right-6">
                <Button
                    title="Finish"
                    onPress={onFinish}
                    loading={loading}
                    disabled={!data.year || !data.delivery_type}
                />
            </View>
        </View>
    );
}
