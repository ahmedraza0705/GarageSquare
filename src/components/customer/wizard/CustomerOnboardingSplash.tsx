import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import Button from '@/components/shared/Button';

interface CustomerOnboardingSplashProps {
    onNext: () => void;
}

export default function CustomerOnboardingSplash({ onNext }: CustomerOnboardingSplashProps) {
    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Illustration */}
                <View className="items-center mt-12 mb-8">
                    <View className="w-64 h-64 items-center justify-center mb-6">
                        <Image
                            source={require('@/assets/onboarding_splash.png')}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="contain"
                        />
                    </View>

                    <Text className="text-2xl font-bold text-gray-900 text-center mb-3">
                        Your Workshop, Your Way
                    </Text>

                    <Text className="text-base text-gray-500 text-center px-4 leading-6">
                        Tailored servicing for every vehicle. Track progress, approve estimates, and stay updated — all in one smooth experience.
                    </Text>
                </View>
            </ScrollView>

            <View className="absolute bottom-6 left-6 right-6">
                <Button
                    title="Continue"
                    onPress={onNext}
                />
            </View>
        </View>
    );
}
