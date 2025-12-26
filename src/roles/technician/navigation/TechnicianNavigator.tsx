import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Image, View, Text } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

// Screens
import TechnicianDashboard from '../screens/TechnicianDashboard';
import JobCardDetailScreen from '../screens/JobCardDetailScreen';
import TechnicianJobCardsScreen from '../screens/TechnicianJobCardsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CompletedJobsScreen from '../screens/CompletedJobsScreen';
import EfficiencyScreen from '../screens/EfficiencyScreen';
import TechnicianVehiclesScreen from '../screens/TechnicianVehiclesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Dashboard to handle Job Details
function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DashboardMain" component={TechnicianDashboard} />
            <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} />
            <Stack.Screen name="CompletedJobs" component={CompletedJobsScreen} />
            <Stack.Screen name="Efficiency" component={EfficiencyScreen} />
        </Stack.Navigator>
    );
}

// Stack for My Jobs to handle Job Details
function JobsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="JobsList" component={TechnicianJobCardsScreen} />
            <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} />
        </Stack.Navigator>
    );
}

// Stack for Profile to handle Edit Profile
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SupportScreen from '../screens/SupportScreen';
import LegalScreen from '../screens/LegalScreen';
import AboutScreen from '../screens/AboutScreen';

function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />
            <Stack.Screen name="Legal" component={LegalScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
        </Stack.Navigator>
    );
}

function TechnicianTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false, // Hide labels as per design
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: any;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'My Jobs') {
                        iconName = focused ? 'construct' : 'construct-outline'; // Tools for Jobs
                    } else if (route.name === 'Job Cards') {
                        iconName = focused ? 'file-tray-full' : 'file-tray-full-outline'; // Box/File for Job Cards
                    } else if (route.name === 'Vehicles') {
                        iconName = focused ? 'car-sport' : 'car-sport-outline';
                    }

                    return <Ionicons name={iconName} size={28} color={color} />;
                },
                tabBarActiveTintColor: '#ffffff', // White
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', // Faded white
                tabBarStyle: {
                    backgroundColor: '#4682b4', // Matches the Blue Card/Design
                    borderTopWidth: 0,
                    height: Platform.OS === 'ios' ? 88 : 60,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardStack} />
            <Tab.Screen name="My Jobs" component={JobsStack} />
            <Tab.Screen name="Job Cards" component={TechnicianJobCardsScreen} />
            <Tab.Screen name="Vehicles" component={TechnicianVehiclesScreen} />
        </Tab.Navigator>
    );
}

// Vehicle Screens
import VehicleDetailScreen from '../screens/VehicleDetailScreen';
import AddVehicleScreen from '../screens/AddVehicleScreen';

export default function TechnicianNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="TechnicianTabs" component={TechnicianTabNavigator} />
            <Stack.Screen name="ProfileStack" component={ProfileStack} />

            {/* Vehicle Routes */}
            <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
            <Stack.Screen
                name="AddVehicle"
                component={AddVehicleScreen}
                options={{ presentation: 'modal' }}
            />
        </Stack.Navigator>
    );
}
