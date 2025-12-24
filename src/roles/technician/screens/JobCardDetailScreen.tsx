
// ============================================
// JOB CARD DETAIL SCREEN - ACCORDION DESIGN
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, UIManager, Platform, LayoutAnimation, StyleSheet, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
const mockPartsRequests = [
    { id: 'p1', name: 'Front Bumper', quantity: 1, status: 'pending', price: 15000 },
    { id: 'p2', name: 'Headlight Bulb', quantity: 2, status: 'approved', price: 800 },
    { id: 'p3', name: 'Wiper Blades', quantity: 1, status: 'rejected', price: 1200 },
];

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
                    <Text style={styles.gaugeStatNumber}>{total - completed}</Text> {/* Simplifying Logic */}
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

export default function JobCardDetailScreen() {
    const navigation = useNavigation();
    const [expandedSection, setExpandedSection] = useState<string | null>('Task');

    const toggleSection = (section: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSection(expandedSection === section ? null : section);
    };

    // Swipeable Action Buttons
    const renderRightActions = (progress: any, dragX: any, task: any) => {
        return (
            <View style={styles.swipeActionsContainer}>
                <TouchableOpacity
                    style={styles.swipeActionReject}
                    onPress={() => console.log('Reject Task', task.id)}
                >
                    <Ionicons name="close" size={24} color="#fff" />
                    <Text style={styles.swipeActionText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.swipeActionApprove}
                    onPress={() => console.log('Approve Task', task.id)}
                >
                    <Ionicons name="checkmark" size={24} color="#fff" />
                    <Text style={styles.swipeActionText}>Done</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const totalCharges = mockCharges.reduce((sum, item) => sum + item.price, 0);

    return (
        <GestureHandlerRootView style={[styles.container, { flex: 1 }]}>
            {/* Custom Header Matches Image */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.menuButton}>
                    <Ionicons name="menu" size={28} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Active Jobs</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.iconButton}>
                        {/* Delete Icon - Red Squricle */}
                        <View style={[styles.headerIconContainer, { backgroundColor: '#fca5a5' }]}>
                            <Ionicons name="trash-outline" size={18} color="#991b1b" />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        {/* Add Icon - Green Squricle */}
                        <View style={[styles.headerIconContainer, { backgroundColor: '#86efac' }]}>
                            <Ionicons name="add" size={20} color="#166534" />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Main Job Card Header - Pill Shape */}
                <View style={styles.jobCardPill}>
                    <View style={styles.jobCardRow}>
                        <Text style={styles.jobCardLabel}>Job Card:</Text>
                        <Text style={styles.jobCardValue}>SA0001</Text>
                    </View>
                    <View style={styles.urgentBadge}>
                        <Text style={styles.urgentText}>Urgent</Text>
                    </View>
                </View>

                {/* 1. Task Summary Accordion */}
                <Accordion
                    title="Task Summary"
                    isOpen={expandedSection === 'Task Summary'}
                    onToggle={() => toggleSection('Task Summary')}
                >
                    <TaskGauge total={6} completed={4} />
                </Accordion>

                {/* 2. Task List Accordion */}
                <Accordion
                    title="Task"
                    isOpen={expandedSection === 'Task'}
                    onToggle={() => toggleSection('Task')}
                >
                    {mockTasks.map((task, index) => (
                        // Only allow swipe if not already completed/rejected ? User didn't specify, but usually yes.
                        // For now, allow all to allow user to see feature easily.
                        <Swipeable
                            key={task.id}
                            renderRightActions={(p, d) => renderRightActions(p, d, task)}
                            containerStyle={{ backgroundColor: '#fff' }} // Fix for some potential layout issues
                        >
                            <View style={styles.taskCard}>
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
                                            <Text style={styles.taskCost}>₹{task.cost.toLocaleString()}</Text>
                                            {task.status === 'completed' && (
                                                <View style={{ marginLeft: 8, padding: 4, backgroundColor: '#22c55e', borderRadius: 4 }}>
                                                    <Ionicons name="checkmark" size={16} color="#fff" />
                                                </View>
                                            )}
                                            {task.status === 'rejected' && (
                                                <View style={{ marginLeft: 8, padding: 4, backgroundColor: '#eee', borderRadius: 4 }}>
                                                    <Ionicons name="close" size={16} color="#000" />
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </Swipeable>
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

                {/* 3. Parts Permission */}
                <Accordion
                    title="Parts Permission"
                    isOpen={expandedSection === 'Parts Permission'}
                    onToggle={() => toggleSection('Parts Permission')}
                >
                    {mockPartsRequests.map((part) => (
                        <View key={part.id} style={styles.chargeItem}>
                            {/* Color Bar based on status */}
                            <View style={[
                                styles.chargeColorBar,
                                part.status === 'approved' ? { backgroundColor: '#22c55e' } :
                                    part.status === 'rejected' ? { backgroundColor: '#ef4444' } :
                                        { backgroundColor: '#f59e0b' } // Pending (Orange)
                            ]} />

                            <View style={styles.chargeContent}>
                                <View style={styles.chargeRow}>
                                    <View>
                                        <Text style={styles.chargeName}>{part.name}</Text>
                                        <Text style={styles.chargeDesc}>Qty: {part.quantity}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={styles.chargePrice}>₹{part.price.toLocaleString()}</Text>
                                        {/* Mini Status Badge */}
                                        <View style={{
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                            borderRadius: 4,
                                            marginTop: 4,
                                            backgroundColor: part.status === 'approved' ? '#dcfce7' : part.status === 'rejected' ? '#fee2e2' : '#fef3c7'
                                        }}>
                                            <Text style={{
                                                fontSize: 10,
                                                fontWeight: 'bold',
                                                color: part.status === 'approved' ? '#166534' : part.status === 'rejected' ? '#991b1b' : '#92400e'
                                            }}>
                                                {part.status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Add Part Button */}
                    <TouchableOpacity style={styles.addPartButton} onPress={() => console.log('Add Part Pressed')}>
                        <Ionicons name="add-circle-outline" size={20} color="#3b82f6" />
                        <Text style={styles.addPartText}>Request Part</Text>
                    </TouchableOpacity>
                </Accordion>
                <Accordion
                    title="Customer & Vehicle"
                    isOpen={expandedSection === 'Customer & Vehicle'}
                    onToggle={() => toggleSection('Customer & Vehicle')}
                >
                    <View style={styles.detailList}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>VIN:</Text>
                            <Text style={styles.detailValue}>GJ-05-RT-2134</Text>
                        </View>
                        <View style={styles.detailDivider} />

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Customer :</Text>
                            <Text style={styles.detailValue}>Ahmed Raza</Text>
                        </View>
                        <View style={styles.detailDivider} />

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Phone No :</Text>
                            <Text style={styles.detailValue}>+91 9890938291</Text>
                        </View>
                        <View style={styles.detailDivider} />

                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Car Brand:</Text>
                            <Text style={styles.detailValue}>Honda City</Text>
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
                    {/* Manager Row */}
                    <View style={styles.qcRow}>
                        <View style={styles.qcLeft}>
                            <View style={[styles.qcColorBar, { backgroundColor: '#1f2937' }]} />
                            <Text style={styles.qcName}>Technician Manager : Varun</Text>
                        </View>
                        <View style={styles.qcActions}>
                            <TouchableOpacity style={styles.qcBtnReject}>
                                <Ionicons name="close" size={20} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.qcBtnApprove}>
                                <Ionicons name="checkmark" size={20} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tech Row 1 */}
                    <View style={styles.qcRow}>
                        <View style={styles.qcLeft}>
                            <View style={[styles.qcColorBar, { backgroundColor: '#22c55e' }]} />
                            <Text style={styles.qcName}>Technician : Varun</Text>
                        </View>
                        {/* Done styling from image (empty or just bar) */}
                    </View>

                    {/* Tech Row 2 */}
                    <View style={styles.qcRow}>
                        <View style={styles.qcLeft}>
                            <View style={[styles.qcColorBar, { backgroundColor: '#ef4444' }]} />
                            <Text style={styles.qcName}>Technician : Ahmed</Text>
                        </View>
                        <View style={styles.qcActions}>
                            <TouchableOpacity style={styles.qcBtnRetry}>
                                <Ionicons name="sync" size={18} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </Accordion>

                <View style={{ height: 100 }} />
            </ScrollView>
        </GestureHandlerRootView>
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
        paddingTop: 50,
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
    headerIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8, // Squircle shape from image
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    // JOB CARD HEADER
    jobCardPill: {
        backgroundColor: '#fff',
        borderRadius: 30, // Large pill shape
        paddingVertical: 12,
        paddingHorizontal: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#cbd5e1',
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
        borderRadius: 30, // Fully rounded pill shape
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#cbd5e1',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14, // Slightly tighter vertical padding
    },
    accordionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000', // Black text
    },
    accordionContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
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
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingVertical: 12,
    },
    taskColorBar: {
        width: 6,
        marginRight: 12,
        borderRadius: 2,
        height: '80%',
        alignSelf: 'center',
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
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
    },
    taskSubtitle: {
        fontSize: 12,
        fontWeight: 'normal',
        color: '#666',
    },
    taskEstimate: {
        fontSize: 11,
        color: '#888',
        marginTop: 2,
    },
    taskCost: {
        fontSize: 15,
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
        width: 8,
        height: 8,
        borderRadius: 4,
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
        width: 6,
        marginRight: 12,
        borderRadius: 2,
        height: '80%',
        alignSelf: 'center',
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
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    chargeDesc: {
        fontSize: 11,
        color: '#666',
    },
    chargePrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
    },
    addPartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#3b82f6',
        borderRadius: 8,
        borderStyle: 'dashed',
        backgroundColor: '#eff6ff',
    },
    addPartText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3b82f6',
        marginLeft: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingTop: 16,
        gap: 12,
    },
    totalLabel: {
        fontSize: 16,
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
        width: 6,
        height: '60%',
        marginRight: 12,
        borderRadius: 2,
    },
    qcName: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#000',
    },
    qcActions: {
        flexDirection: 'row',
        height: '100%',
        alignItems: 'center',
    },
    qcBtnReject: {
        backgroundColor: '#f3f4f6',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    qcBtnApprove: {
        backgroundColor: '#bbf7d0',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qcBtnRetry: {
        backgroundColor: '#f3f4f6',
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
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
    // SWIPE ACTIONS
    swipeActionsContainer: {
        flexDirection: 'row',
        width: 140,
        height: '100%',
    },
    swipeActionReject: {
        backgroundColor: '#ef4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: '100%',
    },
    swipeActionApprove: {
        backgroundColor: '#22c55e',
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: '100%',
    },
    swipeActionText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 4,
    },
});
