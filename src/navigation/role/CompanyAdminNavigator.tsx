
// ============================================
// COMPANY ADMIN NAVIGATOR
// ============================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
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
  FileText,
  Menu,
  Moon,
  Sun
} from 'lucide-react-native';

// Screens
import CompanyAdminDashboard from '@/screens/company-admin/DashboardScreen';
import BranchesScreen from '@/screens/company-admin/BranchesScreen';
import UsersScreen from '@/screens/company-admin/UsersScreen';
import ReportsScreen from '@/screens/company-admin/ReportsScreen';
import InvoiceScreen from '@/screens/company-admin/InvoiceScreen';
import InvoiceDetailScreen from '@/screens/company-admin/InvoiceDetailScreen';
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
// New Imports
import ChangePasswordScreen from '@/screens/shared/ChangePasswordScreen';
import AccountDetailsScreen from '@/screens/shared/AccountDetailsScreen';
import NotificationsScreen from '@/screens/shared/NotificationsScreen';
import AboutScreen from '@/screens/shared/AboutScreen';
import ProfilePopup from '@/components/navigation/ProfilePopup';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom Header Component
function CustomHeader({
  route,
  theme,
  themeName,
  onToggleTheme,
  showBack,
}: {
  route: any;
  theme: ThemeColors;
  themeName: ThemeName;
  onToggleTheme: () => void;
  showBack?: boolean;
}) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [profilePopupVisible, setProfilePopupVisible] = useState(false);

  // Get current screen title
  const getScreenTitle = () => {
    const routeName = route?.name || 'Dashboard';

    // If we're in MainTabs, check the active tab
    if (routeName === 'MainTabs' && route?.state?.index !== undefined) {
      const activeTabRoute = route.state.routes[route.state.index];
      if (activeTabRoute?.name) {
        const titleMap: Record<string, string> = {
          DashboardTab: 'Dashboard',
          BranchesTab: 'Branches',
          UsersTab: 'User Management',
          ReportsTab: 'Reports',
        };
        return titleMap[activeTabRoute.name] || 'Dashboard';
      }
    }

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
      InvoiceTab: 'Estimate',
      Invoice: 'Estimate',
      InvoiceList: 'Estimate',
      InvoiceDetail: 'Invoice Detail',
      ActiveJobs: 'Active Jobs',
      Vehicles: 'Vehicles',
      Customers: 'Customers',
      JobCards: 'Job Cards',
      Settings: 'Settings',
      // New titles
      ChangePassword: 'Change Password',
      AccountDetails: 'Account Details',
      Notifications: 'Notifications',
      About: 'About GarageSquares',
    };
    return titleMap[routeName] || 'Dashboard';
  };

  // Determine if we should show back button
  const shouldShowBackButton = () => {
    // If showBack prop is explicitly set, use it
    if (showBack !== undefined) {
      return showBack;
    }

    const routeName = route?.name || 'Dashboard';

    // Main tab screens should show menu button, not back button
    const mainScreens = ['MainTabs', 'DashboardTab', 'BranchesTab', 'UsersTab', 'ReportsTab'];

    // If we're on MainTabs, don't show back button
    if (mainScreens.includes(routeName)) {
      return false;
    }

    // All other screens (Invoice, Vehicles, Customers, JobCards, etc.) should show back button
    return true;
  };

  return (
    <>
      <View
        style={[
          styles.header,
          { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder },
        ]}
      >
        <View style={styles.headerLeft}>
          {shouldShowBackButton() ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}
            >
              <Image
                source={require('../../assets/back_icon_v2.png')}
                style={{ width: 30, height: 30, resizeMode: 'contain' }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                // Open drawer or menu
                navigation.dispatch(DrawerActions.openDrawer());
              }}
              style={styles.headerButton}
            >
              <Text style={[styles.menuIcon, { color: theme.headerIcon }]}>☰</Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.headerTitle, { color: theme.headerText, marginLeft: 8 }]}>{getScreenTitle()}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={onToggleTheme}
            style={styles.headerButton}
          >
            <Text style={styles.darkModeIcon}>{themeName === 'dark' ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => setProfilePopupVisible(true)}
          >
            <View style={[styles.avatar, { backgroundColor: theme.avatarBg }]}>
              <Text style={[styles.avatarText, { color: theme.avatarText }]}>
                {user?.profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ProfilePopup
        visible={profilePopupVisible}
        onClose={() => setProfilePopupVisible(false)}
      />
    </>
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

// Invoice Stack Navigator (for Invoice and InvoiceDetail)
function InvoiceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InvoiceList" component={InvoiceScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
    </Stack.Navigator>
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
      <Drawer.Screen
        name="Vehicles"
        component={VehiclesScreen}
        options={{
          title: 'Vehicles',
          drawerItemStyle: { display: 'none' }, // Hide from drawer, accessed via menu
        }}
      />
      <Drawer.Screen
        name="Customers"
        component={CustomersScreen}
        options={{
          title: 'Customers',
          drawerItemStyle: { display: 'none' }, // Hide from drawer, accessed via menu
        }}
      />
      <Drawer.Screen
        name="JobCards"
        component={JobCardsScreen}
        options={{
          title: 'Job Cards',
          drawerItemStyle: { display: 'none' }, // Hide from drawer, accessed via menu
        }}
      />
      <Drawer.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Reports',
          drawerItemStyle: { display: 'none' }, // Hide from drawer, accessed via menu
        }}
      />
      <Drawer.Screen
        name="Invoice"
        component={InvoiceStack}
        options={{
          title: 'Invoice',
        }}
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
      <Stack.Screen
        name="ActiveJobs"
        component={ActiveJobsScreen}
        options={{
          headerShown: false, // Using custom header in screen
        }}
      />
      <Stack.Screen
        name="JobCardDetail"
        component={JobCardDetailScreen}
        options={{
          headerShown: false, // Using custom header in screen
        }}
      />
      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{
          headerShown: true,
          title: 'Customer Details',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#000000',
        }}
      />
      <Stack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={{
          headerShown: true,
          title: 'Vehicle Details',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#000000',
        }}
      />
      <Stack.Screen
        name="CreateCustomer"
        component={CreateCustomerScreen}
        options={{
          headerShown: true,
          title: 'Add Customer',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#000000',
        }}
      />
      <Stack.Screen
        name="CreateVehicle"
        component={CreateVehicleScreen}
        options={{
          headerShown: true,
          title: 'Add Vehicle',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#000000',
        }}
      />
      <Stack.Screen
        name="CreateJobCard"
        component={CreateJobCardScreen}
        options={{
          headerShown: true,
          title: 'Create Job Card',
          headerStyle: { backgroundColor: '#ffffff' },
          headerTintColor: '#000000',
        }}
      />
      <Stack.Screen
        name="AccountDetails"
        component={AccountDetailsScreen}
        options={{
          headerShown: true,
          header: ({ route }) => (
            <CustomHeader
              route={route}
              theme={theme}
              themeName={themeName}
              onToggleTheme={toggleTheme}
              showBack={true}
            />
          ),
        }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{
          headerShown: true,
          header: ({ route }) => (
            <CustomHeader
              route={route}
              theme={theme}
              themeName={themeName}
              onToggleTheme={toggleTheme}
              showBack={true}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: true,
          header: ({ route }) => (
            <CustomHeader
              route={route}
              theme={theme}
              themeName={themeName}
              onToggleTheme={toggleTheme}
              showBack={true}
            />
          ),
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerShown: true,
          header: ({ route }) => (
            <CustomHeader
              route={route}
              theme={theme}
              themeName={themeName}
              onToggleTheme={toggleTheme}
              showBack={true}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          header: ({ route }) => (
            <CustomHeader
              route={route}
              theme={theme}
              themeName={themeName}
              onToggleTheme={toggleTheme}
              showBack={true}
            />
          ),
        }}
      />
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
    borderBottomColor: '#e5e7eb',
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
  darkModeIcon: {
    fontSize: 24,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuIcon: {
    fontSize: 24,
    color: '#fff',
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
