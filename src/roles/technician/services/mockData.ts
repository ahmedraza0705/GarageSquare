export const technicianStats = {
    pending: 3,
    completed: 1,
    efficiency: '94%',
};

export const technicianJobs = [
    {
        id: '1',
        job_card_no: 'SA0004',
        price: '₹15,000',
        vehicle: { make: 'Hyundai', model: 'Creta', reg: 'GJ-05-RT-4534' },
        assigned_to: 'Ahmed Raza',
        progress: 45,
        delivery_due: '2h left',
        delivery_date: '07-01-2026',
        status: 'In Progress',
        priority: 'Urgent',
    },
    {
        id: '2',
        job_card_no: 'SA0005',
        price: '₹5,500',
        vehicle: { make: 'Maruti', model: 'Swift', reg: 'KA-01-XY-9876' },
        assigned_to: 'Rahul Kumar',
        progress: 100,
        delivery_due: 'Completed',
        delivery_date: '06-01-2026',
        status: 'Completed',
        priority: 'Normal',
    },
    {
        id: '3',
        job_card_no: 'SA0008',
        price: '₹8,200',
        vehicle: { make: 'Tata', model: 'Nexon', reg: 'MH-02-AZ-1234' },
        assigned_to: 'Ahmed Raza',
        progress: 10,
        delivery_due: '1d left',
        delivery_date: '08-01-2026',
        status: 'Pending',
        priority: 'Normal',
    },
];

export const technicianVehicles = [
    {
        id: '1',
        make: 'Hyundai',
        model: 'Creta SX (O)',
        year: '2022',
        reg_number: 'GJ-05-RT-4534',
        owner: 'Vikram Singh',
        status: 'In Shop',
        service_status: 'Waiting for Parts',
        last_service: '24 Dec 2025',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/41564/hyundai-creta-right-front-three-quarter5.jpeg?q=80',
        assigned_to: 'Ahmed Raza',
        tasks: [
            { id: 101, name: 'Engine Oil Replacement', status: 'Completed', time: '45m' },
            { id: 102, name: 'Oil Filter Change', status: 'Completed', time: '15m' },
            { id: 103, name: 'Brake Pad Inspection', status: 'Pending', time: '30m' },
            { id: 104, name: 'Coolant Top-up', status: 'Rejected', time: '10m' }, // Rejected Item
            { id: 105, name: 'Tyre Rotation', status: 'Rejected', time: '40m' },   // Rejected Item
            { id: 106, name: 'Air Filter Check', status: 'Pending', time: '10m' },
        ],
        timeline: [
            { time: '09:00 AM', event: 'Vehicle Checked In', date: '24 Dec' },
            { time: '09:30 AM', event: 'Inspection Started', date: '24 Dec' },
            { time: '10:15 AM', event: 'Oil Change Completed', date: '24 Dec' },
        ],
        performance_stats: {
            estimated_time: '2h 30m',
            time_spent: '1h 00m',
            efficiency: 'On Track',
        }
    },
    {
        id: '2',
        make: 'Maruti Suzuki',
        model: 'Swift ZXI+',
        year: '2021',
        reg_number: 'KA-01-XY-9876',
        owner: 'Priya Sharma',
        status: 'Completed',
        service_status: 'Ready for Delivery',
        last_service: '20 Dec 2025',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/54399/swift-exterior-right-front-three-quarter-64.jpeg?q=80',
        assigned_to: 'Rahul Verma',
        tasks: [
            { id: 201, name: 'General Service', status: 'Completed', time: '2h' },
            { id: 202, name: 'Washing & Cleaning', status: 'Completed', time: '45m' },
            { id: 203, name: 'Wheel Alignment', status: 'Completed', time: '30m' },
        ],
        timeline: [
            { time: '10:00 AM', event: 'Vehicle Received', date: '20 Dec' },
            { time: '02:00 PM', event: 'Service Completed', date: '20 Dec' },
        ],
        performance_stats: {
            estimated_time: '3h 15m',
            time_spent: '3h 10m',
            efficiency: '98%',
        }
    },
    {
        id: '3',
        make: 'Tata',
        model: 'Nexon EV',
        year: '2023',
        reg_number: 'MH-02-AZ-1234',
        owner: 'Rahul Verma',
        status: 'Scheduled',
        service_status: 'Not Started',
        last_service: '15 Nov 2025',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/42611/tata-nexon-ev-right-front-three-quarter5.jpeg?q=80',
        assigned_to: 'Pending',
        tasks: [
            { id: 301, name: 'Battery Health Check', status: 'Pending', time: '1h' },
            { id: 302, name: 'Software Update', status: 'Pending', time: '45m' },
        ],
        timeline: [],
        performance_stats: {
            estimated_time: '1h 45m',
            time_spent: '0m',
            efficiency: '-',
        }
    },
    {
        id: '4',
        make: 'Toyota',
        model: 'Fortuner',
        year: '2020',
        reg_number: 'DL-3C-AB-9999',
        owner: 'Amit Patel',
        status: 'In Shop',
        service_status: 'Work in Progress',
        last_service: '22 Dec 2025',
        image: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/44709/fortuner-exterior-right-front-three-quarter-19.jpeg?q=80',
        assigned_to: 'Vikram Singh',
        tasks: [
            { id: 401, name: 'Brake Disc Replacement', status: 'In Progress', time: '1h 30m' },
            { id: 402, name: 'Suspension Check', status: 'Pending', time: '45m' },
            { id: 403, name: 'AC Service', status: 'Pending', time: '1h' },
        ],
        timeline: [
            { time: '11:00 AM', event: 'Vehicle Received', date: '22 Dec' },
        ],
        performance_stats: {
            estimated_time: '3h 15m',
            time_spent: '45m',
            efficiency: 'Delayed',
        }
    },
];
