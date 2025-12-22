// ============================================
// JOB CARDS SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { JobCardService } from '@/services/jobCard.service';
import { JobCard } from '@/types';

import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { TextInput, RefreshControl, ActivityIndicator } from 'react-native';

export default function JobCardsScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [filteredJobCards, setFilteredJobCards] = useState<JobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadJobCards();
  }, []);

  const loadJobCards = async () => {
    try {
      setLoading(true);
      const data = await JobCardService.getAll();
      setJobCards(data);
      setFilteredJobCards(data);
    } catch (error) {
      console.error('Error loading job cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredJobCards(jobCards);
      return;
    }

    const filtered = jobCards.filter((jc) =>
      jc.job_number.toLowerCase().includes(query.toLowerCase()) ||
      jc.customer?.full_name.toLowerCase().includes(query.toLowerCase()) ||
      jc.vehicle?.license_plate?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredJobCards(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#35C56A';
      case 'in_progress':
        return '#3B82F6';
      case 'on_hold':
        return '#EAB308';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#9CA3AF';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadJobCards} tintColor={theme.primary} />
        }
      >
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          {/* Search Bar and Add Button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.surface,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginRight: 12,
              borderWidth: 1,
              borderColor: theme.border
            }}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Search Job Card"
                style={{ flex: 1, marginLeft: 8, color: theme.text, fontWeight: '500' }}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={handleSearch}
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: theme.tabIconBg,
                padding: 12,
                borderRadius: 12,
                width: 48,
                height: 48,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.primary
              }}
              onPress={() => navigation.navigate('CreateJobCard' as never)}
            >
              <Ionicons name="add" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          )}

          {!loading && filteredJobCards.map((jobCard) => (
            <TouchableOpacity
              key={jobCard.id}
              style={{
                backgroundColor: theme.surface,
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: theme.border
              }}
              onPress={() => (navigation.navigate as any)('JobCardDetail', { jobCardId: jobCard.id })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>
                  {jobCard.job_number}
                </Text>
                <View style={{
                  backgroundColor: getStatusColor(jobCard.status) + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8
                }}>
                  <Text style={{
                    color: getStatusColor(jobCard.status),
                    fontSize: 12,
                    fontWeight: 'bold',
                    textTransform: 'capitalize'
                  }}>
                    {jobCard.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 8 }}>
                {jobCard.customer && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="person-outline" size={16} color={theme.textMuted} />
                    <Text style={{ color: theme.text, fontSize: 14 }}>
                      <Text style={{ color: theme.textMuted }}>Customer:</Text> {jobCard.customer.full_name}
                    </Text>
                  </View>
                )}
                {jobCard.vehicle && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="car-outline" size={16} color={theme.textMuted} />
                    <Text style={{ color: theme.text, fontSize: 14 }}>
                      <Text style={{ color: theme.textMuted }}>Vehicle:</Text> {jobCard.vehicle.make} {jobCard.vehicle.model} ({jobCard.vehicle.license_plate})
                    </Text>
                  </View>
                )}
                {jobCard.estimated_cost && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="cash-outline" size={16} color={theme.textMuted} />
                    <Text style={{ color: theme.text, fontSize: 14 }}>
                      <Text style={{ color: theme.textMuted }}>Est. Cost:</Text> ₹{jobCard.estimated_cost.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {!loading && filteredJobCards.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Text style={{ color: theme.textMuted }}>No job cards found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

