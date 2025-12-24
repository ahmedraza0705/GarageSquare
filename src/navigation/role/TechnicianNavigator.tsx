// ============================================
// TECHNICIAN NAVIGATOR
// ============================================

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


// Screens
import TechnicianDashboard from '@/screens/technician/DashboardScreen';
import MyJobCardsScreen from '@/screens/technician/MyJobCardsScreen';
import NotificationsScreen from '@/screens/technician/NotificationsScreen';
import ProfileScreen from '@/screens/technician/ProfileScreen';
import TechnicianJobDetailScreen from '@/screens/technician/TechnicianJobDetailScreen';
import WorkProgressScreen from '@/screens/technician/WorkProgressScreen';
import InspectionChecklistScreen from '@/screens/technician/InspectionChecklistScreen';
import AddNotesImagesScreen from '@/screens/technician/AddNotesImagesScreen';
import PartsUsageScreen from '@/screens/technician/PartsUsageScreen';
import JobSubmissionScreen from '@/screens/technician/JobSubmissionScreen';
import SettingsScreen from '@/screens/shared/SettingsScreen';

// Assets
// PNGs removed in favor of vector icons

import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TechnicianTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'MyJobCards') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
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
        options={{ title: 'My Jobs' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Alerts', tabBarBadge: 3 }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function TechnicianNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={TechnicianTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TechnicianJobDetail"
        component={TechnicianJobDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WorkProgress"
        component={WorkProgressScreen}
        options={{ title: 'Work Progress' }}
      />
      <Stack.Screen
        name="InspectionChecklist"
        component={InspectionChecklistScreen}
        options={{ title: 'Inspection Checklist' }}
      />
      <Stack.Screen
        name="AddNotesImages"
        component={AddNotesImagesScreen}
        options={{ title: 'Notes & Images' }}
      />
      <Stack.Screen
        name="PartsUsage"
        component={PartsUsageScreen}
        options={{ title: 'Parts Usage' }}
      />
      <Stack.Screen
        name="JobSubmission"
        component={JobSubmissionScreen}
        options={{ title: 'Submit Job' }}
      />
    </Stack.Navigator>
  );
}

