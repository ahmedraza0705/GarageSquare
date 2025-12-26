import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ImageBackground, Image, Dimensions } from 'react-native';
import { useTheme, typography } from '@/context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const { width } = Dimensions.get('window');

export default function StartingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <StatusBar barStyle={theme.statusBarStyle} translucent backgroundColor="transparent" />

      <ImageBackground
        source={require('@/assets/starting_bg_new.png')}
        style={styles.backgroundContainer}
        resizeMode="cover"
      >
        {/* Subtle Dark Overlay to help white text visibility */}
        <View style={styles.darkOverlay} />

        {/* Content Container */}
        <View className="flex-1 justify-center items-center px-6">
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={require('@/assets/starting_logo_final.png')}
              style={styles.logoImage}
              resizeMode="contain"
              fadeDuration={0}
            />
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            {/* Get Started Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
              style={[styles.button, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't Have An Account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={[styles.signupLink, { color: theme.secondary }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)', // Very subtle overlay
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -60,
  },
  logoImage: {
    width: width * 0.7,
    height: 180,
  },
  bottomSection: {
    width: '100%',
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  button: {
    height: 62,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.title1.fontSize,
    fontFamily: typography.title1.fontFamily,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#FFFFFF',
    fontSize: typography.body2.fontSize,
    fontFamily: typography.body2.fontFamily,
  },
  signupLink: {
    fontSize: typography.body2.fontSize,
    fontFamily: 'sans-serif-Bold',
  },
});
