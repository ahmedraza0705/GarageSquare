// ============================================
// REPORTS SCREEN (Company Admin)
// ============================================

import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function ReportsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Reports
        </Text>
        
        <View className="bg-white rounded-lg p-6 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Coming Soon
          </Text>
          <Text className="text-gray-600">
            Reports and analytics will be available here.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

