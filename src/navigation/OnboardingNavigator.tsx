
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '@/screens/onboarding/WelcomeScreen';
import PersonalDetailsScreen from '@/screens/onboarding/PersonalDetailsScreen';
import CompanyDetailsScreen from '@/screens/onboarding/CompanyDetailsScreen';
import CompanyAddressScreen from '@/screens/onboarding/CompanyAddressScreen';
import DataUploadScreen from '@/screens/onboarding/DataUploadScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="PersonalDetails" component={PersonalDetailsScreen} />
            <Stack.Screen name="CompanyDetails" component={CompanyDetailsScreen} />
            <Stack.Screen name="CompanyAddress" component={CompanyAddressScreen} />
            <Stack.Screen name="DataUpload" component={DataUploadScreen} />
        </Stack.Navigator>
    );
}
