import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Branch } from '@/types';

export default function BranchFileUploadScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { branchData } = route.params as { branchData: any };
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

    const handleFinish = () => {
        // Construct final branch object
        const newBranch: Branch = {
            id: Date.now().toString(),
            name: branchData.name,
            address: branchData.address,
            manager_id: branchData.manager_id,
            phone: branchData.phone,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            email: branchData.email
        };

        // Navigate back to Branches with new data
        // @ts-ignore
        navigation.navigate('Main', {
            screen: 'MainTabs',
            params: {
                screen: 'BranchesTab',
                params: { newBranch }
            }
        });
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
                >
                    <Text className="text-black font-bold text-lg">Finish Setup</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}
