// ============================================
// INVOICE SCREEN (Company Admin)
// Modern 2025 UI Design - Clean & Consistent
// ============================================

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Search,
    Filter,
    FileText,
    LayoutDashboard,
    Building2,
    Users,
    FileBarChart,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';
import { InvoiceService, Invoice } from '@/services/invoice.service';
import { useAuth } from '@/hooks/useAuth';

type TimePeriod = 'Today' | 'Week' | 'Month' | 'Quarter' | 'Year';
type InvoiceType = 'Estimate' | 'Invoice';

export default function InvoiceScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('Month');
    const [selectedType, setSelectedType] = useState<InvoiceType>('Estimate');

    // Supabase integration state
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Comprehensive static data for different time periods
    const allInvoices = {
        Today: [
            {
                id: '1',
                customerName: 'Rajesh.K',
                customerInitials: 'RK',
                location: 'Honda City',
                jobNumber: 'GJ-05-AB-1234',
                amount: 8500,
                invoiceNumber: 'EST-0030',
                date: '19 Dec 2024',
                status: 'estimate' as const,
                avatarColor: '#FF6B6B',
            },
            {
                id: '2',
                customerName: 'Priya.S',
                customerInitials: 'PS',
                location: 'Maruti Swift',
                jobNumber: 'GJ-05-CD-5678',
                amount: 12000,
                invoiceNumber: 'EST-0031',
                date: '19 Dec 2024',
                status: 'estimate' as const,
                avatarColor: '#4ECDC4',
            },
        ],
        Week: [
            {
                id: '1',
                customerName: 'Ahmed.R',
                customerInitials: 'AR',
                location: 'SWIFT Dzire',
                jobNumber: 'GJ-05-MT-0007',
                amount: 14498,
                invoiceNumber: 'EST-0021',
                date: '14 Dec 2024',
                status: 'estimate' as const,
                avatarColor: '#4A90E2',
            },
            {
                id: '2',
                customerName: 'Vikram.P',
                customerInitials: 'VP',
                location: 'Hyundai Creta',
                jobNumber: 'GJ-05-EF-9012',
                amount: 18500,
                invoiceNumber: 'EST-0028',
                date: '16 Dec 2024',
                status: 'estimate' as const,
                avatarColor: '#9B59B6',
            },
            {
                id: '3',
                customerName: 'Sneha.M',
                customerInitials: 'SM',
                location: 'Tata Nexon',
                jobNumber: 'GJ-05-GH-3456',
                amount: 9800,
                invoiceNumber: 'EST-0029',
                date: '18 Dec 2024',
                status: 'estimate' as const,
                avatarColor: '#E74C3C',
            },
        ],
        Month: [
            {
                id: '1',
                customerName: 'Ahmed.R',
                customerInitials: 'AR',
                location: 'SWIFT Dzire',
                jobNumber: 'GJ-05-MT-0007',
                amount: 14498,
                invoiceNumber: 'EST-0021',
                date: '14 Dec 2024',
                status: 'estimate' as const,
                avatarColor: '#4A90E2',
            },
            {
                id: '2',
                customerName: 'Solution.S',
                customerInitials: 'SS',
                location: 'BMW i7',
                jobNumber: 'GJ-05-J2-0007',
                amount: 32000,
                invoiceNumber: 'EST-0022',
                date: '8 Dec 2024',
                status: 'estimate' as const,
                avatarColor: '#5C6BC0',
            },
            {
                id: '3',
                customerName: 'Squares.S',
                customerInitials: 'SS',
                location: 'Kia Carens',
                jobNumber: 'GJ-05-J2-0001',
                amount: 22000,
                invoiceNumber: 'EST-0023',
                date: '5 Dec 2024',
                status: 'estimate' as const,
                avatarColor: '#66BB6A',
            },
            {
                id: '4',
                customerName: 'Amit.T',
                customerInitials: 'AT',
                location: 'Mahindra XUV700',
                jobNumber: 'GJ-05-IJ-7890',
                amount: 25000,
                invoiceNumber: 'EST-0024',
                date: '1 Dec 2024',
                status: 'estimate' as const,
                avatarColor: '#FFA726',
            },
        ],
        Quarter: [
            {
                id: '1',
                customerName: 'Rahul.G',
                customerInitials: 'RG',
                location: 'Toyota Fortuner',
                jobNumber: 'GJ-05-KL-2345',
                amount: 45000,
                invoiceNumber: 'EST-0015',
                date: '15 Nov 2024',
                status: 'estimate' as const,
                avatarColor: '#26A69A',
            },
            {
                id: '2',
                customerName: 'Kavita.D',
                customerInitials: 'KD',
                location: 'Honda Amaze',
                jobNumber: 'GJ-05-MN-6789',
                amount: 11500,
                invoiceNumber: 'EST-0016',
                date: '22 Oct 2024',
                status: 'estimate' as const,
                avatarColor: '#AB47BC',
            },
            {
                id: '3',
                customerName: 'Suresh.B',
                customerInitials: 'SB',
                location: 'Ford EcoSport',
                jobNumber: 'GJ-05-OP-0123',
                amount: 16800,
                invoiceNumber: 'EST-0017',
                date: '10 Oct 2024',
                status: 'estimate' as const,
                avatarColor: '#5C6BC0',
            },
            {
                id: '4',
                customerName: 'Meera.L',
                customerInitials: 'ML',
                location: 'Renault Duster',
                jobNumber: 'GJ-05-QR-4567',
                amount: 13200,
                invoiceNumber: 'EST-0018',
                date: '28 Nov 2024',
                status: 'estimate' as const,
                avatarColor: '#EF5350',
            },
            {
                id: '5',
                customerName: 'Deepak.N',
                customerInitials: 'DN',
                location: 'Nissan Magnite',
                jobNumber: 'GJ-05-ST-8901',
                amount: 9500,
                invoiceNumber: 'EST-0019',
                date: '5 Dec 2024',
                status: 'estimate' as const,
                avatarColor: '#42A5F5',
            },
        ],
        Year: [
            {
                id: '1',
                customerName: 'Ankit.V',
                customerInitials: 'AV',
                location: 'Audi Q7',
                jobNumber: 'GJ-05-UV-2345',
                amount: 85000,
                invoiceNumber: 'EST-0001',
                date: '15 Jan 2024',
                status: 'estimate' as const,
                avatarColor: '#7E57C2',
            },
            {
                id: '2',
                customerName: 'Pooja.K',
                customerInitials: 'PK',
                location: 'Mercedes GLC',
                jobNumber: 'GJ-05-WX-6789',
                amount: 95000,
                invoiceNumber: 'EST-0002',
                date: '28 Feb 2024',
                status: 'estimate' as const,
                avatarColor: '#EC407A',
            },
            {
                id: '3',
                customerName: 'Ravi.S',
                customerInitials: 'RS',
                location: 'Volvo XC90',
                jobNumber: 'GJ-05-YZ-0123',
                amount: 120000,
                invoiceNumber: 'EST-0003',
                date: '12 Mar 2024',
                status: 'estimate' as const,
                avatarColor: '#26C6DA',
            },
            {
                id: '4',
                customerName: 'Neha.R',
                customerInitials: 'NR',
                location: 'Jaguar F-Pace',
                jobNumber: 'GJ-05-AB-4567',
                amount: 110000,
                invoiceNumber: 'EST-0004',
                date: '20 May 2024',
                status: 'estimate' as const,
                avatarColor: '#66BB6A',
            },
            {
                id: '5',
                customerName: 'Karan.M',
                customerInitials: 'KM',
                location: 'Range Rover',
                jobNumber: 'GJ-05-CD-8901',
                amount: 150000,
                invoiceNumber: 'EST-0005',
                date: '8 Aug 2024',
                status: 'estimate' as const,
                avatarColor: '#FFA726',
            },
            {
                id: '6',
                customerName: 'Simran.P',
                customerInitials: 'SP',
                location: 'Porsche Cayenne',
                jobNumber: 'GJ-05-EF-2345',
                amount: 180000,
                invoiceNumber: 'EST-0006',
                date: '25 Sep 2024',
                status: 'estimate' as const,
                avatarColor: '#EF5350',
            },
        ],
    };

    // Load invoices from Supabase
    useEffect(() => {
        loadInvoices();
    }, [selectedPeriod, selectedType]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            setError(null);

            const branchId = user?.profile?.branch_id;
            const invoiceType = selectedType === 'Estimate' ? 'estimate' : 'invoice';

            const data = await InvoiceService.getByTimePeriod(
                selectedPeriod,
                branchId,
                invoiceType
            );

            setInvoices(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load invoices');
            console.error('Error loading invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    const periods: TimePeriod[] = ['Today', 'Week', 'Month', 'Quarter', 'Year'];
    const types: InvoiceType[] = ['Estimate', 'Invoice'];

    // Filter invoices based on search query
    const filteredInvoices = invoices.filter((invoice) => {
        const customerName = invoice.customer?.full_name || '';
        return customerName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: '#F5F5F5' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                {/* Search Bar */}
                <View className="flex-row items-center gap-2 mb-4">
                    <View
                        className="flex-1 flex-row items-center px-3 py-2.5 rounded-lg bg-white"
                        style={{ borderWidth: 1, borderColor: '#E0E0E0' }}
                    >
                        <Search size={18} color="#9E9E9E" />
                        <TextInput
                            className="flex-1 ml-2 text-sm"
                            placeholder="Search customers..."
                            placeholderTextColor="#9E9E9E"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={{ color: '#1F2937' }}
                        />
                    </View>
                    <TouchableOpacity
                        className="p-2.5 rounded-lg bg-white"
                        style={{ borderWidth: 1, borderColor: '#E0E0E0' }}
                    >
                        <Filter size={18} color="#1F2937" />
                    </TouchableOpacity>
                </View>

                {/* Time Period Filter Buttons */}
                <View className="flex-row mb-4">
                    {periods.map((period) => (
                        <TouchableOpacity
                            key={period}
                            onPress={() => setSelectedPeriod(period)}
                            className="flex-1 py-2 mx-1 rounded-lg items-center"
                            style={{
                                backgroundColor: selectedPeriod === period ? '#4A90E2' : '#FFFFFF',
                                borderWidth: 1,
                                borderColor: selectedPeriod === period ? '#4A90E2' : '#E0E0E0',
                            }}
                        >
                            <Text
                                className="font-medium text-sm"
                                style={{ color: selectedPeriod === period ? '#FFFFFF' : '#000000' }}
                            >
                                {period}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Invoice List */}
                {loading ? (
                    <View className="items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#4A90E2" />
                        <Text className="text-sm mt-4" style={{ color: '#9E9E9E' }}>
                            Loading {selectedType.toLowerCase()}s...
                        </Text>
                    </View>
                ) : error ? (
                    <View className="items-center justify-center py-20">
                        <FileText size={64} color="#EF5350" />
                        <Text className="text-base mt-4 mb-2" style={{ color: '#EF5350' }}>
                            {error}
                        </Text>
                        <TouchableOpacity
                            className="px-6 py-3 rounded-lg"
                            style={{ backgroundColor: '#4A90E2' }}
                            onPress={loadInvoices}
                        >
                            <Text className="text-white font-semibold">Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : filteredInvoices.map((invoice) => {
                    const customerName = invoice.customer?.full_name || 'Unknown';
                    const customerInitials = customerName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                    const avatarColors = ['#FF6B6B', '#4ECDC4', '#4A90E2', '#9B59B6', '#E74C3C', '#5C6BC0', '#66BB6A', '#FFA726'];
                    const avatarColor = avatarColors[customerName.length % avatarColors.length];
                    const vehicleInfo = invoice.vehicle ? `${invoice.vehicle.make} ${invoice.vehicle.model}` : 'No vehicle';

                    return (
                        <View
                            key={invoice.id}
                            className="mb-3 rounded-lg overflow-hidden bg-white"
                            style={{
                                borderWidth: 1,
                                borderColor: '#E0E0E0',
                            }}
                        >
                            <View className="p-4">
                                {/* Customer Info */}
                                <View className="flex-row items-center mb-3">
                                    <View
                                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: avatarColor }}
                                    >
                                        <Text className="text-white font-bold text-base">
                                            {customerInitials}
                                        </Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-base font-bold mb-1" style={{ color: '#1F2937' }}>
                                            {customerName}
                                        </Text>
                                        <Text className="text-sm" style={{ color: '#757575' }}>
                                            {vehicleInfo}
                                        </Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-xs mb-1" style={{ color: '#9E9E9E' }}>
                                            {invoice.invoice_number}
                                        </Text>
                                        <Text className="text-xs" style={{ color: '#9E9E9E' }}>
                                            {new Date(invoice.invoice_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </Text>
                                    </View>
                                </View>

                                {/* Vehicle License Plate */}
                                <View className="mb-3">
                                    <Text className="text-sm" style={{ color: '#757575' }}>
                                        {invoice.vehicle?.license_plate || 'No license plate'}
                                    </Text>
                                </View>

                                {/* Amount and Action */}
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-2xl font-bold" style={{ color: '#1F2937' }}>
                                        ₹{invoice.total_amount.toLocaleString('en-IN')}
                                    </Text>
                                    <TouchableOpacity
                                        className="px-6 py-2.5 rounded-lg"
                                        style={{ backgroundColor: '#E3F2FD' }}
                                        onPress={() => navigation.navigate('InvoiceDetail' as never, { invoice } as never)}
                                    >
                                        <Text className="font-semibold text-sm" style={{ color: '#1976D2' }}>
                                            Convert to Invoice
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                })}

                {/* Empty State */}
                {!loading && !error && filteredInvoices.length === 0 && (
                    <View className="items-center justify-center py-20">
                        <FileText size={64} color="#E0E0E0" />
                        <Text className="text-base mt-4" style={{ color: '#9E9E9E' }}>
                            No {selectedType.toLowerCase()}s found
                        </Text>
                    </View>
                )}

                {/* Bottom Spacing for Tab Bar */}
                <View className="h-24" />
            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View
                className="absolute bottom-0 left-0 right-0 flex-row items-center justify-around"
                style={{
                    backgroundColor: '#4682B4',
                    height: Platform.OS === 'ios' ? 85 : 65,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                }}
            >
                <TouchableOpacity
                    className="items-center"
                    onPress={() => navigation.navigate('MainTabs' as never, { screen: 'DashboardTab' } as never)}
                >
                    <LayoutDashboard size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    className="items-center"
                    onPress={() => navigation.navigate('MainTabs' as never, { screen: 'BranchesTab' } as never)}
                >
                    <Building2 size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    className="items-center"
                    onPress={() => navigation.navigate('MainTabs' as never, { screen: 'UsersTab' } as never)}
                >
                    <Users size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    className="items-center"
                    onPress={() => navigation.navigate('MainTabs' as never, { screen: 'ReportsTab' } as never)}
                >
                    <FileBarChart size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
