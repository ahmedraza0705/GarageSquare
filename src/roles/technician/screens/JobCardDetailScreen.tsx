import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, UIManager, Platform, LayoutAnimation, StyleSheet, Dimensions, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { vehicleService, Vehicle } from '../services/VehicleService';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ----------------------------------------
// MOCK DATA (Matches uploaded images)
// ----------------------------------------
const mockTasks = [
    {
        id: 'task_1',
        title: 'Replace Battery',
        subtitle: '(Saafir)',
        estimate: '20 min',
        status: 'completed',
        cost: 7000
    },
    {
        id: 'task_2',
        title: 'Engine oil change',
        subtitle: '(Varun)',
        estimate: '30 min',
        status: 'completed', // Check mark in image
        cost: 2000
    },
    {
        id: 'task_3',
        title: 'Paint Job',
        subtitle: '',
        estimate: '1 hour',
        status: 'pending', // No mark in image
        cost: 50000
    },
    {
        id: 'task_4',
        title: 'Change Tires',
        subtitle: '',
        estimate: '30 min',
        status: 'rejected', // Red bar in image
        cost: 50000
    }
];

const mockCharges = [
    { id: 'c1', name: 'Replace Battery', desc: 'Item: Battery x 1', price: 7000 },
    { id: 'c2', name: 'Engine oil change', desc: 'Item: Part Name x Quantity', price: 2000 },
    { id: 'c3', name: 'Paint Job', desc: 'Item: Part Name x Quantity', price: 10000 },
    { id: 'c4', name: 'AC repair', desc: 'Item: Part Name x Quantity', price: 1500 },
];

// ----------------------------------------
// COMPONENTS
// ----------------------------------------

// Simplified Gauge Chart Component
const TaskGauge = ({ total, completed }: { total: number, completed: number }) => {
    // A simple semi-circle gauge representation
    // Using Svg for cleaner drawing
    const strokeWidth = 10;
    const radius = 60;
    const circumference = Math.PI * radius; // Semi-circle
    const progress = completed / total;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <View style={styles.gaugeContainer}>
            <View style={styles.gaugeChart}>
                <Svg height="80" width="140" viewBox="0 0 140 80">
                    {/* Background Arc */}
                    <Circle
                        cx="70"
                        cy="70"
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={0}
                        strokeLinecap="round"
                        transform="rotate(-180, 70, 70)"
                    />
                    {/* Progress Arc */}
                    <Circle
                        cx="70"
                        cy="70"
                        r={radius}
                        stroke="#4682b4" // SteelBlue matches image
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={`${circumference} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-180, 70, 70)"
                    />
                </Svg>
                <View style={styles.gaugeTextContainer}>
                    <Text style={styles.gaugeMainText}>{completed}</Text>
                    <Text style={styles.gaugeSubText}>Task Complete</Text>
                </View>
            </View>

            <View style={styles.gaugeStatsRow}>
                <View style={styles.gaugeStatItem}>
                    <Text style={styles.gaugeStatNumber}>{total}</Text>
                    <Text style={styles.gaugeStatLabel}>Total task</Text>
                </View>
                <View style={[styles.gaugeStatItem, styles.borderLeft]}>
                    <Text style={styles.gaugeStatNumber}>{total - completed}</Text>
                    {/* Simplifying Logic */}
                    <Text style={styles.gaugeStatLabel}>Rejected</Text>
                </View>
            </View>
        </View>
    );
};

// Accordion Component
const Accordion = ({ title, isOpen, onToggle, children, rightElement }: any) => {
    return (
        <View style={styles.accordionContainer}>
            <TouchableOpacity
                style={styles.accordionHeader}
                onPress={onToggle}
                activeOpacity={0.8}
            >
                <Text style={styles.accordionTitle}>{title}</Text>
                {rightElement ? rightElement :
                    <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="#000" />
                }
            </TouchableOpacity>
            {isOpen && (
                <View style={styles.accordionContent}>
                    <View style={styles.accordionDivider} />
                    {children}
                </View>
            )}
        </View>
    );
}
// ----------------------------------------
// SWIPEABLE IMPLEMENTATION
// ----------------------------------------
import { Swipeable } from 'react-native-gesture-handler';
import { Animated } from 'react-native';

const SwipeableActionRow = ({ children, onApprove, onReject }: any) => {
    const renderRightActions = (progress: any, dragX: any) => {
        const trans = dragX.interpolate({
            inputRange: [-160, 0],
            outputRange: [0, 160],
            extrapolate: 'clamp',
        });

        return (
            <View style={{ width: 160, flexDirection: 'row' }}>
                <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }] }}>
                    <TouchableOpacity
                        onPress={onReject}
                        style={{
                            backgroundColor: '#e5e7eb', // Grey
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            flex: 1,
                        }}>
                        <Ionicons name="close" size={28} color="#000" />
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View style={{ flex: 1, transform: [{ translateX: 0 }] }}>
                    <TouchableOpacity
                        onPress={onApprove}
                        style={{
                            backgroundColor: '#22c55e', // Green
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            flex: 1,
                        }}>
                        <Ionicons name="checkmark" size={28} color="#000" />
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    };

    return (
        <Swipeable renderRightActions={renderRightActions} containerStyle={{ backgroundColor: '#fff' }}>
            {children}
        </Swipeable>
    );
};

export default function JobCardDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { job } = route.params as any; // Get job passed from Dashboard/List

    const [expandedSection, setExpandedSection] = useState<string | null>('Task');

    // Initialize tasks from the actual vehicle service or fall back to mock if empty
    const vehicleId = job.id; // Since we mapped job.id to vehicle.id
    const currentVehicle = vehicleService.getById(vehicleId);

    const [tasks, setTasks] = useState(
        (currentVehicle?.tasks && currentVehicle.tasks.length > 0)
            ? currentVehicle.tasks
            : mockTasks
    );

    const [qcChecks, setQcChecks] = useState<any[]>(
        (currentVehicle?.qc_checks && currentVehicle.qc_checks.length > 0)
            ? currentVehicle.qc_checks
            : []
    );

    // Save default mock tasks/QC to service if vehicle has none
    useEffect(() => {
        const updates: any = {};
        if (!currentVehicle?.tasks || currentVehicle.tasks.length === 0) {
            updates.tasks = mockTasks;
        }
        if (!currentVehicle?.qc_checks || currentVehicle.qc_checks.length === 0) {
            updates.qc_checks = [
                { id: 'qc_default_1', name: 'Technician Inspection', status: 'Pending', role: 'Technician' },
                { id: 'qc_default_2', name: 'Final Certification', status: 'Pending', role: 'Supervisor' }
            ];
            setQcChecks(updates.qc_checks);
        }

        if (Object.keys(updates).length > 0) {
            vehicleService.update(vehicleId, updates);
        }
    }, []);

    const toggleSection = (section: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSection(expandedSection === section ? null : section);
    };

    const handleCompleteTask = (taskId: string) => {
        const updatedTasks = tasks.map((task: any) =>
            task.id === taskId
                ? { ...task, status: 'completed' }
                : task
        );
        setTasks(updatedTasks);
        // Persist to service
        vehicleService.update(vehicleId, { tasks: updatedTasks });
    };

    const handleQCAction = (qcId: string, status: 'Approved' | 'Rejected' | 'Pending') => {
        const updatedQC = qcChecks.map(item =>
            item.id === qcId ? { ...item, status } : item
        );
        setQcChecks(updatedQC);
        vehicleService.update(vehicleId, { qc_checks: updatedQC });
    };

    const completedTasksCount = tasks.filter((t: any) => t.status === 'completed').length;
    const totalCharges = mockCharges.reduce((sum, item) => sum + item.price, 0);

    // Dynamic Vehicle Data
    const vehicleDisplay = currentVehicle || job.vehicle || {};

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* Custom Header Matches Dashboard */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.menuButton}>
                    <Ionicons name="arrow-back" size={28} color="#0f172a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Job Card</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        {/* Delete Icon from image */}
                        <View style={[styles.circleButton, { backgroundColor: '#fca5a5' }]}>
                            <Ionicons name="trash-outline" size={18} color="#991b1b" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Main Job Card Header */}
                <View style={styles.jobCardHeaderBg}>
                    <View style={styles.jobCardRow}>
                        <Text style={styles.jobCardLabel}>Job Card:</Text>
                        <Text style={styles.jobCardValue}>{job.job_card_no || 'JC-001'}</Text>
                    </View>
                    <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>{job.priority || 'Normal'}</Text>
                    </View>
                </View>

                {/* 1. Task Summary Accordion */}
                <Accordion
                    title="Task Summary"
                    isOpen={expandedSection === 'Task Summary'}
                    onToggle={() => toggleSection('Task Summary')}
                >
                    <TaskGauge total={tasks.length} completed={completedTasksCount} />
                </Accordion>

                {/* 2. Task List Accordion */}
                <Accordion
                    title="Task"
                    isOpen={expandedSection === 'Task'}
                    onToggle={() => toggleSection('Task')}
                >
                    {tasks.map((task: any, index: number) => (
                        <View key={task.id} style={styles.taskCard}>
                            {/* Color Bar */}
                            <View style={[
                                styles.taskColorBar,
                                task.status === 'completed' ? { backgroundColor: '#22c55e' } : // Green
                                    task.status === 'rejected' ? { backgroundColor: '#ef4444' } : // Red
                                        task.status === 'pending' ? { backgroundColor: '#f59e0b' } : // Orange/Yellow
                                            { backgroundColor: '#3b82f6' } // Default Blue
                            ]} />

                            {/* Content */}
                            <View style={styles.taskContent}>
                                <View style={styles.taskRow}>
                                    <View>
                                        <Text style={styles.taskTitle}>{task.title} <Text style={styles.taskSubtitle}>{task.subtitle}</Text></Text>
                                        <Text style={styles.taskEstimate}>Estimate: {task.estimate}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.taskCost}>₹{(task.cost || 0).toLocaleString()}</Text>
                                        {task.status === 'completed' ? (
                                            <View style={{ marginLeft: 8, padding: 4, backgroundColor: '#22c55e', borderRadius: 4 }}>
                                                <Ionicons name="checkmark" size={16} color="#fff" />
                                            </View>
                                        ) : task.status === 'rejected' ? (
                                            <View style={{ marginLeft: 8, padding: 4, backgroundColor: '#eee', borderRadius: 4 }}>
                                                <Ionicons name="close" size={16} color="#000" />
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => handleCompleteTask(task.id)}
                                                style={{ marginLeft: 8, padding: 4, backgroundColor: '#e0f2fe', borderRadius: 4, borderWidth: 1, borderColor: '#3b82f6' }}
                                            >
                                                <Text style={{ fontSize: 10, color: '#3b82f6', fontWeight: 'bold' }}>Done</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Legend */}
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
                            <Text style={styles.legendText}>Complete</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                            <Text style={styles.legendText}>Rejected</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#1f2937' }]} />
                            <Text style={styles.legendText}>Pending</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
                            <Text style={styles.legendText}>Need Approval</Text>
                        </View>
                    </View>
                </Accordion>

                {/* 3. Charges Summary */}
                <Accordion
                    title="Charges Summary"
                    isOpen={expandedSection === 'Charges Summary'}
                    onToggle={() => toggleSection('Charges Summary')}
                >
                    {mockCharges.map((charge) => (
                        <View key={charge.id} style={styles.chargeItem}>
                            <View style={[styles.chargeColorBar, { backgroundColor: '#22c55e' }]} />
                            <View style={styles.chargeContent}>
                                <View style={styles.chargeRow}>
                                    <View>
                                        <Text style={styles.chargeName}>{charge.name}</Text>
                                        <Text style={styles.chargeDesc}>{charge.desc}</Text>
                                    </View>
                                    <Text style={styles.chargePrice}>₹{charge.price.toLocaleString()}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>₹{totalCharges.toLocaleString()}</Text>
                    </View>
                </Accordion>

                {/* 4. Customer & Vehicle */}
                <Accordion
                    title="Customer & Vehicle"
                    isOpen={expandedSection === 'Customer & Vehicle'}
                    onToggle={() => toggleSection('Customer & Vehicle')}
                >
                    <View style={styles.detailList}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>VIN:</Text>
                            <Text style={styles.detailValue}>{vehicleDisplay.vin || 'N/A'}</Text>
                        </View>
                        <View style={styles.detailDivider} />

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Customer :</Text>
                            <Text style={styles.detailValue}>{vehicleDisplay.owner || 'Unknown'}</Text>
                        </View>
                        <View style={styles.detailDivider} />

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Phone No :</Text>
                            <Text style={styles.detailValue}>+91 9890938291</Text>
                        </View>
                        <View style={styles.detailDivider} />

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Car Brand:</Text>
                            <Text style={styles.detailValue}>{vehicleDisplay.make} {vehicleDisplay.model}</Text>
                        </View>
                    </View>
                </Accordion>

                {/* 5. Quality Check */}
                <Accordion
                    title="Quality Check"
                    isOpen={expandedSection === 'Quality Check'}
                    onToggle={() => toggleSection('Quality Check')}
                    rightElement={!expandedSection && <View style={styles.qcCompleteBadge}><Text style={styles.qcCompleteText}>Complete</Text></View>}
                >
                    {/* Dynamic QC List */}
                    {qcChecks.map((item) => {
                        const isPending = item.status === 'Pending';
                        const statusColor = item.status === 'Approved' ? '#22c55e' : item.status === 'Rejected' ? '#ef4444' : '#1f2937';

                        const Content = (
                            <View style={styles.qcRow}>
                                <View style={styles.qcLeft}>
                                    <View style={[styles.qcColorBar, { backgroundColor: statusColor }]} />
                                    <View>
                                        <Text style={styles.qcName}>{item.name}</Text>
                                        <Text style={{ fontSize: 10, color: '#666' }}>{item.role}</Text>
                                    </View>
                                </View>
                                <View style={styles.qcActions}>
                                    {!isPending && (
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={[styles.qcCompleteBadge, { backgroundColor: item.status === 'Approved' ? '#dcfce7' : '#fee2e2', marginRight: 8 }]}>
                                                <Text style={{ color: item.status === 'Approved' ? '#166534' : '#991b1b', fontSize: 10, fontWeight: 'bold' }}>
                                                    {item.status}
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                onPress={() => handleQCAction(item.id, 'Pending')}
                                                style={{ padding: 4, borderRadius: 12, backgroundColor: '#f1f5f9' }}
                                            >
                                                <Ionicons name="refresh" size={16} color="#64748b" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    {isPending && (
                                        <Ionicons name="chevron-back" size={20} color="#cbd5e1" style={{ marginRight: 10 }} />
                                    )}
                                </View>
                            </View>
                        );

                        if (isPending) {
                            return (
                                <SwipeableActionRow
                                    key={item.id}
                                    onApprove={() => handleQCAction(item.id, 'Approved')}
                                    onReject={() => handleQCAction(item.id, 'Rejected')}
                                >
                                    {Content}
                                </SwipeableActionRow>
                            );
                        }

                        return (
                            <View key={item.id} style={{ backgroundColor: '#fff' }}>
                                {Content}
                            </View>
                        );
                    })}
                </Accordion>

                <View style={{ height: 100 }} />
            </ScrollView>
        </GestureHandlerRootView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eef2f6', // Light gray background match
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
        backgroundColor: '#eef2f6',
    },
    menuButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
    },
    circleButton: {
        width: 36,
        height: 36,
        borderRadius: 12, // Squircle
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    // JOB CARD HEADER
    jobCardHeaderBg: {
        backgroundColor: '#fff',
        borderRadius: 30, // Large pill shape
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    jobCardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    jobCardLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    jobCardValue: {
        fontSize: 18,
        fontWeight: '400',
        color: '#000',
    },
    urgentBadge: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    urgentText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    // ACCORDION
    accordionContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ccc', // Darker border like image
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 18,
    },
    accordionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000', // Black text
    },
    accordionContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    accordionDivider: {
        height: 1,
        backgroundColor: '#eee',
        marginBottom: 16,
        marginHorizontal: 8,
    },
    // GAUGE CHART
    gaugeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    gaugeChart: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        height: 80, // Half circle
        overflow: 'hidden',
    },
    gaugeTextContainer: {
        position: 'absolute',
        top: 40,
        alignItems: 'center',
    },
    gaugeMainText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
    },
    gaugeSubText: {
        fontSize: 10,
        color: '#666',
    },
    gaugeStatsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 16,
    },
    gaugeStatItem: {
        flex: 1,
        alignItems: 'center',
    },
    borderLeft: {
        borderLeftWidth: 1,
        borderLeftColor: '#eee',
        paddingLeft: 16,
    },
    gaugeStatNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
    },
    gaugeStatLabel: {
        fontSize: 12,
        color: '#666',
    },
    // TASKS
    taskCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 0,
        paddingVertical: 12,
    },
    taskColorBar: {
        width: 8,
        marginRight: 12,
        borderRadius: 2,
    },
    taskContent: {
        flex: 1,
        justifyContent: 'center',
    },
    taskRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    taskSubtitle: {
        fontSize: 12,
        fontWeight: 'normal',
        color: '#666',
    },
    taskEstimate: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    taskCost: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    legendRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginTop: 16,
        justifyContent: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 10,
        color: '#666',
    },
    // CHARGES
    chargeItem: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 12,
    },
    chargeColorBar: {
        width: 8,
        marginRight: 12,
        borderRadius: 2,
    },
    chargeContent: {
        flex: 1,
    },
    chargeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chargeName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    chargeDesc: {
        fontSize: 11,
        color: '#666',
    },
    chargePrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: 16,
        gap: 12,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    // CUSTOMER DETAILS
    detailList: {
        // paddingVertical: 8,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        minWidth: 100,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    detailDivider: {
        height: 1,
        backgroundColor: '#eee',
    },
    // QUALITY CHECK
    qcRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        height: 50,
    },
    qcLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
    },
    qcColorBar: {
        width: 8,
        height: '100%',
        marginRight: 12,
    },
    qcName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#000',
    },
    qcActions: {
        flexDirection: 'row',
        height: '100%',
    },
    qcBtnReject: {
        backgroundColor: '#eee',
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    qcBtnApprove: {
        backgroundColor: '#22c55e',
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    qcBtnRetry: {
        backgroundColor: '#eee',
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    qcCompleteBadge: {
        backgroundColor: '#22c55e',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    qcCompleteText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});



