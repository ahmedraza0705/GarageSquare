
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
                    onPress={() => (navigation as any).toggleDrawer?.()}
                    style={styles.backButton}
                >
                    <Ionicons name="menu" size={28} color="#000" />
                </TouchableOpacity>

                <Text style={styles.headerTitle}>My Jobs</Text>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        onPress={() => setDarkMode(!darkMode)}
                        style={styles.headerButton}
                    >
                        <View style={styles.themeIconContainer}>
                            <Ionicons name="moon" size={18} color="#000" />
                        </View>
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
                            <Ionicons name="search" size={20} color="#000" />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search User"
                                placeholderTextColor="#9ca3af"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            <TouchableOpacity style={styles.filterButton}>
                                <Ionicons name="filter" size={20} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                                // @ts-ignore
                                navigation.navigate('CreateJobCard'); // Placeholder
                            }}
                        >
                            <Ionicons name="add" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Job Cards */}
                <View style={styles.cardsContainer}>
                    {filteredJobCards.map((jobCard) => {
                        // Mock progress and delivery for design matching
                        const progress = jobCard.status === 'completed' ? 100 : 70;
                        const progressColor = progress === 100 ? '#22c55e' : '#3b82f6';

                        return (
                            <TouchableOpacity
                                key={jobCard.id}
                                style={styles.jobCard}
                                onPress={() => handleJobCardPress(jobCard)}
                                activeOpacity={0.9}
                            >
                                {/* Row 1: ID and Price */}
                                <View style={styles.cardHeaderRow}>
                                    <Text style={styles.jobNumber}>Job Card {jobCard.job_number}</Text>
                                    <Text style={styles.priceText}>₹{jobCard.estimated_cost?.toLocaleString('en-IN') || '0'}</Text>
                                </View>

                                <View style={styles.divider} />

                                {/* Row 2: Vehicle */}
                                <View style={styles.vehicleRow}>
                                    <View>
                                        <Text style={styles.vehicleModel}>{jobCard.vehicle?.make} {jobCard.vehicle?.model}</Text>
                                        <Text style={styles.licensePlate}>{jobCard.vehicle?.license_plate}</Text>
                                    </View>
                                    <Ionicons name="car-sport" size={28} color="#000" />
                                </View>

                                <View style={styles.divider} />

                                {/* Row 3: Assigned To */}
                                <View style={styles.assignedRow}>
                                    <View style={styles.assignedAvatar}>
                                        <Text style={styles.assignedAvatarText}>
                                            {jobCard.assigned_user?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text style={styles.assignedText}>
                                        <Text style={{ fontWeight: 'bold' }}>Assigned to: </Text>
                                        {jobCard.assigned_user?.full_name}
                                    </Text>
                                </View>

                                {/* Row 4: Progress */}
                                <View style={styles.progressRow}>
                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: progressColor }]} />
                                    </View>
                                    <Text style={styles.progressText}>{progress}% completed</Text>
                                </View>

                                {/* Row 5: Delivery */}
                                <View style={styles.deliveryContainer}>
                                    <View style={styles.deliveryItem}>
                                        <Text style={styles.deliveryLabel}>Delivery due:</Text>
                                        <Text style={styles.deliveryValueRed}>45m left</Text>
                                    </View>
                                    <View style={styles.deliveryItem}>
                                        <Text style={styles.deliveryLabel}>Delivery date:</Text>
                                        <Text style={styles.deliveryValueRed}>07-01-2026</Text>
                                    </View>
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
        backgroundColor: '#eef2f6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 12,
        backgroundColor: '#eef2f6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerButton: {
    },
    themeIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#cbd5e1', // Greyish
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarButton: {
        padding: 0,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#fca5a5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#eef2f6',
    },
    searchBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    filterButton: {
        padding: 4,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#bbf7d0', // Light green
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#86efac',
    },
    cardsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 16,
    },
    jobCard: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#cbd5e1',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    jobNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    priceText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 12,
    },
    vehicleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    vehicleModel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    licensePlate: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    assignedRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
    assignedAvatarText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    assignedText: {
        fontSize: 14,
        color: '#0f172a',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 12,
    },
    progressBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#e2e8f0',
        borderRadius: 4,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 10,
        color: '#64748b',
        minWidth: 70,
        textAlign: 'right',
    },
    deliveryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    deliveryItem: {

    },
    deliveryLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    deliveryValueRed: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#dc2626',
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#64748b',
    },
});
