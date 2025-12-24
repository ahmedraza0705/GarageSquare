// ============================================
// JOB SUBMISSION SCREEN
// ============================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function JobSubmissionScreen() {
    const navigation = useNavigation();
    const [checklist, setChecklist] = useState([
        { id: 1, label: 'All service tasks completed and marked?', checked: false },
        { id: 2, label: 'Inspection checklist filled and passed?', checked: false },
        { id: 3, label: 'Parts usage recorded correctly?', checked: false },
        { id: 4, label: 'Work notes and evidence photos added?', checked: false },
        { id: 5, label: 'Vehicle cleaned and ready for delivery?', checked: false }
    ]);

    const toggleCheck = (id: number) => {
        setChecklist(checklist.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    const isReadyToSubmit = checklist.every(item => item.checked);

    const handleSubmit = () => {
        if (!isReadyToSubmit) {
            Alert.alert('Incomplete', 'Please confirm all checklist items before submitting.');
            return;
        }

        Alert.alert(
            'Confirm Submission',
            'Are you sure you want to mark this job as completed? The supervisor will be notified for final approval.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Submit Job',
                    style: 'default',
                    onPress: () => {
                        // Navigate back to Dashboard or Jobs list
                        navigation.navigate('TechnicianDashboard' as never);
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-white">
            <View className="px-4 py-4 border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Image source={require('../../assets/Arrow.png')} className="w-6 h-6 tint-gray-900" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">Final Submission</Text>
                    <Text className="text-gray-500 text-xs">Job #JOB-2023-001</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                <View className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                    <Text className="text-blue-800 text-sm font-semibold text-center">
                        Great job! You are about to complete this service. Please review the checklist below to ensure everything appears correct.
                    </Text>
                </View>

                <Text className="text-lg font-bold text-gray-900 mb-4">Submission Checklist</Text>

                {checklist.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        className="flex-row items-center mb-4"
                        onPress={() => toggleCheck(item.id)}
                    >
                        <View className={`w-6 h-6 rounded border-2 mr-3 justify-center items-center ${item.checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                            {item.checked && <Text className="text-white text-xs font-bold">✓</Text>}
                        </View>
                        <Text className={`flex-1 text-base ${item.checked ? 'text-gray-900' : 'text-gray-600'}`}>{item.label}</Text>
                    </TouchableOpacity>
                ))}

                <View className="mt-10">
                    <TouchableOpacity
                        className={`py-4 rounded-xl shadow-sm ${isReadyToSubmit ? 'bg-green-600' : 'bg-gray-300'}`}
                        onPress={handleSubmit}
                        disabled={!isReadyToSubmit}
                    >
                        <Text className="text-white text-center font-bold text-lg">Submit Job for Approval</Text>
                    </TouchableOpacity>
                    {!isReadyToSubmit && (
                        <Text className="text-center text-gray-400 text-xs mt-3">
                            Complete all checklist items to enable submission
                        </Text>
                    )}
                </View>

            </ScrollView>
        </View>
    );
}
