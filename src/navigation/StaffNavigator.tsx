import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useRole } from '@/hooks/useRole';
import { ROLE_PERMISSIONS, PERMISSIONS } from '@/config/roleConfig';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import DashboardScreen from '@/screens/staff/dashboard/DashboardScreen';
import ActiveJobsScreen from '@/screens/staff/jobs/ActiveJobsScreen';
import JobCardsScreen from '@/screens/staff/jobs/JobCardsScreen';
import MyJobCardsScreen from '@/screens/staff/jobs/MyJobCardsScreen';
import JobCardDetailScreen from '@/screens/staff/jobs/JobCardDetailScreen';
import CreateJobCardScreen from '@/screens/staff/jobs/CreateJobCardScreen';
import TaskDetailScreen from '@/screens/staff/jobs/TaskDetailScreen';
import JobSubmissionScreen from '@/screens/staff/jobs/JobSubmissionScreen';
import InspectionChecklistScreen from '@/screens/staff/jobs/InspectionChecklistScreen';
import PartsUsageScreen from '@/screens/staff/jobs/PartsUsageScreen';
import AddNotesImagesScreen from '@/screens/staff/jobs/AddNotesImagesScreen';
import WorkProgressScreen from '@/screens/staff/jobs/WorkProgressScreen';

import UsersScreen from '@/screens/staff/users/UsersScreen';
import CustomersScreen from '@/screens/staff/users/CustomersScreen';
import CreateCustomerScreen from '@/screens/staff/users/CreateCustomerScreen';
import CustomerDetailScreen from '@/screens/staff/users/CustomerDetailScreen';
import TechnicianProfileScreen from '@/screens/staff/users/TechnicianProfileScreen';

import ReportsScreen from '@/screens/staff/reports/ReportsScreen';

import BranchesScreen from '@/screens/staff/operations/BranchesScreen';
import VehiclesScreen from '@/screens/staff/operations/VehiclesScreen';
import CreateVehicleScreen from '@/screens/staff/operations/CreateVehicleScreen';
import VehicleDetailScreen from '@/screens/staff/operations/VehicleDetailScreen';

import InvoiceScreen from '@/screens/staff/invoices/InvoiceScreen';

// Technician Specific Screens
import TechnicianVehiclesScreen from '@/roles/technician/screens/TechnicianVehiclesScreen';
import TechnicianVehicleDetailScreen from '@/roles/technician/screens/VehicleDetailScreen';
import AddVehicleScreen from '@/roles/technician/screens/AddVehicleScreen';


// Stack Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardStack() {
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1e1e1e' }, headerTintColor: '#fff' }}>
            <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Dashboard' }} />
        </Stack.Navigator>
    );
}

function JobsStack() {
    const { role } = useRole();
    const initialRoute = role === 'technician' ? 'MyJobCards' : 'ActiveJobs';

    return (
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerStyle: { backgroundColor: '#1e1e1e' }, headerTintColor: '#fff' }}>
            <Stack.Screen name="ActiveJobs" component={ActiveJobsScreen} options={{ title: 'All Jobs' }} />
            <Stack.Screen name="JobCards" component={JobCardsScreen} />
            <Stack.Screen name="MyJobCards" component={MyJobCardsScreen} options={{ title: 'My Jobs' }} />
            <Stack.Screen name="JobCardDetail" component={JobCardDetailScreen} options={{ title: 'Job Details' }} />
            <Stack.Screen name="CreateJobCard" component={CreateJobCardScreen} options={{ title: 'New Job Card' }} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
            <Stack.Screen name="WorkProgress" component={WorkProgressScreen} />
            <Stack.Screen name="InspectionChecklist" component={InspectionChecklistScreen} />
            <Stack.Screen name="PartsUsage" component={PartsUsageScreen} />
            <Stack.Screen name="AddNotesImages" component={AddNotesImagesScreen} />
            <Stack.Screen name="JobSubmission" component={JobSubmissionScreen} />
        </Stack.Navigator>
    );
}

function UsersStack() {
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1e1e1e' }, headerTintColor: '#fff' }}>
            <Stack.Screen name="UsersMain" component={UsersScreen} options={{ title: 'Users' }} />
            <Stack.Screen name="Customers" component={CustomersScreen} />
            <Stack.Screen name="CreateCustomer" component={CreateCustomerScreen} options={{ title: 'New Customer' }} />
            <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ title: 'Customer Details' }} />
            <Stack.Screen name="TechnicianProfile" component={TechnicianProfileScreen} options={{ title: 'Profile' }} />
        </Stack.Navigator>
    );
}

function OperationsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1e1e1e' }, headerTintColor: '#fff' }}>
            <Stack.Screen name="Branches" component={BranchesScreen} options={{ title: 'Branches' }} />
            <Stack.Screen name="Vehicles" component={VehiclesScreen} />
            <Stack.Screen name="CreateVehicle" component={CreateVehicleScreen} options={{ title: 'New Vehicle' }} />
            <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ title: 'Vehicle Details' }} />
        </Stack.Navigator>
    );
}

function TechnicianOperationsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Vehicles" component={TechnicianVehiclesScreen} />
            <Stack.Screen name="VehicleDetail" component={TechnicianVehicleDetailScreen} />
            <Stack.Screen
                name="AddVehicle"
                component={AddVehicleScreen}
                options={{ presentation: 'modal' }}
            />
        </Stack.Navigator>
    );
}

function ReportsStack() {
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1e1e1e' }, headerTintColor: '#fff' }}>
            <Stack.Screen name="ReportsMain" component={ReportsScreen} options={{ title: 'Reports' }} />
        </Stack.Navigator>
    );
}

function InvoiceStack() {
    return (
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1e1e1e' }, headerTintColor: '#fff' }}>
            <Stack.Screen name="InvoicesMain" component={InvoiceScreen} options={{ title: 'Invoices' }} />
        </Stack.Navigator>
    );
}

export default function StaffNavigator() {
    const { role } = useRole();
    const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];

    if (!role || permissions.length === 0) {
        return null; // or a loading spinner
    }

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#4e86c0', // Blue color from image
                    borderTopWidth: 0,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                },
                tabBarActiveTintColor: '#ffffff',
                tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
                tabBarShowLabel: false, // Image shows icons only? Or maybe user wants labels. keeping false for cleaner look like image
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Jobs') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'Operations') {
                        iconName = focused ? 'car-sport' : 'car-sport-outline'; // Vehicles
                    } else if (route.name === 'Invoices') {
                        iconName = focused ? 'receipt' : 'receipt-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={28} color={color} />;
                },
            })}
        >
            {permissions.includes(PERMISSIONS.VIEW_DASHBOARD) && (
                <Tab.Screen name="Dashboard" component={DashboardStack} />
            )}
            {permissions.includes(PERMISSIONS.MANAGE_JOBS) && (
                <Tab.Screen name="Jobs" component={JobsStack} />
            )}
            {permissions.includes(PERMISSIONS.MANAGE_OPERATIONS) && (
                <Tab.Screen
                    name="Operations"
                    component={role === 'technician' ? TechnicianOperationsStack : OperationsStack}
                    options={{ title: 'Vehicles' }}
                />
            )}
            {/* {permissions.includes(PERMISSIONS.VIEW_INVOICES) && ( */}
            <Tab.Screen name="Invoices" component={InvoiceStack} />
            {/* )} */}

            {permissions.includes(PERMISSIONS.VIEW_PROFILE) && (
                <Tab.Screen
                    name="Profile"
                    component={TechnicianProfileScreen}
                    options={{ title: 'Profile' }}
                />
            )}

            {/* Hidden Tabs (Requested to remove from main nav list, but might need permission checks/removal)
            {permissions.includes(PERMISSIONS.MANAGE_USERS) && (
                <Tab.Screen name="Users" component={UsersStack} />
            )}
            {permissions.includes(PERMISSIONS.VIEW_REPORTS) && (
                <Tab.Screen name="Reports" component={ReportsStack} />
            )}
            */}
        </Tab.Navigator>
    );
}
