// ============================================
// JOB CARD DETAIL SCREEN (Redesign)
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, Platform, Alert, Modal, TextInput, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Trash2, Plus, ChevronDown, ChevronUp, Menu, X, Check, Undo2, LayoutDashboard, Building2, Users, FileBarChart, ChevronLeft, RotateCcw, UserCheck } from 'lucide-react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useJobs, Job, ServiceDetail } from '../../context/JobContext';

// --- CONSTANTS ---
const COMMON_SERVICES = [
  'Oil Change',
  'Brake Pad Replacement',
  'Battery Replacement',
  'Tire Rotation',
  'AC Recharge',
  'Wheel Alignment',
  'Suspension Repair',
  'Engine Diagnostics',
  'Alternator Repair',
  'Spark Plug Replacement',
  'Exhaust Leak Repair',
  'Transmission Flush',
  'Wheel Balancing',
  'Radiator Flush',
  'Belt Replacement',
  'Headlight Restoration',
  'Fuel Filter Replacement',
  'Clutch Repair',
  'Power Steering Flush',
  'Cabin Air Filter Change',
];

// Screen Dimensions
const { width } = Dimensions.get('window');

// --- TYPES ---
interface Task {
  id: string;
  title: string;
  assignedTo: string; // e.g., "(varun)"
  estimate: string;
  cost: number;
  status: 'complete' | 'rejected' | 'pending' | 'approval';
}

interface Charge {
  id: string;
  description: string;
  details?: string;
  cost: number;
}

interface QualityCheck {
  id: string;
  role: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
}

// --- COMPONENTS ---

// 1. Accordion Component
const Accordion = ({
  title,
  children,
  isOpen,
  onToggle,
  badge
}: {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  badge?: React.ReactNode;
}) => {
  return (
    <View style={styles.accordionContainer}>
      <TouchableOpacity style={styles.accordionHeader} onPress={onToggle} activeOpacity={0.7}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={styles.accordionTitle}>{title}</Text>
          {badge && <View style={{ marginLeft: 'auto', marginRight: 10 }}>{badge}</View>}
        </View>
        {isOpen ? <ChevronUp size={24} color="#000" /> : <ChevronDown size={24} color="#000" />}
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.accordionContent}>
          {children}
        </View>
      )}
    </View>
  );
};

// 2. Circular Progress Chart (Semi-Circle)
const SemiCircleProgress = ({ total, complete, rejected }: { total: number; complete: number; rejected: number }) => {
  // Simple calculation for demo
  const radius = 80;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  // We want a semi-circle (180 degrees), so max strokeDasharray is half circumference
  const halfCircumference = circumference / 2;

  // Progress
  const progressRatio = complete / total;
  const progressArc = halfCircumference * progressRatio;

  // Center coordinates
  const cx = 100;
  const cy = 100;

  return (
    <View style={styles.chartContainer}>
      <Svg height="120" width="200" viewBox="0 0 200 120">
        <G rotation="-180" origin="100, 100">
          {/* Background Arc (Gray) */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${halfCircumference} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Progress Arc (Blue) */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="#4682B4" // Steel Blue
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${progressArc} ${circumference}`}
            strokeLinecap="round"
          />
        </G>
        {/* Count Text */}
        <SvgText
          x={cx}
          y={cy - 20}
          fontSize="36"
          fontWeight="bold"
          fill="#000"
          textAnchor="middle"
        >
          {complete}
        </SvgText>
        <SvgText
          x={cx}
          y={cy}
          fontSize="12"
          fill="#374151"
          textAnchor="middle"
        >
          Task Complete
        </SvgText>
      </Svg>

      {/* Stats Below Chart */}
      <View style={styles.chartStatsRow}>
        <View style={styles.chartStatItem}>
          <Text style={styles.chartStatValue}>{total}</Text>
          <Text style={styles.chartStatLabel}>Total task</Text>
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.chartStatItem}>
          <Text style={styles.chartStatValue}>{rejected}</Text>
          <Text style={styles.chartStatLabel}>Rejected</Text>
        </View>
      </View>
    </View>
  );
};

// 3. Task Item with Swipeable Actions
const TaskItem = ({
  task,
  currentStatus,
  onStatusChange
}: {
  task: Task;
  currentStatus: Task['status'];
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  // Use currentStatus instead of task.status for color coding
  let borderColor = '#9ca3af'; // Default gray
  let statusColor = '#9ca3af';

  if (currentStatus === 'complete') { borderColor = '#22c55e'; statusColor = '#22c55e'; } // Green
  else if (currentStatus === 'rejected') { borderColor = '#ef4444'; statusColor = '#ef4444'; } // Red
  else if (currentStatus === 'pending') { borderColor = '#374151'; statusColor = '#374151'; } // Dark Gray/Blueish
  else if (currentStatus === 'approval') { borderColor = '#eab308'; statusColor = '#eab308'; } // Yellow

  // Handle reject action
  const handleReject = () => {
    onStatusChange(task.id, 'rejected');
    swipeableRef.current?.close();
  };

  // Handle approve action
  const handleApprove = () => {
    // If task needs approval, approve it by changing to pending
    // Otherwise, mark as complete
    const newStatus = currentStatus === 'approval' ? 'pending' : 'complete';
    onStatusChange(task.id, newStatus);
    swipeableRef.current?.close();
  };

  // Handle undo action (revert to pending)
  const handleUndo = () => {
    onStatusChange(task.id, 'pending');
    swipeableRef.current?.close();
  };

  // Handle need approval action
  const handleNeedApproval = () => {
    onStatusChange(task.id, 'approval');
    swipeableRef.current?.close();
  };

  // Render left swipe actions (Swipe Right)
  const renderLeftActions = () => {
    // Only available when status is pending
    if (currentStatus !== 'pending') return null;

    return (
      <View style={styles.swipeActionsContainer}>
        <TouchableOpacity
          style={[styles.swipeActionButton, styles.needApprovalButton]}
          onPress={handleNeedApproval}
        >
          <UserCheck size={20} color="#000" />
        </TouchableOpacity>
      </View>
    );
  };

  // Render right swipe actions based on current status
  const renderRightActions = () => {
    // If task is complete or rejected, show only undo button
    if (currentStatus === 'complete' || currentStatus === 'rejected') {
      return (
        <View style={styles.swipeActionsContainer}>
          <TouchableOpacity
            style={[styles.swipeActionButton, styles.undoButton]}
            onPress={handleUndo}
          >
            <Undo2 size={20} color="#000" />
          </TouchableOpacity>
        </View>
      );
    }

    // For pending or approval status, show approve and reject buttons
    return (
      <View style={styles.swipeActionsContainer}>
        <TouchableOpacity
          style={[styles.swipeActionButton, styles.rejectButton]}
          onPress={handleReject}
        >
          <X size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeActionButton, styles.approveButton]}
          onPress={handleApprove}
        >
          <Check size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootRight={false}
      overshootLeft={false}
      friction={2}
    >
      <View style={styles.taskItemContainer}>
        {/* Left colored border */}
        <View style={[styles.taskStatusIndicator, { backgroundColor: borderColor }]} />

        <View style={styles.taskContent}>
          <View style={styles.taskRow}>
            <Text style={styles.taskTitle}>{task.title} <Text style={styles.taskAssigned}>{task.assignedTo}</Text></Text>
            <Text style={styles.taskCost}>₹{task.cost.toLocaleString('en-IN')}</Text>
          </View>
          <Text style={styles.taskEstimate}>Estimate: {task.estimate}</Text>
        </View>
      </View>
    </Swipeable>
  );
};

// 4. Charge Item
const ChargeItem = ({ charge }: { charge: Charge }) => (
  <View style={styles.chargeItemContainer}>
    <View style={{ flex: 1 }}>
      <Text style={styles.chargeTitle}>{charge.description}</Text>
      {charge.details && <Text style={styles.chargeDetails}>{charge.details}</Text>}
    </View>
    <Text style={styles.chargeCost}>₹{charge.cost.toLocaleString('en-IN')}</Text>
  </View>
);

// 5. Quality Check Item with Swipeable Actions
const QualityCheckItem = ({
  check,
  currentStatus,
  onStatusChange
}: {
  check: QualityCheck;
  currentStatus: QualityCheck['status'];
  onStatusChange: (checkId: string, newStatus: QualityCheck['status']) => void;
}) => {
  const swipeableRef = useRef<Swipeable>(null);

  // Color coding border based on status
  let borderColor = '#374151'; // Default dark gray for pending
  if (currentStatus === 'approved') borderColor = '#22c55e'; // Green
  else if (currentStatus === 'rejected') borderColor = '#ef4444'; // Red

  // Handle reject action
  const handleReject = () => {
    onStatusChange(check.id, 'rejected');
    swipeableRef.current?.close();
  };

  // Handle approve action
  const handleApprove = () => {
    onStatusChange(check.id, 'approved');
    swipeableRef.current?.close();
  };

  // Handle undo action (revert to pending)
  const handleUndo = () => {
    onStatusChange(check.id, 'pending');
    swipeableRef.current?.close();
  };

  // Render right swipe actions based on current status
  const renderRightActions = () => {
    // If approved or rejected, show only undo button
    if (currentStatus === 'approved' || currentStatus === 'rejected') {
      return (
        <View style={styles.swipeActionsContainer}>
          <TouchableOpacity
            style={[styles.swipeActionButton, styles.undoButton]}
            onPress={handleUndo}
          >
            <Undo2 size={20} color="#000" />
          </TouchableOpacity>
        </View>
      );
    }

    // For pending status, show approve and reject buttons
    return (
      <View style={styles.swipeActionsContainer}>
        <TouchableOpacity
          style={[styles.swipeActionButton, styles.rejectButton]}
          onPress={handleReject}
        >
          <X size={20} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeActionButton, styles.approveButton]}
          onPress={handleApprove}
        >
          <Check size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <View style={styles.qualityRow}>
        <View style={[styles.qualityStatusIndicator, { backgroundColor: borderColor }]} />
        <View style={styles.qualityContent}>
          <Text style={styles.qualityLabel}>{check.role} : <Text style={styles.qualityValue}>{check.name}</Text></Text>
        </View>
      </View>
    </Swipeable>
  );
};

export default function JobCardDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { jobs, setJobDetails, deleteJob, updateJobStatus } = useJobs();

  // Add Service Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newEstimateHour, setNewEstimateHour] = useState('');
  const [newEstimateMin, setNewEstimateMin] = useState('');
  const [newCost, setNewCost] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [stagedServices, setStagedServices] = useState<ServiceDetail[]>([]);

  // Get jobCardId from route params, default to '2' (SA0001) for demo persistence
  const jobCardId = route.params?.jobCardId || '2';
  const currentJob = jobs.find(j => j.id === jobCardId);

  const handleDelete = () => {
    Alert.alert(
      "Delete Job Card",
      "Are you sure you want to delete this job card?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteJob(jobCardId);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Error", "Failed to delete job card. Please try again.");
            }
          }
        }
      ]
    );
  };

  const jobToDisplay = currentJob || {
    id: jobCardId,
    jobId: 'N/A',
    services: [],
    taskStatuses: {},
    qualityStatuses: {},
    status: 'Pending',
    customer: 'Loading...',
    vehicle: 'Loading...',
    regNo: 'N/A',
    amount: '₹0'
  } as Job;

  // Derive Dynamic Tasks from Job Services
  const dynamicTasks: Task[] = (jobToDisplay.services || []).map((service: ServiceDetail, index: number) => ({
    id: service.name, // Use name as ID
    title: service.name,
    assignedTo: currentJob?.assignedTech ? `(${currentJob.assignedTech})` : '',
    estimate: service.estimate || '45 min',
    cost: service.cost || 0,
    status: 'pending'
  }));

  // DEBUG LOGGING
  useEffect(() => {
    console.log(`[JobCardDetails] Job ${jobCardId} services:`, currentJob?.services);
    console.log(`[JobCardDetails] Dynamic Tasks:`, dynamicTasks);
  }, [currentJob, dynamicTasks]);

  // Derive Dynamic Charges
  const dynamicCharges: Charge[] = dynamicTasks.map((task, index) => ({
    id: `c-${task.id}`,
    description: task.title,
    details: 'Service Charge',
    cost: task.cost
  }));

  // Derive statuses directly from Job object to ensure live updates
  const taskStatuses = (() => {
    const statuses = { ...(jobToDisplay.taskStatuses || {}) } as Record<string, Task['status']>;
    // Ensure all dynamic tasks have at least a 'pending' status if not set
    dynamicTasks.forEach(t => {
      if (!statuses[t.id]) {
        statuses[t.id] = (jobToDisplay.status === 'Done' || jobToDisplay.status === 'Delivered') ? 'complete' : 'pending';
      }
    });
    return statuses;
  })();

  // Derive Dynamic Quality Checks
  const dynamicQualityChecks: QualityCheck[] = [
    {
      id: '1',
      role: 'Technician Manager',
      name: currentJob?.assignedTech || 'Unassigned',
      status: 'pending'
    },
    {
      id: '2',
      role: 'Technician',
      name: currentJob?.assignedTech || 'Unassigned',
      status: 'pending'
    },
  ];

  const qualityStatuses = (() => {
    const statuses = { ...(jobToDisplay.qualityStatuses || {}) } as Record<string, QualityCheck['status']>;
    dynamicQualityChecks.forEach(q => {
      if (!statuses[q.id]) {
        statuses[q.id] = (jobToDisplay.status === 'Done' || jobToDisplay.status === 'Delivered') ? 'approved' : 'pending';
      }
    });
    return statuses;
  })();

  // Calculate Total dynamically from Charges
  const calculateTotal = () => {
    return dynamicCharges.reduce((sum, item) => sum + item.cost, 0);
  };

  const [openSections, setOpenSections] = useState({
    summary: true,
    task: false,
    charges: false,
    customer: false,
    quality: false
  });

  // Auto-move to Done logic
  // Auto-move to Done logic
  useEffect(() => {
    if (!currentJob || currentJob.status === 'Done' || currentJob.status === 'Delivered') return;

    const statuses = Object.values(taskStatuses);
    // Filter out rejected tasks - they don't count towards completion requirement
    const validStatuses = statuses.filter(s => s !== 'rejected');
    const allTasksComplete = validStatuses.length > 0 && validStatuses.every(status => status === 'complete');

    // If all tasks are rejected, we can also consider it complete (nothing left to do)
    const isTotallyRejected = statuses.length > 0 && validStatuses.length === 0;

    const allQCApproved = Object.values(qualityStatuses).every(status => status === 'approved');

    if ((allTasksComplete || isTotallyRejected) && allQCApproved) {
      updateJobStatus(currentJob.id, 'Done', {
        workCompleted: true,
        qualityCheckCompleted: true
      });
      // Optionally notify user
      Alert.alert("Job Complete", `Job Card ${currentJob.jobId} has been moved to Done.`);
    }
  }, [taskStatuses, qualityStatuses, currentJob, updateJobStatus]);

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Function to update task status and save to context
  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const updatedStatuses = {
      ...taskStatuses,
      [taskId]: newStatus
    };

    // Persist to Global Context
    if (currentJob) {
      setJobDetails(currentJob.id, { taskStatuses: updatedStatuses });
    }
  };

  // Function to update quality check status and save to context
  const updateQualityStatus = (checkId: string, newStatus: QualityCheck['status']) => {
    const updatedStatuses = {
      ...qualityStatuses,
      [checkId]: newStatus
    };

    // Persist to Global Context
    if (currentJob) {
      setJobDetails(currentJob.id, { qualityStatuses: updatedStatuses });
    }
  };

  const filteredServices = COMMON_SERVICES.filter(service =>
    service.toLowerCase().includes(newServiceName.toLowerCase())
  );

  const handleAddServiceManual = () => {
    if (!newServiceName || !newCost) {
      Alert.alert('Error', 'Please enter service name and cost');
      return;
    }

    const timeStr = `${newEstimateHour || '0'}h ${newEstimateMin || '0'}m`;
    const newService = {
      name: newServiceName,
      cost: parseFloat(newCost),
      estimate: timeStr
    };

    setStagedServices(prev => [...prev, newService]);

    // Reset inputs but keep modal open
    setNewServiceName('');
    setNewEstimateHour('');
    setNewEstimateMin('');
    setNewCost('');
    Keyboard.dismiss();
  };

  const handleRemoveStagedService = (index: number) => {
    setStagedServices(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitStagedServices = () => {
    if (stagedServices.length === 0) {
      Alert.alert('Error', 'Please add at least one service');
      return;
    }

    if (currentJob) {
      const updatedServices = [...(currentJob.services || []), ...stagedServices];

      // Update task statuses for all new services
      const newTaskStatuses = { ...taskStatuses };
      stagedServices.forEach(s => {
        newTaskStatuses[s.name] = 'pending';
      });

      setJobDetails(currentJob.id, {
        services: updatedServices,
        taskStatuses: newTaskStatuses
      });

      setStagedServices([]);
      setModalVisible(false);
      Alert.alert('Success', `${stagedServices.length} service(s) added successfully`);
    }
  };

  // Calculate task summary statistics dynamically
  const calculateTaskSummary = () => {
    const statuses = Object.values(taskStatuses);
    const totalRaw = statuses.length;
    const complete = statuses.filter(status => status === 'complete').length;
    const rejected = statuses.filter(status => status === 'rejected').length;

    // Adjusted Total: Exclude rejected from the denominator so percentage hits 100%
    // If 6 tasks, 1 rejected, 5 complete -> Total should be considered 5 for the chart.
    const effectiveTotal = totalRaw - rejected;

    return { total: effectiveTotal, complete, rejected };
  };

  const taskSummary = calculateTaskSummary();

  const isQualityComplete = Object.values(qualityStatuses).every(status => status === 'approved');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft color="#000" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Card Details</Text>
          <View style={styles.headerRightButtons}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: '#fca5a5' }]}
              onPress={handleDelete}
            >
              <Trash2 size={18} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: '#a7f3d0' }]}
              onPress={() => setModalVisible(true)}
            >
              <Plus size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Job Card Banner */}
          <View style={styles.bannerContainer}>
            <Text style={styles.bannerValue}>{jobToDisplay.jobId}</Text>
            {currentJob?.status === 'Urgent' && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            )}
          </View>

          {/* 1. Task Summary Accordion */}
          <Accordion
            title="Task Summary"
            isOpen={openSections.summary}
            onToggle={() => toggleSection('summary')}
          >
            <SemiCircleProgress
              total={taskSummary.total}
              complete={taskSummary.complete}
              rejected={taskSummary.rejected}
            />
          </Accordion>

          {/* 2. Task List Accordion */}
          <Accordion
            title="Task"
            isOpen={openSections.task}
            onToggle={() => toggleSection('task')}
          >
            {dynamicTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                currentStatus={taskStatuses[task.id]}
                onStatusChange={updateTaskStatus}
              />
            ))}

            {/* Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} /><Text style={styles.legendText}>Complete</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} /><Text style={styles.legendText}>Rejected</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#374151' }]} /><Text style={styles.legendText}>Pending</Text></View>
              <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#eab308' }]} /><Text style={styles.legendText}>Need Approval</Text></View>
            </View>
          </Accordion>

          {/* 3. Charges Summary Accordion */}
          <Accordion
            title="Charges Summary"
            isOpen={openSections.charges}
            onToggle={() => toggleSection('charges')}
          >
            <View style={styles.chargesList}>
              {dynamicCharges.map(charge => (
                <ChargeItem key={charge.id} charge={charge} />
              ))}
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{calculateTotal().toLocaleString('en-IN')}</Text>
            </View>
          </Accordion>

          {/* 4. Customer & Vehicle Accordion */}
          <Accordion
            title="Customer & Vehicle"
            isOpen={openSections.customer}
            onToggle={() => toggleSection('customer')}
          >
            {/* Using a simple row layout for fields */}
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>VIN / Reg No:</Text>
              <Text style={styles.fieldValue}>{jobToDisplay.vin || jobToDisplay.regNo}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Customer :</Text>
              <Text style={styles.fieldValue}>{jobToDisplay.customer}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Phone No :</Text>
              <Text style={styles.fieldValue}>{jobToDisplay.phone}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Car Brand:</Text>
              <Text style={styles.fieldValue}>{jobToDisplay.brand || jobToDisplay.vehicle}</Text>
            </View>
          </Accordion>

          {/* 5. Quality Check Accordion */}
          <Accordion
            title="Quality Check"
            isOpen={openSections.quality}
            onToggle={() => toggleSection('quality')}
            badge={isQualityComplete ? (
              <View style={styles.completeBadge}>
                <Text style={styles.completeBadgeText}>Complete</Text>
              </View>
            ) : null}
          >
            <View style={styles.qualityContainer}>
              {dynamicQualityChecks.map(check => (
                <QualityCheckItem
                  key={check.id}
                  check={check}
                  currentStatus={qualityStatuses[check.id]}
                  onStatusChange={updateQualityStatus}
                />
              ))}
            </View>
          </Accordion>

        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setModalVisible(false);
              setShowServiceDropdown(false);
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.modalContainer}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Services:</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <ChevronDown size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.modalContentStyle}
              >
                <Text style={styles.modalFieldLabel}>Service Details</Text>
                <View style={styles.inputSearchWrapper}>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="select service"
                    placeholderTextColor="#9ca3af"
                    value={newServiceName}
                    onChangeText={(text) => {
                      setNewServiceName(text);
                      setShowServiceDropdown(true);
                    }}
                    onFocus={() => setShowServiceDropdown(true)}
                  />
                  {showServiceDropdown && filteredServices.length > 0 && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView
                        style={{ maxHeight: 150 }}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                      >
                        {filteredServices.map((service, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setNewServiceName(service);
                              setShowServiceDropdown(false);
                              Keyboard.dismiss();
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{service}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={styles.modalEstimateRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalFieldLabel}>Estimate:</Text>
                    <Text style={styles.modalSubLabel}>Time</Text>
                    <View style={styles.timeInputs}>
                      <TextInput
                        style={[styles.modalInput, { flex: 1, marginRight: 8 }]}
                        placeholder="Hour"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={newEstimateHour}
                        onChangeText={setNewEstimateHour}
                      />
                      <TextInput
                        style={[styles.modalInput, { flex: 1 }]}
                        placeholder="Minute"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={newEstimateMin}
                        onChangeText={setNewEstimateMin}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.modalCostRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalFieldLabel}>Cost:</Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Cost"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      value={newCost}
                      onChangeText={setNewCost}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.modalAddButton}
                    onPress={handleAddServiceManual}
                  >
                    <Text style={styles.modalAddButtonText}>add</Text>
                  </TouchableOpacity>
                </View>

                {/* Staged Services List */}
                {stagedServices.length > 0 && (
                  <View style={styles.stagedServicesContainer}>
                    <Text style={[styles.modalFieldLabel, { marginTop: 20 }]}>Staged Services:</Text>
                    {stagedServices.map((service, index) => (
                      <View key={index} style={styles.stagedServiceItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.stagedServiceName}>{service.name}</Text>
                          <Text style={styles.stagedServiceDetail}>{service.estimate} • ₹{service.cost}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveStagedService(index)}>
                          <Trash2 size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ))}

                    <TouchableOpacity
                      style={styles.modalSubmitButton}
                      onPress={handleSubmitStagedServices}
                    >
                      <Text style={styles.modalSubmitButtonText}>Submit {stagedServices.length} Service(s)</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e7eb',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', // Center it a bit, or keep it bottom like accordion
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#9ca3af',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  modalContentStyle: {
    paddingBottom: 20,
  },
  modalFieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  modalSubLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 10,
  },
  inputSearchWrapper: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    zIndex: 1001,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#000',
  },
  modalEstimateRow: {
    marginBottom: 15,
  },
  timeInputs: {
    flexDirection: 'row',
  },
  modalCostRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 15,
  },
  modalAddButton: {
    backgroundColor: '#4682B4',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
  },
  modalAddButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  stagedServicesContainer: {
    marginTop: 10,
  },
  stagedServiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  stagedServiceName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  stagedServiceDetail: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  modalSubmitButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalSubmitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 12
  },
  iconButton: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00000030'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20 // Reduced padding for cleaner look without bottom bar
  },

  // Banner
  bannerContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#9ca3af',
    marginBottom: 16
  },
  bannerLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 8
  },
  bannerValue: {
    fontSize: 18,
    color: '#000',
    flex: 1
  },
  urgentBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  urgentText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12
  },

  // Accordion
  accordionContainer: {
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#9ca3af',
    marginBottom: 16,
    overflow: 'hidden'
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000'
  },
  accordionContent: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 0 // Content components manage their padding
  },

  // Chart Section
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 20
  },
  chartStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    width: '80%',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#000'
  },
  chartStatItem: {
    alignItems: 'center'
  },
  chartStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000'
  },
  chartStatLabel: {
    fontSize: 12,
    color: '#000'
  },

  // Task Item
  taskItemContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff'
  },
  taskStatusIndicator: {
    width: 8,
    // backgroundColor set via prop
  },
  taskContent: {
    flex: 1,
    padding: 12
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  },
  taskAssigned: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 'normal'
  },
  taskCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  },
  taskEstimate: {
    fontSize: 12,
    color: '#6b7280'
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
    justifyContent: 'center'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 2
  },
  legendText: {
    fontSize: 10,
    color: '#6b7280'
  },

  // Charges
  chargesList: {
    padding: 16
  },
  chargeItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8
  },
  chargeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000'
  },
  chargeDetails: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2
  },
  chargeCost: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    gap: 16
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  },

  // Customer Fields
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000'
  },
  fieldValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500'
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginHorizontal: 12
  },

  // Quality Check
  qualityContainer: {
    padding: 0
  },
  qualityRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff'
  },
  qualityStatusIndicator: {
    width: 8
  },
  qualityContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center'
  },
  qualityLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000'
  },
  qualityValue: {
    fontWeight: '500',
    color: '#111827'
  },
  qualityActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0
  },
  actionBtnGray: {
    width: 48,
    height: 48,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#d1d5db'
  },
  actionBtnGreen: {
    width: 48,
    height: 48,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#16a34a'
  },

  // Swipeable Task Actions
  swipeActionsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  swipeActionButton: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#e5e7eb',
  },
  approveButton: {
    backgroundColor: '#22c55e',
  },
  undoButton: {
    backgroundColor: '#e5e7eb',
    width: 70,
  },
  needApprovalButton: {
    backgroundColor: '#e5e7eb',
    width: 70,
  },
  completeBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
