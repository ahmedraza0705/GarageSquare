// ============================================
// JOB CARDS SCREEN (Technician Group Manager)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { JobCardService } from '@/services/jobCard.service';
import { JobCard } from '@/types';

export default function TechnicianGroupManagerJobCardsScreen() {
  const navigation = useNavigation();
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobCards();
  }, []);

  const loadJobCards = async () => {
    try {
      setLoading(true);
      const data = await JobCardService.getAll();
      setJobCards(data);
    } catch (error) {
      console.error('Error loading job cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (jobCardId: string) => {
    // TODO: Show technician selection modal
    Alert.alert('Assign Job Card', 'Select a technician to assign this job card to.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
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
        {jobCards.map((jobCard) => (
          <View
            key={jobCard.id}
            className="bg-white rounded-lg p-4 mb-4 shadow-sm"
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
            {jobCard.assigned_user ? (
              <Text className="text-gray-600 text-sm mb-2">
                Assigned to: {jobCard.assigned_user.full_name || jobCard.assigned_user.email}
              </Text>
            ) : (
              <TouchableOpacity
                className="bg-primary-600 rounded-lg p-2 mt-2"
                onPress={() => handleAssign(jobCard.id)}
              >
                <Text className="text-white text-sm font-medium text-center">
                  Assign Technician
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={() => navigation.navigate('JobCardDetail' as never, { jobCardId: jobCard.id } as never)}
            >
              <Text className="text-primary-600 text-sm font-medium mt-2">
                View Details →
              </Text>
            </TouchableOpacity>
          </View>
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

