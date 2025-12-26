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
    const navigation = useNavigation<any>();
    const { jobs, updateJobStatus, toggleWorkComplete, toggleQualityCheck, toggleDelivery, getJobsByStatus } = useJobs();

    const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'done'>('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [technicianSearchQuery, setTechnicianSearchQuery] = useState('');

    const filteredTechnicians = TECHNICIAN_MANAGERS.filter(tm =>
        tm.toLowerCase().includes(technicianSearchQuery.toLowerCase())
    );

    // Get live data from context
    const tabJobs = getJobsByStatus(activeTab);

    // Filter jobs by multiple fields (Job ID, Vehicle name, Reg No, Technician name)
    const filteredJobs = tabJobs.filter(job => {
        const query = searchQuery.toLowerCase();
        return (
            (job?.jobId?.toLowerCase() || '').includes(query) ||
            (job?.vehicle?.toLowerCase() || '').includes(query) ||
            (job?.regNo?.toLowerCase() || '').includes(query) ||
            (job?.assignedTech?.toLowerCase() || '').includes(query)
        );
    });

    // Sort jobs by priority (Urgent first, then by jobId)
    const sortedJobs = [...filteredJobs].sort((a, b) => {
        const aUrgent = a.priority === 'Urgent';
        const bUrgent = b.priority === 'Urgent';
        if (aUrgent && !bUrgent) return -1;
        if (!aUrgent && bUrgent) return 1;
        // Secondary sort by updatedAt (newest first)
        return (b.updatedAt || 0) - (a.updatedAt || 0);
    });

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
        const allTasksDone = services.length > 0 && services.every((s: any) =>
            completedServices.includes(typeof s === 'string' ? s : s.name)
        );

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

                        // 3. Update status to Delivered (job will disappear from Done tab)
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
                        backgroundColor: isActive ? '#4682B4' : 'transparent',
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
            case 'pending': return '#f59e0b'; // Orange (same as Waiting)
            case 'waiting': return '#f59e0b'; // Orange
            case 'urgent': return '#ef4444'; // Red
            case 'progress': return '#3b82f6'; // Blue
            case 'done': return '#10b981'; // Green
            case 'delivered': return '#10b981'; // Green (same as Complete)
            default: return '#9ca3af';
        }
    };

    // Calculate time left from now until delivery date/time
    const calculateTimeLeft = (dateStr?: string, timeStr?: string) => {
        if (!dateStr || !timeStr) return timeStr || 'N/A';

        try {
            // Parse Date: DD-MM-YYYY
            const [day, month, year] = dateStr.split('-').map(Number);

            // Parse Time: HH:MM AM/PM
            const timeParts = timeStr.toUpperCase().trim().split(' ');
            // Handle cases like "5:00PM" (no space) or "5:00 PM"
            let time, modifier;
            if (timeParts.length === 1) {
                // Try splitting by AM/PM if attached
                if (timeParts[0].includes('PM')) {
                    modifier = 'PM';
                    time = timeParts[0].replace('PM', '');
                } else if (timeParts[0].includes('AM')) {
                    modifier = 'AM';
                    time = timeParts[0].replace('AM', '');
                } else {
                    // Assume 24h or missing modifier, treat as is for 24h or default AM
                    time = timeParts[0];
                    modifier = 'AM'; // Default
                }
            } else {
                [time, modifier] = timeParts;
            }

            let [hours, minutes] = time.split(':').map(Number);

            if (isNaN(hours) || isNaN(minutes)) throw new Error('Invalid Time');

            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;

            const targetDate = new Date(year, month - 1, day, hours, minutes);
            const now = new Date();
            const diff = targetDate.getTime() - now.getTime();

            if (diff <= 0) return 'Overdue';

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) return `${days}d ${hrs}h left`;
            if (hrs > 0) return `${hrs}h ${mins}m left`;
            return `${mins}m left`;
        } catch (e) {
            return timeStr; // Fallback to original string if parse fails
        }
    };

    const renderJobCard = (job: any) => {
        // Calculate progress logic (from ActiveJobsScreen)
        const calculateProgress = (job: any) => {
            if (!job.taskStatuses) return 0;
            const statuses = Object.values(job.taskStatuses) as string[];
            if (statuses.length === 0) return 0;
            const complete = statuses.filter(s => s === 'complete').length;
            return complete / statuses.length;
        };
        const progress = calculateProgress(job);

        return (
            <TouchableOpacity
                key={job.id}
                style={styles.card}
                onPress={() => navigation.navigate('JobCardDetail', { jobCardId: job.id })}
                activeOpacity={0.7}
            >
                {/* Header: Job Card No, Status & Price */}
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <Text style={styles.jobId}>{job.jobId}</Text>
                        {job.priority === 'Urgent' && (
                            <View style={[styles.statusBadge, { backgroundColor: '#ef4444' }]}>
                                <Text style={styles.statusText}>Urgent</Text>
                            </View>
                        )}
                        {job.priority !== 'Urgent' && job.status?.toLowerCase() !== 'urgent' && (
                            <View style={[styles.statusBadge, {
                                backgroundColor: job.status?.toLowerCase() === 'waiting' ? '#f59e0b' :
                                    activeTab === 'done' ? '#22c55e' : '#4682B4'
                            }]}>
                                <Text style={styles.statusText}>
                                    {job.status?.toLowerCase() === 'waiting' || job.status?.toLowerCase() === 'pending' ? 'Pending' :
                                        activeTab === 'done' ? 'Complete' :
                                            (progress === 1 && !job.qualityCheckCompleted) ? 'Quality check left' : 'In progress'}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.amountText}>{job.amount}</Text>
                </View>

                <View style={styles.divider} />

                {/* Vehicle Info */}
                <View style={styles.vehicleSection}>
                    <View>
                        <Text style={styles.vehicleName}>{job.vehicle}</Text>
                        <Text style={styles.regNo}>{job.regNo}</Text>
                    </View>
                    <Text style={styles.vehicleIcon}>🚗</Text>
                </View>

                <View style={styles.divider} />

                {/* Assignment & Progress */}
                <View style={styles.assignmentSection}>
                    <View style={styles.assignedRow}>
                        <View style={styles.assignedAvatar}>
                            <Text style={styles.avatarText}>AR</Text>
                        </View>
                        <Text style={styles.assignedToText}>Assigned to: {activeTab !== 'pending' && <Text style={styles.boldText}>{job.assignedTech || 'Ahmed Raza'}</Text>}</Text>
                    </View>

                    <View style={styles.progressRow}>
                        <View style={styles.progressBarBackground}>
                            <View style={[
                                styles.progressBarFill,
                                {
                                    width: activeTab === 'done' ? '100%' : `${progress * 100}%`,
                                    backgroundColor: activeTab === 'done' ? '#22c55e' : '#4682B4'
                                }
                            ]} />
                        </View>
                        <Text style={[
                            styles.progressLabel,
                            { color: activeTab === 'done' ? '#22c55e' : '#4682B4' }
                        ]}>
                            {activeTab === 'done' ? '100' : Math.round(progress * 100)}% completed
                        </Text>
                    </View>
                </View>

                {/* Delivery Info */}
                <View style={styles.deliveryInfoRow}>
                    <View>
                        <Text style={styles.deliveryLabelTop}>Delivery due:</Text>
                        <Text style={styles.deliveryValueLarge}>
                            {activeTab === 'pending'
                                ? (job.deliveryDue || '')
                                : calculateTimeLeft(job.deliveryDate || '', job.deliveryDue)
                            }
                        </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.deliveryLabelTop}>Delivery date:</Text>
                        <Text style={styles.deliveryValueLarge}>{job.deliveryDate || ''}</Text>
                    </View>
                </View>

                {
                    (activeTab === 'pending' || activeTab === 'done') && (
                        <TouchableOpacity
                            style={styles.startTaskButton}
                            onPress={() => {
                                if (activeTab === 'pending') {
                                    setSelectedJobId(job.id);
                                    setAssignModalVisible(true);
                                } else {
                                    handleDelivery(job.id);
                                }
                            }}
                        >
                            <Text style={styles.startTaskText}>
                                {activeTab === 'pending' ? 'Start Task' : 'Delivery'}
                            </Text>
                        </TouchableOpacity>
                    )
                }
            </TouchableOpacity >
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Tabs */}
            <View style={styles.tabsWrapper}>
                <View style={styles.tabsContainer}>
                    {renderTab('Pending', 0, 'pending')}
                    {renderTab('Active', 0, 'active')}
                    {renderTab('Done', 0, 'done')}
                </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search Job Cards"
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('CreateJobCard')}
                >
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.listContent}>
                {filteredJobs.length === 0 ? (
                    <Text style={{ textAlign: 'center', marginTop: 20, color: '#9ca3af' }}>No jobs found</Text>
                ) : (
                    sortedJobs.map(renderJobCard)
                )}
            </ScrollView>

            {/* Assign Modal */}
            {/* Assign Modal */}
            <Modal
                visible={assignModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setAssignModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setAssignModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContent}
                        activeOpacity={1}
                    >
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Technician Manager *</Text>
                            <TouchableOpacity onPress={() => setAssignModalVisible(false)}>
                                <Text style={styles.arrowIcon}>↑</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Modal Search Bar */}
                        <View style={styles.modalSearchContainer}>
                            <Text style={styles.searchIconSmall}>🔍</Text>
                            <TextInput
                                style={styles.modalSearchInput}
                                placeholder="Search Name"
                                placeholderTextColor="#9ca3af"
                                value={technicianSearchQuery}
                                onChangeText={setTechnicianSearchQuery}
                            />
                        </View>

                        {/* Technician List */}
                        <ScrollView style={styles.technicianList}>
                            {filteredTechnicians.map((tm, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[
                                        styles.technicianItem,
                                        selectedTechnician === tm && styles.selectedTechnicianItem
                                    ]}
                                    onPress={() => {
                                        setSelectedTechnician(tm);
                                    }}
                                >
                                    <Text style={[
                                        styles.technicianName,
                                        selectedTechnician === tm && styles.selectedTechnicianText
                                    ]}>
                                        {tm}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            {filteredTechnicians.length === 0 && (
                                <Text style={styles.noResultsText}>No results found</Text>
                            )}
                        </ScrollView>

                        {/* Action Buttons */}
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
                                    styles.assignButton,
                                    !selectedTechnician && { opacity: 0.5 }
                                ]}
                                onPress={handleAssignJob}
                                disabled={!selectedTechnician}
                            >
                                <Text style={styles.assignButtonText}>Assign</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    tabsWrapper: {
        backgroundColor: '#ffffff',
        borderRadius: 25,
        padding: 4,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    tabsContainer: {
        flexDirection: 'row',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
    },
    tabText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    searchRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 25,
        paddingHorizontal: 16,
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
    listContent: {
        paddingBottom: 40,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        // Shadow for premium feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    jobId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 10,
    },
    amountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 12,
    },
    vehicleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    regNo: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    vehicleIcon: {
        fontSize: 28,
    },
    assignmentSection: {
        marginBottom: 12,
    },
    assignedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    assignedAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#4682B4',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    avatarText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    assignedToText: {
        fontSize: 14,
        color: '#000',
    },
    boldText: {
        fontWeight: 'bold',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBarBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4682B4',
        borderRadius: 4,
    },
    progressLabel: {
        fontSize: 10,
        color: '#4682B4',
        fontWeight: '500',
    },
    deliveryInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    deliveryLabelTop: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    deliveryValueLarge: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    startTaskButton: {
        backgroundColor: '#b45309', // Brownish orange
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    startTaskText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 25, // Large rounded corners like the pic
        padding: 24,
        width: '100%',
        maxWidth: 340,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    arrowIcon: {
        fontSize: 20,
        color: '#000',
        fontWeight: 'bold',
    },
    modalSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchIconSmall: {
        fontSize: 14,
        color: '#9ca3af',
        marginRight: 8,
    },
    modalSearchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
    },
    technicianList: {
        maxHeight: 200,
        marginBottom: 16,
    },
    technicianItem: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    selectedTechnicianItem: {
        backgroundColor: '#eff6ff',
    },
    technicianName: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    selectedTechnicianText: {
        color: '#4682B4',
        fontWeight: '700',
    },
    noResultsText: {
        textAlign: 'center',
        color: '#9ca3af',
        marginTop: 12,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#f3f4f6',
    },
    assignButton: {
        backgroundColor: '#4682B4',
    },
    cancelButtonText: {
        color: '#374151',
        fontWeight: '600',
    },
    assignButtonText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    addButton: {
        width: 44,
        height: 44,
        backgroundColor: '#a7f3d0', // Green button
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
        borderWidth: 1,
        borderColor: '#10b981',
    },
    addButtonText: {
        fontSize: 24,
        color: '#000',
        fontWeight: '300',
    },
});
