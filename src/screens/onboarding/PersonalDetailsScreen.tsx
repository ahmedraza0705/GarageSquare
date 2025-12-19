import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth.service';

export default function PersonalDetailsScreen() {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const { user } = useAuth();

    const [fullName, setFullName] = useState(user?.profile?.full_name || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.profile?.phone || '');
    const [address, setAddress] = useState(''); // Address isn't on UserProfile directly in previous schema types, but needed for UI. We might skip saving address if no field exists, or save to metadata.
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (!fullName || !phoneNumber) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            if (user?.id) {
                await AuthService.updateProfile(user.id, {
                    full_name: fullName,
                    phone: phoneNumber,
                    // address: address // No address field on UserProfile yet.
                });
            }
            navigation.navigate('CompanyDetails');
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
                    <View className="h-1 bg-blue-200 flex-1 rounded-full" />
                    <View className="h-1 bg-blue-200 flex-1 rounded-full" />
                    <View className="h-1 bg-blue-200 flex-1 rounded-full" />
                </View>

                <ScrollView className="px-6 flex-1">
                    <Text className="text-base font-bold text-gray-900 mb-2">Your Name</Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 mb-6 bg-white"
                        placeholder="Enter Your Name"
                        value={fullName}
                        onChangeText={setFullName}
                    />

                    <Text className="text-base font-bold text-gray-900 mb-2">Phone Number</Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 mb-6 bg-white"
                        placeholder="Enter Number"
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                    />

                    <Text className="text-base font-bold text-gray-900 mb-2">Your Address</Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 mb-6 bg-white"
                        placeholder="Enter Your Address"
                        value={address}
                        onChangeText={setAddress}
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
