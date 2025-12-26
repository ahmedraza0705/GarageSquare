import { technicianVehicles } from '../services/mockData';
import { storageService } from '../../../services/StorageService';

export interface Vehicle {
    id: string;
    make: string;
    model: string;
    year: string;
    reg_number: string;
    owner: string;
    status: 'In Shop' | 'Completed' | 'Scheduled' | 'Ready';
    service_status: string;
    last_service: string;
    image: string;
    assigned_to: string;
    tasks?: any[];
    timeline?: any[];
    performance_stats?: any;
    vin?: string;
    color?: string;
    mileage?: string;
    fuel_level?: string;
    notes?: string;
    qc_checks?: {
        id: string;
        name: string;
        status: 'Pending' | 'Approved' | 'Rejected';
        role: string; // e.g., 'Technician', 'Advisor'
    }[];
}

const STORAGE_KEY = 'technician_vehicles';

class VehicleService {
    private vehicles: Vehicle[] = [];
    private initialized = false;

    constructor() {
        // Initialize with mock data mainly to avoid empty startup before async load,
        // but real init happens in init()
        this.vehicles = (technicianVehicles as any[]).map(v => ({
            ...v,
            status: v.status as Vehicle['status'],
        }));
    }

    /**
     * Initialize the service by loading data from storage
     */
    async init(): Promise<void> {
        if (this.initialized) return;

        const storedVehicles = await storageService.load<Vehicle[]>(STORAGE_KEY);
        if (storedVehicles && storedVehicles.length > 0) {
            this.vehicles = storedVehicles;
        } else {
            // First time run: persist the mock data to storage
            await this.save();
        }
        this.initialized = true;
    }

    private async save() {
        await storageService.save(STORAGE_KEY, this.vehicles);
    }

    getAll(): Vehicle[] {
        return this.vehicles;
    }

    getById(id: string): Vehicle | undefined {
        return this.vehicles.find(v => v.id === id);
    }

    async add(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
        const newVehicle = {
            ...vehicle,
            id: Math.random().toString(36).substr(2, 9),
            tasks: vehicle.tasks || [],
            timeline: vehicle.timeline || [],
            status: vehicle.status || 'In Shop',
            image: vehicle.image || 'https://images.unsplash.com/photo-1619682817481-e994891cd1f5?q=80&w=600&auto=format&fit=crop',
            assigned_to: vehicle.assigned_to || 'Current User', // Auto-assign logic
            qc_checks: vehicle.qc_checks || [
                { id: 'qc_1', name: 'Technician Inspection', status: 'Pending', role: 'Technician' },
                { id: 'qc_2', name: 'Supervisor Approval', status: 'Pending', role: 'Supervisor' }
            ],
        };
        this.vehicles.unshift(newVehicle as Vehicle);
        await this.save();
        return newVehicle as Vehicle;
    }

    async update(id: string, updates: Partial<Vehicle>): Promise<Vehicle | null> {
        const index = this.vehicles.findIndex(v => v.id === id);
        if (index === -1) return null;

        this.vehicles[index] = { ...this.vehicles[index], ...updates };
        await this.save();
        return this.vehicles[index];
    }

    async delete(id: string): Promise<boolean> {
        const initialLength = this.vehicles.length;
        this.vehicles = this.vehicles.filter(v => v.id !== id);
        if (this.vehicles.length < initialLength) {
            await this.save();
            return true;
        }
        return false;
    }

    getDashboardStats() {
        const total = this.vehicles.length;
        const pending = this.vehicles.filter(v => v.status === 'In Shop' || v.status === 'Scheduled').length;
        const completed = this.vehicles.filter(v => v.status === 'Completed' || v.status === 'Ready').length;

        // Calculate efficiency based on tasks completed vs total tasks across all vehicles
        let totalTasks = 0;
        let completedTasks = 0;

        this.vehicles.forEach(v => {
            if (v.tasks) {
                totalTasks += v.tasks.length;
                completedTasks += v.tasks.filter((t: any) => t.status === 'Completed').length;
            }
        });

        const efficiency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            pending: pending.toString(),
            completed: completed.toString(),
            efficiency: `${efficiency}%`
        };
    }
}

export const vehicleService = new VehicleService();
