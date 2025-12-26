// ============================================
// CUSTOM DRAWER CONTENT
// ============================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerActions, useNavigationState, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface MenuItem {
  label: string;
  screenName?: string;
  tabScreen?: string;
  params?: any;
  nestedScreen?: string;
  isWorking: boolean;
}

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, signOut } = useAuth();
  const { theme, themeName } = useTheme();

  // Provide default values to avoid undefined text rendering
  const language = 'English';
  const companyName = user?.profile?.branch?.name || user?.profile?.full_name || 'Company Admin';
  const location = `${user?.profile?.city || 'Surat'}, ${user?.profile?.postal_code || '395009'}, ${user?.profile?.state || 'INDIA'}`;

  // Get the active route name using standard helpers
  const navState = useNavigationState(state => state);

  const getActiveRouteName = (state: any): string => {
    if (!state || !state.routes) return 'Dashboard';
    const route = state.routes[state.index];

    if (route.state) {
      return getActiveRouteName(route.state);
    }

    const childRouteName = getFocusedRouteNameFromRoute(route);
    if (childRouteName) {
      return childRouteName;
    }

    return route.name;
  };

  const activeRoute = getActiveRouteName(navState);

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', screenName: 'MainTabs', tabScreen: 'DashboardTab', nestedScreen: 'DashboardHome', isWorking: true },
    { label: 'Branches', screenName: 'MainTabs', tabScreen: 'BranchesTab', isWorking: true },
    { label: 'Users', screenName: 'MainTabs', tabScreen: 'UsersTab', isWorking: true },
    { label: 'Job Tasks and Assignments', screenName: 'JobTasks', isWorking: true },
    { label: 'Job Cards', screenName: 'JobCards', isWorking: true },
    {
      label: 'Vehicle Management',
      screenName: 'MainTabs',
      tabScreen: 'DashboardTab',
      nestedScreen: 'Vehicles',
      isWorking: true
    },
    { label: 'Reports', screenName: 'Reports', isWorking: true },
    { label: 'Invoice and Billing', screenName: 'Invoice', isWorking: true },
    { label: 'Customers', screenName: 'Customers', isWorking: true },
    { label: 'Inventory', screenName: 'Inventory', isWorking: true },
    { label: 'Shop Timing', isWorking: false },
  ];

  const footerItems: MenuItem[] = [
    { label: 'Privacy Policy', isWorking: false },
    { label: 'Settings', screenName: 'Settings', isWorking: true },
  ];

  const getActiveLabel = () => {
    const allItems = [...menuItems, ...footerItems];

    if (activeRoute === 'CustomerDetail' || activeRoute === 'CreateCustomer' || activeRoute === 'Customers') return 'Customers';
    if (activeRoute === 'VehicleDetail' || activeRoute === 'CreateVehicle' || activeRoute === 'Vehicles') return 'Vehicle Management';
    if (activeRoute === 'JobCardDetail' || activeRoute === 'CreateJobCard' || activeRoute === 'ActiveJobs') return 'Job Cards';
    if (activeRoute === 'BranchDetails' || activeRoute === 'BranchFileUpload') return 'Branches';
    if (activeRoute === 'AccountDetails' || activeRoute === 'ChangePassword' || activeRoute === 'Notifications' || activeRoute === 'About') return 'Settings';

    const activeItem = allItems.find(item =>
      item.screenName === activeRoute ||
      item.tabScreen === activeRoute ||
      (item.screenName === 'MainTabs' && item.tabScreen === activeRoute)
    );

    if (activeItem) return activeItem.label;

    if (activeRoute === 'DashboardTab') return 'Dashboard';
    if (activeRoute === 'BranchesTab' || activeRoute === 'Branches') return 'Branches';
    if (activeRoute === 'UsersTab') return 'Users';
    if (activeRoute === 'ReportsTab' || activeRoute === 'Reports') return 'Reports';

    return 'Dashboard';
  };

  const currentActiveLabel = getActiveLabel();

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

  const handleMenuPress = (item: MenuItem) => {
    if (!item.isWorking) {
      Alert.alert('Coming Soon', `${item.label} feature will be available soon.`);
      return;
    }

    if (item.screenName) {
      if (item.tabScreen && item.nestedScreen) {
        // @ts-ignore
        props.navigation.navigate(item.screenName, {
          screen: item.tabScreen,
          params: { screen: item.nestedScreen }
        });
      } else if (item.tabScreen) {
        // @ts-ignore
        props.navigation.navigate(item.screenName, { screen: item.tabScreen });
      } else {
        // @ts-ignore
        props.navigation.navigate(item.screenName);
      }
      props.navigation.dispatch(DrawerActions.closeDrawer());
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.drawerBackground }]}>
      <View style={{ flex: 1 }}>
        <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.header, { backgroundColor: theme.drawerBackground }]}>
            <View style={styles.headerTopRow}>
              <Text style={[styles.languageText, { color: theme.primary }]}>{language}</Text>
              <TouchableOpacity style={styles.editIcon}>
                <Ionicons name="pencil" size={18} color={theme.primary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.companyName, { color: theme.text }]}>{companyName}</Text>
            <Text style={[styles.locationText, { color: theme.textMuted }]}>{location}</Text>
          </View>

          <View style={[styles.separator, { backgroundColor: theme.border }]} />

          <View style={styles.menuList}>
            {menuItems.map((item, index) => {
              const isActive = currentActiveLabel === item.label;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    isActive && {
                      backgroundColor: theme.tabIconBg,
                      borderLeftColor: theme.primary,
                      borderLeftWidth: 4,
                    }
                  ]}
                  onPress={() => handleMenuPress(item)}
                >
                  <Text style={[
                    styles.menuItemText,
                    { color: isActive ? theme.primary : theme.text }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </DrawerContentScrollView>
      </View>

      <View style={[styles.bottomSection, { backgroundColor: theme.drawerBackground }]}>
        <View style={[styles.separator, { backgroundColor: theme.border }]} />
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
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={theme.notification} style={{ marginRight: 12 }} />
          <Text style={[styles.logoutText, { color: theme.notification }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footerInfo: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  bottomSection: {
    paddingBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
