import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }
        // TODO: Implement actual password change logic here
        Alert.alert('Success', 'Password changed successfully');
        navigation.goBack();
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Change Password</Text>
            </View>

            <ScrollView className="flex-1 p-5">
                <View className="mb-4">
                    <Text className="text-slate-600 font-medium mb-2">Current Password</Text>
                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900"
                        secureTextEntry
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        placeholder="Enter current password"
                    />
                </View>

                <View className="mb-4">
                    <Text className="text-slate-600 font-medium mb-2">New Password</Text>
                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password"
                    />
                </View>

                <View className="mb-8">
                    <Text className="text-slate-600 font-medium mb-2">Confirm New Password</Text>
                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="Confirm new password"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleChangePassword}
                    className="bg-[#4682b4] p-4 rounded-xl items-center shadow-sm active:bg-[#3a6d96]"
                >
                    <Text className="text-white font-bold text-lg">Update Password</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
