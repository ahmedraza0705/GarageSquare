// ============================================
// COMPANY ADMIN NAVIGATOR
// ============================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions, useNavigation, getFocusedRouteNameFromRoute } from '@react-navigation/native';
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
import { Ionicons } from '@expo/vector-icons';

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
import InventoryScreen from '@/screens/company-admin/InventoryScreen';
import ActiveJobsScreen from '@/screens/company-admin/ActiveJobsScreen';
import JobCardDetailScreen from '@/screens/shared/JobCardDetailScreen';
import SettingsScreen from '@/screens/shared/SettingsScreen';
import CustomerDetailScreen from '@/screens/shared/CustomerDetailScreen';
import VehicleDetailScreen from '@/screens/shared/VehicleDetailScreen';
import CreateCustomerScreen from '@/screens/shared/CreateCustomerScreen';
import CreateVehicleScreen from '@/screens/shared/CreateVehicleScreen';
import CreateJobCardScreen from '@/screens/shared/CreateJobCardScreen';
import BranchDetailsScreen from '@/screens/company-admin/BranchDetailsScreen';
import BranchFileUploadScreen from '@/screens/company-admin/BranchFileUploadScreen';
import ChangePasswordScreen from '@/screens/shared/Chan13gePasswordScreen';
import AccountDetailsScreen from '@/screens/shared/AccountDetailsScreen';
import NotificationsScreen from '@/screens/shared/NotificationsScreen';
import AboutScreen from '@/screens/shared/AboutScreen';
import ProfilePopup from '@/components/navigation/ProfilePopup';


const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const DashboardInnerStack = createNativeStackNavigator();

function DashboardStackNavigator() {
  const { theme, themeName, toggleTheme } = useTheme();

  return (
    <DashboardInnerStack.Navigator
      screenOptions={{
        header: ({ route }) => (
          <CustomHeader
            route={route}
            theme={theme}
            themeName={themeName}
            onToggleTheme={toggleTheme}
            showBack={route.name !== 'DashboardHome'}
          />
        ),
        headerShown: true,
      }}
    >
      <DashboardInnerStack.Screen
        name="DashboardHome"
        component={CompanyAdminDashboard}
      />
      <DashboardInnerStack.Screen
        name="Vehicles"
        component={VehiclesScreen}
      />
      <DashboardInnerStack.Screen
        name="Customers"
        component={CustomersScreen}
      />
    </DashboardInnerStack.Navigator>
  );
}

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
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
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
      // Navigators
      DashboardTab: 'Dashboard',
      MainTabs: 'Dashboard',
      DashboardStack: 'Dashboard',

      // Screens
      DashboardHome: 'Dashboard',
      Vehicles: 'Vehicles Management', // Plural to match Pic 2
      Customers: 'Customers',

      // Tabs
      BranchesTab: 'Branches',
      UsersTab: 'User Management',
      ReportsTab: 'Reports',

      // Other Screens
      Branches: 'Branches',
      UserManagement: 'User Management',
      Reports: 'Reports',
      InvoiceTab: 'Estimate',
      Invoice: 'Estimate',
      InvoiceList: 'Estimate',
      InvoiceDetail: 'Invoice Detail',
      ActiveJobs: 'Active Jobs',
      JobCards: 'Job Cards',
      Settings: 'Settings',
      ChangePassword: 'Change Password',
      AccountDetails: 'Account Details',
      Notifications: 'Notifications',
      About: 'About GarageSquares',
    };

    // 2. Try to get the deepest focused route name
    const getDeepestRouteName = (r: any): string => {
      const name = getFocusedRouteNameFromRoute(r);
      if (name) {
        // If we found a name, check if it's a tab or stack container that might have more nesting
        if (name === 'DashboardTab' || name === 'MainTabs') {
          // This is a bit of a hack since we don't have the state object here directly,
          // but we can check if it exists in the route object's state
          const state = r.state;
          if (state && state.routes && state.index !== undefined) {
            return getDeepestRouteName(state.routes[state.index]);
          }
        }
        return name;
      }
      return r.name;
    };

    const deepestRouteName = getDeepestRouteName(route);
    return titleMap[deepestRouteName] || deepestRouteName || 'Dashboard';
  };

  const screenTitle = getScreenTitle();
  const isDashboard = screenTitle === 'Dashboard';

  // Match body background for seamless look in Light Mode for specific screens
  const seamlessScreens = ['Dashboard', 'Branch Management', 'Branches', 'User Management', 'Reports'];
  const isSeamless = seamlessScreens.includes(screenTitle);

  const headerBackgroundColor = (isSeamless && themeName === 'light')
    ? theme.background
    : theme.headerBg;

  // Determine if we should show back button
  const shouldShowBackButton = () => {
    // If showBack prop is explicitly set, use it
    if (showBack !== undefined) {
      return showBack;
    }

    const routeName = route?.name || 'Dashboard';

    // List of screens that should show menu button (hamburger) instead of back button
    // These are primary drawer screens
    const drawerScreens = ['MainTabs', 'DashboardTab', 'BranchesTab', 'UsersTab', 'ReportsTab', 'Vehicles', 'Customers', 'Inventory', 'JobCards'];

    // If we're on a drawer screen, don't show back button
    if (drawerScreens.includes(routeName) || drawerScreens.includes(route?.name)) {
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
          {
            backgroundColor: headerBackgroundColor,
            borderBottomColor: theme.headerBorder,
            // Remove border for seamless dashboard look
            // Remove border for seamless look
            borderBottomWidth: isSeamless ? 0 : 1,
            paddingBottom: 8,
            height: 60, // Fixed height since parent SafeAreaView handles the notch
          },
        ]}
      >
        <View style={styles.headerLeft}>
          {shouldShowBackButton() ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerButton}
            >
              <Ionicons name="chevron-back" size={28} color={theme.headerIcon} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                navigation.dispatch(DrawerActions.openDrawer());
              }}
              style={styles.headerButton}
            >
              <Ionicons name="menu" size={28} color={theme.headerIcon} />
            </TouchableOpacity>
          )}

          <Text style={[styles.headerTitle, { color: theme.headerText, marginLeft: 8 }]}>{getScreenTitle()}</Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={onToggleTheme}
            style={[
              styles.headerButton,
              {
                backgroundColor: themeName === 'dark' ? '#60A5FA' : '#DBEAFE',
                width: 36,
                height: 36,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }
            ]}
          >
            <Ionicons
              name={themeName === 'dark' ? 'sunny' : 'moon'}
              size={18}
              color={themeName === 'dark' ? '#1E3A8A' : '#1E40AF'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.avatarButton,
              {
                backgroundColor: themeName === 'dark' ? '#FCA5A5' : '#FECACA',
                width: 36,
                height: 36,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
              }
            ]}
            onPress={() => setProfilePopupVisible(true)}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: themeName === 'dark' ? '#7F1D1D' : '#991B1B',
            }}>
              {(user?.profile?.full_name?.[0] || user?.email?.[0] || 'A').toUpperCase()}
            </Text>
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

// Dashboard Stack (to show bottom bar on nested screens)
function DashboardStack() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Dashboard" component={CompanyAdminDashboard} />
    </Stack.Navigator>
  );
}

// Bottom Tab Navigator
function CompanyAdminTabs() {
  const { theme, themeName, toggleTheme } = useTheme();
  // Use theme colors instead of hardcoded values
  const BAR_COLOR = theme.tabBarBg;
  const ACTIVE_COLOR = theme.tabIconColor;
  const INACTIVE_COLOR = themeName === 'dark' ? '#9CA3AF' : '#E5E7EB'; // Muted color for inactive

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => (
          <CustomHeader
            route={route}
            theme={theme}
            themeName={themeName}
            onToggleTheme={toggleTheme}
          />
        ),
        headerShown: true,
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
          elevation: 8,
          zIndex: 50,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          borderTopColor: theme.tabBarBorder, // Add if needed
        },
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[
              focused ? styles.activeTabIcon : null,
              { backgroundColor: focused ? theme.tabIconBg : 'transparent' }
            ]}>
              <LayoutDashboard color={color} size={24} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="BranchesTab"
        component={BranchesScreen}
        options={{
          headerShown: true, // Uses shared header
          tabBarIcon: ({ color, size, focused }) => (
            <View style={[
              focused ? styles.activeTabIcon : null,
              { backgroundColor: focused ? theme.tabIconBg : 'transparent' }
            ]}>
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
            <View style={[
              focused ? styles.activeTabIcon : null,
              { backgroundColor: focused ? theme.tabIconBg : 'transparent' }
            ]}>
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
            <View style={[
              focused ? styles.activeTabIcon : null,
              { backgroundColor: focused ? theme.tabIconBg : 'transparent' }
            ]}>
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
function CompanyAdminDrawer() {
  const { theme, themeName, toggleTheme } = useTheme();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        header: () => (
          <CustomHeader
            route={route}
            theme={theme}
            themeName={themeName}
            onToggleTheme={toggleTheme}
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
        component={CompanyAdminTabs}
        options={{
          title: 'Dashboard',
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          title: 'Inventory',
          drawerItemStyle: { display: 'none' }, // Hide from drawer, accessed via menu
        }}
      />
      <Drawer.Screen
        name="LegacyVehiclesHidden" // Renamed further to ensure no overlap
        component={VehiclesScreen}
        options={{
          title: 'Vehicles',
          headerShown: false,
          drawerItemStyle: { display: 'none' },
        }}
      // Redirect to the tab stack version if accessed via Drawer
      />
      <Drawer.Screen
        name="Customers"
        component={CustomersScreen}
        options={{
          title: 'Customers',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="JobCards"
        component={JobCardsScreen}
        options={{
          title: 'Job Cards',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Reports',
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
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
      <Stack.Screen name="Main" component={CompanyAdminDrawer} />
      <Stack.Screen
        name="ActiveJobs"
        component={ActiveJobsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="JobCardDetail"
        component={JobCardDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={{
          headerShown: true,
          title: 'Vehicle Details',
          headerStyle: { backgroundColor: theme.headerBg },
          headerTintColor: theme.headerText,
        }}
      />
      <Stack.Screen
        name="CreateCustomer"
        component={CreateCustomerScreen}
        options={{
          headerShown: false,
          title: 'Add Customer',
          headerStyle: { backgroundColor: theme.headerBg },
          headerTintColor: theme.headerText,
        }}
      />
      <Stack.Screen
        name="CreateVehicle"
        component={CreateVehicleScreen}
        options={{
          headerShown: true,
          title: 'Add Vehicle',
          headerStyle: { backgroundColor: theme.headerBg },
          headerTintColor: theme.headerText,
        }}
      />
      <Stack.Screen
        name="CreateJobCard"
        component={CreateJobCardScreen}
        options={{
          headerShown: true,
          title: 'Create Job Card',
          headerStyle: { backgroundColor: theme.headerBg },
          headerTintColor: theme.headerText,
        }}
      />
      <Stack.Screen
        name="BranchDetails"
        component={BranchDetailsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BranchFileUpload"
        component={BranchFileUploadScreen}
        options={{
          headerShown: false,
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    padding: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarButton: {
    padding: 0,
  },
  activeTabIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 12,
  }
});
