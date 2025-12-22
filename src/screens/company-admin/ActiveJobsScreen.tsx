// ============================================
// ACTIVE JOBS SCREEN (Company Admin)
// ============================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ProgressBarAndroid, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, Building2, Users, FileBarChart } from 'lucide-react-native';
import { useJobs } from '../../context/JobContext';

// Static Data Interface
interface StaticJobCard {
    id: string;
    jobNumber: string;
    price: string;
    make: string;
    model: string;
    licensePlate: string;
    assignedTo: string;
    progress: number;
    deliveryDate: string;
    timeLeft: string;
}

// Static Data
const staticJobCards: StaticJobCard[] = [
    {
        id: '1',
        jobNumber: 'SA0004',
        price: '15,000',
        make: 'Hyundai',
        model: 'Creta',
        licensePlate: 'GJ-05-RT-4534',
        assignedTo: 'Ahmed Raza',
        progress: 0.7,
        deliveryDate: '07-01-2026',
        timeLeft: '45m left',
    },
    {
        id: '2',
        jobNumber: 'SA0001',
        price: '15,000',
        make: 'Hyundai',
        model: 'Creta',
        licensePlate: 'GJ-05-RT-4356',
        assignedTo: 'Ahmed Raza',
        progress: 1.0,
        deliveryDate: '07-01-2026',
        timeLeft: '45m left',
    },
];

export default function ActiveJobsScreen() {
    const navigation = useNavigation<any>();
    const { user } = useAuth();
    const { getJobsByStatus } = useJobs();
    const [searchQuery, setSearchQuery] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    // Get active jobs from global context and filter based on search query
    const allActiveJobs = getJobsByStatus('active');
    const jobs = [...allActiveJobs]
        .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
        .filter(job => {
            const query = searchQuery.toLowerCase();
            return (
                job.customer.toLowerCase().includes(query) ||
                job.regNo.toLowerCase().includes(query) ||
                job.vehicle.toLowerCase().includes(query) ||
                job.jobId.toLowerCase().includes(query)
            );
        });

    // Helper to calculate progress percentage
    const calculateProgress = (job: any) => {
        if (!job.taskStatuses) return 0;
        const statuses = Object.values(job.taskStatuses) as string[];
        if (statuses.length === 0) return 0;
        const complete = statuses.filter(s => s === 'complete').length;
        return complete / statuses.length;
    };

    // Simple progress bar component since ProgressBarAndroid is Android only
    const ProgressBar = ({ progress, color }: { progress: number; color: string }) => (
        <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.openDrawer && navigation.openDrawer()} style={styles.menuButton}>
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Active Jobs</Text>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={() => setDarkMode(!darkMode)} style={styles.headerButton}>
                        <Text style={styles.iconText}>{darkMode ? '☀️' : '🌙'}</Text>
                    </TouchableOpacity>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Search Bar */}
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search User"
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity>
                            <Text style={styles.filterIcon}>Y</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.addButton}>
                        <Text style={styles.addIcon}>+</Text>
                    </TouchableOpacity>
                </View>

                {/* Job Cards */}
                {jobs.map((job) => {
                    const progress = calculateProgress(job);
                    return (
                        <TouchableOpacity
                            key={job.id}
                            style={styles.card}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('JobCardDetail', { jobCardId: job.id })}
                        >
                            {/* Header: Job Card No & Price */}
                            <View style={styles.cardHeader}>
                                <Text style={styles.jobCardTitle}>Job Card {job.jobId}</Text>
                                <Text style={styles.priceText}>{job.amount}</Text>
                            </View>

                            <View style={styles.separator} />

                            {/* Vehicle Info */}
                            <View style={styles.vehicleRow}>
                                <View>
                                    <Text style={styles.vehicleName}>{job.vehicle}</Text>
                                    <Text style={styles.licensePlate}>{job.regNo}</Text>
                                </View>
                                <Text style={styles.carIcon}>🚗</Text>
                            </View>

                            <View style={styles.separator} />

                            {/* Assignment & Progress */}
                            <View style={styles.assignmentSection}>
                                <View style={styles.assignedRow}>
                                    <View style={styles.assignedAvatar}>
                                        <Text style={styles.assignedInitials}>AR</Text>
                                    </View>
                                    <Text style={styles.assignedText}>Assigned to: <Text style={styles.boldText}>{job.assignedTech}</Text></Text>
                                </View>

                                <View style={styles.progressRow}>
                                    <ProgressBar
                                        progress={progress}
                                        color={progress >= 1 ? '#22c55e' : '#3b82f6'}
                                    />
                                    <Text style={styles.progressText}>{Math.round(progress * 100)}% completed</Text>
                                </View>
                            </View>

                            {/* Delivery Info */}
                            <View style={styles.deliveryRow}>
                                <View>
                                    <Text style={styles.deliveryLabel}>Delivery due:</Text>
                                    <Text style={styles.deliveryTimeLeft}>{job.deliveryDue || '45m left'}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.deliveryLabel}>Delivery date:</Text>
                                    <Text style={styles.deliveryDate}>{job.deliveryDate || '07-01-2026'}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eff0f1', // Light gray background
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: '#eff0f1',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuButton: {
        padding: 4,
    },
    menuIcon: {
        fontSize: 24,
        color: '#000',
        fontWeight: 'bold',
    },
    iconText: {
        fontSize: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        textDecorationLine: 'underline',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerButton: {
        padding: 8,
        backgroundColor: '#d1d5db', // Gray circle
        borderRadius: 20,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#fca5a5', // Light red
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    avatarText: {
        color: '#000',
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    searchRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 48,
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 8,
        color: '#000',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
    },
    filterIcon: {
        fontSize: 18,
        fontWeight: 'bold',
        transform: [{ rotate: '180deg' }], // Rough visual approximation of filter icon
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#a7f3d0', // Light green
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#10b981',
    },
    addIcon: {
        fontSize: 24,
        color: '#000',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    jobCardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    priceText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    separator: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginBottom: 12,
    },
    vehicleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    licensePlate: {
        fontSize: 14,
        color: '#6b7280',
    },
    carIcon: {
        fontSize: 28,
    },
    assignmentSection: {
        marginBottom: 12,
    },
    assignedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    assignedAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    assignedInitials: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    assignedText: {
        fontSize: 14,
        color: '#000',
    },
    boldText: {
        fontWeight: 'bold',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 10,
        color: '#6b7280',
    },
    deliveryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    deliveryLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 2,
    },
    deliveryTimeLeft: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ef4444', // Red
    },
    deliveryDate: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ef4444', // Red
    },
});
