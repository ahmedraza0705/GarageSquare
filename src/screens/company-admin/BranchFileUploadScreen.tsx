import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BranchService } from '@/services/branch.service';
import { Branch } from '@/types';
import { ActivityIndicator } from 'react-native';
import { AuthService } from '@/services/auth.service';

export default function BranchFileUploadScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { theme } = useTheme();
    const { branchData } = route.params as { branchData: any };
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploads, setUploads] = useState({
        customers: false,
        users: false,
        inventory: false
    });

    const handleUpload = (type: 'customers' | 'users' | 'inventory') => {
        // Simulate upload
        setUploads(prev => ({ ...prev, [type]: true }));
        Alert.alert('Success', 'File uploaded successfully');
    };

    const handleFinish = async () => {
        try {
            setIsSubmitting(true);

            // Construct branch object for Supabase
            // Note: DB generates id, created_at, updated_at
            const newBranchData = {
                name: branchData.name,
                address: branchData.address,
                manager_id: undefined,
                phone: branchData.phone,
                is_active: true,
                email: branchData.email,
                company_id: branchData.company_id
            };

            // Save to Supabase
            const createdBranch = await BranchService.createBranch(newBranchData);


            // 2. Update Manager Profile if needed (to associate them with this branch)
            if (branchData.manager_id && branchData.manager_id.includes('-')) { // Assuming it's a UUID
                try {
                    await AuthService.updateProfile(branchData.manager_id, {
                        branch_id: createdBranch.id
                    });
                    // Update createdBranch object for navigation
                    createdBranch.manager_id = branchData.manager_id;
                } catch (updateError) {
                    console.error('Error updating manager branch association:', updateError);
                }
            }

            // Navigate back to Branches with new data
            // @ts-ignore
            navigation.navigate('Main', {
                screen: 'MainTabs',
                params: {
                    screen: 'BranchesTab',
                    params: { newBranch: createdBranch }
                }
            });
        } catch (error) {
            console.error('Error creating branch:', error);
            Alert.alert('Error', 'Failed to create branch. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const UploadSection = ({ title, subtitle, type, isUploaded }: any) => (
        <View className="mb-6">
            <Text className="text-gray-900 font-bold mb-2">{title}</Text>
            <View className={`border-2 border-dashed ${isUploaded ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'} rounded-xl p-6 items-center justify-center`}>
                {isUploaded ? (
                    <View className="items-center">
                        <Text className="text-green-600 mb-2">File Uploaded</Text>
                        <View className="flex-row items-center">
                            <Ionicons name="document-text" size={20} color="#166534" />
                            <Text className="text-gray-600 ml-2">data.csv</Text>
                        </View>
                    </View>
                ) : (
                    <>
                        <Text className="text-gray-500 mb-4">{subtitle}</Text>
                        <TouchableOpacity
                            style={{ backgroundColor: theme.tabIconBg }}
                            className="px-6 py-2 rounded-lg flex-row items-center"
                            onPress={() => handleUpload(type)}
                        >
                            <Ionicons name="cloud-upload-outline" size={20} color={theme.primary} />
                            <Text style={{ color: theme.primary }} className="font-bold ml-2">Upload</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View style={{ borderBottomColor: theme.border }} className="px-4 py-3 border-b">
                <Text style={{ color: theme.text }} className="text-lg font-bold">Branch Setup</Text>
            </View>

            <ScrollView className="flex-1 px-5 pt-6">

                <UploadSection
                    title="Branch Customers"
                    subtitle="Input customer details (Optional)"
                    type="customers"
                    isUploaded={uploads.customers}
                />

                <UploadSection
                    title="Branch Users"
                    subtitle="User customer details (Optional)"
                    type="users"
                    isUploaded={uploads.users}
                />

                <UploadSection
                    title="Branch Inventory"
                    subtitle="Inventory customer details (Optional)"
                    type="inventory"
                    isUploaded={uploads.inventory}
                />

            </ScrollView>

            <View className="p-5 border-t border-gray-100">
                <TouchableOpacity
                    style={{
                        backgroundColor: '#35c56a71',
                        borderWidth: 1,
                        borderColor: '#35C56A',
                        borderRadius: 12,
                        paddingVertical: 16,
                        alignItems: 'center'
                    }}
                    onPress={handleFinish}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <Text className="text-black font-bold text-lg">Finish Setup</Text>
                    )}
                </TouchableOpacity>
            </View>

        </View>
    );
}
