// ============================================
// VEHICLE SERVICE
// ============================================

import { Vehicle, CreateVehicleForm, VehicleServiceItem, VehicleServiceStatus } from '@/types';

// Mock Data Store
let MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    customer_id: 'c1',
    make: 'Hyundai',
    model: 'i20',
    year: 2021,
    license_plate: 'GJ-05-RJ-2134',
    vin: 'GJ05RJ2134THISISVIN',
    color: 'White',
    mileage: 45000,
    branch_id: 'b1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: {
      id: 'c1',
      full_name: 'Ahmed',
      phone: '9876543210',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    services: [
      { id: 's1', name: 'Replace Battery', status: 'completed', assigned_to: 'Ahmed Raza', estimate: '20 min', created_at: new Date().toISOString() },
      { id: 's2', name: 'Engine oil change', status: 'pending', assigned_to: 'Ahmed Raza', estimate: '30 min', created_at: new Date().toISOString() },
      { id: 's3', name: 'Paint Job', status: 'need_approval', assigned_to: 'Saafir', estimate: '1 hour', created_at: new Date().toISOString() },
      { id: 's4', name: 'Change Tires', status: 'rejected', assigned_to: 'Ahmed Raza', estimate: '30 min', created_at: new Date().toISOString() },
    ]
  },
  {
    id: 'v2',
    customer_id: 'c1',
    make: 'Honda',
    model: 'City',
    year: 2023,
    license_plate: 'GJ-05-RJ-2134',
    vin: 'HONDACITYVIN12345',
    color: 'Silver',
    mileage: 12000,
    branch_id: 'b1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: {
      id: 'c1',
      full_name: 'Ahmed',
      phone: '9876543210',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    services: []
  },
  {
    id: 'v3',
    customer_id: 'c1',
    make: 'Hyundai',
    model: 'i20',
    year: 2021,
    license_plate: 'GJ-05-RJ-2134',
    vin: 'GJ05RJ2134THISISVIN',
    color: 'Red',
    mileage: 45000,
    branch_id: 'b1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: {
      id: 'c1',
      full_name: 'Ahmed',
      phone: '9876543210',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    services: []
  },
];

export class VehicleService {
  /**
   * Get all vehicles
   */
  static async getAll(filters?: {
    customer_id?: string;
    branch_id?: string;
    search?: string;
  }) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    let data = [...MOCK_VEHICLES];

    if (filters?.search) {
      const lowerSearch = filters.search.toLowerCase();
      data = data.filter(v =>
        v.make.toLowerCase().includes(lowerSearch) ||
        v.model.toLowerCase().includes(lowerSearch) ||
        v.customer?.full_name.toLowerCase().includes(lowerSearch) ||
        v.license_plate?.toLowerCase().includes(lowerSearch)
      );
    }

    return data;
  }

  /**
   * Get vehicle by ID
   */
  static async getById(id: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const vehicle = MOCK_VEHICLES.find(v => v.id === id);
    if (!vehicle) throw new Error('Vehicle not found');
    return vehicle;
  }

  /**
   * Create new vehicle
   */
  static async create(formData: CreateVehicleForm & { customer_name?: string, customer_email?: string }, branchId?: string) {
    await new Promise(resolve => setTimeout(resolve, 800));

    // In a real app we would create the customer first if it doesn't exist, 
    // but for this mock we'll just fake it if name is provided
    const newVehicle: Vehicle = {
      id: Math.random().toString(36).substring(7),
      customer_id: formData.customer_id,
      make: formData.make || 'Unknown',
      model: formData.model || 'Unknown',
      year: formData.year,
      license_plate: formData.license_plate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      customer: {
        id: formData.customer_id,
        full_name: formData.customer_name || 'New Customer',
        email: formData.customer_email,
        phone: 'N/A',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      services: []
    };

    MOCK_VEHICLES.unshift(newVehicle);
    return newVehicle;
  }

  /**
   * Add a service to a vehicle
   */
  static async addService(vehicleId: string, serviceName: string, estimate?: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const vehicleIndex = MOCK_VEHICLES.findIndex(v => v.id === vehicleId);
    if (vehicleIndex === -1) throw new Error('Vehicle not found');

    const newService: VehicleServiceItem = {
      id: Math.random().toString(36).substring(7),
      name: serviceName,
      status: 'pending',
      assigned_to: 'Unassigned',
      estimate: estimate || 'TBD',
      created_at: new Date().toISOString()
    };

    if (!MOCK_VEHICLES[vehicleIndex].services) {
      MOCK_VEHICLES[vehicleIndex].services = [];
    }

    MOCK_VEHICLES[vehicleIndex].services!.push(newService);
    return newService;
  }

  /**
 * Update service status
 */
  static async updateServiceStatus(vehicleId: string, serviceId: string, status: VehicleServiceStatus) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const vehicle = MOCK_VEHICLES.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.services) throw new Error('Vehicle or services not found');

    const service = vehicle.services.find(s => s.id === serviceId);
    if (!service) throw new Error('Service not found');

    service.status = status;
    return service;
  }

  /**
   * Update vehicle
   */
  static async update(id: string, updates: Partial<Vehicle>) {
    // Mock update
    return MOCK_VEHICLES.find(v => v.id === id) as Vehicle;
  }

  /**
   * Delete vehicle
   */
  static async delete(id: string) {
    MOCK_VEHICLES = MOCK_VEHICLES.filter(v => v.id !== id);
  }
}

