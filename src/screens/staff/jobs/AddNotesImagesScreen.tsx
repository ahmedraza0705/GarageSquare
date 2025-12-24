// ============================================
// ADD NOTES & IMAGES SCREEN
// ============================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AddNotesImagesScreen() {
    const navigation = useNavigation();
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState<any[]>([]);

    const handleAddImage = () => {
        // In a real app, this would open the image picker
        const newImage = {
            id: Date.now(),
            uri: 'https://via.placeholder.com/150', // Mock image
            timestamp: new Date().toLocaleTimeString()
        };
        setImages([...images, newImage]);
        Alert.alert('Image Added', 'Mock image added successfully');
    };

    const handleSave = () => {
        if (!notes && images.length === 0) {
            Alert.alert('Empty', 'Please add some notes or images before saving.');
            return;
        }
        Alert.alert('Saved', 'Notes and images attached to job card.');
        navigation.goBack();
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white px-4 py-4 border-b border-gray-200 flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                        <Image source={require('../../../assets/Arrow.png')} className="w-6 h-6 tint-gray-900" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Notes & Evidence</Text>
                </View>
                <TouchableOpacity onPress={handleSave}>
                    <Text className="text-blue-600 font-bold text-lg">Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-6">

                {/* Text Notes Section */}
                <View className="mb-6">
                    <Text className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Work Remarks</Text>
                    <View className="bg-white p-4 rounded-xl border border-gray-200 h-40">
                        <TextInput
                            className="flex-1 text-base text-gray-900 align-top"
                            placeholder="Type your detailed observations, repairs done, or issues found..."
                            multiline
                            textAlignVertical="top"
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>
                </View>

                {/* Images Section */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-sm font-bold text-gray-700 uppercase tracking-wide">Photo Evidence ({images.length})</Text>
                        <TouchableOpacity onPress={handleAddImage} className="bg-blue-50 px-3 py-1 rounded-full">
                            <Text className="text-blue-700 font-semibold text-xs">+ Add Photo</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row flex-wrap">
                        <TouchableOpacity
                            onPress={handleAddImage}
                            className="w-[31%] aspect-square bg-gray-200 rounded-xl mr-[2%] mb-2 justify-center items-center border-2 border-dashed border-gray-300"
                        >
                            <Text className="text-3xl text-gray-400">+</Text>
                        </TouchableOpacity>

                        {images.map((img, index) => (
                            <View key={img.id} className="w-[31%] aspect-square bg-gray-300 rounded-xl mr-[2%] mb-2 relative overflow-hidden">
                                <Image source={{ uri: img.uri }} className="w-full h-full" resizeMode="cover" />
                                <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                                    <Text className="text-white text-[10px] text-center">{img.timestamp}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
