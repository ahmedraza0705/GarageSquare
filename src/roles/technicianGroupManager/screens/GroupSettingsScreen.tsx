import React from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function GroupSettingsScreen() {
    const navigation = useNavigation();

    const Section = ({ title, children }: any) => (
        <View className="mb-6">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">{title}</Text>
            <View className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {children}
            </View>
        </View>
    );

    const SettingItem = ({ label, icon, value, type = 'toggle', isLast }: any) => (
        <View className={`flex-row items-center justify-between p-4 ${!isLast ? 'border-b border-slate-100' : ''}`}>
            <View className="flex-row items-center">
                <Ionicons name={icon} size={20} color="#64748b" style={{ marginRight: 12 }} />
                <Text className="text-slate-700 font-medium">{label}</Text>
            </View>
            {type === 'toggle' ? (
                <Switch value={value} trackColor={{ false: "#e2e8f0", true: "#3b82f6" }} />
            ) : (
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-[#f8fafc]">
            <View className="bg-white px-5 pt-12 pb-4 border-b border-slate-200 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-slate-900">Group Settings</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Section title="General">
                    <SettingItem label="Group Name" icon="people-outline" type="link" />
                    <SettingItem label="Shift Timing" icon="time-outline" type="link" isLast />
                </Section>

                <Section title="Automation">
                    <SettingItem label="Auto-Assign New Jobs" icon="flash-outline" value={true} />
                    <SettingItem label="Load Balancing" icon="git-network-outline" value={true} isLast />
                </Section>

                <Section title="Notifications">
                    <SettingItem label="Job Overdue Alerts" icon="alert-circle-outline" value={true} />
                    <SettingItem label="Completion Reports" icon="document-text-outline" value={false} isLast />
                </Section>

                <TouchableOpacity className="bg-red-50 p-4 rounded-xl items-center border border-red-100 mt-4">
                    <Text className="text-red-600 font-bold">Sign Out of Group Manager</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
