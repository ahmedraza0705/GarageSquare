import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

export default function TechnicianDashboard() {
    const navigation = useNavigation();
    const { user } = useAuth();

    // Mock Data for the design
    const stats = {
        pending: 3,
        completed: 12,
        efficiency: '94%',
    };

    const todoList = [
        {
            id: 'jb1',
            job_card_no: 'SA0001',
            price: '₹21,500',
            vehicle: { make: 'Honda', model: 'City', reg: 'GJ-05-2134' },
            assigned_to: 'Ahmed Raza',
            progress: 70,
            delivery_due: '45m left',
            delivery_date: '09-12-2025',
            priority: 'Urgent',
            status: 'In Progress'
        },
        {
            id: 'jb2',
            job_card_no: 'SA0004',
            price: '₹15,000',
            vehicle: { make: 'Hyundai', model: 'Creta', reg: 'GJ-05-RT-4534' },
            assigned_to: 'Ahmed Raza',
            progress: 45,
            delivery_due: '2h left',
            delivery_date: '07-01-2026',
            priority: 'Normal',
            status: 'In Progress'
        },
        {
            id: 'jb3',
            job_card_no: 'SA0005',
            price: '₹5,500',
            vehicle: { make: 'Maruti', model: 'Swift', reg: 'KA-01-XY-9876' },
            assigned_to: 'Rahul Kumar',
            progress: 100,
            delivery_due: 'Completed',
            delivery_date: '06-01-2026',
            priority: 'Normal',
            status: 'Completed'
        },
    ];

    return (
        <View style={styles.container}>
            {/* New Header Design */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => (navigation as any).toggleDrawer?.()}>
                        <Ionicons name="menu" size={32} color="#0f172a" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Dashboard</Text>
                </View>

                <View style={styles.headerRight}>
                    {/* Green Theme Toggle (Visual only for now) */}
                    <TouchableOpacity style={styles.themeButton}>
                        <Ionicons name="moon-outline" size={24} color="#000" />
                    </TouchableOpacity>

                    {/* Red Avatar */}
                    <TouchableOpacity style={styles.profileButton}>
                        <Text style={styles.profileText}>
                            {user?.profile?.full_name?.[0]?.toUpperCase() || 'A'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Stats Row - 3 Cards requested: Pending, Completed, Efficiency */}
                <View style={styles.statsRow}>
                    {/* Pending Card - Blue */}
                    <View style={[styles.statCard, styles.blueCard]}>
                        <View>
                            <Text style={[styles.statLabel, styles.textWhite]}>Pending</Text>
                            <Text style={[styles.statValue, styles.textWhite]}>{stats.pending}</Text>
                        </View>
                        <Ionicons name="time-outline" size={32} color="rgba(255,255,255,0.8)" />
                    </View>

                    {/* Completed Card - White */}
                    <View style={[styles.statCard, styles.whiteCard]}>
                        <View>
                            <Text style={styles.statLabel}>Completed</Text>
                            <Text style={styles.statValue}>{stats.completed}</Text>
                        </View>
                        <Ionicons name="checkmark-done-circle-outline" size={32} color="#10b981" />
                    </View>

                    {/* Efficiency Card - White */}
                    <View style={[styles.statCard, styles.whiteCard]}>
                        <View>
                            <Text style={styles.statLabel}>Efficiency</Text>
                            <Text style={styles.statValue}>{stats.efficiency}</Text>
                        </View>
                        <Ionicons name="flash-outline" size={32} color="#f59e0b" />
                    </View>
                </View>

                {/* To-Do List Container */}
                <View style={styles.listContainer}>
                    <Text style={styles.listTitle}>To-Do list</Text>
                    {/* Job Cards */}
                    {todoList.map((job) => (
                        <TouchableOpacity
                            key={job.id}
                            style={styles.jobCard}
                            onPress={() => (navigation as any).navigate('JobCardDetail', { jobCardId: job.id })}
                            activeOpacity={0.9}
                        >
                            {/* Header: ID and Price */}
                            <View style={styles.cardHeader}>
                                <Text style={styles.jobCardNo}>Job Card {job.job_card_no}</Text>
                                <Text style={styles.jobPrice}>{job.price}</Text>
                            </View>

                            <View style={styles.divider} />

                            {/* Vehicle Info */}
                            <View style={styles.vehicleRow}>
                                <View>
                                    <Text style={styles.vehicleName}>{job.vehicle.make} {job.vehicle.model}</Text>
                                    <Text style={styles.vehicleReg}>{job.vehicle.reg}</Text>
                                </View>
                                <Ionicons name="car-sport" size={28} color="#000" />
                            </View>

                            <View style={styles.divider} />

                            {/* Assigned To */}
                            <View style={styles.assignedRow}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {job.assigned_to.split(' ').map((n: string) => n[0]).join('')}
                                    </Text>
                                </View>
                                <Text style={styles.assignedLabel}>Assigned to: </Text>
                                <Text style={styles.assignedValue}>{job.assigned_to}</Text>
                            </View>

                            {/* Progress Bar */}
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBarBg}>
                                    <View style={[styles.progressBarFill, { width: `${job.progress}%` as any }]} />
                                </View>
                                <Text style={styles.progressText}>{job.progress}% completed</Text>
                            </View>

                            {/* Delivery Info */}
                            <View style={styles.deliveryRow}>
                                <View>
                                    <Text style={styles.deliveryLabel}>Delivery due:</Text>
                                    <Text style={[styles.deliveryValue, { color: '#dc2626' }]}>{job.delivery_due}</Text>
                                </View>
                                <View>
                                    <Text style={styles.deliveryLabel}>Delivery date:</Text>
                                    <Text style={[styles.deliveryValue, { color: '#dc2626' }]}>{job.delivery_date}</Text>
                                </View>
                            </View>

                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f1f5f9', // Light gray background
    },
    // NEW HEADER STYLES
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        // backgroundColor: '#f1f5f9',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    themeButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#86efac', // Green-300
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#4ade80',
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#fca5a5', // Red-300
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f87171',
    },
    profileText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 16,
    },
    // CONTENT STYLES
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        justifyContent: 'space-between',
        minHeight: 100,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    blueCard: {
        backgroundColor: '#3b82f6', // Standard Blue
    },
    whiteCard: {
        backgroundColor: '#ffffff',
    },
    textWhite: {
        color: '#ffffff',
    },
    statLabel: {
        fontSize: 13,
        color: '#64748b',
        fontWeight: '500',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#0f172a',
    },

    // To-Do List Styles
    listContainer: {
        marginBottom: 100, // Space for bottom tab
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 12,
    },
    jobCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    jobCardNo: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    jobPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 8,
    },
    vehicleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    vehicleName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    vehicleReg: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    assignedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    avatarText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    assignedLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0f172a',
    },
    assignedValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0f172a',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    progressBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: '#cbd5e1',
        borderRadius: 4,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#3b82f6',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 11,
        color: '#64748b',
    },
    deliveryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    deliveryLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0f172a',
        marginBottom: 4,
    },
    deliveryValue: {
        fontSize: 20,
        fontWeight: 'bold',
    },
});
