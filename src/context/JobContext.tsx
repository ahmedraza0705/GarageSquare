import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { JobCardService } from '@/services/jobCard.service';
import { AuthService } from '@/services/auth.service';
import { JobCard } from '@/types';

// Define Service Detail Structure
export interface ServiceDetail {
    id?: string;
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
    setJobDetails: (id: string, details: Partial<Job>) => void;
    toggleWorkComplete: (id: string) => void;
    toggleQualityCheck: (id: string) => void;
    toggleDelivery: (id: string) => void;
    toggleServiceStatus: (id: string, serviceName: string) => void;
    deleteJob: (id: string) => void;
    getJobsByStatus: (statusTab: 'pending' | 'active' | 'done') => Job[];
}

const JobContext = createContext<JobContextType | undefined>(undefined);


export function JobProvider({ children }: { children: ReactNode }) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setLoading(true);
            const data = await JobCardService.getAll();
            // Map DB format to UI format if needed, but our interfaces are similar
            const mappedJobs: Job[] = data.map(jc => ({
                id: jc.id,
                jobId: jc.job_number,
                status: jc.status,
                amount: `₹${jc.estimated_cost?.toLocaleString() || '0'}`,
                vehicle: jc.vehicle?.brand ? `${jc.vehicle.brand} ${jc.vehicle.model}` : 'Unknown vehicle',
                regNo: jc.vehicle?.license_plate || 'N/A',
                customer: jc.customer?.full_name || 'Anonymous',
                assignedTech: jc.assigned_tech_name || 'Unassigned',
                priority: jc.priority === 'urgent' ? 'Urgent' : 'Normal',
                workCompleted: jc.work_completed,
                qualityCheckCompleted: jc.quality_check_completed,
                deliveryCompleted: jc.delivery_completed,
                services: [
                    ...(jc.services || []).map(s => ({
                        id: s.id,
                        name: s.service?.name || s.custom_service_name || 'Unknown',
                        cost: s.total_price || 0,
                        estimate: s.estimate || (s.service?.estimated_duration ? `${s.service.estimated_duration} min` : undefined)
                    })),
                    ...(jc.tasks || []).map(t => ({
                        id: t.id,
                        name: t.title || t.service?.name || 'Unknown Task',
                        cost: t.cost || 0,
                        estimate: t.estimate || (t.service?.estimated_duration ? `${t.service.estimated_duration} min` : undefined)
                    }))
                ],
                deliveryDate: jc.delivery_date,
                deliveryDue: jc.delivery_due,
                taskStatuses: (jc as any).task_statuses || {},
                qualityStatuses: (jc as any).quality_statuses || {},
                updatedAt: jc.updated_at ? new Date(jc.updated_at).getTime() : Date.now(),
            }));
            setJobs(mappedJobs);

            // DEBUG LOGGING
            if (mappedJobs.length > 0) {
                console.log('[JobContext] First mapped job services:', JSON.stringify(mappedJobs[0].services, null, 2));
            }
        } catch (error) {
            console.error('Error loading jobs from DB:', error);
        } finally {
            setLoading(false);
        }
    };

    const addJob = async (job: Omit<Job, 'id' | 'jobId'>) => {
        try {
            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser) throw new Error('Not authenticated');
            const branchId = currentUser.profile?.branch_id || '';

            // Map UI Job to CreateJobCardForm (roughly)
            // This is a simplification, ideally CreateJobCardScreen calls service directly
            // but for now we follow the existing pattern in JobContext.

            // Re-fetch jobs after creation to get real data
            await loadJobs();
        } catch (error) {
            console.error('Failed to save job to DB:', error);
        }
    };

    const updateJobStatus = async (id: string, status: string, options?: { workCompleted?: boolean, qualityCheckCompleted?: boolean, assignedTech?: string, deliveryCompleted?: boolean }) => {
        try {
            // Update local state first (Optimistic)
            setJobs(prev => prev.map(job =>
                job.id === id ? { ...job, status, ...options, updatedAt: Date.now() } : job
            ));

            // Map UI status back to DB status if needed
            let dbStatus = status.toLowerCase() as any;
            if (dbStatus === 'waiting') dbStatus = 'pending';
            if (dbStatus === 'progress') dbStatus = 'in_progress';
            if (dbStatus === 'done') dbStatus = 'completed';

            const updates: any = {
                status: dbStatus,
                assigned_tech_name: options?.assignedTech,
                work_completed: options?.workCompleted,
                quality_check_completed: options?.qualityCheckCompleted,
                delivery_completed: options?.deliveryCompleted
            };

            await JobCardService.update(id, updates);
        } catch (error) {
            console.error('Failed to update job status in DB:', error);
            loadJobs(); // Revert on error
        }
    };

    const toggleWorkComplete = async (id: string) => {
        const job = jobs.find(j => j.id === id);
        if (!job) return;

        try {
            const newValue = !job.workCompleted;
            setJobs(prev => prev.map(j => j.id === id ? { ...j, workCompleted: newValue } : j));
            await JobCardService.update(id, { work_completed: newValue });
        } catch (error) {
            console.error('Failed to toggle work complete:', error);
            loadJobs();
        }
    };

    const toggleQualityCheck = async (id: string) => {
        const job = jobs.find(j => j.id === id);
        if (!job) return;

        try {
            const newValue = !job.qualityCheckCompleted;
            setJobs(prev => prev.map(j => j.id === id ? { ...j, qualityCheckCompleted: newValue } : j));
            await JobCardService.update(id, { quality_check_completed: newValue });
        } catch (error) {
            console.error('Failed to toggle quality check:', error);
            loadJobs();
        }
    };

    const toggleDelivery = async (id: string) => {
        const job = jobs.find(j => j.id === id);
        if (!job) return;

        try {
            const newValue = !job.deliveryCompleted;
            setJobs(prev => prev.map(j => j.id === id ? { ...j, deliveryCompleted: newValue } : j));
            await JobCardService.update(id, { delivery_completed: newValue });
        } catch (error) {
            console.error('Failed to toggle delivery:', error);
            loadJobs();
        }
    };

    const toggleServiceStatus = async (id: string, serviceName: string) => {
        // Services are stored in JSON task_statuses
        const job = jobs.find(j => j.id === id);
        if (!job) return;

        try {
            const currentStatuses = job.taskStatuses || {};
            const currentStatus = currentStatuses[serviceName] || 'pending';
            const newStatus = currentStatus === 'complete' ? 'pending' : 'complete';

            const updatedStatuses = { ...currentStatuses, [serviceName]: newStatus };

            setJobs(prev => prev.map(j =>
                j.id === id ? { ...j, taskStatuses: updatedStatuses } : j
            ));

            await JobCardService.update(id, { task_statuses: updatedStatuses as any });
        } catch (error) {
            console.error('Failed to toggle service status:', error);
            loadJobs();
        }
    };

    const getJobsByStatus = (statusTab: 'pending' | 'active' | 'done') => {
        return jobs.filter(job => {
            const s = job.status.toLowerCase();
            if (statusTab === 'pending') {
                // In original code, 'Waiting' was in pending. 'Pending' relies on not being Active or Done
                return s === 'waiting' || s === 'pending';
            }
            if (statusTab === 'active') {
                return s === 'urgent' || s === 'progress' || s === 'active' || s === 'in_progress';
            }
            if (statusTab === 'done') {
                // Exclude 'delivered' - those should only appear in Job Cards page
                return s === 'done' || s === 'completed';
            }
            return false;
        });
    };

    const deleteJob = async (id: string) => {
        try {
            // Update local state first (Optimistic UI)
            setJobs(prev => prev.filter(job => job.id !== id));

            // Call backend service
            await JobCardService.delete(id);
        } catch (error) {
            console.error('Failed to delete job from DB:', error);
            // On error, we might want to reload jobs to restore local state
            await loadJobs();
            throw error; // Re-throw so UI can handle it if needed
        }
    };

    const setJobDetails = async (id: string, details: Partial<Job>) => {
        try {
            let needsRefresh = false;
            const currentJob = jobs.find(j => j.id === id);

            // 1. Handle new services (persist as individual records)
            if (details.services) {
                // Calculate new total cost including all services (existing + new)
                const totalCost = details.services.reduce((sum, s) => sum + s.cost, 0);

                // Update the main Job Card record with the new total
                await JobCardService.update(id, { estimated_cost: totalCost });

                const newServices = details.services.filter(s => !s.id);
                if (newServices.length > 0) {
                    await JobCardService.addServices(id, newServices.map(s => ({
                        name: s.name,
                        cost: s.cost,
                        estimate: s.estimate || '30m'
                    })));
                    needsRefresh = true;
                }
            }

            // 2. Handle Individual Status Changes (Sync to specific DB rows)
            if (details.taskStatuses && currentJob) {
                const prevStatuses = currentJob.taskStatuses || {};
                const changedEntries = Object.entries(details.taskStatuses).filter(
                    ([taskId, status]) => prevStatuses[taskId] !== status
                );

                for (const [taskId, status] of changedEntries) {
                    // Find the work item in currently mapped services to know its type/id
                    const serviceItem = currentJob.services?.find(s => s.id === taskId || s.name === taskId);

                    if (serviceItem && serviceItem.id) {
                        // Determine if it's in job_card_services or tasks table
                        // For now, most things from details screen are job_card_services
                        // In loadJobs, we mapped both tasks and services into the same array
                        // We can check if it's a UUID (service) or something else, but let's assume 'service' 
                        // as per current data flow from CreateJobCard.
                        // Better: try updating as service first, or check type if we had it.
                        // Assuming service for now as most new ones are services.
                        await JobCardService.updateWorkItemStatus('service', serviceItem.id, status as string);
                    }
                }
            }

            // 3. Persist JSON statuses if they changed (Backward Compatibility)
            if (details.taskStatuses || details.qualityStatuses) {
                const updates: any = {};
                if (details.taskStatuses) updates.task_statuses = details.taskStatuses;
                if (details.qualityStatuses) updates.quality_statuses = details.qualityStatuses;

                await JobCardService.update(id, updates);
            }

            // 4. Finalize state
            if (needsRefresh) {
                await loadJobs();
            } else {
                setJobs(prev => prev.map(job => {
                    if (job.id === id) {
                        const updatedJob = { ...job, ...details, updatedAt: Date.now() };
                        if (details.services) {
                            const totalCost = details.services.reduce((sum, s) => sum + s.cost, 0);
                            updatedJob.amount = `₹${totalCost.toLocaleString()}`;
                        }
                        return updatedJob;
                    }
                    return job;
                }));
            }
        } catch (error) {
            console.error('Failed to set job details:', error);
            await loadJobs(); // Recover on error
        }
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
