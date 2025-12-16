// ============================================
// CUSTOM DRAWER CONTENT
// ============================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';

interface MenuItem {
  label: string;
  screenName?: string;
  tabScreen?: string;
  icon?: string;
  isWorking: boolean;
  onPress?: () => void;
}

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme, themeName } = useTheme();
  const [language, setLanguage] = useState('English');
  const [activeLabel, setActiveLabel] = useState('Dashboard');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from this account?',
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
    } else if (item.onPress) {
      item.onPress();
      props.navigation.dispatch(DrawerActions.closeDrawer());
    }
  };

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', screenName: 'MainTabs', tabScreen: 'DashboardTab', isWorking: true },
    { label: 'Branches', screenName: 'MainTabs', tabScreen: 'BranchesTab', isWorking: true },
    { label: 'Users', screenName: 'MainTabs', tabScreen: 'UsersTab', isWorking: true },
    { label: 'Job Tasks and Assignments', screenName: 'ActiveJobs', isWorking: true },
    { label: 'Job Cards', screenName: 'JobCards', isWorking: true },
    { label: 'Vehicle Management', screenName: 'Vehicles', isWorking: true },
    { label: 'Reports', screenName: 'Reports', isWorking: true },
    { label: 'Invoice and Billing', isWorking: false },
    { label: 'Customers', screenName: 'Customers', isWorking: true },
    { label: 'Inventory', isWorking: false },
    { label: 'Shop Timing', isWorking: false },
    { label: 'Privacy Policy', isWorking: false },
    { label: 'Settings', screenName: 'Settings', isWorking: true },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.drawerBackground }]}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.drawerBackground }]}
      >
        {/* Top Bar */}
        <View style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <View style={styles.languageSelector}>
            <Text style={[styles.languageText, { color: theme.text }]}>{language}</Text>
            <Text style={[styles.dropdownIcon, { color: theme.textMuted }]}>▼</Text>
          </View>
          <View style={styles.topBarRight}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={styles.iconButton}
            >
              <Text style={[styles.iconText, { color: theme.headerIcon }]}>
                {themeName === 'dark' ? '☀️' : '🌙'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={[styles.iconText, { color: theme.headerIcon }]}>✏️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Profile Section */}
        <View
          style={[
            styles.profileSection,
            { backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}
        >
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              <Text style={[styles.avatarEmoji, { color: theme.onPrimary }]}>👤</Text>
            </View>
          </View>
          <Text style={[styles.companyName, { color: theme.text }]}>
            {user?.profile?.company_name || 'Company Admin'}
          </Text>
          <Text style={[styles.companyAddress, { color: theme.textMuted }]}>
            {user?.profile?.city || 'Surat'}, {user?.profile?.postal_code || '395009'} ,{' '}
            {user?.profile?.country || 'INDIA'}
          </Text>
        </View>

        {/* Menu Items */}
        <View style={[styles.menuContainer, { backgroundColor: theme.surface }]}>
          {menuItems.map((item, index) => {
            const isLastItem = index === menuItems.length - 1;
            const isActive = activeLabel === item.label;

            return (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    styles.menuItem,
                    !isLastItem && { borderBottomColor: theme.border },
                    !item.isWorking && { backgroundColor: theme.disabledBg },
                    isActive && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => handleMenuPress(item)}
                  disabled={!item.isWorking}
                >
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: theme.text },
                      !item.isWorking && { color: theme.textMuted },
                      isActive && { color: theme.onPrimary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.primary }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: theme.onPrimary }]}>Logout</Text>
        </TouchableOpacity>
      </DrawerContentScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginHorizontal: 16,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  languageText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#6b7280',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  iconText: {
    fontSize: 18,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  companyAddress: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  menuItemActive: {
    backgroundColor: '#d7e5f6',
    borderRadius: 12,
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuItemText: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '700',
  },
  menuItemTextDisabled: {
    color: '#9ca3af',
  },
  menuItemTextActive: {
    color: '#0f172a',
  },
  logoutButton: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    textAlign: 'center',
  },
});

