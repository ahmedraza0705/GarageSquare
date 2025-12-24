import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');

export default function TechnicianDashboard() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const userName = user?.email?.split('@')[0] || 'Technician';

    // Mock Data
    const stats = {
        pending: 3,
        completed: 12,
        efficiency: '94%',
    };

    const todayJobs = [
        { id: '1', vehicle: 'Hyundai Creta', reg: 'KA 05 AB 1234', service: 'General Service', time: '10:00 AM', status: 'In Progress' },
        { id: '2', vehicle: 'Maruti Swift', reg: 'KA 01 XY 9876', service: 'Oil Change', time: '02:00 PM', status: 'Pending' },
        { id: '3', vehicle: 'Honda City', reg: 'MH 12 PQ 4567', service: 'Brake Inspection', time: '04:30 PM', status: 'Pending' },
    ];

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <LinearGradient
                colors={['#1e293b', '#334155']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>Good Morning,</Text>
                        <Text style={styles.userName}>{userName}</Text>
                    </View>
                    <TouchableOpacity style={styles.profileButton} onPress={() => (navigation as any).navigate('Profile')}>
                        <Ionicons name="person-circle-outline" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Quick Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBg, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                            <Ionicons name="time-outline" size={20} color="#60a5fa" />
                        </View>
                        <Text style={styles.statValue}>{stats.pending}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBg, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#4ade80" />
                        </View>
                        <Text style={styles.statValue}>{stats.completed}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.iconBg, { backgroundColor: 'rgba(234, 179, 8, 0.2)' }]}>
                            <Ionicons name="flash-outline" size={20} color="#facc15" />
                        </View>
                        <Text style={styles.statValue}>{stats.efficiency}</Text>
                        <Text style={styles.statLabel}>Efficiency</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* Main Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#3b82f6' }]}
                        onPress={() => (navigation as any).navigate('MyJobCards')}
                    >
                        <Ionicons name="briefcase" size={20} color="#fff" />
                        <Text style={styles.actionText}>My Jobs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#64748b' }]}
                        onPress={() => (navigation as any).navigate('ScanQR')} // Placeholder route
                    >
                        <Ionicons name="qr-code" size={20} color="#fff" />
                        <Text style={styles.actionText}>Scan Job</Text>
                    </TouchableOpacity>
                </View>

                {/* Today's Schedule */}
                <Text style={styles.sectionTitle}>Today's Schedule</Text>
                <View style={styles.jobList}>
                    {todayJobs.map((job) => (
                        <TouchableOpacity key={job.id} style={styles.jobCard} onPress={() => (navigation as any).navigate('JobCardDetail', { jobCardId: job.id })}>
                            <View style={styles.jobHeader}>
                                <Text style={styles.jobVehicle}>{job.vehicle}</Text>
                                <View style={[styles.statusBadge, job.status === 'In Progress' ? styles.statusProgress : styles.statusPending]}>
                                    <Text style={[styles.statusText, job.status === 'In Progress' ? styles.textProgress : styles.textPending]}>
                                        {job.status}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.jobReg}>{job.reg}</Text>

                            <View style={styles.divider} />

                            <View style={styles.jobFooter}>
                                <View style={styles.jobMeta}>
                                    <Ionicons name="construct-outline" size={14} color="#64748b" />
                                    <Text style={styles.metaText}>{job.service}</Text>
                                </View>
                                <View style={styles.jobMeta}>
                                    <Ionicons name="time-outline" size={14} color="#64748b" />
                                    <Text style={styles.metaText}>{job.time}</Text>
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
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '500',
    },
    userName: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
    },
    profileButton: {
        padding: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    iconBg: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 10,
        color: '#94a3b8',
        marginTop: 2,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 16,
    },
    jobList: {
        gap: 12,
        marginBottom: 40,
    },
    jobCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    jobVehicle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#334155',
    },
    jobReg: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusProgress: {
        backgroundColor: '#eff6ff',
    },
    statusPending: {
        backgroundColor: '#f1f5f9',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '600',
    },
    textProgress: {
        color: '#3b82f6',
    },
    textPending: {
        color: '#64748b',
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 12,
    },
    jobFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    jobMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 12,
        color: '#64748b',
        fontWeight: '500',
    },
});
