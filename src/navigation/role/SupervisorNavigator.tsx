// ============================================
// SUPERVISOR NAVIGATOR
// ============================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SupervisorDashboard from '@/screens/supervisor/DashboardScreen';
import JobCardsScreen from '@/screens/supervisor/JobCardsScreen';
import TasksScreen from '@/screens/supervisor/TasksScreen';
import TeamScreen from '@/screens/supervisor/TeamScreen';
import SettingsScreen from '@/screens/shared/SettingsScreen';
import JobCardDetailScreen from '@/screens/shared/JobCardDetailScreen';
import TaskDetailScreen from '@/screens/shared/TaskDetailScreen';
import CreateJobCardScreen from '@/screens/shared/CreateJobCardScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SupervisorTabs() {
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
        component={SupervisorDashboard}
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
        name="Team" 
        component={TeamScreen}
        options={{ title: 'Team' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function SupervisorNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Main" component={SupervisorTabs} options={{ headerShown: false }} />
      <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} options={{ title: 'Job Card Details' }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Details' }} />
      <Stack.Screen name="CreateJobCard" component={CreateJobCardScreen} options={{ title: 'Create Job Card' }} />
    </Stack.Navigator>
  );
}

