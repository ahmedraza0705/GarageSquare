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

import { LayoutGrid, Building2, User, BarChart3 } from 'lucide-react-native';

function ManagerTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#cbd5e1',
        tabBarStyle: {
          backgroundColor: '#4E88B9', // Custom blue from image
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          position: 'absolute',
          bottom: 15,
          left: 15,
          right: 15,
          elevation: 5,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={ManagerDashboard}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <LayoutGrid size={28} color={color} />
        }}
      />
      <Tab.Screen
        name="Vehicles"
        component={VehiclesScreen}
        options={{
          title: 'Vehicles',
          headerShown: false,
          tabBarIcon: ({ color }) => <Building2 size={28} color={color} />
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomersScreen}
        options={{
          title: 'Customers',
          tabBarIcon: ({ color }) => <User size={28} color={color} />
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          title: 'Payments',
          tabBarIcon: ({ color }) => <BarChart3 size={28} color={color} />
        }}
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
      <Stack.Screen name="CreateCustomer" component={CreateCustomerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateVehicle" component={CreateVehicleScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateJobCard" component={CreateJobCardScreen} options={{ title: 'Create Job Card' }} />
    </Stack.Navigator>
  );
}

