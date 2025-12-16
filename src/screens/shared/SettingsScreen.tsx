// ============================================
// SETTINGS SCREEN
// ============================================

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import Button from '@/components/shared/Button';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { role } = useRole();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
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

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-6 py-4">
        <View className="bg-white rounded-lg p-6 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">
            Profile Information
          </Text>
          
          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Name</Text>
            <Text className="text-base text-gray-900">
              {user?.profile?.full_name || 'N/A'}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Email</Text>
            <Text className="text-base text-gray-900">
              {user?.email || 'N/A'}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Phone</Text>
            <Text className="text-base text-gray-900">
              {user?.profile?.phone || 'N/A'}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Role</Text>
            <Text className="text-base text-gray-900 capitalize">
              {role?.replace('_', ' ') || 'N/A'}
            </Text>
          </View>
        </View>

        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
        />
      </View>
    </ScrollView>
  );
}

