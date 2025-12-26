import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { vehicleService } from '../services/VehicleService';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Components ---

const TaskGauge = ({ total, completed }: { total: number, completed: number }) => {
    const strokeWidth = 10;
    const radius = 60;
    const circumference = Math.PI * radius;
    const progress = total > 0 ? completed / total : 0;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={styles.gaugeContainer}>
            <View style={styles.gaugeChart}>
                <Svg height="80" width="140" viewBox="0 0 140 80">
                    <Circle cx="70" cy="70" r={radius} stroke="#e2e8f0" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={`${circumference} ${circumference}`} strokeLinecap="round" transform="rotate(-180, 70, 70)" />
                    <Circle cx="70" cy="70" r={radius} stroke="#3b82f6" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform="rotate(-180, 70, 70)" />
                </Svg>
                <View style={styles.gaugeTextContainer}>
                    <Text style={styles.gaugeMainText}>{completed}</Text>
                    <Text style={styles.gaugeSubText}>Done / {total}</Text>
                </View>
            </View>
        </View>
    );
};

const Accordion = ({ title, isOpen, onToggle, children }: any) => (
    <View style={styles.accordionContainer}>
        <TouchableOpacity style={styles.accordionHeader} onPress={onToggle} activeOpacity={0.8}>
            <Text style={styles.accordionTitle}>{title}</Text>
            <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#1e293b" />
        </TouchableOpacity>
        {isOpen && <View style={styles.accordionContent}>{children}</View>}
    </View>
);

// --- Main Screen ---

export default function JobTasksDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { jobId } = route.params as { jobId: string };

    const [job, setJob] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [qcChecks, setQcChecks] = useState<any[]>([]);
    const [expandedSection, setExpandedSection] = useState<string | null>('Tasks');

    // Checklist State
    const [workCompleted, setWorkCompleted] = useState(false);
    const [qualityChecked, setQualityChecked] = useState(false);

    useEffect(() => {
        loadJobDetails();
    }, [jobId]);

    const loadJobDetails = () => {
        const data = vehicleService.getById(jobId);
        if (data) {
            setJob(data);
            setTasks(data.tasks || []);
            setQcChecks(data.qc_checks || []);

            if (data.status === 'Ready') {
                setWorkCompleted(true);
                setQualityChecked(true);
            }
        }
    };

    const toggleSection = (section: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handleTaskStatus = (taskId: string, newStatus: string) => {
        const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
        setTasks(updatedTasks);
        vehicleService.update(jobId, { tasks: updatedTasks });
        setJob((prev: any) => ({ ...prev, tasks: updatedTasks }));
    };

    // Calculations for Summaries
    const summary = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => !t.status || t.status === 'pending').length,
        approval: tasks.filter(t => t.status === 'need_approval').length,
        rejected: tasks.filter(t => t.status === 'rejected').length,
    };

    const MOCK_TASK_PRICE = 45.00; // Mock price per task
    const totalCharges = summary.completed * MOCK_TASK_PRICE;

    const allTasksHandling = tasks.length > 0 && tasks.every(t => t.status === 'completed' || t.status === 'rejected' || t.status === 'need_approval');

    const handleMarkJobDone = () => {
        if (!allTasksHandling) {
            Alert.alert('Outstanding Tasks', 'All tasks must be completed, rejected, or sent for approval.');
            return;
        }
        if (summary.approval > 0) {
            Alert.alert('Pending Approvals', 'You have tasks waiting for approval. Cannot complete job yet.');
            return;
        }
        setWorkCompleted(!workCompleted);
    };

    const handleDeliverJob = () => {
        if (!workCompleted || !qualityChecked) {
            Alert.alert('Prerequisites Checklist', 'Please ensure Work Completed and QC Passed are checked.');
            return;
        }
        Alert.alert(
            'Confirm Delivery',
            'Mark job as Delivered (Completed)? This will archive the job.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Deliver',
                    style: 'destructive',
                    onPress: () => {
                        vehicleService.update(jobId, { status: 'Completed' });
                        Alert.alert('Delivered', 'Job moved to history.');
                        navigation.goBack();
                    }
                }
            ]
        );
    };

    if (!job) return <View style={styles.center}><Text>Loading...</Text></View>;

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{job.job_card_no}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Info Card */}
                <View style={styles.card}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.plate}>{job.reg_number}</Text>
                        <View style={[styles.badge, { backgroundColor: '#dbeafe' }]}>
                            <Text style={styles.badgeText}>{job.status}</Text>
                        </View>
                    </View>
                    <Text style={styles.subtitle}>{job.make} {job.model}</Text>
                    <Text style={styles.vin}>VIN: {job.vin || 'N/A'}</Text>
                    <View style={styles.divider} />
                    <TaskGauge total={tasks.length} completed={summary.completed} />
                </View>

                {/* Task Summary Badge Row */}
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryCount}>{summary.total}</Text>
                        <Text style={styles.summaryLabel}>Total</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryCount, { color: '#22c55e' }]}>{summary.completed}</Text>
                        <Text style={styles.summaryLabel}>Done</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryCount, { color: '#eab308' }]}>{summary.approval}</Text>
                        <Text style={styles.summaryLabel}>Approval</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryCount, { color: '#ef4444' }]}>{summary.rejected}</Text>
                        <Text style={styles.summaryLabel}>Rejected</Text>
                    </View>
                </View>

                {/* Tasks */}
                <Accordion title="Tasks List" isOpen={expandedSection === 'Tasks'} onToggle={() => toggleSection('Tasks')}>
                    {tasks.map((task, idx) => (
                        <View key={task.id || idx} style={styles.taskRow}>
                            <View style={styles.taskInfo}>
                                <Text style={styles.taskTitle}>{task.title || task.name}</Text>
                                <Text style={styles.taskSub}>{task.time || '0m'} • {task.status || 'Pending'}</Text>
                            </View>
                            <View style={styles.taskActions}>
                                {task.status === 'completed' ? (
                                    <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
                                ) : task.status === 'rejected' ? (
                                    <Ionicons name="close-circle" size={28} color="#ef4444" />
                                ) : task.status === 'need_approval' ? (
                                    <Ionicons name="time" size={28} color="#eab308" />
                                ) : (
                                    <>
                                        <TouchableOpacity onPress={() => handleTaskStatus(task.id, 'completed')} style={[styles.btn, styles.btnSuccess]}>
                                            <Ionicons name="checkmark" size={18} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleTaskStatus(task.id, 'need_approval')} style={[styles.btn, styles.btnWarning]}>
                                            <Ionicons name="alert" size={18} color="#fff" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleTaskStatus(task.id, 'rejected')} style={[styles.btn, styles.btnDanger]}>
                                            <Ionicons name="close" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                    ))}
                    {tasks.length === 0 && <Text style={styles.emptyText}>No tasks found.</Text>}
                </Accordion>

                {/* Charges Summary */}
                <Accordion title="Charges Summary" isOpen={expandedSection === 'Charges'} onToggle={() => toggleSection('Charges')}>
                    <View style={styles.chargesContainer}>
                        <View style={styles.chargeRow}>
                            <Text style={styles.chargeLabel}>Labor Cost ({summary.completed} tasks)</Text>
                            <Text style={styles.chargeValue}>${totalCharges.toFixed(2)}</Text>
                        </View>
                        <View style={styles.chargeRow}>
                            <Text style={styles.chargeLabel}>Parts</Text>
                            <Text style={styles.chargeValue}>$0.00</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.chargeRow}>
                            <Text style={styles.chargeTotalLabel}>Total Estimate</Text>
                            <Text style={styles.chargeTotalValue}>${totalCharges.toFixed(2)}</Text>
                        </View>
                    </View>
                </Accordion>

                {/* Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Completion Actions</Text>

                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setQualityChecked(!qualityChecked)}>
                        <Ionicons name={qualityChecked ? "checkbox" : "square-outline"} size={24} color={qualityChecked ? "#22c55e" : "#94a3b8"} />
                        <Text style={styles.checkboxLabel}>Quality Check Passed</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.checkboxRow} onPress={handleMarkJobDone}>
                        <Ionicons name={workCompleted ? "checkbox" : "square-outline"} size={24} color={workCompleted ? "#22c55e" : "#94a3b8"} />
                        <Text style={styles.checkboxLabel}>All Work Completed</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.deliverBtn, (!workCompleted || !qualityChecked) && styles.disabledBtn]}
                        onPress={handleDeliverJob}
                        disabled={!workCompleted || !qualityChecked}
                    >
                        <Text style={styles.deliverText}>Deliver Job</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#1e293b', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    backBtn: { padding: 4 },
    scrollContent: { padding: 20, paddingBottom: 100 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    plate: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 12, fontWeight: 'bold', color: '#1e40af' },
    subtitle: { fontSize: 16, color: '#475569', marginTop: 4 },
    vin: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 15 },
    gaugeContainer: { alignItems: 'center' },
    gaugeChart: { height: 80, justifyContent: 'center', alignItems: 'center' },
    gaugeTextContainer: { position: 'absolute', top: 35, alignItems: 'center' },
    gaugeMainText: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
    gaugeSubText: { fontSize: 10, color: '#64748b' },
    accordionContainer: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff' },
    accordionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    accordionContent: { padding: 16, paddingTop: 0 },
    taskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    taskInfo: { flex: 1 },
    taskTitle: { fontSize: 14, fontWeight: '600', color: '#334155' },
    taskSub: { fontSize: 12, color: '#94a3b8' },
    taskActions: { flexDirection: 'row', gap: 8 },
    btn: { padding: 8, borderRadius: 8 },
    btnSuccess: { backgroundColor: '#22c55e' },
    btnDanger: { backgroundColor: '#ef4444' },
    btnWarning: { backgroundColor: '#eab308' },
    emptyText: { textAlign: 'center', color: '#94a3b8', padding: 20 },
    section: { marginTop: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 },
    checkboxLabel: { marginLeft: 12, fontSize: 15, color: '#334155', fontWeight: '500' },
    deliverBtn: { backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 12 },
    disabledBtn: { backgroundColor: '#cbd5e1' },
    deliverText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // Summary Styles
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, backgroundColor: '#fff', padding: 16, borderRadius: 12 },
    summaryItem: { alignItems: 'center' },
    summaryCount: { fontSize: 18, fontWeight: 'bold', color: '#334155' },
    summaryLabel: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

    // Charges Styles
    chargesContainer: { paddingVertical: 8 },
    chargeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    chargeLabel: { fontSize: 14, color: '#64748b' },
    chargeValue: { fontSize: 14, fontWeight: '600', color: '#0f172a' },
    chargeTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
    chargeTotalValue: { fontSize: 16, fontWeight: 'bold', color: '#3b82f6' },
});
