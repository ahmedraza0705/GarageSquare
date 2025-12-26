// ============================================
// JOB CARDS SCREEN (Supervisor)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { JobCardService } from '@/services/jobCard.service';
import { JobCard } from '@/types';

export default function SupervisorJobCardsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobCards();
  }, []);

  const loadJobCards = async () => {
    try {
      setLoading(true);
      const data = await JobCardService.getAll();
      // Filter by supervisor_id if needed
      const filtered = data.filter(jc => jc.supervisor_id === user?.id);
      setJobCards(filtered);
    } catch (error) {
      console.error('Error loading job cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadJobCards} />
      }
    >
      <View className="px-6 py-4">
        <TouchableOpacity
          className="bg-primary-600 rounded-lg p-4 mb-4"
          onPress={() => navigation.navigate('CreateJobCard' as never)}
        >
          <Text className="text-white font-semibold text-center">
            + Create Job Card
          </Text>
        </TouchableOpacity>

        {jobCards.map((jobCard) => (
          <TouchableOpacity
            key={jobCard.id}
            className="bg-white rounded-lg p-4 mb-4 shadow-sm"
            onPress={() => navigation.navigate('JobCardDetail' as never, { jobCardId: jobCard.id } as never)}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-semibold text-gray-900">
                {jobCard.job_number}
              </Text>
              <View className={`px-3 py-1 rounded-full ${getStatusColor(jobCard.status)}`}>
                <Text className={`text-xs font-medium capitalize`}>
                  {jobCard.status.replace('_', ' ')}
                </Text>
              </View>
            </View>

            {jobCard.customer && (
              <Text className="text-gray-600 text-sm mb-1">
                {jobCard.customer.full_name}
              </Text>
            )}
            {jobCard.vehicle && (
              <Text className="text-gray-600 text-sm">
                {jobCard.vehicle.brand} {jobCard.vehicle.model}
              </Text>
            )}
          </TouchableOpacity>
        ))}

        {jobCards.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-gray-500">No job cards found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

