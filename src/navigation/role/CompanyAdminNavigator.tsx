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
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';

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
import BranchDetailsScreen from '@/screens/company-admin/BranchDetailsScreen';
import BranchFileUploadScreen from '@/screens/company-admin/BranchFileUploadScreen';
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
    const titleMap: Record<string, string> = {
      DashboardTab: 'Dashboard',
      MainTabs: 'Dashboard',
      Dashboard: 'Dashboard',
      BranchesTab: 'Branch Management',
      Branches: 'Branch Management',
      UsersTab: 'User Management',
      UserManagement: 'User Management',
      ReportsTab: 'Reports',
      Reports: 'Reports',
      ActiveJobs: 'Active Jobs',
      Vehicles: 'Vehicles',
      Customers: 'Customers',
      JobCards: 'Job Cards',
      Settings: 'Settings',
      ChangePassword: 'Change Password',
      AccountDetails: 'Account Details',
      Notifications: 'Notifications',
      About: 'About GarageSquares',
    };
    return titleMap[routeName] || 'Dashboard';
  };

  return (
    <>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.headerBg,
            borderBottomColor: theme.headerBorder
          },
        ]}
      >
        <View style={styles.headerLeft}>
          {showBack ? (
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

// Bottom Tab Navigator
function CompanyAdminTabs({
  theme,
  themeName,
  toggleTheme
}: {
  theme: ThemeColors;
  themeName: ThemeName;
  toggleTheme: () => void;
}) {
  const BAR_COLOR = '#4682B4';
  const ACTIVE_COLOR = '#ffffff86';
  const INACTIVE_COLOR = '#FFFFFF';

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
        },
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarShowLabel: false,
      })}
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
          headerShown: true, // Uses shared header
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
          headerShown: false,
        }}
      >
        {() => (
          <CompanyAdminTabs
            theme={theme}
            themeName={themeName}
            toggleTheme={onToggleTheme}
          />
        )}
      </Drawer.Screen>
      <Drawer.Screen
        name="Vehicles"
        component={VehiclesScreen}
        options={{
          title: 'Vehicles',
          drawerItemStyle: { display: 'none' },
        }}
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
          headerShown: true,
          title: 'Customer Details',
          headerStyle: { backgroundColor: theme.headerBg },
          headerTintColor: theme.headerText,
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
          headerShown: true,
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
