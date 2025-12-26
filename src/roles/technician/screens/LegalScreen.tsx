import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function LegalScreen() {
    const navigation = useNavigation();
    const route: any = useRoute();
    const { title, contentType } = route.params || { title: 'Legal', contentType: 'terms' };

    const getContent = () => {
        if (contentType === 'terms') {
            return (
                <Text className="text-slate-600 leading-6">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    {'\n\n'}
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </Text>
            );
        } else if (contentType === 'privacy') {
            return (
                <Text className="text-slate-600 leading-6">
                    Your privacy is important to us. It is GarageSquare's policy to respect your privacy regarding any information we may collect from you across our website.
                    {'\n\n'}
                    We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent.
                </Text>
            );
        }
        return <Text className="text-slate-600">No content available.</Text>;
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">{title}</Text>
            </View>

            <ScrollView className="flex-1 p-5">
                {getContent()}
            </ScrollView>
        </SafeAreaView>
    );
}
