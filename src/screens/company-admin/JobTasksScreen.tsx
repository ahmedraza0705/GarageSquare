import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { useJobs } from '@/context/JobContext';

const TECHNICIAN_MANAGERS = [
    'John Doe',
    'Jane Smith',
    'Robert Johnson',
    'Michael Brown'
];

export default function JobTasksScreen() {
    const { theme } = useTheme();
    const navigation = useNavigation();
    const { jobs, updateJobStatus, toggleWorkComplete, toggleQualityCheck, toggleDelivery, getJobsByStatus } = useJobs();

    const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'done'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    // Get live data from context
    const tabJobs = getJobsByStatus(activeTab);

    // Filter by search query if needed
    const filteredJobs = tabJobs.filter(job =>
        job?.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job?.vehicle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job?.jobId?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAssignJob = () => {
        if (!selectedJobId || !selectedTechnician) return;

        // Move to active (Status 'Progress') and assign technician
        updateJobStatus(selectedJobId, 'Progress', {
            workCompleted: false,
            qualityCheckCompleted: false,
            assignedTech: selectedTechnician
        });

        // Reset
        setAssignModalVisible(false);
        setSelectedTechnician(null);
        setSelectedJobId(null);
        setActiveTab('active');
    };


    const handleComplete = (jobId: string, currentStatus: boolean, qualityCheckStatus: boolean) => {
        const job = jobs.find(j => j.id === jobId);
        if (!job) return;

        // Check if all tasks are completed
        const services = job.services || [];
        const completedServices = job.completedServices || [];
        const allTasksDone = services.length > 0 && services.every(s => completedServices.includes(s));

        // If trying to mark as complete (turning it true), enforce validation
        if (!currentStatus && !allTasksDone) {
            Alert.alert(
                "Tasks Incomplete",
                "All tasks must be marked as 'Done' in the Details view before you can complete this job."
            );
            return;
        }

        // 1. Toggle Visual Logic (Blue button)
        toggleWorkComplete(jobId);

        // 2. Logic: Only move if BOTH are now true (Current toggle will make it true)
        const willBeComplete = !currentStatus;
        if (willBeComplete && qualityCheckStatus) {
            setTimeout(() => {
                updateJobStatus(jobId, 'Done', {
                    workCompleted: true,
                    qualityCheckCompleted: true,
                    deliveryCompleted: false // Ensure it lands in Done tab
                });
            }, 1000); // 1 sec delay
        }
    };

    const handleQualityCheck = (id: string, currentlyCompleted: boolean | undefined, isWorkDone: boolean | undefined) => {
        if (!currentlyCompleted) {
            toggleQualityCheck(id);

            // Check if Work Completed is ALSO done
            if (isWorkDone) {
                setTimeout(() => {
                    updateJobStatus(id, 'Done');
                }, 1000);
            }
        } else {
            toggleQualityCheck(id);
        }
    };

    const handleDelivery = (jobId: string) => {
        Alert.alert(
            "Confirm Delivery",
            "Are you sure about delivery?",
            [
                {
                    text: "No",
                    style: "cancel"
                },
                {
                    text: "Yes",
                    onPress: () => {
                        // 1. Show Success Message
                        Alert.alert("Success", "Vehicle sent to delivery successfully");

                        // 2. Visual Toggle (Blue Button)
                        toggleDelivery(jobId);

                        // 3. Remove from list after delay (Archiving)
                        setTimeout(() => {
                            updateJobStatus(jobId, 'Delivered', { deliveryCompleted: true });
                        }, 1000);
                    }
                }
            ]
        );
    };

    const renderTab = (name: string, count: number, key: 'pending' | 'active' | 'done') => {
        const isActive = activeTab === key;
        const tabCount = getJobsByStatus(key).length;

        return (
            <TouchableOpacity
                style={[
                    styles.tabButton,
                    {
                        backgroundColor: isActive ? '#3b82f6' : '#ffffff',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                    }
                ]}
                onPress={() => setActiveTab(key)}
            >
                <Text style={[
                    styles.tabText,
                    { color: isActive ? '#ffffff' : '#000000' }
                ]}>
                    {name} ({tabCount})
                </Text>
            </TouchableOpacity>
        );
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'waiting': return '#f59e0b'; // Orange
            case 'urgent': return '#ef4444'; // Red
            case 'progress': return '#3b82f6'; // Blue
            case 'done': return '#10b981'; // Green
            case 'delivered': return '#10b981'; // Green (same as Complete)
            default: return '#9ca3af';
        }
    };

    const renderJobCard = (job: any) => {
        return (
            <View key={job.id} style={[styles.card, { backgroundColor: '#ffffff' }]}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                        <Text style={styles.statusText}>
                            {job.status.toLowerCase() === 'delivered' ? 'Complete' : job.status}
                        </Text>
                    </View>
                    <Text style={styles.jobId}>Job Card {job.jobId}</Text>
                    <View style={styles.amountBadge}>
                        <Text style={styles.amountText}>{job.amount}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Card Body */}
                <View style={styles.cardBody}>
                    <View style={styles.vehicleIconContainer}>
                        <Text style={styles.vehicleIcon}>🚗</Text>
                    </View>
                    <View style={styles.detailsContainer}>
                        <Text style={styles.vehicleName}>{job.vehicle}</Text>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Customer : </Text>
                            <Text style={styles.detailValue}>{job.customer}</Text>
                        </View>
                        {activeTab !== 'pending' && (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Assigned tech: </Text>
                                <Text style={styles.detailValue}>{job.assignedTech || 'Unassigned'}</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.regNoContainer}>
                        <Text style={styles.regNo}>{job.regNo}</Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    {activeTab === 'pending' && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.primaryButton]}
                            onPress={() => {
                                setSelectedJobId(job.id);
                                setAssignModalVisible(true);
                            }}
                        >
                            <Text style={styles.primaryButtonText}>Start Task</Text>
                        </TouchableOpacity>
                    )}

                    {activeTab === 'active' && (
                        <>
                            {/* Complete Button Logic */}
                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    job.workCompleted ? styles.secondaryButton : styles.outlineButton,
                                    !job.workCompleted && { borderColor: '#3b82f6' }
                                ]}
                                onPress={() => handleComplete(job.id, job.workCompleted, job.qualityCheckCompleted)}
                            >
                                <Text style={[
                                    !job.workCompleted ? { color: '#3b82f6' } : styles.secondaryButtonText,
                                    !job.workCompleted ? styles.outlineButtonText : {}
                                ]}>
                                    Complete
                                </Text>
                            </TouchableOpacity>

                            {/* Quality Check Button logic */}
                            <TouchableOpacity
                                style={[
                                    styles.actionButton,
                                    job.qualityCheckCompleted ? styles.greenButton : styles.outlineButton
                                ]}
                                onPress={() => handleQualityCheck(job.id, job.qualityCheckCompleted, job.workCompleted)}
                            >
                                <Text style={[
                                    job.qualityCheckCompleted ? styles.primaryButtonText : styles.outlineButtonText
                                ]}>
                                    {job.qualityCheckCompleted ? 'Quality Check Complete' : 'Quality Check Not Complete'}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {activeTab === 'done' && (
                        <TouchableOpacity
                            style={[
                                styles.actionButton,
                                job.deliveryCompleted ? styles.greenButton : styles.outlineButton
                            ]}
                            onPress={() => handleDelivery(job.id, job.deliveryCompleted)}
                        >
                            <Text style={[
                                job.deliveryCompleted ? styles.primaryButtonText : styles.outlineButtonText,
                                !job.deliveryCompleted && { color: '#3b82f6' }
                            ]}>
                                {job.deliveryCompleted ? 'Delivered' : 'Delivery'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={[styles.actionButton, styles.detailButton]}
                        onPress={() => {
                            navigation.navigate('JobTasksDetail', { jobId: job.id });
                        }}
                    >
                        <Text style={styles.detailButtonText}>View Details</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                {/* Footer */}
                <View style={styles.cardFooter}>
                    <Text style={styles.footerText}>Delivery date: {job.deliveryDate}</Text>
                    <Text style={styles.footerText}>Delivery due: {job.deliveryDue}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {renderTab('Pending', 0, 'pending')}
                {renderTab('Active', 0, 'active')}
                {renderTab('Done', 0, 'done')}
            </View>

            {/* Search Bar + Add Button */}
            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search User"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity style={styles.filterButton}>
                        <Text style={styles.filterIcon}>⚡</Text>
                    </TouchableOpacity>
                </View>

                {/* Floating Add Button */}
                <TouchableOpacity
                    style={styles.addButtonIcon}
                    onPress={() => navigation.navigate('CreateJobCard')}
                >
                    <Text style={styles.addButtonIconText}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.listContent}>
                {filteredJobs.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 20, color: '#9ca3af' }}>No jobs found</Text>
                ) : (
                    filteredJobs.map(renderJobCard)
                )}
            </ScrollView>

            {/* Assign Modal */}
            <Modal
                visible={assignModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setAssignModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Technician Manager *</Text>
                        <TouchableOpacity style={styles.dropdown}>
                            <Text style={{ color: selectedTechnician ? '#000' : '#9ca3af' }}>
                                {selectedTechnician || 'Select Technician Manager'}
                            </Text>
                            <Text>⬇️</Text>
                        </TouchableOpacity>

                        <ScrollView style={{ maxHeight: 150, marginBottom: 16 }}>
                            {TECHNICIAN_MANAGERS.map((tm, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={{
                                        paddingVertical: 12,
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#f3f4f6',
                                        backgroundColor: selectedTechnician === tm ? '#eff6ff' : 'transparent'
                                    }}
                                    onPress={() => setSelectedTechnician(tm)}
                                >
                                    <Text style={{
                                        fontWeight: selectedTechnician === tm ? 'bold' : 'normal',
                                        color: selectedTechnician === tm ? '#2563eb' : '#374151'
                                    }}>
                                        {tm}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setAssignModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.addButton,
                                    !selectedTechnician && { opacity: 0.5 }
                                ]}
                                onPress={handleAssignJob}
                                disabled={!selectedTechnician}
                            >
                                <Text style={styles.addButtonText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    tabsContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabText: {
        fontWeight: '600',
        fontSize: 14,
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
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 8,
        color: '#9ca3af',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000000',
    },
    filterButton: {
        padding: 4,
    },
    filterIcon: {
        fontSize: 18,
        color: '#9ca3af',
    },
    addButtonIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#d97706',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonIconText: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContent: {
        paddingBottom: 24,
    },
    card: {
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
    },
    statusText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    jobId: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
        flex: 1,
    },
    amountBadge: {
        backgroundColor: '#6b7280',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    amountText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
    },
    cardBody: {
        padding: 12,
        flexDirection: 'row',
    },
    vehicleIconContainer: {
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    vehicleIcon: {
        fontSize: 32,
    },
    detailsContainer: {
        flex: 1,
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    detailLabel: {
        color: '#6b7280',
        fontSize: 12,
    },
    detailValue: {
        fontSize: 12,
        fontWeight: '500',
    },
    regNoContainer: {
        alignItems: 'flex-end',
    },
    regNo: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    actionRow: {
        flexDirection: 'row',
        padding: 12,
        gap: 8,
        flexWrap: 'wrap',
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButton: {
        backgroundColor: '#d97706',
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#3b82f6',
    },
    secondaryButtonText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    greenButton: {
        backgroundColor: '#10b981',
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: '#9ca3af',
        backgroundColor: 'transparent',
    },
    outlineButtonText: {
        color: '#6b7280',
        fontSize: 12,
    },
    detailButton: {
        backgroundColor: '#e5e7eb',
        marginLeft: 'auto',
    },
    detailButtonText: {
        color: '#374151',
        fontSize: 12,
        fontWeight: '600',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#f9fafb',
    },
    footerText: {
        fontSize: 11,
        color: '#6b7280',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 24,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
    },
    addButton: {
        backgroundColor: '#2563eb',
    },
    cancelButtonText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 14,
    },
    addButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 14,
    }
});
