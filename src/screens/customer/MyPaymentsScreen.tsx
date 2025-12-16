// ============================================
// MY PAYMENTS SCREEN (Customer)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Payment } from '@/types';

export default function CustomerMyPaymentsScreen() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      // Check if Supabase is disabled
      if (!supabase) {
        console.warn('Supabase is disabled - using local storage');
        setPayments([]);
        setLoading(false);
        return;
      }
      
      // Get customer ID
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (customer) {
        const { data, error } = await supabase
          .from('payments')
          .select(`
            *,
            job_card:job_cards(*)
          `)
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPayments(data || []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadPayments} />
      }
    >
      <View className="px-6 py-4">
        {payments.map((payment) => (
          <View
            key={payment.id}
            className="bg-white rounded-lg p-4 mb-4 shadow-sm"
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-semibold text-gray-900">
                ${payment.amount.toFixed(2)}
              </Text>
              <View className={`px-3 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                <Text className={`text-xs font-medium capitalize`}>
                  {payment.status}
                </Text>
              </View>
            </View>
            
            {payment.job_card && (
              <Text className="text-gray-600 text-sm mb-1">
                Job: {payment.job_card.job_number}
              </Text>
            )}
            {payment.payment_method && (
              <Text className="text-gray-600 text-sm mb-1 capitalize">
                Method: {payment.payment_method.replace('_', ' ')}
              </Text>
            )}
            <Text className="text-gray-500 text-xs">
              {new Date(payment.created_at).toLocaleDateString()}
            </Text>
          </View>
        ))}

        {payments.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-gray-500">No payments found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

