// ============================================
// TECHNICIAN NAVIGATOR
// ============================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TechnicianDashboard from '@/screens/technician/DashboardScreen';
import MyJobCardsScreen from '@/screens/technician/MyJobCardsScreen';
import MyTasksScreen from '@/screens/technician/MyTasksScreen';
import SettingsScreen from '@/screens/shared/SettingsScreen';
import JobCardDetailScreen from '@/screens/shared/JobCardDetailScreen';
import TaskDetailScreen from '@/screens/shared/TaskDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TechnicianTabs() {
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

export default function TechnicianNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={TechnicianTabs} options={{ headerShown: false }} />
      <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} options={{ title: 'Job Card Details' }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Details' }} />
    </Stack.Navigator>
  );
}

