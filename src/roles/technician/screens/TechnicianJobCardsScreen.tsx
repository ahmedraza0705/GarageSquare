import React from 'react';
import { View, Platform, StatusBar, ScrollView } from 'react-native';
import JobCard from '../components/JobCard';
import Header from '../components/Header';
import { technicianJobs } from '../services/mockData';
import { useNavigation } from '@react-navigation/native';

export default function TechnicianJobCardsScreen() {
    const navigation = useNavigation();

    return (
        <View className="flex-1 bg-[#f1f5f9]">
            <StatusBar barStyle="dark-content" />

            <Header title="Job Cards" />

            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {technicianJobs.map((job) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        onPress={() => (navigation as any).navigate('JobCardDetail', { job })}
                    />
                ))}
            </ScrollView>
        </View>
    );
}
