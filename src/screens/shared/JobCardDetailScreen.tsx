// ============================================
// JOB CARD DETAIL SCREEN (Redesign)
// ============================================

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Trash2, Plus, ChevronDown, ChevronUp, Menu, X, Check, Undo2, LayoutDashboard, Building2, Users, FileBarChart, ChevronLeft, RotateCcw, UserCheck } from 'lucide-react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useJobs } from '../../context/JobContext';

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

// --- STATIC DATA ---
const STATIC_DATA = {
  jobCardNumber: 'SA0001',
  vehicle: {
    vin: 'GJ-05-RT-2134',
    customerName: 'Ahmed Raza',
    phone: '+91 9890938291',
    carBrand: 'Honda City',
  },
  tasks: [
    {
      id: '1',
      title: 'Replace Battery',
      assignedTo: '(Saafir)',
      estimate: '20 min',
      cost: 7000,
      status: 'pending',
    },
    {
      id: '2',
      title: 'Engine oil change',
      assignedTo: '(varun)',
      estimate: '30 min',
      cost: 2000,
      status: 'pending',
    },
    {
      id: '3',
      title: 'Paint Job',
      assignedTo: '',
      estimate: '1 hour',
      cost: 50000,
      status: 'pending',
    },
    {
      id: '4',
      title: 'Change Tires',
      assignedTo: '',
      estimate: '30 min',
      cost: 50000,
      status: 'pending',
    },
    // Adding dummy tasks to match "6 Total task" in mockup
    {
      id: '5',
      title: 'AC repair',
      assignedTo: '',
      estimate: '45 min',
      cost: 1500,
      status: 'pending',
    },
    {
      id: '6',
      title: 'Washing',
      assignedTo: '',
      estimate: '20 min',
      cost: 500,
      status: 'pending',
    }
  ] as Task[],
  charges: [
    { id: '1', description: 'Replace Battery', details: 'Items: Battery x 1', cost: 7000 },
    { id: '2', description: 'Engine oil change', details: 'Items: Purl Synt x 5 Quantity', cost: 2000 },
    { id: '3', description: 'Paint Job', details: 'Ref: Purl White x 2 Quantity', cost: 10000 },
    { id: '4', description: 'AC repair', details: 'Ref: Part Name x Quantity', cost: 1500 },
  ] as Charge[],
  qualityChecks: [
    { id: '1', role: 'Technician Manager', name: 'Varun', status: 'pending' },
    { id: '2', role: 'Technician', name: 'Varun', status: 'pending' },
    { id: '3', role: 'Technician', name: 'Ahmed', status: 'pending' },
  ] as QualityCheck[]
};

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
          onPress: () => {
            deleteJob(jobCardId);
            navigation.goBack();
          }
        }
      ]
    );
  };

  const jobToDisplay = currentJob || {
    ...STATIC_DATA,
    id: 'static',
    jobId: STATIC_DATA.jobCardNumber,
    services: STATIC_DATA.tasks.map(t => ({ name: t.title, cost: t.cost, estimate: t.estimate })),
    taskStatuses: {},
    qualityStatuses: {},
    status: 'Pending'
  };

  // Derive Dynamic Tasks from Job Services
  const dynamicTasks: Task[] = (jobToDisplay.services || []).map((service, index) => ({
    id: service.name, // Use name as ID
    title: service.name,
    assignedTo: currentJob?.assignedTech ? `(${currentJob.assignedTech})` : '',
    estimate: service.estimate || '45 min',
    cost: service.cost || 0,
    status: 'pending'
  }));

  // Derive Dynamic Charges
  const dynamicCharges: Charge[] = dynamicTasks.map((task, index) => ({
    id: `c-${task.id}`,
    description: task.title,
    details: 'Service Charge',
    cost: task.cost
  }));

  // Initialize statuses from Context if they exist, otherwise default to pending/appropriate status
  const [taskStatuses, setTaskStatuses] = useState<Record<string, Task['status']>>(() => {
    if (jobToDisplay.status === 'Done' || jobToDisplay.status === 'Delivered') {
      const allDone: Record<string, Task['status']> = {};
      dynamicTasks.forEach(t => { allDone[t.id] = 'complete'; });
      return (jobToDisplay.taskStatuses as any) || allDone;
    }
    const initialStatuses: Record<string, Task['status']> = {};
    dynamicTasks.forEach(t => {
      // Load saved status or default to 'pending'
      initialStatuses[t.id] = (jobToDisplay.taskStatuses as any)?.[t.id] || 'pending';
    });
    return initialStatuses;
  });

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
    // Adding a second technician slot if needed, or keeping generic. 
    // For now assuming 1 main tech, but keeping structure similar to mock for visual consistency
    {
      id: '3',
      role: 'Technician',
      name: 'Ahmed', // Keeping static secondary or removal? User asked for "Technician Manager". 
      // I will stick to the main request for Manager, and keeping Technician 1 as the assigned tech too effectively.
      status: 'pending'
    },
  ];

  const [qualityStatuses, setQualityStatuses] = useState<Record<string, QualityCheck['status']>>(() => {
    if (jobToDisplay.status === 'Done' || jobToDisplay.status === 'Delivered') {
      const allApproved: Record<string, QualityCheck['status']> = {};
      dynamicQualityChecks.forEach(q => { allApproved[q.id] = 'approved'; });
      return (jobToDisplay.qualityStatuses as any) || allApproved;
    }
    return (jobToDisplay.qualityStatuses as any) ||
      dynamicQualityChecks.reduce((acc, check) => ({
        ...acc,
        [check.id]: check.status
      }), {});
  });

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
  useEffect(() => {
    if (!currentJob || currentJob.status === 'Done' || currentJob.status === 'Delivered') return;

    const allTasksComplete = Object.values(taskStatuses).every(status => status === 'complete');
    const allQCApproved = Object.values(qualityStatuses).every(status => status === 'approved');

    if (allTasksComplete && allQCApproved) {
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
    setTaskStatuses(updatedStatuses);

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
    setQualityStatuses(updatedStatuses);

    // Persist to Global Context
    if (currentJob) {
      setJobDetails(currentJob.id, { qualityStatuses: updatedStatuses });
    }
  };

  // Calculate task summary statistics dynamically
  const calculateTaskSummary = () => {
    const statuses = Object.values(taskStatuses);
    const total = statuses.length;
    const complete = statuses.filter(status => status === 'complete').length;
    const rejected = statuses.filter(status => status === 'rejected').length;

    return { total, complete, rejected };
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
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#a7f3d0' }]}>
              <Plus size={18} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Job Card Banner */}
          <View style={styles.bannerContainer}>
            <Text style={styles.bannerLabel}>Job Card:</Text>
            <Text style={styles.bannerValue}>{currentJob?.jobId || STATIC_DATA.jobCardNumber}</Text>
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

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e7eb', // Light gray bg
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
    fontSize: 14,
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
