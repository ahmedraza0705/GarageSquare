
// ============================================
// CUSTOM DRAWER CONTENT
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerActions, useNavigationState, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  label: string;
  screenName?: string;
  tabScreen?: string;
  params?: any; // Added params support
  isWorking: boolean;
}

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, signOut } = useAuth();
  const [_, forceUpdate] = useState(0);

  // Provide default values to avoid undefined text rendering
  const language = 'English';
  const companyName = user?.profile?.branch?.name || user?.profile?.full_name || 'Company Admin';
  const location = `${user?.profile?.city || 'Surat'}, ${user?.profile?.postal_code || '395009'}, ${user?.profile?.state || 'INDIA'}`;

  // Get the active route name using standard helpers
  // This hook ensures re-render on any navigation state change
  const navState = useNavigationState(state => state);

  const getActiveRouteName = (state: any): string => {
    if (!state || !state.routes) return 'Dashboard';
    const route = state.routes[state.index];

    // If there's a nested state, use it (specifically for nested navigators)
    if (route.state) {
      return getActiveRouteName(route.state);
    }

    // Attempt to get the name from the route using the helper
    const childRouteName = getFocusedRouteNameFromRoute(route);
    if (childRouteName) {
      return childRouteName;
    }

    return route.name;
  };

  const activeRoute = getActiveRouteName(navState);
  const currentParentRoute = navState.routes[navState.index].name;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  // Removed local activeLabel state as highlight is derived from navigation state

  const handleMenuPress = (item: MenuItem) => {
    if (!item.isWorking) {
      Alert.alert('Coming Soon', `${item.label} feature will be available soon.`);
      return;
    }

    // Navigation is handled by the hook, no need for local state to drive highlight
    // setActiveLabel(item.label);

    if (item.screenName) {
      if (item.tabScreen) {
        // @ts-ignore - navigating into nested tabs
        props.navigation.navigate(item.screenName, { screen: item.tabScreen });
      } else {
        // @ts-ignore
        props.navigation.navigate(item.screenName);
      }
      props.navigation.dispatch(DrawerActions.closeDrawer());
    }
  };

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', screenName: 'MainTabs', tabScreen: 'DashboardTab', params: { screen: 'Dashboard' }, isWorking: true },
    { label: 'Branches', screenName: 'MainTabs', tabScreen: 'BranchesTab', isWorking: true },
    { label: 'Users', screenName: 'MainTabs', tabScreen: 'UsersTab', isWorking: true },
    { label: 'Job Tasks and Assignments', isWorking: false },
    { label: 'Job Cards', screenName: 'JobCards', isWorking: true },
    { label: 'Vehicle Management', screenName: 'Vehicles', isWorking: true },
    { label: 'Reports', screenName: 'MainTabs', tabScreen: 'ReportsTab', isWorking: true },
    { label: 'Invoice', screenName: 'Invoice', isWorking: true },
    { label: 'Customers', screenName: 'Customers', isWorking: true },
    { label: 'Inventory', isWorking: false },
    { label: 'Shop Timing', isWorking: false },
  ];

  const footerItems: MenuItem[] = [
    { label: 'Privacy Policy', isWorking: false },
    { label: 'Settings', screenName: 'Settings', isWorking: true },
  ];

  const getActiveLabel = () => {
    const allItems = [...menuItems, ...footerItems];

    // Priority 1: Match specifically for known detail/sub-screens to their parent category
    if (activeRoute === 'CustomerDetail' || activeRoute === 'CreateCustomer' || activeRoute === 'Customers') return 'Customers';
    if (activeRoute === 'VehicleDetail' || activeRoute === 'CreateVehicle' || activeRoute === 'Vehicles') return 'Vehicle Management';
    if (activeRoute === 'JobCardDetail' || activeRoute === 'CreateJobCard' || activeRoute === 'ActiveJobs') return 'Job Cards';
    if (activeRoute === 'BranchDetails' || activeRoute === 'BranchFileUpload') return 'Branches';
    if (activeRoute === 'AccountDetails' || activeRoute === 'ChangePassword' || activeRoute === 'Notifications' || activeRoute === 'About') return 'Settings';

    // Priority 2: Match by exact screen name or tab screen name
    const activeItem = allItems.find(item =>
      item.screenName === activeRoute ||
      item.tabScreen === activeRoute ||
      (item.screenName === 'MainTabs' && item.tabScreen === activeRoute)
    );

    if (activeItem) return activeItem.label;

    // Priority 3: Fallback manual matches for tab names
    if (activeRoute === 'DashboardTab') return 'Dashboard';
    if (activeRoute === 'BranchesTab' || activeRoute === 'Branches') return 'Branches';
    if (activeRoute === 'UsersTab') return 'Users';
    if (activeRoute === 'ReportsTab' || activeRoute === 'Reports') return 'Reports';

    // Priority 4: Partial match logic for safety
    if (activeRoute.includes('Dashboard')) return 'Dashboard';
    if (activeRoute.includes('Branches')) return 'Branches';
    if (activeRoute.includes('Users')) return 'Users';
    if (activeRoute.includes('Reports')) return 'Reports';

    return 'Dashboard';
  };

  const currentActiveLabel = getActiveLabel();

  const { theme, themeName } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.drawerBackground }]}>
      <View style={{ flex: 1 }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <View style={[styles.header, { backgroundColor: theme.drawerBackground }]}>
            <View style={styles.headerTopRow}>
              <Text style={styles.languageText}>{language}</Text>
              <TouchableOpacity style={styles.editIcon}>
                <Ionicons name="pencil" size={18} color="#EAB308" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.companyName, { color: theme.text }]}>{companyName}</Text>
            <Text style={[styles.locationText, { color: theme.textMuted }]}>{location}</Text>
          </View>

          <View style={[styles.separator, { backgroundColor: theme.border }]} />

          {/* Main Menu Items */}
          <View style={styles.menuList}>
            {menuItems.map((item, index) => {
              const isActive = currentActiveLabel === item.label;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    isActive && {
                      backgroundColor: themeName === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                      borderLeftColor: '#3B82F6',
                    },
                    isActive && styles.menuItemActiveBorder
                  ]}
                  onPress={() => handleMenuPress(item)}
                >
                  <Text style={[
                    styles.menuItemText,
                    { color: isActive ? '#3B82F6' : theme.text }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </DrawerContentScrollView>
      </View >

      {/* Pinned Bottom Selection */}
      < View style={[styles.bottomSection, { backgroundColor: theme.drawerBackground }]} >
        {/* Separator above fixed section */}
        < View style={[styles.separator, { backgroundColor: theme.border }]} />

        <View style={styles.footerInfo}>
          {footerItems.map((item, index) => (
            <TouchableOpacity
              key={`footer-${index}`}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
            >
              <Text style={[styles.menuItemText, { color: theme.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.separator, { marginVertical: 0, backgroundColor: theme.border }]} />
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Image
            source={require('../../assets/logout_icon_v2.png')}
            style={[styles.logoutImage, { tintColor: theme.notification }]}
          />
          <Text style={[styles.logoutText, { color: theme.notification }]}>Logout</Text>
        </TouchableOpacity>
      </View >
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingTop: 0,
  },
  header: {
    padding: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  languageText: {
    color: '#3b82f6', // Blueish
    fontSize: 14,
    fontWeight: '600',
  },
  editIcon: {
    padding: 4,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    width: '100%',
  },
  menuList: {
    paddingVertical: 8,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  menuItemActiveBorder: {
    borderLeftWidth: 4,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerInfo: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  bottomSection: {
    paddingBottom: 16, // Safe area padding
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  logoutImage: {
    width: 20,
    height: 20,
    marginRight: 12,
    resizeMode: 'contain',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
