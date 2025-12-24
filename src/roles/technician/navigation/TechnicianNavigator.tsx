
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import TechnicianDashboard from '../screens/TechnicianDashboard';
import AssignedJobsList from '../screens/AssignedJobsList';
import JobCardDetailScreen from '../screens/JobCardDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Jobs to handle Detail View
function JobsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="AssignedJobsList" component={AssignedJobsList} />
            <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} />
        </Stack.Navigator>
    );
}

// Stack for Dashboard because it also navigates to Job Details
function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TechnicianDashboardMain" component={TechnicianDashboard} />
            <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} />
        </Stack.Navigator>
    );
}

export default function TechnicianNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#4682b4', // Steel Blue from image
                    borderTopWidth: 0,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#ffffff',
                tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Jobs') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardStack} />
            <Tab.Screen name="Jobs" component={JobsStack} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
