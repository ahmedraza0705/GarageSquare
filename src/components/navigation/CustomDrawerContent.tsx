
// ============================================
// CUSTOM DRAWER CONTENT
// ============================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';

interface MenuItem {
  label: string;
  screenName?: string;
  tabScreen?: string;
  isWorking: boolean;
}

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

  // Provide default values to avoid undefined text rendering
  const language = 'English';
  const companyName = user?.profile?.branch?.name || user?.profile?.full_name || 'Company Admin';
  const location = `${user?.profile?.city || 'Surat'}, ${user?.profile?.postal_code || '395009'}, ${user?.profile?.state || 'INDIA'}`;

  const [activeLabel, setActiveLabel] = useState('Dashboard');

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
    setActiveLabel(item.label);

    if (!item.isWorking) {
      Alert.alert('Coming Soon', `${item.label} feature will be available soon.`);
      return;
    }

    if (item.screenName) {
      if (item.tabScreen) {
        // @ts-ignore
        props.navigation.navigate(item.screenName, { screen: item.tabScreen });
      } else {
        // @ts-ignore
        props.navigation.navigate(item.screenName);
      }
      props.navigation.dispatch(DrawerActions.closeDrawer());
    }
  };

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', screenName: 'MainTabs', tabScreen: 'DashboardTab', isWorking: true },
    { label: 'Branches', screenName: 'MainTabs', tabScreen: 'BranchesTab', isWorking: true },
    { label: 'Users', screenName: 'MainTabs', tabScreen: 'UsersTab', isWorking: true },
    { label: 'Job Tasks and Assignments', screenName: 'Tasks', isWorking: true },
    { label: 'Job Cards', screenName: 'JobCards', isWorking: true },
    { label: 'Vehicle Management', screenName: 'Vehicles', isWorking: true },
    { label: 'Reports', screenName: 'Reports', isWorking: true },
    { label: 'Invoice and Billing', isWorking: false },
    { label: 'Customers', screenName: 'Customers', isWorking: true },
    { label: 'Inventory', isWorking: false },
    { label: 'Shop Timing', isWorking: false },
  ];

  const footerItems: MenuItem[] = [
    { label: 'Privacy Policy', isWorking: false },
    { label: 'Settings', screenName: 'Settings', isWorking: true },
  ];

  return (
    <View style={[styles.container, { backgroundColor: '#ffffff' }]}>
      <View style={{ flex: 1 }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <Text style={styles.languageText}>{language}</Text>
              <TouchableOpacity style={styles.editIcon}>
                <Text style={{ fontSize: 16 }}>✏️</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.companyName}>{companyName}</Text>
            <Text style={styles.locationText}>{location}</Text>
          </View>

          <View style={styles.separator} />

          {/* Main Menu Items */}
          <View style={styles.menuList}>
            {menuItems.map((item, index) => {
              const isActive = activeLabel === item.label;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    isActive && styles.menuItemActive
                  ]}
                  onPress={() => handleMenuPress(item)}
                >
                  <Text style={[
                    styles.menuItemText,
                    isActive && styles.menuItemTextActive
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </DrawerContentScrollView>
      </View>

      {/* Pinned Bottom Selection */}
      <View style={styles.bottomSection}>
        {/* Separator above fixed section */}
        <View style={styles.separator} />

        <View style={styles.footerInfo}>
          {footerItems.map((item, index) => (
            <TouchableOpacity
              key={`footer-${index}`}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item)}
            >
              <Text style={styles.menuItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.separator, { marginVertical: 0 }]} />
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Image
            source={require('../../assets/logout_icon_v2.png')}
            style={styles.logoutImage}
          />
          <Text style={styles.logoutText}>Logout</Text>
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
    backgroundColor: '#ffffff',
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
    color: '#000000',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    width: '100%',
  },
  menuList: {
    paddingVertical: 8,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  menuItemActive: {
    backgroundColor: '#e0f2fe',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  menuItemTextActive: {
    color: '#000000',
  },
  footerInfo: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  bottomSection: {
    backgroundColor: '#ffffff',
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
    color: '#ef4444',
  },
});
