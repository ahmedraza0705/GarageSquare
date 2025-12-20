export const CAR_BRANDS = [
    { id: '1', name: 'Maruti Suzuki', icon: 'shield-car' },
    { id: '2', name: 'Mahindra' },
    { id: '3', name: 'Volkswagen' },
    { id: '4', name: 'Mercedes' },
    { id: '5', name: 'Skoda' },
    { id: '6', name: 'Tata' },
    { id: '7', name: 'Other' },
];

export const CAR_MODELS: Record<string, string[]> = {
    'Skoda': ['Slavia', 'Kushaq', 'Rapid', 'Superb', 'Kodiaq', 'Octavia'],
    'Maruti Suzuki': ['Swift', 'Baleno', 'Brezza', 'Ertiga', 'Dzire', 'Alto'],
    'Mahindra': ['XUV700', 'Thar', 'Scorpio-N', 'Bolero', 'XUV300', 'Scorpio'],
    'Volkswagen': ['Virtus', 'Taigun', 'Tiguan', 'Polo', 'Vento', 'Passat'],
    'Mercedes': ['C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE'],
    'Tata': ['Nexon', 'Harrier', 'Safari', 'Punch', 'Tiago', 'Altroz'],
    'Other': ['Verna', 'Urus', 'Fortuner', '530', 'X5', 'Seltos'],
};

export const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'];
export const YEARS_OF_MANUFACTURE = ['2013', '2014', '2015'];
export const YEAR_OF_PURCHASE = ['2013', '2014', '2015'];
export const DELIVERY_TYPES = ['Walk-in / Visit-out', 'Pickup / Drop-off'];
