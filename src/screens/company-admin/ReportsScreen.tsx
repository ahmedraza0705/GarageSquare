// ============================================
// REPORTS SCREEN (Company Admin)
// ============================================

import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function ReportsScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View className="px-6 py-4">
        <Text style={{ color: theme.text }} className="text-2xl font-bold mb-6">
          Reports
        </Text>

        <View style={{ backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }} className="rounded-lg p-6 mb-4">
          <Text style={{ color: theme.text }} className="text-lg font-semibold mb-2">
            Coming Soon
          </Text>
          <Text style={{ color: theme.textMuted }}>
            Reports and analytics will be available here.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

