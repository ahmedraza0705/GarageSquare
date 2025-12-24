// ============================================
// TECHNICIAN GROUP MANAGER NAVIGATOR
// ============================================

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/context/ThemeContext';
import TechnicianGroupManagerDashboard from '@/screens/technician-group-manager/DashboardScreen';
import JobCardsScreen from '@/screens/technician-group-manager/JobCardsScreen';
import TasksScreen from '@/screens/technician-group-manager/TasksScreen';
import SettingsScreen from '@/screens/shared/SettingsScreen';
import JobCardDetailScreen from '@/screens/shared/JobCardDetailScreen';
import TaskDetailScreen from '@/screens/shared/TaskDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TechnicianGroupManagerTabs() {
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
          } else if (route.name === 'JobCards') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'list' : 'list-outline';
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
        component={TechnicianGroupManagerDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="JobCards"
        component={JobCardsScreen}
        options={{ title: 'Job Cards' }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ title: 'Tasks' }}
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

export default function TechnicianGroupManagerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={TechnicianGroupManagerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} options={{ title: 'Job Card Details' }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Details' }} />
    </Stack.Navigator>
  );
}

