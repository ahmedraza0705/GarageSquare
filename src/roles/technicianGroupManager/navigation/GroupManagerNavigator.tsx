
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import GroupManagerDashboard from '../screens/GroupManagerDashboard';
import TechnicianListScreen from '../screens/TechnicianListScreen';
import AssignJobScreen from '../screens/AssignJobScreen';
import JobProgressScreen from '../screens/JobProgressScreen';

const Tab = createBottomTabNavigator();

export default function GroupManagerNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#e2e8f0',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#3b82f6',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Technicians') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'Assign Job') {
                        iconName = focused ? 'add-circle' : 'add-circle-outline';
                    } else if (route.name === 'Progress') {
                        iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={GroupManagerDashboard} />
            <Tab.Screen name="Technicians" component={TechnicianListScreen} />
            <Tab.Screen name="Assign Job" component={AssignJobScreen} />
            <Tab.Screen name="Progress" component={JobProgressScreen} />
        </Tab.Navigator>
    );
}
