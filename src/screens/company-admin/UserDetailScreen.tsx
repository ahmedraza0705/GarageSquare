// ============================================
// USER DETAIL SCREEN (Company Admin)
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RoleName, UserProfile } from '@/types';
import { AuthService } from '@/services/auth_v2.service';
import { supabase } from '@/lib/supabase';
import {
    Users,
    Mail,
    Phone,
    Shield,
    Check,
    Trash2,
    UserX,
    UserCheck
} from 'lucide-react-native';

const AVAILABLE_ROLES: { value: RoleName; label: string; color: string }[] = [
    { value: 'manager', label: 'Manager', color: '#2563EB' },
    { value: 'supervisor', label: 'Supervisor', color: '#7C3AED' },
    { value: 'technician_group_manager', label: 'Tech Lead', color: '#059669' },
    { value: 'technician', label: 'Technician', color: '#D97706' },
    { value: 'customer', label: 'Customer', color: '#4B5563' },
];

export default function UserDetailScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const route = useRoute();
    const { user: initialUser } = route.params as { user: UserProfile };

    const [user, setUser] = useState<UserProfile>(initialUser);
    const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        full_name: user.full_name || '',
        phone: user.phone || '',
        email: user.email,
        role: (user.role?.name as RoleName) || '',
        branch_id: user.branch_id || '',
    });

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        if (!supabase) return;
        try {
            const { data } = await supabase.from('branches').select('id, name').order('name');
            setBranches(data || []);
        } catch (error) {
            console.error('Error loading branches:', error);
        }
    };

    const handleSave = async () => {
        if (!form.full_name.trim() || !form.email.trim() || !form.role) {
            Alert.alert('Missing Fields', 'Name, Email, and Role are required.');
            return;
        }

        try {
            setSaving(true);
            await AuthService.updateUserProfile(user.id, {
                full_name: form.full_name,
                phone: form.phone,
                role: form.role as RoleName,
                branch_id: form.branch_id || null,
            });
            Alert.alert('Success', 'Profile updated successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async () => {
        const action = user.is_active ? 'deactivate' : 'reactivate';
        Alert.alert(
            `${action === 'deactivate' ? 'Deactivate' : 'Reactivate'} User`,
            `Are you sure?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: action === 'deactivate' ? 'Deactivate' : 'Reactivate',
                    style: action === 'deactivate' ? 'destructive' : 'default',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            if (action === 'deactivate') {
                                await AuthService.deactivateUser(user.id);
                            } else {
                                await AuthService.reactivateUser(user.id);
                            }
                            setUser({ ...user, is_active: !user.is_active });
                            Alert.alert('Success', `User ${action}d.`);
                        } catch (error: any) {
                            Alert.alert('Error', error.message || `Failed to ${action} user.`);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = async () => {
        Alert.alert('Delete User', 'This cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        setLoading(true);
                        await AuthService.deleteUser(user.id);
                        navigation.goBack();
                    } catch (error: any) {
                        Alert.alert('Error', error.message);
                    } finally {
                        setLoading(false);
                    }
                }
            }
        ]);
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1 px-6 py-6" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Full Name */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1.5">Full Name</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                        <Users size={20} color="#9CA3AF" />
                        <TextInput
                            value={form.full_name}
                            onChangeText={t => setForm({ ...form, full_name: t })}
                            placeholder="e.g. John Doe"
                            className="flex-1 ml-3 text-base text-gray-900"
                        />
                    </View>
                </View>

                {/* Email */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1.5">Email Address</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-100">
                        <Mail size={20} color="#9CA3AF" />
                        <TextInput
                            value={form.email}
                            editable={false}
                            className="flex-1 ml-3 text-base text-gray-500"
                        />
                    </View>
                </View>

                {/* Phone */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1.5">Phone (Optional)</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                        <Phone size={20} color="#9CA3AF" />
                        <TextInput
                            value={form.phone}
                            onChangeText={t => setForm({ ...form, phone: t })}
                            placeholder="+1 (555) 000-0000"
                            keyboardType="phone-pad"
                            className="flex-1 ml-3 text-base text-gray-900"
                        />
                    </View>
                </View>

                {/* Actions Section */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Account Actions</Text>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={handleToggleStatus}
                            className={`flex-1 py-3 rounded-xl items-center flex-row justify-center ${user.is_active ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}
                        >
                            {user.is_active ? <UserX size={18} color="#EF4444" /> : <UserCheck size={18} color="#10B981" />}
                            <Text className={`ml-2 font-semibold ${user.is_active ? 'text-red-600' : 'text-green-600'}`}>
                                {user.is_active ? 'Deactivate' : 'Reactivate'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    await AuthService.resetPassword(user.email);
                                    Alert.alert('Success', 'Password reset email sent');
                                } catch (e) {
                                    Alert.alert('Error', 'Failed to send reset email');
                                }
                            }}
                            className="flex-1 bg-blue-50 border border-blue-200 py-3 rounded-xl items-center flex-row justify-center"
                        >
                            <Shield size={18} color="#2563EB" />
                            <Text className="ml-2 font-semibold text-blue-600">Reset Pass</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Role Selection */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Role</Text>
                    <View className="flex-row flex-wrap">
                        {AVAILABLE_ROLES.map(role => {
                            const isSelected = form.role === role.value;
                            return (
                                <TouchableOpacity
                                    key={role.value}
                                    onPress={() => setForm({ ...form, role: role.value })}
                                    className="mr-2 mb-2 px-4 py-2 rounded-full border"
                                    style={{
                                        backgroundColor: isSelected ? role.color : 'white',
                                        borderColor: isSelected ? role.color : '#E5E7EB'
                                    }}
                                >
                                    <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                        {role.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Branch Selection */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-2">Assign Branch</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <TouchableOpacity
                            onPress={() => setForm({ ...form, branch_id: '' })}
                            className={`mr-2 px-4 py-3 rounded-xl border ${!form.branch_id ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={!form.branch_id ? 'text-white font-medium' : 'text-gray-600 font-medium'}>
                                No Branch
                            </Text>
                        </TouchableOpacity>
                        {branches.map(branch => (
                            <TouchableOpacity
                                key={branch.id}
                                onPress={() => setForm({ ...form, branch_id: branch.id })}
                                className={`mr-2 px-4 py-3 rounded-xl border ${form.branch_id === branch.id ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={form.branch_id === branch.id ? 'text-white font-medium' : 'text-gray-600 font-medium'}>
                                    {branch.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Footer Actions */}
            <View
                className="p-6 border-t border-gray-100 bg-white flex-row gap-3"
                style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            >
                <TouchableOpacity
                    onPress={handleDelete}
                    className="w-14 h-14 bg-red-50 rounded-xl items-center justify-center border border-red-100"
                >
                    <Trash2 size={24} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`flex-1 py-4 rounded-xl items-center flex-row justify-center ${saving ? 'bg-blue-400' : 'bg-blue-600'}`}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Check size={20} color="white" />
                            <Text className="text-white font-bold text-lg ml-2">Save Changes</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
