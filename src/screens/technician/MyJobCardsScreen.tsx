// ============================================
// MY JOB CARDS SCREEN (Technician)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import StatusBadge from '@/components/StatusBadge';
import { Ionicons } from '@expo/vector-icons';

export default function MyJobCardsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [jobCards, setJobCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Urgent' | 'Normal'>('All');

  const mockJobCards = [
    {
      id: 'jb1',
      job_number: 'JOB-2023-001',
      status: 'in_progress',
      vehicle: { make: 'Toyota', model: 'Camry', year: 2020, license_plate: 'ABC-123' },
      priority: 'Urgent',
      customer: { first_name: 'John', last_name: 'Doe' }
    },
    {
      id: 'jb2',
      job_number: 'JOB-2023-005',
      status: 'pending',
      vehicle: { make: 'Honda', model: 'Civic', year: 2019, license_plate: 'XYZ-789' },
      priority: 'Normal',
      customer: { first_name: 'Jane', last_name: 'Smith' }
    },
    {
      id: 'jb3',
      job_number: 'JOB-2023-008',
      status: 'completed',
      vehicle: { make: 'Ford', model: 'F-150', year: 2021, license_plate: 'TRK-999' },
      priority: 'Normal',
      customer: { first_name: 'Bob', last_name: 'Builder' }
    }
  ];

  useEffect(() => {
    loadJobCards();
  }, []);

  const loadJobCards = async () => {
    setLoading(true);
    setTimeout(() => {
      setJobCards(mockJobCards);
      setLoading(false);
    }, 1000);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      loadJobCards();
    }, 1000);
  }, []);

  const filteredJobs = jobCards.filter(job => {
    const matchesSearch =
      job?.job_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job?.vehicle?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job?.vehicle?.license_plate?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === 'All' || job.priority === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header & Search */}
      <View className="bg-white px-4 py-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-4">My Assignments</Text>

        {/* Search Bar */}
        <View className="bg-gray-100 rounded-lg flex-row items-center px-3 py-2 mb-4">
          <Ionicons name="search" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search job no, vehicle..."
            className="flex-1 text-base text-gray-900"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Pills */}
        <View className="flex-row">
          {['All', 'Urgent', 'Normal'].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter as any)}
              className={`px-4 py-1.5 rounded-full mr-2 ${activeFilter === filter ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <Text className={`text-sm font-semibold ${activeFilter === filter ? 'text-white' : 'text-gray-600'}`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View className="items-center justify-center mt-20">
            <Text className="text-gray-400">Loading jobs...</Text>
          </View>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <TouchableOpacity
              key={job.id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-3"
              onPress={() => navigation.navigate('TechnicianJobDetail' as never)}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-lg font-bold text-gray-900">{job.job_number}</Text>
                  <Text className="text-sm text-gray-500">{job.vehicle?.make} {job.vehicle?.model} ({job.vehicle?.year})</Text>
                </View>
                <StatusBadge status={job.status} size="sm" />
              </View>

              <View className="h-[1px] bg-gray-50 my-2" />

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Text className="text-xs text-gray-400 mr-2">License:</Text>
                  <Text className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{job.vehicle?.license_plate}</Text>
                </View>
                {job.priority === 'Urgent' && (
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-red-500 mr-1" />
                    <Text className="text-xs font-bold text-red-600">URGENT</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="items-center justify-center mt-20">
            <Text className="text-gray-400">No jobs found matching your criteria.</Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
