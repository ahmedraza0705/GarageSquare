// ============================================
// TECHNICIAN GROUP MANAGER NAVIGATOR
// ============================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TechnicianGroupManagerDashboard from '@/screens/technician-group-manager/DashboardScreen';
import JobCardsScreen from '@/screens/technician-group-manager/JobCardsScreen';
import TasksScreen from '@/screens/technician-group-manager/TasksScreen';
import SettingsScreen from '@/screens/shared/SettingsScreen';
import JobCardDetailScreen from '@/screens/shared/JobCardDetailScreen';
import TaskDetailScreen from '@/screens/shared/TaskDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TechnicianGroupManagerTabs() {
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

export default function TechnicianGroupManagerNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={TechnicianGroupManagerTabs} options={{ headerShown: false }} />
      <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} options={{ title: 'Job Card Details' }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Details' }} />
    </Stack.Navigator>
  );
}

