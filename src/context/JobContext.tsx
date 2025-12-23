import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define Service Detail Structure
export interface ServiceDetail {
    name: string;
    cost: number;
    estimate?: string;
}

// Define the Job type based on usage in JobTasksScreen
export interface Job {
    id: string;
    jobId: string;
    status: string;
    amount: string;
    vehicle: string;
    regNo: string;
    customer: string;
    assignedTech?: string;
    deliveryDate?: string;
    deliveryDue?: string;
    priority?: 'Normal' | 'Urgent';

    // Progress Flags
    workCompleted?: boolean;
    qualityCheckCompleted?: boolean;
    deliveryCompleted?: boolean;

    // Additional fields for full details
    phone?: string;
    email?: string;
    vin?: string;
    brand?: string;
    model?: string;
    odometer?: string;
    pickupAddress?: string;
    dropoffAddress?: string;
    services?: ServiceDetail[]; // Changed from string[] to ServiceDetail[]
    completedServices?: string[]; // Keep as strings for simple checking
    otherRequirements?: string;

    // Persisted states for Task list and Quality Check list
    taskStatuses?: Record<string, string>;
    qualityStatuses?: Record<string, string>;
    updatedAt?: number;
}

interface JobContextType {
    jobs: Job[];
    addJob: (job: Omit<Job, 'id' | 'jobId'>) => void;
    updateJobStatus: (id: string, status: string, options?: { workCompleted?: boolean, qualityCheckCompleted?: boolean, assignedTech?: string, deliveryCompleted?: boolean }) => void;
    setJobDetails: (id: string, details: Partial<Pick<Job, 'taskStatuses' | 'qualityStatuses'>>) => void;
    toggleWorkComplete: (id: string) => void;
    toggleQualityCheck: (id: string) => void;
    toggleDelivery: (id: string) => void;
    toggleServiceStatus: (id: string, serviceName: string) => void;
    deleteJob: (id: string) => void;
    getJobsByStatus: (statusTab: 'pending' | 'active' | 'done') => Job[];
}

const JobContext = createContext<JobContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_JOBS: Job[] = [
    {
        id: '1',
        jobId: 'SA0002',
        status: 'Waiting',
        amount: '₹10,000',
        vehicle: 'Honda City',
        regNo: 'GJ-05-RT-2134',
        customer: 'Ahmed',
        assignedTech: 'Ahmed raza',
        deliveryDate: '09-12-2025',
        deliveryDue: '3:00 PM',
        services: [
            { name: 'Engine Check', cost: 2000, estimate: '30 min' },
            { name: 'Oil Change', cost: 5000, estimate: '1 hour' },
            { name: 'Filter Replacement', cost: 3000, estimate: '30 min' }
        ],
        completedServices: [],
        priority: 'Normal',
    },
    {
        id: '2',
        jobId: 'SA0001',
        status: 'Urgent',
        amount: '₹21,500',
        vehicle: 'Honda City',
        regNo: 'GJ-05-RT-2134',
        customer: 'Ahmed',
        assignedTech: 'Ahmed raza',
        deliveryDate: '09-12-2025',
        deliveryDue: '3:00 PM',
        workCompleted: false,
        qualityCheckCompleted: false,
        services: [
            { name: 'Replace Battery', cost: 7000, estimate: '20 min' },
            { name: 'Brake Inspection', cost: 1500, estimate: '45 min' },
            { name: 'Tire Rotation', cost: 1000, estimate: '30 min' },
            { name: 'General Service', cost: 12000, estimate: '2 hours' }
        ],
        completedServices: [],
        priority: 'Urgent',
    },
    {
        id: '3',
        jobId: 'SA0003',
        status: 'Progress',
        amount: '₹4,000',
        vehicle: 'Honda City',
        regNo: 'GJ-05-RT-2134',
        customer: 'Ahmed',
        assignedTech: 'Ahmed raza',
        deliveryDate: '09-12-2025',
        deliveryDue: '3:00 PM',
        workCompleted: false, // Default: White button
        qualityCheckCompleted: false, // Default: White button
        services: [
            { name: 'Car Wash', cost: 1000, estimate: '45 min' },
            { name: 'Interior Cleaning', cost: 3000, estimate: '1 hour' }
        ],
        completedServices: [],
        priority: 'Normal',
    },
    {
        id: '4',
        jobId: 'SA0004',
        status: 'Done',
        amount: '₹15,000',
        vehicle: 'Honda City',
        regNo: 'GJ-05-RT-2134',
        customer: 'Ahmed',
        assignedTech: 'Ahmed raza',
        deliveryDate: '09-12-2025',
        deliveryDue: '3:00 PM',
        workCompleted: true,
        qualityCheckCompleted: true,
        deliveryCompleted: false, // Default to false (Outline)
        services: [
            { name: 'Suspension Repair', cost: 8000, estimate: '2 hours' },
            { name: 'Wheel Alignment', cost: 2000, estimate: '1 hour' },
            { name: 'AC Service', cost: 5000, estimate: '1.5 hours' }
        ],
        completedServices: ['Suspension Repair', 'Wheel Alignment', 'AC Service'], // All done
        priority: 'Normal',
    },
];

export function JobProvider({ children }: { children: ReactNode }) {
    const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);

    const addJob = (job: Omit<Job, 'id' | 'jobId'>) => {
        const nextId = (jobs.length + 1).toString();
        const jobId = `SA${(jobs.length + 1).toString().padStart(4, '0')}`;
        setJobs(prev => [...prev, {
            ...job,
            id: nextId,
            jobId: jobId,
            status: job.status || 'Pending',
            priority: job.priority || 'Normal',
            deliveryCompleted: false,
            completedServices: [],
            updatedAt: Date.now(),
        }]);
    };

    const updateJobStatus = (id: string, status: string, options?: { workCompleted?: boolean, qualityCheckCompleted?: boolean, assignedTech?: string, deliveryCompleted?: boolean }) => {
        setJobs(prev => prev.map(job =>
            job.id === id ? { ...job, status, ...options, updatedAt: Date.now() } : job
        ));
    };

    const toggleWorkComplete = (id: string) => {
        setJobs(prev => prev.map(job =>
            job.id === id ? { ...job, workCompleted: !job.workCompleted } : job
        ));
    };

    const toggleQualityCheck = (id: string) => {
        setJobs(prev => prev.map(job =>
            job.id === id ? { ...job, qualityCheckCompleted: !job.qualityCheckCompleted } : job
        ));
    };

    const toggleDelivery = (id: string) => {
        setJobs(prev => prev.map(job =>
            job.id === id ? { ...job, deliveryCompleted: !job.deliveryCompleted } : job
        ));
    };

    const toggleServiceStatus = (id: string, serviceName: string) => {
        setJobs(prev => prev.map(job => {
            if (job.id === id) {
                const currentCompleted = job.completedServices || [];
                const isCompleted = currentCompleted.includes(serviceName);
                const updatedCompleted = isCompleted
                    ? currentCompleted.filter(s => s !== serviceName)
                    : [...currentCompleted, serviceName];
                return { ...job, completedServices: updatedCompleted };
            }
            return job;
        }));
    };

    const getJobsByStatus = (statusTab: 'pending' | 'active' | 'done') => {
        return jobs.filter(job => {
            const s = job.status.toLowerCase();
            if (statusTab === 'pending') {
                // In original code, 'Waiting' was in pending. 'Pending' relies on not being Active or Done
                return s === 'waiting' || s === 'pending';
            }
            if (statusTab === 'active') {
                return s === 'urgent' || s === 'progress' || s === 'active';
            }
            if (statusTab === 'done') {
                return s === 'done' || s === 'completed' || s === 'delivered';
            }
            return false;
        });
    };

    const deleteJob = (id: string) => {
        setJobs(prev => prev.filter(job => job.id !== id));
    };

    const setJobDetails = (id: string, details: Partial<Pick<Job, 'taskStatuses' | 'qualityStatuses'>>) => {
        setJobs(prev => prev.map(job =>
            job.id === id ? { ...job, ...details, updatedAt: Date.now() } : job
        ));
    };

    return (
        <JobContext.Provider value={{ jobs, addJob, updateJobStatus, setJobDetails, deleteJob, toggleWorkComplete, toggleQualityCheck, toggleDelivery, toggleServiceStatus, getJobsByStatus }}>
            {children}
        </JobContext.Provider>
    );
}

export function useJobs() {
    const context = useContext(JobContext);
    if (context === undefined) {
        throw new Error('useJobs must be used within a JobProvider');
    }
    return context;
}
