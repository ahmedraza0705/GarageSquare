import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { ArrowLeft, Upload, Check } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { CompanyService } from '@/services/company.service';
// import * as DocumentPicker from 'expo-document-picker'; 

// Mock DocumentPicker for now to avoid dependency issues
const DocumentPicker = {
    getDocumentAsync: async (_options: any) => {
        // Simulate success
        return { canceled: false, assets: [{ name: 'mock_file.csv' }] };
    }
};

// Helper component for upload section
const UploadSection = ({ title, files, onUpload, uploaded }: { title: string, files: string[], onUpload: () => void, uploaded: boolean }) => (
    <View className="bg-white border border-dashed border-green-300 rounded-xl p-6 mb-6">
        <Text className="text-lg font-bold text-gray-900 mb-4">{title}</Text>

        {files.length > 0 ? (
            <View className="mb-4">
                {files.map((file, idx) => (
                    <Text key={idx} className="text-gray-600 mb-1">{file}</Text>
                ))}
            </View>
        ) : (
            <Text className="text-gray-400 text-center mb-4">No files uploaded</Text>
        )}

        <View className="items-center">
            {uploaded ? (
                <View className="flex-row items-center justify-center bg-green-100 px-4 py-2 rounded-lg">
                    <Check size={18} color="#16A34A" />
                    <Text className="text-green-600 font-medium ml-2">Uploaded</Text>
                </View>
            ) : (
                <TouchableOpacity
                    className="flex-row items-center bg-blue-100 px-6 py-2 rounded-lg"
                    onPress={onUpload}
                >
                    <Upload size={18} color="#2563EB" />
                    <Text className="text-blue-600 font-medium ml-2">Upload</Text>
                </TouchableOpacity>
            )}
        </View>
    </View>
);

export default function DataUploadScreen() {
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Mock states for uploads
    const [customerFiles, setCustomerFiles] = useState<string[]>([]);
    const [userFiles, setUserFiles] = useState<string[]>([]);
    const [inventoryFiles, setInventoryFiles] = useState<string[]>([]);

    const handleUpload = async (type: 'customers' | 'users' | 'inventory') => {
        try {
            // Mock file picker or simplified version
            // In a real app we'd use DocumentPicker.getDocumentAsync({ type: '*/*' });
            const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const fileName = result.assets[0].name;

                if (type === 'customers') setCustomerFiles([...customerFiles, fileName]);
                else if (type === 'users') setUserFiles([...userFiles, fileName]);
                else if (type === 'inventory') setInventoryFiles([...inventoryFiles, fileName]);
            }
        } catch (err) {
            console.log('Document picker error or cancelled', err);
            // Fallback for demo if package not installed or fails
            const mockName = `${type}_data.csv`;
            if (type === 'customers') setCustomerFiles([...customerFiles, mockName]);
            else if (type === 'users') setUserFiles([...userFiles, mockName]);
            else if (type === 'inventory') setInventoryFiles([...inventoryFiles, mockName]);
        }
    };

    const handleFinish = async () => {
        if (!user?.profile?.company_id) {
            Alert.alert('Error', 'No company associated with this user.');
            return;
        }

        try {
            setLoading(true);
            // 1. (Optional) Process files here

            // 2. Mark onboarding as completed
            await CompanyService.updateCompany(user.profile.company_id, {
                onboarding_completed: true
            });

            // 3. Navigate to Dashboard
            navigation.reset({
                index: 0,
                routes: [{ name: 'App' }],
            });

        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            <View className="px-6 py-4 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ArrowLeft size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Import Data</Text>
            </View>

            {/* Progress Bar */}
            <View className="flex-row px-6 mb-8 gap-2">
                <View className="h-1 bg-green-500 flex-1 rounded-full" />
                <View className="h-1 bg-green-500 flex-1 rounded-full" />
                <View className="h-1 bg-green-500 flex-1 rounded-full" />
                <View className="h-1 bg-green-500 flex-1 rounded-full" />
            </View>

            <ScrollView className="px-6 flex-1">
                <Text className="text-gray-500 mb-6">
                    Upload your existing data to get started quickly. You can also do this later.
                </Text>

                <UploadSection
                    title="Customers"
                    files={customerFiles}
                    onUpload={() => handleUpload('customers')}
                    uploaded={customerFiles.length > 0}
                />

                <UploadSection
                    title="Users"
                    files={userFiles}
                    onUpload={() => handleUpload('users')}
                    uploaded={userFiles.length > 0}
                />

                <UploadSection
                    title="Inventory"
                    files={inventoryFiles}
                    onUpload={() => handleUpload('inventory')}
                    uploaded={inventoryFiles.length > 0}
                />

            </ScrollView>

            <View className="p-6">
                <TouchableOpacity
                    className="w-full bg-green-600 py-4 rounded-xl items-center shadow-sm"
                    onPress={handleFinish}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-semibold text-lg">Finish Setup</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
