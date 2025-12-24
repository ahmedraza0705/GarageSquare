// ============================================
// MANAGER NAVIGATOR
// ============================================

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/context/ThemeContext';
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
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.tabIconColor,
        tabBarInactiveTintColor: theme.tabIconColor,
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={ManagerDashboard}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              focused ? styles.activeTabIcon : null,
              { backgroundColor: focused ? theme.tabIconBg : 'transparent' }
            ]}>
              <LayoutGrid
                size={24}
                color={color}
                opacity={focused ? 1 : theme.tabIconInactiveOpacity}
              />
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Vehicles"
        component={VehiclesScreen}
        options={{
          title: 'Vehicles',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              focused ? styles.activeTabIcon : null,
              { backgroundColor: focused ? theme.tabIconBg : 'transparent' }
            ]}>
              <Building2
                size={24}
                color={color}
                opacity={focused ? 1 : theme.tabIconInactiveOpacity}
              />
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomersScreen}
        options={{
          title: 'Customers',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              focused ? styles.activeTabIcon : null,
              { backgroundColor: focused ? theme.tabIconBg : 'transparent' }
            ]}>
              <User
                size={24}
                color={color}
                opacity={focused ? 1 : theme.tabIconInactiveOpacity}
              />
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Payments"
        component={PaymentsScreen}
        options={{
          title: 'Payments',
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              focused ? styles.activeTabIcon : null,
              { backgroundColor: focused ? theme.tabIconBg : 'transparent' }
            ]}>
              <BarChart3
                size={24}
                color={color}
                opacity={focused ? 1 : theme.tabIconInactiveOpacity}
              />
            </View>
          )
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  activeTabIcon: {
    padding: 8,
    borderRadius: 12,
  }
});

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

