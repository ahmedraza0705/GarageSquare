
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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
      icon: <Feather name="user" size={24} color="#000" />,
      screen: 'AccountDetails'
    },
    {
      title: 'Notifications',
      icon: <Feather name="bell" size={24} color="#000" />,
      screen: 'Notifications'
    },
    {
      title: 'Help and Support',
      icon: <Feather name="headphones" size={24} color="#000" />,
      screen: 'Support'
    },
    {
      title: 'Language',
      icon: <Ionicons name="text" size={24} color="#000" />,
      screen: 'Language'
    },
    {
      title: 'About GarageSquares',
      icon: <Feather name="info" size={24} color="#000" />,
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
              style={styles.menuItemCard}
              onPress={() => handlePress(item)}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  {item.icon}
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#000" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutCard}
          onPress={handleLogout}
        >
          <View style={styles.menuLeft}>
            <View style={styles.iconContainer}>
              {/* Using Custom Logout Image */}
              <Image
                source={require('../../assets/logout_icon_v2.png')}
                style={{ width: 24, height: 24, resizeMode: 'contain' }}
              />
            </View>
            <Text style={[styles.menuTitle, { color: '#FF4242' }]}>Log Out</Text>
          </View>
        </TouchableOpacity>
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
    gap: 12, // Gap between cards
  },
  menuItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700', // Bold as in the image
    color: '#000',
  },
});
