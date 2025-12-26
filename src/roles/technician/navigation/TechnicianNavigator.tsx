import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Image, View, Text } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';

// Screens
import TechnicianDashboard from '../screens/TechnicianDashboard';
import ProfileScreen from '../screens/ProfileScreen';
import CompletedJobsScreen from '../screens/CompletedJobsScreen';
import EfficiencyScreen from '../screens/EfficiencyScreen';
import TechnicianVehiclesScreen from '../screens/TechnicianVehiclesScreen';
import JobTasksScreen from '@/roles/technician/screens/JobTasksScreen';
import JobTasksDetailScreen from '@/roles/technician/screens/JobTasksDetailScreen';
import JobCardsScreen from '@/roles/technician/screens/JobCardsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Dashboard to handle Job Details
function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="DashboardMain" component={TechnicianDashboard} />
            {/* <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} /> */}
            <Stack.Screen name="CompletedJobs" component={CompletedJobsScreen} />
            <Stack.Screen name="Efficiency" component={EfficiencyScreen} />
        </Stack.Navigator>
    );
}

// Stack for My Jobs to handle Job Details
function JobsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="JobsList" component={JobTasksScreen} />
            <Stack.Screen name="JobTasksDetail" component={JobTasksDetailScreen} />
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
    const { user } = useAuth();
    const userImage = user?.profile?.avatar_url;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarShowLabel: false,
                tabBarIcon: ({ focused, color, size }) => {
                    if (route.name === 'Profile') {
                        return (
                            <View className={`rounded-full border-2 ${focused ? 'border-sky-400' : 'border-transparent'}`} style={{ padding: 1 }}>
                                {userImage ? (
                                    <Image
                                        source={{ uri: userImage }}
                                        className="w-10 h-10 rounded-full"
                                    />
                                ) : (
                                    <View className="w-10 h-10 rounded-full bg-slate-600 items-center justify-center">
                                        <Ionicons name="person" size={20} color="#ffffffff" />
                                    </View>
                                )}
                            </View>
                        );
                    }

                    let iconName: any;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'My Jobs') {
                        iconName = focused ? 'construct' : 'construct-outline';
                    } else if (route.name === 'Job Cards') {
                        iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
                    } else if (route.name === 'Vehicles') {
                        iconName = focused ? 'car-sport' : 'car-sport-outline';
                    }

                    return <Ionicons name={iconName} size={30} color={color} />;
                },
                tabBarActiveTintColor: '#ffffff',
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
                tabBarStyle: {
                    backgroundColor: '#4682B4', // Restoring premium dark
                    borderTopWidth: 0,
                    height: Platform.OS === 'ios' ? 88 : 70,
                    paddingTop: 12,
                    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 24,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 10,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardStack} />
            <Tab.Screen name="My Jobs" component={JobsStack} />
            {/* <Tab.Screen name="Job Cards" component={JobCardsScreen} /> */}
            <Tab.Screen name="Vehicles" component={TechnicianVehiclesScreen} />
            <Tab.Screen name="Profile" component={ProfileStack} />
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
