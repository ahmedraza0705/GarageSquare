// ============================================
// MANAGER NAVIGATOR
// ============================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ManagerDashboard from '@/screens/manager/DashboardScreen';
import CustomersScreen from '@/screens/manager/CustomersScreen';
import VehiclesScreen from '@/screens/manager/VehiclesScreen';
import JobCardsScreen from '@/screens/manager/JobCardsScreen';
import SettingsScreen from '@/screens/shared/SettingsScreen';
import PaymentsScreen from '@/screens/manager/PaymentsScreen';
import CustomerDetailScreen from '@/screens/shared/CustomerDetailScreen';
import VehicleDetailScreen from '@/screens/shared/VehicleDetailScreen';
import JobCardDetailScreen from '@/screens/shared/JobCardDetailScreen';
import CreateCustomerScreen from '@/screens/shared/CreateCustomerScreen';
import CreateVehicleScreen from '@/screens/shared/CreateVehicleScreen';
import CreateJobCardScreen from '@/screens/shared/CreateJobCardScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ManagerTabs() {
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
        component={ManagerDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Customers" 
        component={CustomersScreen}
        options={{ title: 'Customers' }}
      />
      <Tab.Screen 
        name="Vehicles" 
        component={VehiclesScreen}
        options={{ title: 'Vehicles' }}
      />
      <Tab.Screen 
        name="JobCards" 
        component={JobCardsScreen}
        options={{ title: 'Job Cards' }}
      />
      <Tab.Screen 
        name="Payments" 
        component={PaymentsScreen}
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

export default function ManagerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={ManagerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer Details' }} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ title: 'Vehicle Details' }} />
      <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} options={{ title: 'Job Card Details' }} />
      <Stack.Screen name="CreateCustomer" component={CreateCustomerScreen} options={{ title: 'Add Customer' }} />
      <Stack.Screen name="CreateVehicle" component={CreateVehicleScreen} options={{ title: 'Add Vehicle' }} />
      <Stack.Screen name="CreateJobCard" component={CreateJobCardScreen} options={{ title: 'Create Job Card' }} />
    </Stack.Navigator>
  );
}

