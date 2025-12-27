import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Screens
import GroupManagerDashboard from '../screens/GroupManagerDashboard';
import MyGroupsScreen from '../screens/MyGroupsScreen';
import GroupMembersScreen from '../screens/GroupMembersScreen';
import JobProgressScreen from '../screens/JobProgressScreen'; // Acts as Team Jobs
import AssignJobScreen from '../screens/AssignJobScreen';
import TechnicianPerformanceScreen from '../screens/TechnicianPerformanceScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack for Team Tab (Groups -> Members)
function TeamStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MyGroups" component={MyGroupsScreen} />
            <Stack.Screen name="GroupMembers" component={GroupMembersScreen} />
        </Stack.Navigator>
    );
}

// Stack for Jobs Tab (Jobs -> Detail/Assign)
function JobsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TeamJobs" component={JobProgressScreen} />
            <Stack.Screen name="JobCardDetail" component={require('../screens/ManagerJobDetailScreen').default} />
            <Stack.Screen name="AssignJob" component={AssignJobScreen} />
        </Stack.Navigator>
    );
}

// Stack for Dashboard Tab (Dashboard -> Notifications -> Settings)
function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DashboardMain" component={GroupManagerDashboard} />
            <Stack.Screen name="Notifications" component={require('../screens/ManagerNotificationsScreen').default} />
            <Stack.Screen name="Settings" component={require('../screens/GroupSettingsScreen').default} />
            <Stack.Screen name="Performance" component={TechnicianPerformanceScreen} />
            <Stack.Screen name="JobCardDetail" component={require('../screens/ManagerJobDetailScreen').default} />
            <Stack.Screen name="TeamJobs" component={JobProgressScreen} />
        </Stack.Navigator>
    );
}

export default function GroupManagerNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#4682B4',
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    height: 65,
                    paddingBottom: 10,
                    paddingTop: 10,
                    elevation: 0,
                    shadowOpacity: 0
                },
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: '#fff',
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginBottom: 0
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Team') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'Jobs') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'Reports') {
                        iconName = focused ? 'pie-chart' : 'pie-chart-outline';
                    }

                    return <Ionicons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardStack} />
            <Tab.Screen name="Team" component={TeamStack} />
            <Tab.Screen name="Jobs" component={JobsStack} />
            <Tab.Screen name="Reports" component={TechnicianPerformanceScreen} />
            <Tab.Screen
                name="Inventory"
                component={require('../screens/InventoryScreen').default}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons name={focused ? 'cube' : 'cube-outline'} size={size} color={color} />
                    )
                }}
            />
        </Tab.Navigator>
    );
}
