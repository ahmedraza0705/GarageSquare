import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { useJobs } from '../../context/JobContext';

// Mock Data as fallback or type definition
const MOCK_JOB_CARD = {
    id: 'SA0001',
    vin: 'GJ-05-RT-2134',
    vehicle: 'Honda City',
    customer: 'Ahmed',
    phone: '+91 9890938291',
    assignedTech: 'Ahmed Raza',
    priority: 'Urgent',
    tasks: [
        { id: '1', title: 'Replace Battery', status: 'Complete', assigned: 'Ahmed Raza', estimate: '20 min', cost: 7000 },
    ],
    techManagerCheck: false,
    technicianCheck: true,
    readyToDelivery: false
};

export default function JobTasksDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { theme, themeName, toggleTheme } = useTheme();
    const { jobs, toggleServiceStatus } = useJobs();

    // Get ID from route
    const { jobId } = route.params as { jobId: string };

    const [jobData, setJobData] = useState<typeof MOCK_JOB_CARD | null>(null);

    // React to context changes
    useEffect(() => {
        const foundJob = jobs.find(j => j.id === jobId);
        if (foundJob) {
            const isJobDone = foundJob.status === 'Done' || foundJob.status === 'Delivered';
            const completedList = foundJob.completedServices || [];

            // Map services to tasks
            const tasks = (foundJob.services || []).map((service: any, index) => {
                // Should show incomplete if not in list, unless job is fully done
                const serviceName = service.name || service; // Handle both object and legacy string if any
                const isComplete = isJobDone || completedList.includes(serviceName);
                return {
                    id: serviceName, // Using service name as ID
                    title: serviceName,
                    status: isComplete ? 'Complete' : 'Pending',
                    assigned: foundJob.assignedTech || 'Unassigned',
                    estimate: service.estimate || '45 min',
                    cost: service.cost || 0
                };
            });

            setJobData({
                id: foundJob.jobId,
                vin: foundJob.vin || foundJob.regNo || 'N/A',
                vehicle: foundJob.vehicle || 'Unknown Vehicle',
                customer: foundJob.customer || 'Unknown',
                phone: foundJob.phone || 'N/A',
                assignedTech: foundJob.assignedTech || 'Unassigned',
                priority: foundJob.status,
                tasks: tasks,
                techManagerCheck: false,
                technicianCheck: false,
                readyToDelivery: false
            });
        }
    }, [jobId, jobs]);

    const toggleTaskStatus = (serviceName: string) => {
        const foundJob = jobs.find(j => j.id === jobId);
        if (!foundJob) return;

        // Use context to toggle
        toggleServiceStatus(foundJob.id, serviceName);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Complete': return { bg: '#dcfce7', text: '#166534' }; // Green
            case 'Pending': return { bg: '#e5e7eb', text: '#374151' }; // Gray
            case 'Need Approval': return { bg: '#ffedd5', text: '#c2410c' }; // Orange
            case 'Rejected': return { bg: '#fee2e2', text: '#991b1b' }; // Red
            default: return { bg: '#f3f4f6', text: '#6b7280' };
        }
    };

    if (!jobData) {
        return <View style={styles.container}><Text style={{ padding: 20 }}>Loading...</Text></View>;
    }

    // Summaries
    const totalTasks = jobData.tasks.length;
    const completedTasks = jobData.tasks.filter(t => t.status === 'Complete').length;
    const pendingTasks = jobData.tasks.filter(t => t.status === 'Pending').length;
    const approvalTasks = jobData.tasks.filter(t => t.status === 'Need Approval').length;
    const rejectedTasks = jobData.tasks.filter(t => t.status === 'Rejected').length;
    const totalCost = jobData.tasks.reduce((sum, t) => sum + t.cost, 0);

    return (
        <View style={[styles.container, { backgroundColor: '#f3f4f6' }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: '#ffffff' }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Text style={{ fontSize: 24 }}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Active Jobs</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={toggleTheme}>
                        <Text style={styles.icon}>{themeName === 'dark' ? '☀️' : '🌙'}</Text>
                    </TouchableOpacity>
                    <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    {/* Top Info */}
                    <View style={styles.jobHeader}>
                        <Text style={styles.jobTitle}>{jobData.id}</Text>
                        {jobData.priority === 'Urgent' && (
                            <View style={styles.urgentBadge}><Text style={styles.urgentText}>{jobData.priority}</Text></View>
                        )}
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoGrid}>
                        <View style={styles.infoCol}>
                            <Text style={styles.label}>VIN: {jobData.vin}</Text>
                            <Text style={styles.label}>Customer : <Text style={styles.value}>{jobData.customer}</Text></Text>
                            <Text style={styles.label}>Phone No : <Text style={styles.value}>{jobData.phone}</Text></Text>
                            <Text style={styles.label}>Assigned tech: <Text style={styles.value}>{jobData.assignedTech}</Text></Text>
                        </View>
                        <View style={styles.infoColRight}>
                            <Text style={styles.carModel}>{jobData.vehicle}</Text>
                            <Text style={{ fontSize: 32 }}>🚗</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Main Content Areas */}
                    <View style={styles.rowLayout}>

                        {/* Left: Tasks List */}
                        <View style={styles.leftCol}>
                            {jobData.tasks.map(task => {
                                const colors = getStatusColor(task.status);
                                return (
                                    <View key={task.id} style={styles.taskCard}>
                                        <View style={styles.taskHeader}>
                                            <Text style={styles.taskTitle}>{task.title}</Text>
                                            <View style={[styles.statusTag, { backgroundColor: colors.bg }]}>
                                                <Text style={[styles.statusTagText, { color: colors.text }]}>{task.status}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.taskSub}>Assigned: {task.assigned}</Text>
                                        <Text style={styles.taskSub}>Estimate: {task.estimate}</Text>
                                        <View style={styles.taskAction}>
                                            {task.status === 'Pending' && (
                                                <TouchableOpacity
                                                    style={styles.markDoneBtn}
                                                    onPress={() => toggleTaskStatus(task.id)}
                                                >
                                                    <Text style={styles.markDoneText}>Mark done</Text>
                                                </TouchableOpacity>
                                            )}
                                            {task.status === 'Complete' && (
                                                <View style={styles.doneBtn}>
                                                    <Text style={styles.doneText}>done</Text>
                                                </View>
                                            )}
                                            {task.status === 'Need Approval' && (
                                                <View style={styles.approvalBtn}>
                                                    <Text style={styles.approvalText}>Need Approval</Text>
                                                </View>
                                            )}
                                            {task.status === 'Rejected' && (
                                                <View style={styles.rejectedBtn}>
                                                    <Text style={styles.rejectedText}>Rejected</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                );
                            })}
                        </View>

                        {/* Right: Summaries */}
                        <View style={styles.rightCol}>
                            {/* Task Summary */}
                            <View style={styles.summaryBox}>
                                <Text style={styles.summaryHeader}>Task Summary</Text>
                                <View style={styles.summRow}><Text style={styles.summLabel}>Total Tasks</Text><Text style={styles.summValue}>{totalTasks}</Text></View>
                                <View style={styles.summRow}><Text style={styles.summLabel}>Complete</Text><Text style={styles.summValue}>{completedTasks}</Text></View>
                                <View style={styles.summRow}><Text style={styles.summLabel}>Pending</Text><Text style={styles.summValue}>{pendingTasks}</Text></View>
                                <View style={styles.summRow}><Text style={styles.summLabel}>Approval</Text><Text style={styles.summValue}>{approvalTasks}</Text></View>
                                <View style={styles.summRow}><Text style={styles.summLabel}>Rejected</Text><Text style={styles.summValue}>{rejectedTasks}</Text></View>
                            </View>

                            {/* Charges Summary */}
                            <View style={styles.summaryBox}>
                                <Text style={styles.summaryHeader}>Charges Summary</Text>
                                {jobData.tasks.map(t => (
                                    <View key={t.id} style={styles.summRow}>
                                        <Text style={[styles.summLabel, { fontSize: 10 }]} numberOfLines={1}>{t.title}</Text>
                                        <Text style={styles.summValue}>{t.cost}</Text>
                                    </View>
                                ))}
                                <View style={[styles.divider, { marginVertical: 4 }]} />
                                <View style={styles.summRow}>
                                    <Text style={styles.summLabel}>Total :</Text>
                                    <Text style={styles.summValue}>{totalCost.toLocaleString()}</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Footer Checks */}
                    <View style={styles.rowLayout}>
                        <View style={[styles.summaryBox, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.summaryHeader}>Quality Check Complete</Text>
                            <View style={styles.qcRow}>
                                <Text style={styles.qcLabel}>Technician Manager :</Text>
                                <TouchableOpacity
                                    style={[styles.qcBtn, jobData.techManagerCheck ? styles.qcBtnDone : styles.qcBtnNot]}
                                    onPress={() => setJobData(p => p ? ({ ...p, techManagerCheck: !p.techManagerCheck }) : null)}
                                >
                                    <Text style={styles.qcBtnText}>{jobData.techManagerCheck ? 'Done' : 'Not Done'}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.qcRow}>
                                <Text style={styles.qcLabel}>Technician :</Text>
                                <TouchableOpacity style={[styles.qcBtn, styles.qcBtnDone]} disabled>
                                    <Text style={styles.qcBtnText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={[styles.summaryBox, { width: 120, alignItems: 'center', justifyContent: 'center' }]}>
                            <Text style={styles.summaryHeader}>Ready to delivery</Text>
                            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{jobData.readyToDelivery ? 'True' : 'False'}</Text>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2 },
    headerButton: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    headerRight: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    icon: { fontSize: 20 },
    avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontWeight: 'bold' },

    scrollContent: { padding: 16 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e5e7eb' },

    jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    jobTitle: { fontSize: 18, fontWeight: 'bold' },
    urgentBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    urgentText: { color: '#ef4444', fontWeight: 'bold', fontSize: 12 },

    divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },

    infoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    infoCol: { flex: 1 },
    infoColRight: { alignItems: 'flex-end' },
    label: { color: '#6b7280', fontSize: 12, marginBottom: 4 },
    value: { color: '#111827', fontWeight: '600' },
    carModel: { fontSize: 14, fontWeight: 'bold' },

    rowLayout: { flexDirection: 'row', marginTop: 12 },
    leftCol: { flex: 3 },
    rightCol: { flex: 2, marginLeft: 12 }, // Adjusted flex ratio for better fit

    taskCard: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, marginBottom: 8 },
    taskHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    taskTitle: { fontWeight: '700', fontSize: 13, flex: 1 },
    statusTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    statusTagText: { fontSize: 10, fontWeight: 'bold' },
    taskSub: { fontSize: 11, color: '#6b7280', marginBottom: 2 },
    taskAction: { marginTop: 4, alignItems: 'flex-end' },

    markDoneBtn: { borderWidth: 1, borderColor: '#9ca3af', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
    markDoneText: { fontSize: 10, color: '#4b5563' },
    doneBtn: { borderWidth: 1, borderColor: '#10b981', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
    doneText: { fontSize: 10, color: '#10b981' },
    approvalBtn: { borderWidth: 1, borderColor: '#f97316', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
    approvalText: { fontSize: 10, color: '#f97316' },
    rejectedBtn: { borderWidth: 1, borderColor: '#ef4444', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
    rejectedText: { fontSize: 10, color: '#ef4444' },

    summaryBox: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, marginBottom: 12 },
    summaryHeader: { fontWeight: 'bold', fontSize: 12, marginBottom: 8 },
    summRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    summLabel: { fontSize: 11, color: '#4b5563', flex: 1 },
    summValue: { fontSize: 11, fontWeight: '600' },

    qcRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    qcLabel: { fontSize: 11, flex: 1 },
    qcBtn: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
    qcBtnNot: { borderColor: '#9ca3af', backgroundColor: '#fff' },
    qcBtnDone: { borderColor: '#10b981', backgroundColor: '#fff' },
    qcBtnText: { fontSize: 10 },
});
