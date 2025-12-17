// ============================================
// COMPANY ADMIN NAVIGATOR
// ============================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, ThemeColors, ThemeName } from '@/context/ThemeContext';
import CustomDrawerContent from '@/components/navigation/CustomDrawerContent';
// Icons
import {
  LayoutDashboard,
  Building2,
  Users,
  FileBarChart,
  Menu,
  Moon,
  Sun
} from 'lucide-react-native';

// Screens
import CompanyAdminDashboard from '@/screens/company-admin/DashboardScreen';
import BranchesScreen from '@/screens/company-admin/BranchesScreen';
import UsersScreen from '@/screens/company-admin/UsersScreen';
import ReportsScreen from '@/screens/company-admin/ReportsScreen';
import CustomersScreen from '@/screens/company-admin/CustomersScreen';
import VehiclesScreen from '@/screens/company-admin/VehiclesScreen';
import JobCardsScreen from '@/screens/company-admin/JobCardsScreen';
import ActiveJobsScreen from '@/screens/company-admin/ActiveJobsScreen';
import JobCardDetailScreen from '@/screens/shared/JobCardDetailScreen';
import SettingsScreen from '@/screens/shared/SettingsScreen';
import CustomerDetailScreen from '@/screens/shared/CustomerDetailScreen';
import VehicleDetailScreen from '@/screens/shared/VehicleDetailScreen';
import CreateCustomerScreen from '@/screens/shared/CreateCustomerScreen';
import CreateVehicleScreen from '@/screens/shared/CreateVehicleScreen';
import CreateJobCardScreen from '@/screens/shared/CreateJobCardScreen';
import TasksScreen from '@/screens/supervisor/TasksScreen';
import TaskDetailScreen from '@/screens/shared/TaskDetailScreen';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom Header Component
function CustomHeader({
  route,
  theme,
  themeName,
  onToggleTheme,
}: {
  route: any;
  theme: ThemeColors;
  themeName: ThemeName;
  onToggleTheme: () => void;
}) {
  const navigation = useNavigation();
  const { user } = useAuth();

  // Get current screen title
  const getScreenTitle = () => {
    const routeName = route?.name || 'Dashboard';
    const titleMap: Record<string, string> = {
      DashboardTab: 'Dashboard',
      MainTabs: 'Dashboard',
      Dashboard: 'Dashboard',
      BranchesTab: 'Branches',
      Branches: 'Branches',
      UsersTab: 'User Management',
      UserManagement: 'User Management',
      ReportsTab: 'Reports',
      Reports: 'Reports',
      ActiveJobs: 'Active Jobs',
      Vehicles: 'Vehicles',
      Customers: 'Customers',
      JobCards: 'Job Cards',
      Settings: 'Settings',
    };
    return titleMap[routeName] || 'Dashboard';
  };

  return (
    <View
      style={[
        styles.header,
        { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          navigation.dispatch(DrawerActions.openDrawer());
        }}
        style={styles.headerButton}
      >
        <Menu size={24} color={theme.headerIcon} />
      </TouchableOpacity>

      <Text style={[styles.headerTitle, { color: theme.headerText }]}>{getScreenTitle()}</Text>

      <View style={styles.headerRight}>
        <TouchableOpacity
          onPress={onToggleTheme}
          style={styles.headerButton}
        >
          {themeName === 'dark' ? (
            <Sun size={24} color={theme.headerIcon} />
          ) : (
            <Moon size={24} color={theme.headerIcon} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatarButton}>
          <View style={[styles.avatar, { backgroundColor: theme.avatarBg }]}>
            <Text style={[styles.avatarText, { color: theme.avatarText }]}>
              {user?.profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Bottom Tab Navigator
function CompanyAdminTabs({ theme }: { theme: ThemeColors }) {
  // We want a blue bar with white icons, matching the user's image request
  const BAR_COLOR = '#4682B4'; // Blue-600
  const ACTIVE_COLOR = '#ffffff86';
  const INACTIVE_COLOR = '#FFFFFF';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: BAR_COLOR,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 8, // Increased elevation for Android
          zIndex: 50, // Added zIndex for iOS
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarShowLabel: false, // Hide labels for a cleaner look like the image
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={CompanyAdminDashboard}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeTabIcon : null}>
              <LayoutDashboard color={color} size={24} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="BranchesTab"
        component={BranchesScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeTabIcon : null}>
              <Building2 color={color} size={24} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="UsersTab"
        component={UsersScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeTabIcon : null}>
              <Users color={color} size={24} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeTabIcon : null}>
              <FileBarChart color={color} size={24} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Drawer Navigator (Wraps Tabs)
function CompanyAdminDrawer({
  theme,
  themeName,
  onToggleTheme,
}: {
  theme: ThemeColors;
  themeName: ThemeName;
  onToggleTheme: () => void;
}) {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        header: () => (
          <CustomHeader
            route={route}
            theme={theme}
            themeName={themeName}
            onToggleTheme={onToggleTheme}
          />
        ),
        drawerStyle: {
          width: 300,
          backgroundColor: theme.drawerBackground,
        },
        drawerType: 'front',
        overlayColor: theme.overlay,
        drawerPosition: 'left',
        swipeEnabled: true,
      })}
    >
      <Drawer.Screen
        name="MainTabs"
        options={{
          title: 'Dashboard',
        }}
      >
        {() => <CompanyAdminTabs theme={theme} />}
      </Drawer.Screen>

      {/* Hidden items accessible via Menu but part of Drawer logic if needed */}
      <Drawer.Screen
        name="Vehicles"
        component={VehiclesScreen}
        options={{ title: 'Vehicles', drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="Customers"
        component={CustomersScreen}
        options={{ title: 'Customers', drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="JobCards"
        component={JobCardsScreen}
        options={{ title: 'Job Cards', drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Reports', drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings', drawerItemStyle: { display: 'none' } }}
      />
    </Drawer.Navigator>
  );
}

// Root Stack for Company Admin
export default function CompanyAdminNavigator() {
  const { themeName, theme, toggleTheme } = useTheme();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main">
        {() => (
          <CompanyAdminDrawer
            theme={theme}
            themeName={themeName}
            onToggleTheme={toggleTheme}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ActiveJobs" component={ActiveJobsScreen} />
      <Stack.Screen
        name="JobCardDetail"
        component={JobCardDetailScreen}
        options={{ headerShown: true, title: 'Job Detail' }}
      />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} options={{ headerShown: true, title: 'Customer Details' }} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} options={{ headerShown: true, title: 'Vehicle Details' }} />
      <Stack.Screen name="CreateCustomer" component={CreateCustomerScreen} options={{ headerShown: true, title: 'Add Customer' }} />
      <Stack.Screen name="CreateVehicle" component={CreateVehicleScreen} options={{ headerShown: true, title: 'Add Vehicle' }} />
      <Stack.Screen name="CreateJobCard" component={CreateJobCardScreen} options={{ headerShown: true, title: 'New Job Card' }} />
      <Stack.Screen name="Tasks" component={TasksScreen} options={{ headerShown: true, title: 'Tasks' }} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ headerShown: true, title: 'Task Details' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarButton: {
    padding: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTabIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 12,
  }
});
