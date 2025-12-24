// ============================================
// TECHNICIAN NAVIGATOR
// ============================================

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/context/ThemeContext';
import TechnicianDashboard from '@/screens/technician/DashboardScreen';
import MyJobCardsScreen from '@/screens/technician/MyJobCardsScreen';
import MyTasksScreen from '@/screens/technician/MyTasksScreen';
import SettingsScreen from '@/screens/shared/SettingsScreen';
import JobCardDetailScreen from '@/screens/shared/JobCardDetailScreen';
import TaskDetailScreen from '@/screens/shared/TaskDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TechnicianTabs() {
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
          } else if (route.name === 'MyJobCards') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'MyTasks') {
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
        component={TechnicianDashboard}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="MyJobCards"
        component={MyJobCardsScreen}
        options={{ title: 'My Job Cards' }}
      />
      <Tab.Screen
        name="MyTasks"
        component={MyTasksScreen}
        options={{ title: 'My Tasks' }}
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

export default function TechnicianNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={TechnicianTabs} options={{ headerShown: false }} />
      <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} options={{ title: 'Job Card Details' }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Details' }} />
    </Stack.Navigator>
  );
}

