
// ============================================
// ASSIGNED JOBS SCREEN (Technician)
// ============================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { JobCard } from '@/types';

// Static job cards data (MOCKED for now)
const staticJobCards: JobCard[] = [
    {
        id: 'job_001',
        job_number: 'SA0001',
        customer_id: 'customer_001',
        vehicle_id: 'vehicle_001',
        branch_id: 'branch_1',
        assigned_to: 'tech_001',
        status: 'in_progress',
        priority: 'urgent',
        description: 'Engine repair and maintenance',
        estimated_cost: 21500,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customer: {
            id: 'customer_001',
            full_name: 'Ahmed',
            phone: '+1234567890',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        vehicle: {
            id: 'vehicle_001',
            customer_id: 'customer_001',
            make: 'Honda',
            model: 'City',
            license_plate: 'GJ-05-RT-2134',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        assigned_user: {
            id: 'tech_001',
            email: 'ahmed.raza@example.com',
            full_name: 'Ahmed raza',
            role_id: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    },
    {
        id: 'job_002',
        job_number: 'SA0002',
        customer_id: 'customer_001',
        vehicle_id: 'vehicle_002',
        branch_id: 'branch_1',
        assigned_to: 'tech_001',
        status: 'in_progress',
        priority: 'high',
        description: 'Regular service and oil change',
        estimated_cost: 10000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customer: {
            id: 'customer_001',
            full_name: 'Ahmed',
            phone: '+1234567890',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        vehicle: {
            id: 'vehicle_002',
            customer_id: 'customer_001',
            make: 'Hyundai',
            model: 'i10',
            license_plate: 'GJ-UD-KI-2234',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        assigned_user: {
            id: 'tech_001',
            email: 'ahmed.raza@example.com',
            full_name: 'Ahmed raza',
            role_id: null,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    },
];

export default function AssignedJobsList() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [jobCards] = useState<JobCard[]>(staticJobCards);
    const [darkMode, setDarkMode] = useState(false);

    const getStatusBadge = (status: string, priority?: string) => {
        if (priority === 'urgent') {
            return { label: 'Urgent', color: '#ffffff', bgColor: '#ef4444' };
        }
        if (status === 'in_progress') {
            return { label: 'Progress', color: '#ffffff', bgColor: '#2563eb' };
        }
        if (status === 'completed') {
            return { label: 'Ready', color: '#ffffff', bgColor: '#10b981' };
        }
        return { label: 'Pending', color: '#ffffff', bgColor: '#6b7280' };
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const handleJobCardPress = (jobCard: JobCard) => {
        // @ts-ignore
        navigation.navigate('JobCardDetail', { jobCardId: jobCard.id });
    };

    const filteredJobCards = jobCards.filter(jobCard => {
        const searchLower = searchQuery.toLowerCase();
        return (
            jobCard.job_number.toLowerCase().includes(searchLower) ||
            jobCard.customer?.full_name?.toLowerCase().includes(searchLower) ||
            jobCard.vehicle?.make?.toLowerCase().includes(searchLower) ||
            jobCard.vehicle?.model?.toLowerCase().includes(searchLower) ||
            jobCard.assigned_user?.full_name?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    {/* Changed path to match new directory depth: roles/technician/screens is 3 levels deep from src? No, src/roles/technician/screens */}
                    {/* Previous was src/screens/staff/jobs (3 deep) */}
                    {/* src (1/2) roles(3) technician(4) screens(5) -> ../../../../assets/Arrow.png */}
                    {/* <Image source={require('../../../../assets/Arrow.png')} style={styles.backIcon} /> */}
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>Job Cards</Text>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        onPress={() => setDarkMode(!darkMode)}
                        style={styles.headerButton}
                    >
                        <Text style={styles.darkModeIcon}>{darkMode ? '☀️' : '🌙'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.avatarButton}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBarRow}>
                        <View style={styles.searchBar}>
                            <Text style={styles.searchIcon}>🔍</Text>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search User"
                                placeholderTextColor="#9ca3af"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            <TouchableOpacity style={styles.filterButton}>
                                <Text style={styles.filterIcon}>🔽</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                                // @ts-ignore
                                navigation.navigate('CreateJobCard'); // Placeholder
                            }}
                        >
                            <Text style={styles.addIcon}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Job Cards */}
                <View style={styles.cardsContainer}>
                    {filteredJobCards.map((jobCard) => {
                        const badge = getStatusBadge(jobCard.status, jobCard.priority);
                        const deliveryDate = new Date();
                        deliveryDate.setDate(deliveryDate.getDate() + 2);
                        const deliveryTime = '3:00 PM';

                        return (
                            <TouchableOpacity
                                key={jobCard.id}
                                style={styles.jobCard}
                                onPress={() => handleJobCardPress(jobCard)}
                                activeOpacity={0.7}
                            >
                                {/* Top Row: Status, Job Number, Price */}
                                <View style={styles.topRow}>
                                    {/* Status Badge */}
                                    <View style={[styles.statusBadge, { backgroundColor: badge.bgColor }]}>
                                        <Text style={[styles.statusBadgeText, { color: badge.color }]}>
                                            {badge.label}
                                        </Text>
                                    </View>

                                    {/* Job Card Number - Centered */}
                                    <Text style={styles.jobNumber}>Job Card {jobCard.job_number}</Text>

                                    {/* Price Tag */}
                                    <View style={styles.priceTag}>
                                        <Text style={styles.priceText}>₹{jobCard.estimated_cost?.toLocaleString('en-IN') || '0'}</Text>
                                    </View>
                                </View>

                                {/* Vehicle Section with Icon */}
                                <View style={styles.vehicleSection}>
                                    <Text style={styles.carIcon}>🚗</Text>
                                    <View style={styles.vehicleInfo}>
                                        <Text style={styles.vehicleModel}>{jobCard.vehicle?.model || 'N/A'}</Text>
                                        <Text style={styles.licensePlate}>{jobCard.vehicle?.license_plate || 'N/A'}</Text>
                                    </View>
                                </View>

                                {/* Customer and Technician Info */}
                                <View style={styles.infoSection}>
                                    <Text style={styles.infoText}>
                                        Customer : {jobCard.customer?.full_name || 'N/A'}
                                    </Text>
                                    <Text style={styles.infoText}>
                                        Assigned tech: {jobCard.assigned_user?.full_name || 'N/A'}
                                    </Text>
                                </View>

                                {/* Delivery Info */}
                                <View style={styles.deliveryRow}>
                                    <Text style={styles.deliveryText}>
                                        Delivery date: {formatDate(deliveryDate.toISOString())}
                                    </Text>
                                    <Text style={styles.deliveryText}>
                                        Delivery due: {deliveryTime}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {filteredJobCards.length === 0 && (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No job cards found</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        marginTop: 40,
    },
    headerButton: {
        padding: 8,
    },
    backButton: {
        padding: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backIcon: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    darkModeIcon: {
        fontSize: 20,
    },
    avatarButton: {
        padding: 4,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#ef4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    searchBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
    },
    searchIcon: {
        fontSize: 18,
        color: '#000000',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    filterButton: {
        padding: 4,
    },
    filterIcon: {
        fontSize: 16,
        color: '#000000',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#d1fae5',
        borderWidth: 2,
        borderColor: '#10b981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addIcon: {
        fontSize: 24,
        color: '#000000',
        fontWeight: 'bold',
    },
    cardsContainer: {
        padding: 16,
        gap: 12,
    },
    jobCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        minWidth: 60,
        alignItems: 'center',
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    jobNumber: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
        textAlign: 'center',
    },
    priceTag: {
        backgroundColor: '#6b7280',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    priceText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    vehicleSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    carIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    vehicleInfo: {
        flex: 1,
    },
    vehicleModel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    licensePlate: {
        fontSize: 14,
        color: '#6b7280',
    },
    infoSection: {
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 4,
    },
    deliveryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    deliveryText: {
        fontSize: 13,
        color: '#6b7280',
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#6b7280',
    },
});
