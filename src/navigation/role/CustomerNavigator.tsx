// ============================================
// CUSTOMER NAVIGATOR
// ============================================

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/context/ThemeContext';
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
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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

          return (
            <View style={[
              focused ? styles.activeTabIcon : null,
              { backgroundColor: focused ? theme.tabIconBg : 'transparent' }
            ]}>
              <Ionicons
                name={iconName}
                size={22}
                color={color}
                style={{ opacity: focused ? 1 : theme.tabIconInactiveOpacity }}
              />
            </View>
          );
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

const styles = StyleSheet.create({
  activeTabIcon: {
    padding: 8,
    borderRadius: 12,
  }
});

export default function CustomerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={CustomerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ title: 'Vehicle Details' }} />
      <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} options={{ title: 'Service Details' }} />
    </Stack.Navigator>
  );
}

