import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, StatusBar, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';

const InputField = ({ label, value, onChangeText, icon, placeholder, keyboardType = 'default', editable = true }: any) => (
    <View className="mb-5 last:mb-0">
        <Text className="text-slate-500 text-xs font-bold mb-2 uppercase tracking-wider ml-1">{label}</Text>
        <View className={`flex-row items-center border rounded-xl px-4 py-3.5 shadow-sm ${editable ? 'bg-slate-50 border-slate-200 focus:border-blue-500' : 'bg-slate-100 border-slate-200'}`}>
            <Feather name={icon} size={18} color={editable ? "#64748b" : "#94a3b8"} style={{ marginRight: 12 }} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                className={`flex-1 font-semibold text-[15px] ${editable ? 'text-slate-900' : 'text-slate-500'}`}
                keyboardType={keyboardType}
                editable={editable}
            />
            {!editable && <Feather name="lock" size={14} color="#94a3b8" />}
        </View>
    </View>
);

export default function EditProfileScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const route = useRoute();

    // Animation
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // Safe access to phone property
    const userPhone = (user as any)?.phone || '+91 98765 43210';
    const initialParams = (route.params as any)?.profileData || {};

    const [firstName, setFirstName] = useState(
        initialParams.firstName || user?.profile?.full_name?.split(' ')[0] || ''
    );
    const [lastName, setLastName] = useState(
        initialParams.lastName || user?.profile?.full_name?.split(' ').slice(1).join(' ') || ''
    );
    const [role, setRole] = useState(initialParams.role || user?.profile?.role || 'Technician');
    const [email, setEmail] = useState(initialParams.email || user?.email || '');
    const [phone, setPhone] = useState(userPhone);
    const [image, setImage] = useState<string | null>(initialParams.image || null);

    // Address fields
    const [address, setAddress] = useState(initialParams.address || '123 Garage St.');
    const [city, setCity] = useState(initialParams.city || 'Ahmedabad');
    const [stateVal, setStateVal] = useState(initialParams.stateVal || 'Gujarat');
    const [country, setCountry] = useState(initialParams.country || 'India');

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSave = () => {
        Alert.alert("Success", "Profile updated successfully!", [
            {
                text: "OK",
                onPress: () => {
                    navigation.navigate('ProfileMain', {
                        updatedProfile: {
                            firstName,
                            lastName,
                            email,
                            phone,
                            image,
                            address,
                            city,
                            stateVal,
                            country
                        }
                    } as any);
                }
            }
        ]);
    };

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <SafeAreaView edges={['top']} className="bg-white z-10 shadow-sm border-b border-slate-100/50">
                <View className="h-14 px-4 flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full active:bg-slate-50">
                        <Ionicons name="arrow-back" size={24} color="#0f172a" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-800 tracking-tight">Edit Profile</Text>
                    <TouchableOpacity onPress={handleSave} className="bg-blue-600 px-4 py-1.5 rounded-full shadow-sm active:bg-blue-700">
                        <Text className="text-white font-bold text-sm">Save</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="p-5 pb-10">

                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        {/* Avatar Section */}
                        <View className="items-center mb-8">
                            <View className="relative">
                                <View className="w-28 h-28 rounded-full bg-slate-100 items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                                    {image ? (
                                        <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                                    ) : (
                                        <Text className="text-4xl font-bold text-slate-300">
                                            {firstName?.[0]?.toUpperCase() || 'A'}
                                        </Text>
                                    )}
                                </View>
                                <TouchableOpacity
                                    onPress={pickImage}
                                    className="absolute bottom-0 right-0 bg-blue-600 w-9 h-9 rounded-full items-center justify-center border-[3px] border-white shadow-md active:bg-blue-700"
                                >
                                    <Feather name="camera" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                            <View className="mt-3 items-center">
                                <Text className="text-xl font-bold text-slate-900">{firstName} {lastName}</Text>
                                <Text className="text-slate-500 font-medium text-sm mt-0.5">{role}</Text>
                            </View>
                        </View>

                        {/* Personal Details Card */}
                        <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-5">
                            <Text className="text-slate-900 font-bold text-base mb-5 flex-row items-center">
                                Personal Details
                            </Text>
                            <InputField label="First Name" value={firstName} onChangeText={setFirstName} icon="user" placeholder="Enter first name" />
                            <InputField label="Last Name" value={lastName} onChangeText={setLastName} icon="user" placeholder="Enter last name" />
                            <InputField label="Role" value={role} icon="shield" editable={false} />
                        </View>

                        {/* Contact Info Card */}
                        <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-5">
                            <Text className="text-slate-900 font-bold text-base mb-5">Contact Info</Text>
                            <InputField label="Email Address" value={email} onChangeText={setEmail} icon="mail" placeholder="Enter email" keyboardType="email-address" />
                            <InputField label="Phone Number" value={phone} onChangeText={setPhone} icon="phone" placeholder="Enter phone" keyboardType="phone-pad" />
                        </View>

                        {/* Address Card */}
                        <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-5">
                            <Text className="text-slate-900 font-bold text-base mb-5">Address</Text>
                            <InputField label="Street Address" value={address} onChangeText={setAddress} icon="map-pin" placeholder="Enter address" />
                            <View className="flex-row gap-3 mt-4">
                                <View className="flex-1">
                                    <InputField label="City" value={city} onChangeText={setCity} icon="home" placeholder="City" />
                                </View>
                                <View className="flex-1">
                                    <InputField label="State" value={stateVal} onChangeText={setStateVal} icon="map" placeholder="State" />
                                </View>
                            </View>
                            <View className="mt-4">
                                <InputField label="Country" value={country} onChangeText={setCountry} icon="globe" placeholder="Country" />
                            </View>
                        </View>

                        {/* Delete Account Button */}
                        <TouchableOpacity className="mt-2 mb-8 bg-red-50 p-4 rounded-xl border border-red-100 items-center active:bg-red-100">
                            <Text className="text-red-600 font-bold">Delete Account</Text>
                        </TouchableOpacity>
                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
