
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    {
      title: 'Account Details',
      icon: '👤',
      screen: 'AccountDetails'
    },
    {
      title: 'Notifications',
      icon: '🔔',
      screen: 'Notifications'
    },
    {
      title: 'Help and Support',
      icon: '🎧',
      screen: 'Support' // Not implemented yet
    },
    {
      title: 'Language',
      icon: '文',
      screen: 'Language' // Not implemented yet
    },
    {
      title: 'About GarageSquares',
      icon: 'ℹ️',
      screen: 'About'
    },
  ];

  const handlePress = (item: any) => {
    if (item.screen) {
      if (['Support', 'Language'].includes(item.screen)) {
        console.warn('Screen not implemented:', item.screen);
        return;
      }
      navigation.navigate(item.screen as never);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#f3f4f6' }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handlePress(item)}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>{item.icon}</Text>
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.menuContainer, { marginTop: 24 }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={handleLogout}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🚪</Text>
              </View>
              <Text style={[styles.menuTitle, { color: '#ef4444' }]}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 18,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  chevron: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
});
