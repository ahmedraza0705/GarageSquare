import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft, AlertCircle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth.service';

export default function PersonalDetailsScreen() {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const { user } = useAuth();

    const [fullName, setFullName] = useState(user?.profile?.full_name || '');
    const [gmail, setGmail] = useState(user?.profile?.email || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.profile?.phone || '');
    const [address, setAddress] = useState(user?.profile?.address || '');
    const [country, setCountry] = useState(user?.profile?.country || '');
    const [state, setState] = useState(user?.profile?.state || '');
    const [zipCode, setZipCode] = useState(user?.profile?.postal_code || '');
    const [city, setCity] = useState(user?.profile?.city || '');

    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const newErrors: Record<string, boolean> = {};

        if (!fullName.trim()) newErrors.fullName = true;

        // Gmail validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!gmail.trim() || !emailRegex.test(gmail)) newErrors.gmail = true;

        // Phone validation (numeric and at least 10 digits)
        const phoneRegex = /^\d{10,}$/;
        if (!phoneNumber.trim() || !phoneRegex.test(phoneNumber.replace(/\D/g, ''))) newErrors.phoneNumber = true;

        if (!address.trim()) newErrors.address = true;
        if (!city.trim()) newErrors.city = true;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {
        if (!validate()) {
            Alert.alert('Error', 'Please correct the highlighted fields');
            return;
        }

        try {
            setLoading(true);
            if (user?.id) {
                await AuthService.updateProfile(user.id, {
                    full_name: fullName,
                    email: gmail,
                    phone: phoneNumber,
                    address: address,
                    country: country,
                    state: state,
                    postal_code: zipCode,
                    city: city
                });
            }
            navigation.navigate('CompanyDetails');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label: string, value: string, setValue: (v: string) => void, placeholder: string, errorKey: string, options: any = {}) => (
        <View className="mb-4">
            <Text className="text-sm font-bold text-gray-900 mb-1">{label}</Text>
            <View className={`flex-row items-center border ${errors[errorKey] ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 py-3 bg-white`}>
                <TextInput
                    className="flex-1 text-base text-gray-900"
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={(text) => {
                        setValue(text);
                        if (errors[errorKey]) {
                            setErrors(prev => ({ ...prev, [errorKey]: false }));
                        }
                    }}
                    {...options}
                />
                {errors[errorKey] && (
                    <AlertCircle size={20} color="#EF4444" />
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 80}
            >
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <ArrowLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View className="flex-row px-6 mb-6 gap-2">
                    <View style={{ backgroundColor: theme.primary }} className="h-1 flex-1 rounded-full" />
                    <View className="h-1 bg-gray-300 flex-1 rounded-full" />
                    <View className="h-1 bg-gray-300 flex-1 rounded-full" />
                    <View className="h-1 bg-gray-300 flex-1 rounded-full" />
                </View>

                <ScrollView className="px-6 flex-1" showsVerticalScrollIndicator={false}>
                    {renderInput('Your Name', fullName, setFullName, 'Enter Your Name', 'fullName')}
                    {renderInput('GMail', gmail, setGmail, 'yourmail@gmail.com', 'gmail', { keyboardType: 'email-address', autoCapitalize: 'none' })}
                    {renderInput('Phone Number', phoneNumber, setPhoneNumber, 'Enter Your Number', 'phoneNumber', { keyboardType: 'phone-pad', maxLength: 10 })}
                    {renderInput('Address', address, setAddress, 'Enter Your Address', 'address')}

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-gray-900 mb-1">Country</Text>
                            <View className="border border-gray-200 rounded-2xl px-4 py-3 bg-white shadow-sm">
                                <TextInput
                                    className="text-base text-gray-900"
                                    placeholder="Enter Country"
                                    placeholderTextColor="#9CA3AF"
                                    value={country}
                                    onChangeText={setCountry}
                                />
                            </View>
                        </View>
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-gray-900 mb-1">State</Text>
                            <View className={`flex-row items-center border border-gray-200 rounded-2xl px-4 py-3 bg-white shadow-sm`}>
                                <TextInput
                                    className="flex-1 text-base text-gray-900"
                                    placeholder="Enter State"
                                    placeholderTextColor="#9CA3AF"
                                    value={state}
                                    onChangeText={setState}
                                />
                            </View>
                        </View>
                    </View>

                    <View className="flex-row gap-4 mt-4 mb-6">
                        <View className="flex-1">
                            <Text className="text-sm font-bold text-gray-900 mb-1">ZIP Code</Text>
                            <View className="border border-gray-200 rounded-2xl px-4 py-3 bg-white shadow-sm">
                                <TextInput
                                    className="text-base text-gray-900"
                                    placeholder="Enter ZIP Code"
                                    placeholderTextColor="#9CA3AF"
                                    value={zipCode}
                                    onChangeText={setZipCode}
                                />
                            </View>
                        </View>
                        <View className="flex-1">
                            {renderInput('City', city, setCity, 'Enter City', 'city')}
                        </View>
                    </View>
                </ScrollView>

                <View className="p-6">
                    <TouchableOpacity
                        style={{ backgroundColor: theme.primary }}
                        className="w-full py-4 rounded-2xl items-center shadow-lg"
                        onPress={handleNext}
                        disabled={loading}
                    >
                        <Text className="text-white font-bold text-lg">
                            {loading ? 'Saving...' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
