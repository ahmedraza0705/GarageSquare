import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth_v2.service';
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
        if (!companyName) {
            Alert.alert('Error', 'Please enter a company name');
            return;
        }

        try {
            setLoading(true);
            let currentCompanyId = user?.profile?.company_id;

            // 1. Create company if missing
            if (!currentCompanyId && user?.id) {
                console.log('No company_id found, auto-linking using user.id:', user.id);
                const newCompany = await CompanyService.createCompany(companyName, user.id);
                if (!newCompany) throw new Error('Failed to create company');
                currentCompanyId = newCompany.id;

                // 2. Link user to company
                await AuthService.updateProfile(user.id, {
                    company_id: currentCompanyId
                });
                console.log('Linked user to company:', currentCompanyId);
            }

            if (!currentCompanyId) {
                throw new Error('Not linked with company and failed to create one.');
            }

            // 3. Update company details
            await CompanyService.updateCompany(currentCompanyId, {
                name: companyName,
                registry_number: registerNumber,
                description: description,
            });

            navigation.navigate('CompanyAddress');
        } catch (error: any) {
            console.error('Error in CompanyDetails handleNext:', error);
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
