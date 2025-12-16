
// ============================================
// COMPANY ADMIN NAVIGATOR
// ============================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, ThemeColors, ThemeName } from '@/context/ThemeContext';
import CustomDrawerContent from '@/components/navigation/CustomDrawerContent';
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
      // New titles
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
          { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder },
        ]}
      >
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
          >
            <Text style={[styles.menuIcon, { color: theme.headerIcon }]}>←</Text>
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

        <Text style={[styles.headerTitle, { color: theme.headerText }]}>{getScreenTitle()}</Text>

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

type TabIconProps = {
  type: 'grid' | 'building' | 'user' | 'bars';
  focused: boolean;
  theme: ThemeColors;
};

function TabIcon({ type, focused, theme }: TabIconProps) {
  const containerStyle = [
    styles.tabIconWrapper,
    {
      opacity: focused ? 1 : theme.tabIconInactiveOpacity,
      backgroundColor: theme.tabIconBg,
    },
  ];
  const squareStyle = [styles.tabGridSquare, { backgroundColor: theme.tabIconColor }];
  const buildingLeftStyle = [styles.tabBuildingLeft, { backgroundColor: theme.tabIconColor }];
  const buildingRightStyle = [styles.tabBuildingRight, { backgroundColor: theme.tabIconColor }];
  const userHeadStyle = [styles.tabUserHead, { backgroundColor: theme.tabIconColor }];
  const userBodyStyle = [styles.tabUserBody, { backgroundColor: theme.tabIconColor }];
  const barBlockStyle = [styles.tabBarBlock, { backgroundColor: theme.tabIconColor }];
  const fallbackStyle = [styles.tabIconFallback, { color: theme.tabIconColor }];

  switch (type) {
    case 'grid':
      return (
        <View style={containerStyle}>
          <View style={styles.tabGrid}>
            <View style={squareStyle} />
            <View style={squareStyle} />
            <View style={squareStyle} />
            <View style={squareStyle} />
          </View>
        </View>
      );
    case 'building':
      return (
        <View style={containerStyle}>
          <View style={styles.tabBuilding}>
            <View style={buildingLeftStyle} />
            <View style={buildingRightStyle} />
          </View>
        </View>
      );
    case 'user':
      return (
        <View style={containerStyle}>
          <View style={styles.tabUser}>
            <View style={userHeadStyle} />
            <View style={userBodyStyle} />
          </View>
        </View>
      );
    case 'bars':
      return (
        <View style={containerStyle}>
          <View style={styles.tabBars}>
            <View style={[barBlockStyle, styles.tabBarShort]} />
            <View style={[barBlockStyle, styles.tabBarMedium]} />
            <View style={[barBlockStyle, styles.tabBarTall]} />
          </View>
        </View>
      );
    default:
      return (
        <View style={containerStyle}>
          <Text style={fallbackStyle}>•</Text>
        </View>
      );
  }
}

// Bottom Tab Navigator
function CompanyAdminTabs({ theme }: { theme: ThemeColors }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopWidth: 1,
          borderTopColor: theme.tabBarBorder,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.tabIconColor,
        tabBarInactiveTintColor: theme.tabIconColor,
        tabBarActiveBackgroundColor: theme.tabIconBg,
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={CompanyAdminDashboard}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon type="grid" focused={focused} theme={theme} />,
        }}
      />
      <Tab.Screen
        name="BranchesTab"
        component={BranchesScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon type="building" focused={focused} theme={theme} />,
        }}
      />
      <Tab.Screen
        name="UsersTab"
        component={UsersScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon type="user" focused={focused} theme={theme} />,
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => <TabIcon type="bars" focused={focused} theme={theme} />,
        }}
      />
    </Tab.Navigator>
  );
}

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
          width: 320,
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
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          drawerItemStyle: { display: 'none' },
        }}
      />

      <Drawer.Screen
        name="AccountDetails"
        component={AccountDetailsScreen}
        options={{
          title: 'Account Details',
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer.Navigator>
  );
}

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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    zIndex: 10,
  },
  headerButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  darkModeIcon: {
    fontSize: 20,
  },
  avatarButton: {
    padding: 4,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabGrid: {
    width: 24,
    height: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tabGridSquare: {
    width: 10,
    height: 10,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    marginBottom: 3,
  },
  tabBuilding: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 26,
    height: 24,
    gap: 3,
  },
  tabBuildingLeft: {
    width: 10,
    height: 16,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  tabBuildingRight: {
    width: 12,
    height: 20,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  tabUser: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 24,
  },
  tabUserHead: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    marginBottom: 3,
  },
  tabUserBody: {
    width: 18,
    height: 8,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  tabBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 26,
    height: 24,
    gap: 3,
  },
  tabBarBlock: {
    width: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  tabBarShort: {
    height: 8,
  },
  tabBarMedium: {
    height: 13,
  },
  tabBarTall: {
    height: 18,
  },
  tabIconFallback: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
