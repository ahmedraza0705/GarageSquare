// ============================================
// ADD USER SCREEN (Company Admin)
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { RoleName } from '@/types';
import { AuthService } from '@/services/auth_v2.service';
import { CompanyService } from '@/services/company.service';
import { supabase } from '@/lib/supabase';
import {
    Users,
    Mail,
    Phone,
    Shield,
    Check,
    ChevronLeft,
    UserCircle
} from 'lucide-react-native';

const AVAILABLE_ROLES: { value: RoleName; label: string; color: string }[] = [
    { value: 'manager', label: 'Manager', color: '#2563EB' },
    { value: 'supervisor', label: 'Supervisor', color: '#7C3AED' },
    { value: 'technician_group_manager', label: 'Tech Lead', color: '#059669' },
    { value: 'technician', label: 'Technician', color: '#D97706' },
    { value: 'customer', label: 'Customer', color: '#4B5563' },
];

export default function AddUserScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
    const [loadingBranches, setLoadingBranches] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        full_name: '',
        username: '',
        phone: '',
        email: '',
        password: '',
        role: '' as RoleName | '',
        branch_id: '',
    });

    const { user } = useAuth();

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
        } finally {
            setLoadingBranches(false);
        }
    };

    const handleSave = async () => {
        // Validate required fields
        if (!form.full_name.trim()) {
            Alert.alert('Missing Fields', 'Name is required.');
            return;
        }

        if (!form.email.trim()) {
            Alert.alert('Missing Fields', 'Email is required.');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(form.email.trim())) {
            Alert.alert('Invalid Email', 'Please enter a valid email address (e.g., user@example.com)');
            return;
        }

        if (!form.role) {
            Alert.alert('Missing Fields', 'Role is required.');
            return;
        }

        if (!form.password) {
            Alert.alert('Missing Password', 'Password is required for new users.');
            return;
        }

        if (form.password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
            return;
        }

        let companyId = user?.profile?.company_id;

        // AUTOMATIC LINKING: If no company_id, use user.id as company_id
        if (!companyId && user?.id) {
            try {
                setSaving(true);
                console.log('No company_id found for admin, auto-linking with user.id:', user.id);

                // 1. Create/Upsert company with User ID
                const newCompany = await CompanyService.createCompany(
                    `${user.profile?.full_name || 'My'}'s Company`,
                    user.id
                );

                if (newCompany) {
                    companyId = newCompany.id;

                    // 2. Update admin profile to include this company_id
                    await AuthService.updateProfile(user.id, {
                        company_id: companyId
                    });

                    console.log('Auto-linking successful. Company ID:', companyId);
                }
            } catch (err) {
                console.error('Auto-linking failed:', err);
                Alert.alert('Linking Error', 'Failed to automatically link your account to a company.');
                setSaving(false);
                return;
            }
        }

        if (!companyId) {
            Alert.alert('Error', 'Your account is not linked to a company. Please contact support.');
            return;
        }

        try {
            setSaving(true);
            console.log('[AddUserScreen] Starting user creation with data:', {
                email: form.email,
                full_name: form.full_name,
                role: form.role,
                branch_id: form.branch_id,
                company_id: companyId,
            });

            const result = await AuthService.createUserWithProfile({
                email: form.email,
                password: form.password,
                full_name: form.full_name,
                username: form.username || undefined,
                phone: form.phone,
                role: form.role as RoleName,
                branch_id: form.branch_id || undefined,
                company_id: companyId,
            });

            console.log('[AddUserScreen] ✅ User creation successful. Result:', result);

            Alert.alert('Success', 'User created successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (err: any) {
            console.error('[AddUserScreen] ❌ Error creating user:', err);
            console.error('[AddUserScreen] Error details:', {
                message: err.message,
                code: err.code,
                status: err.status,
                details: err.details,
            });

            // Provide user-friendly error messages
            let errorMessage = 'Failed to create user.';
            if (err.message?.includes('already registered') || err.message?.includes('already exists')) {
                errorMessage = 'This email address is already registered. Please use a different email.';
            } else if (err.message?.includes('Invalid email')) {
                errorMessage = 'Please enter a valid email address.';
            } else if (err.message?.includes('Password')) {
                errorMessage = 'Password must be at least 6 characters long.';
            } else if (err.message) {
                errorMessage = err.message;
            }

            Alert.alert('Error', errorMessage);
        } finally {
            setSaving(false);
        }
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
                            onChangeText={t => {
                                const updates: any = { full_name: t };
                                if (!form.username) {
                                    updates.username = t.toLowerCase().replace(/\s+/g, '.');
                                }
                                setForm({ ...form, ...updates });
                            }}
                            placeholder="e.g. John Doe"
                            className="flex-1 ml-3 text-base text-gray-900"
                        />
                    </View>
                </View>

                {/* Username */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1.5">Username</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                        <UserCircle size={20} color="#9CA3AF" />
                        <TextInput
                            value={form.username}
                            onChangeText={t => setForm({ ...form, username: t.toLowerCase() })}
                            placeholder="e.g. john.doe"
                            className="flex-1 ml-3 text-base text-gray-900"
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Email */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-700 mb-1.5">Email Address</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                        <Mail size={20} color="#9CA3AF" />
                        <TextInput
                            value={form.email}
                            onChangeText={t => setForm({ ...form, email: t.toLowerCase() })}
                            placeholder="john@company.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="flex-1 ml-3 text-base text-gray-900"
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

                {/* Password */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-700 mb-1.5">Temporary Password</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                        <Shield size={20} color="#9CA3AF" />
                        <TextInput
                            value={form.password}
                            onChangeText={t => setForm({ ...form, password: t })}
                            placeholder="Create a secure password"
                            secureTextEntry
                            className="flex-1 ml-3 text-base text-gray-900"
                        />
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
                className="p-6 border-t border-gray-100 bg-white"
                style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            >
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`w-full py-4 rounded-xl items-center flex-row justify-center ${saving ? 'bg-blue-400' : 'bg-blue-600'}`}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <>
                            <Check size={20} color="white" />
                            <Text className="text-white font-bold text-lg ml-2">Create User</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
