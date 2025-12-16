// ============================================
// CUSTOMER DASHBOARD
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function CustomerDashboard() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    vehicles: 0,
    activeServices: 0,
    completedServices: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Check if Supabase is disabled
      if (!supabase) {
        console.warn('Supabase is disabled - using default stats');
        setStats({
          vehicles: 0,
          activeServices: 0,
          completedServices: 0,
        });
        return;
      }

      // Get customer ID
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (customer) {
        // Vehicles count
        const { count: vehicles } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', customer.id);

        // Active services
        const { count: activeServices } = await supabase
          .from('job_cards')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', customer.id)
          .in('status', ['pending', 'in_progress']);

        // Completed services
        const { count: completedServices } = await supabase
          .from('job_cards')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', customer.id)
          .eq('status', 'completed');

        setStats({
          vehicles: vehicles || 0,
          activeServices: activeServices || 0,
          completedServices: completedServices || 0,
        });
      } else {
        setStats({
          vehicles: 0,
          activeServices: 0,
          completedServices: 0,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Set default stats on error
      setStats({
        vehicles: 0,
        activeServices: 0,
        completedServices: 0,
      });
    }
  };

  const StatCard = ({ title, value, onPress }: { title: string; value: string | number; onPress?: () => void }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-4 shadow-sm"
      onPress={onPress}
      disabled={!onPress}
    >
      <Text className="text-gray-500 text-sm mb-2">{title}</Text>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-gray-900 mb-6">
          Welcome Back
        </Text>

        <StatCard
          title="My Vehicles"
          value={stats.vehicles}
          onPress={() => navigation.navigate('MyVehicles' as never)}
        />
        <StatCard
          title="Active Services"
          value={stats.activeServices}
          onPress={() => navigation.navigate('MyJobCards' as never)}
        />
        <StatCard
          title="Completed Services"
          value={stats.completedServices}
        />
      </View>
    </ScrollView>
  );
}

