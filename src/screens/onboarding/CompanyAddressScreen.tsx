import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { CompanyService } from '@/services/company.service';

export default function CompanyAddressScreen() {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const { user } = useAuth();

    const [address, setAddress] = useState(user?.profile?.company?.address || '');
    const [country, setCountry] = useState(user?.profile?.company?.country || '');
    const [state, setState] = useState(user?.profile?.company?.state || '');
    const [city, setCity] = useState(user?.profile?.company?.city || '');
    const [zipCode, setZipCode] = useState(user?.profile?.company?.zip_code || '');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (!user?.profile?.company_id) {
            Alert.alert('Error', 'No company associated with this user.');
            return;
        }

        try {
            setLoading(true);
            await CompanyService.updateCompany(user.profile.company_id, {
                address,
                country,
                state,
                city,
                zip_code: zipCode,
            });
            // Proceed to Data Upload instead of finishing directly
            navigation.navigate('DataUpload');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <ArrowLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View className="flex-row px-6 mb-8 gap-2">
                    <View className="h-1 bg-blue-600 flex-1 rounded-full" />
                    <View className="h-1 bg-blue-600 flex-1 rounded-full" />
                    <View className="h-1 bg-blue-600 flex-1 rounded-full" />
                    <View className="h-1 bg-blue-200 flex-1 rounded-full" />
                </View>

                <ScrollView className="px-6 flex-1">
                    <Text className="text-base font-bold text-gray-900 mb-2">Company Address</Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 mb-4 bg-white"
                        placeholder="Enter Company Address"
                        value={address}
                        onChangeText={setAddress}
                    />

                    <Text className="text-base font-bold text-gray-900 mb-2">Country</Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 mb-4 bg-white"
                        placeholder="Enter Country"
                        value={country}
                        onChangeText={setCountry}
                    />

                    <Text className="text-base font-bold text-gray-900 mb-2">State</Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 mb-4 bg-white"
                        placeholder="Enter State"
                        value={state}
                        onChangeText={setState}
                    />

                    <Text className="text-base font-bold text-gray-900 mb-2">City</Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 mb-4 bg-white"
                        placeholder="Enter City"
                        value={city}
                        onChangeText={setCity}
                    />

                    <Text className="text-base font-bold text-gray-900 mb-2">ZIP code</Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 mb-6 bg-white"
                        placeholder="Enter ZIP Code"
                        value={zipCode}
                        onChangeText={setZipCode}
                    />
                </ScrollView>

                <View className="p-6">
                    <TouchableOpacity
                        className="w-full bg-blue-600 py-4 rounded-xl items-center shadow-sm"
                        onPress={handleNext}
                        disabled={loading}
                    >
                        <Text className="text-white font-semibold text-lg">
                            {loading ? 'Saving...' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
