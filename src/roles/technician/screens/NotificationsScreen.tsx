import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function NotificationsScreen() {
    const navigation = useNavigation();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);
    const [smsEnabled, setSmsEnabled] = useState(true);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-4 py-3 border-b border-slate-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Notifications</Text>
            </View>

            <ScrollView className="flex-1 p-5">
                <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
                    <View>
                        <Text className="text-lg font-semibold text-slate-900">Push Notifications</Text>
                        <Text className="text-slate-500 text-sm">Receive alerts on your device</Text>
                    </View>
                    <Switch
                        value={pushEnabled}
                        onValueChange={setPushEnabled}
                        trackColor={{ false: '#e2e8f0', true: '#4682b4' }}
                        thumbColor={pushEnabled ? '#fff' : '#fff'}
                    />
                </View>

                <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
                    <View>
                        <Text className="text-lg font-semibold text-slate-900">Email Notifications</Text>
                        <Text className="text-slate-500 text-sm">Receive updates via email</Text>
                    </View>
                    <Switch
                        value={emailEnabled}
                        onValueChange={setEmailEnabled}
                        trackColor={{ false: '#e2e8f0', true: '#4682b4' }}
                        thumbColor={emailEnabled ? '#fff' : '#fff'}
                    />
                </View>

                <View className="flex-row justify-between items-center py-4 border-b border-slate-100">
                    <View>
                        <Text className="text-lg font-semibold text-slate-900">SMS Notifications</Text>
                        <Text className="text-slate-500 text-sm">Receive urgent updates via SMS</Text>
                    </View>
                    <Switch
                        value={smsEnabled}
                        onValueChange={setSmsEnabled}
                        trackColor={{ false: '#e2e8f0', true: '#4682b4' }}
                        thumbColor={smsEnabled ? '#fff' : '#fff'}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
