import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { CompanyService } from '@/services/company.service';

export default function CompanyDetailsScreen() {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const { user } = useAuth();

    const [companyName, setCompanyName] = useState(user?.profile?.company?.name || '');
    const [registerNumber, setRegisterNumber] = useState(user?.profile?.company?.registry_number || '');
    // Using user supplied "Company Number" as registry number for now, or could describe a phone number?
    // Figma shows "Company Register Number" and "Company Number" (likely Phone) and "Description".
    const [companyPhone, setCompanyPhone] = useState('');
    const [description, setDescription] = useState(user?.profile?.company?.description || '');
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (!companyName || !user?.profile?.company_id) {
            if (!user?.profile?.company_id) {
                Alert.alert('Error', 'No company associated with this user.');
                return;
            }
            Alert.alert('Error', 'Please fill in required fields');
            return;
        }

        try {
            setLoading(true);
            await CompanyService.updateCompany(user.profile.company_id, {
                name: companyName,
                registry_number: registerNumber,
                description: description,
                // phone: companyPhone // If company schema has phone
            });
            navigation.navigate('CompanyAddress');
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
                    <View className="h-1 bg-blue-200 flex-1 rounded-full" />
                    <View className="h-1 bg-blue-200 flex-1 rounded-full" />
                </View>

                <ScrollView className="px-6 flex-1">
                    <Text className="text-base font-bold text-gray-900 mb-2">Company Name</Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 mb-6 bg-white"
                        placeholder="Ahmed"
                        value={companyName}
                        onChangeText={setCompanyName}
                    />

                    <Text className="text-base font-bold text-gray-900 mb-2">Company Register Number</Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 mb-6 bg-white"
                        placeholder="Enter Register Number"
                        value={registerNumber}
                        onChangeText={setRegisterNumber}
                    />

                    <Text className="text-base font-bold text-gray-900 mb-2">Company Number</Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 mb-6 bg-white"
                        placeholder="Entry"
                        keyboardType="phone-pad"
                        value={companyPhone}
                        onChangeText={setCompanyPhone}
                    />

                    <Text className="text-base font-bold text-gray-900 mb-2">Company Description</Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 mb-6 bg-white"
                        placeholder="Description"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
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
