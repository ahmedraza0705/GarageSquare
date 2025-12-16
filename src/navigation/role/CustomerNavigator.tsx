// ============================================
// CUSTOMER NAVIGATOR
// ============================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerDashboard from '@/screens/customer/DashboardScreen';
import MyVehiclesScreen from '@/screens/customer/MyVehiclesScreen';
import MyJobCardsScreen from '@/screens/customer/MyJobCardsScreen';
import MyPaymentsScreen from '@/screens/customer/MyPaymentsScreen';
import SettingsScreen from '@/screens/shared/SettingsScreen';
import VehicleDetailScreen from '@/screens/shared/VehicleDetailScreen';
import JobCardDetailScreen from '@/screens/shared/JobCardDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#64748b',
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={CustomerDashboard}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="MyVehicles" 
        component={MyVehiclesScreen}
        options={{ title: 'My Vehicles' }}
      />
      <Tab.Screen 
        name="MyJobCards" 
        component={MyJobCardsScreen}
        options={{ title: 'Services' }}
      />
      <Tab.Screen 
        name="MyPayments" 
        component={MyPaymentsScreen}
        options={{ title: 'Payments' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function CustomerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={CustomerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ title: 'Vehicle Details' }} />
      <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} options={{ title: 'Service Details' }} />
    </Stack.Navigator>
  );
}

