// ============================================
// CUSTOMER NAVIGATOR
// ============================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CustomerDashboard from '@/screens/customer/DashboardScreen';
import MyVehiclesScreen from '@/screens/customer/MyVehiclesScreen';
import MyJobCardsScreen from '@/screens/customer/MyJobCardsScreen';
import MyPaymentsScreen from '@/screens/customer/MyPaymentsScreen';
import SettingsScreen from '@/screens/shared/SettingsScreen';
import VehicleDetailScreen from '@/screens/staff/operations/VehicleDetailScreen';
import JobCardDetailScreen from '@/screens/staff/jobs/JobCardDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#64748b',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyVehicles') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'MyJobCards') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'MyPayments') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'alert-circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
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

