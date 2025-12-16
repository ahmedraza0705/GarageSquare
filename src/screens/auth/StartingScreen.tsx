// ============================================
// STARTING SCREEN
// ============================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function StartingScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View className="flex-1">
      {/* Background - Using gradient as placeholder for garage image */}
      <View style={styles.backgroundContainer}>
        {/* Garage-like background color (gray tones) */}
        <View style={styles.backgroundGradient} />
        
        {/* Dark Overlay */}
        <View style={styles.darkOverlay} />

        {/* Content */}
        <View className="flex-1 justify-center items-center px-6">
          {/* Logo */}
          <View className="items-center" style={styles.logoSection}>
            <View style={styles.logoContainer}>
              {/* Main Gear with Star */}
              <View style={styles.gearContainer}>
                {/* Gear Circle */}
                <View style={styles.gearCircle}>
                  {/* Star in center */}
                  <Text style={styles.star}>⭐</Text>
                </View>
                
                {/* Gear teeth - positioned around the circle */}
                <View style={[styles.gearTooth, styles.gearToothTop]} />
                <View style={[styles.gearTooth, styles.gearToothBottom]} />
                <View style={[styles.gearTooth, styles.gearToothLeft]} />
                <View style={[styles.gearTooth, styles.gearToothRight]} />
                
                {/* Wings - left */}
                <View style={styles.wingLeft}>
                  <View style={[styles.wingShape, { transform: [{ rotate: '-45deg' }] }]} />
                </View>
                {/* Wings - right */}
                <View style={styles.wingRight}>
                  <View style={[styles.wingShape, { transform: [{ rotate: '45deg' }] }]} />
                </View>
              </View>

              {/* Crossed Wrenches Below */}
              <View style={styles.wrenchesContainer}>
                <View style={[styles.wrench, styles.wrench1]} />
                <View style={[styles.wrench, styles.wrench2]} />
              </View>
            </View>
          </View>

          {/* Bottom Section */}
          <View className="absolute bottom-12 w-full px-6">
            {/* Get Started Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="bg-blue-600 py-4 rounded-lg items-center justify-center mb-4"
              style={styles.button}
            >
              <Text className="text-white font-bold text-lg">Get Started</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center">
              <Text className="text-white text-base">Don't Have An Account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text className="text-orange-500 font-semibold underline text-base">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#2d3748', // Garage-like dark gray background
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#4a5568', // Lighter gray for depth
    opacity: 0.5,
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark overlay
  },
  logoSection: {
    marginBottom: 80,
  },
  logoContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gearContainer: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gearCircle: {
    width: 96,
    height: 96,
    borderWidth: 4,
    borderColor: '#2563eb',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  star: {
    fontSize: 36,
    color: '#2563eb',
  },
  gearTooth: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: '#2563eb',
    borderRadius: 12,
  },
  gearToothTop: {
    top: -12,
    left: '50%',
    marginLeft: -12,
  },
  gearToothBottom: {
    bottom: -12,
    left: '50%',
    marginLeft: -12,
  },
  gearToothLeft: {
    left: -12,
    top: '50%',
    marginTop: -12,
  },
  gearToothRight: {
    right: -12,
    top: '50%',
    marginTop: -12,
  },
  wingLeft: {
    position: 'absolute',
    left: -40,
    top: '50%',
    marginTop: -16,
    width: 64,
    height: 32,
  },
  wingRight: {
    position: 'absolute',
    right: -40,
    top: '50%',
    marginTop: -16,
    width: 64,
    height: 32,
  },
  wingShape: {
    width: 64,
    height: 32,
    backgroundColor: '#2563eb',
    borderRadius: 16,
  },
  wrenchesContainer: {
    position: 'absolute',
    top: 140,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrench: {
    position: 'absolute',
    width: 32,
    height: 4,
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  wrench1: {
    transform: [{ rotate: '45deg' }],
  },
  wrench2: {
    transform: [{ rotate: '-45deg' }],
  },
  button: {
    width: '100%',
    minHeight: 55,
  },
});

