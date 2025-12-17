import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { branchService } from '@/services/branchService';
import { Branch } from '@/types';
import { ActivityIndicator } from 'react-native';

export default function BranchFileUploadScreen() {
    const navigation = useNavigation();
    const route = useRoute();
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
                // TODO: Manager ID should ideally refer to a valid user profile UUID
                // For now, we are passing the name from the form, which might need adjustment 
                // depending on your database constraints (if manager_id is UUID foreign key).
                // If it fails, set to null or handle appropriately.
                // manager_id: branchData.manager_id, 
                // TEMPORARY FIX: If manager_id is just a name, don't send it if schema expects UUID
                // or ensure your schema allows text or you have a valid UUID.
                // Assuming for now we skip manager_id if it's just a name to avoid UUID error
                manager_id: undefined,
                phone: branchData.phone,
                is_active: true,
                email: branchData.email
            };

            // Save to Supabase
            const createdBranch = await branchService.createBranch(newBranchData);

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
                            className="bg-blue-50 px-6 py-2 rounded-lg flex-row items-center"
                            onPress={() => handleUpload(type)}
                        >
                            <Ionicons name="cloud-upload-outline" size={20} color="#3B82F6" />
                            <Text className="text-blue-500 font-bold ml-2">Upload</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-3 border-b border-gray-100">
                <Text className="text-lg font-bold">Branch Setup</Text>
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

        </SafeAreaView>
    );
}
