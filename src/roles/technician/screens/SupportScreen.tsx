import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function SupportScreen() {
    const navigation = useNavigation();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Help & Support</Text>
            </View>

            <ScrollView className="flex-1 p-5">
                <Text className="text-base text-slate-600 mb-6 leading-6">
                    Need help? Our support team is available 24/7 to assist you.
                </Text>

                <TouchableOpacity
                    onPress={() => Linking.openURL('tel:+1234567890')}
                    className="flex-row items-center bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200"
                >
                    <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
                        <Ionicons name="call" size={20} color="#3b82f6" />
                    </View>
                    <View>
                        <Text className="text-lg font-bold text-slate-900">Call Us</Text>
                        <Text className="text-slate-500">+1 (234) 567-890</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => Linking.openURL('mailto:support@garagesquare.com')}
                    className="flex-row items-center bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200"
                >
                    <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-4">
                        <Ionicons name="mail" size={20} color="#22c55e" />
                    </View>
                    <View>
                        <Text className="text-lg font-bold text-slate-900">Email Us</Text>
                        <Text className="text-slate-500">support@garagesquare.com</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
