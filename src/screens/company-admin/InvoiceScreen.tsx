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
    Platform,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Search,
    Filter,
    FileText,
    LayoutDashboard,
    Building2,
    Users,
    Plus,
    TrendingUp,
    Clock,
    CheckCircle2,
    Calendar,
    BarChart3,
    ChevronRight,
    Briefcase,
    AlertTriangle
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { InvoiceService } from '@/services/invoice.service';

const { width } = Dimensions.get('window');

type TimePeriod = 'Today' | 'Week' | 'Month' | 'Quarter' | 'Year';
type InvoiceType = 'Estimate' | 'Invoice';

// Local Invoice Interface (matching the structure used in render)
interface Invoice {
    id: string;
    invoice_number: string;
    invoice_type: 'estimate' | 'invoice';
    status: 'draft' | 'sent' | 'approved' | 'rejected' | 'converted' | 'paid' | 'cancelled';
    payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
    invoice_date: string;
    total_amount: number;
    customer?: {
        full_name: string;
    };
    vehicle?: {
        make: string;
        model: string;
        license_plate?: string;
    };
    // Additional fields for detail view compatibility if passed via navigation
    job_card_id?: string;
    customer_id?: string;
    branch_id?: string;
    vehicle_id?: string;
    subtotal?: number;
    tax_rate?: number;
    cgst?: number;
    sgst?: number;
    discount_amount?: number;
    created_at?: string;
    updated_at?: string;
}

export default function InvoiceScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('Month');
    const [selectedType, setSelectedType] = useState<InvoiceType>('Invoice');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

    // Static data state
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Comprehensive static data for different time periods
    const allInvoices: Record<TimePeriod, Invoice[]> = {
        Today: [
            {
                id: '1',
                invoice_number: 'EST-0030',
                invoice_type: 'estimate',
                status: 'draft',
                payment_status: 'unpaid',
                invoice_date: '2024-12-19T10:00:00Z',
                total_amount: 8500,
                customer: { full_name: 'Rajesh.K' },
                vehicle: { make: 'Honda', model: 'City', license_plate: 'GJ-05-AB-1234' }
            },
            {
                id: '2',
                invoice_number: 'EST-0031',
                invoice_type: 'estimate',
                status: 'draft',
                payment_status: 'unpaid',
                invoice_date: '2024-12-19T11:30:00Z',
                total_amount: 12000,
                customer: { full_name: 'Priya.S' },
                vehicle: { make: 'Maruti', model: 'Swift', license_plate: 'GJ-05-CD-5678' }
            },
        ],
        Week: [
            {
                id: '3',
                invoice_number: 'EST-0021',
                invoice_type: 'estimate',
                status: 'sent',
                payment_status: 'unpaid',
                invoice_date: '2024-12-14T09:00:00Z',
                total_amount: 14498,
                customer: { full_name: 'Ahmed.R' },
                vehicle: { make: 'Maruti', model: 'SWIFT Dzire', license_plate: 'GJ-05-MT-0007' }
            },
            {
                id: '4',
                invoice_number: 'EST-0028',
                invoice_type: 'estimate',
                status: 'approved',
                payment_status: 'unpaid',
                invoice_date: '2024-12-16T14:20:00Z',
                total_amount: 18500,
                customer: { full_name: 'Vikram.P' },
                vehicle: { make: 'Hyundai', model: 'Creta', license_plate: 'GJ-05-EF-9012' }
            },
            {
                id: '5',
                invoice_number: 'EST-0029',
                invoice_type: 'estimate',
                status: 'draft',
                payment_status: 'unpaid',
                invoice_date: '2024-12-18T16:45:00Z',
                total_amount: 9800,
                customer: { full_name: 'Sneha.M' },
                vehicle: { make: 'Tata', model: 'Nexon', license_plate: 'GJ-05-GH-3456' }
            },
        ],
        Month: [
            {
                id: '6',
                invoice_number: 'EST-0021',
                invoice_type: 'estimate',
                status: 'sent',
                payment_status: 'unpaid',
                invoice_date: '2024-12-14T09:00:00Z',
                total_amount: 14498,
                customer: { full_name: 'Ahmed.R' },
                vehicle: { make: 'Maruti', model: 'SWIFT Dzire', license_plate: 'GJ-05-MT-0007' }
            },
            {
                id: '7',
                invoice_number: 'EST-0022',
                invoice_type: 'estimate',
                status: 'approved',
                payment_status: 'unpaid',
                invoice_date: '2024-12-08T10:15:00Z',
                total_amount: 32000,
                customer: { full_name: 'Solution.S' },
                vehicle: { make: 'BMW', model: 'i7', license_plate: 'GJ-05-J2-0007' }
            },
            {
                id: '8',
                invoice_number: 'EST-0023',
                invoice_type: 'estimate',
                status: 'converted',
                payment_status: 'paid',
                invoice_date: '2024-12-05T11:00:00Z',
                total_amount: 22000,
                customer: { full_name: 'Squares.S' },
                vehicle: { make: 'Kia', model: 'Carens', license_plate: 'GJ-05-J2-0001' }
            },
            {
                id: '9',
                invoice_number: 'EST-0024',
                invoice_type: 'estimate',
                status: 'rejected',
                payment_status: 'unpaid',
                invoice_date: '2024-12-01T13:30:00Z',
                total_amount: 25000,
                customer: { full_name: 'Amit.T' },
                vehicle: { make: 'Mahindra', model: 'XUV700', license_plate: 'GJ-05-IJ-7890' }
            },
        ],
        Quarter: [
            {
                id: '10',
                invoice_number: 'EST-0015',
                invoice_type: 'estimate',
                status: 'paid',
                payment_status: 'paid',
                invoice_date: '2024-11-15T10:00:00Z',
                total_amount: 45000,
                customer: { full_name: 'Rahul.G' },
                vehicle: { make: 'Toyota', model: 'Fortuner', license_plate: 'GJ-05-KL-2345' }
            },
        ],
        Year: [
            {
                id: '11',
                invoice_number: 'EST-0001',
                invoice_type: 'estimate',
                status: 'paid',
                payment_status: 'paid',
                invoice_date: '2024-01-15T09:00:00Z',
                total_amount: 85000,
                customer: { full_name: 'Ankit.V' },
                vehicle: { make: 'Audi', model: 'Q7', license_plate: 'GJ-05-UV-2345' }
            },
        ],
    };

    // Load static data
    useEffect(() => {
        loadInvoices();
    }, [selectedPeriod, selectedType]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch from Supabase service
            const data = await InvoiceService.getByTimePeriod(
                selectedPeriod,
                undefined, // branchId
                selectedType.toLowerCase() as 'estimate' | 'invoice'
            );

            setInvoices(data as any);
        } catch (err: any) {
            console.error('Error loading invoices:', err);
            setError(err.message || 'Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const periods: TimePeriod[] = ['Today', 'Week', 'Month', 'Quarter', 'Year'];
    const types: InvoiceType[] = ['Estimate', 'Invoice'];

    // Filter invoices based on search query
    // Filter invoices based on search query and status filter
    const filteredInvoices = invoices.filter((invoice) => {
        const customerName = invoice.customer?.full_name || '';
        const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All'
            ? true
            : statusFilter === 'Paid'
                ? invoice.payment_status === 'paid'
                : invoice.payment_status === 'unpaid';

        return matchesSearch && matchesStatus;
    });

    // Calculate Stats
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const pendingAmount = filteredInvoices
        .filter(inv => inv.payment_status === 'unpaid')
        .reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidCount = filteredInvoices.filter(inv => inv.payment_status === 'paid').length;

    const getStatusColor = (status: string) => {
        const colors: Record<string, { bg: string, text: string }> = {
            draft: { bg: '#F3F4F6', text: '#4B5563' },
            sent: { bg: '#E0F2FE', text: '#0284C7' },
            approved: { bg: '#DCFCE7', text: '#16A34A' },
            rejected: { bg: '#FEE2E2', text: '#DC2626' },
            converted: { bg: '#F3E8FF', text: '#9333EA' },
            paid: { bg: '#DCFCE7', text: '#16A34A' },
            cancelled: { bg: '#FEE2E2', text: '#DC2626' },
        };
        return colors[status.toLowerCase()] || colors.draft;
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid': return <CheckCircle2 size={13} color="#16A34A" />;
            case 'approved': return <CheckCircle2 size={13} color="#16A34A" />;
            case 'draft': return <Clock size={13} color="#4B5563" />;
            case 'sent': return <TrendingUp size={13} color="#0284C7" />;
            case 'converted': return <Clock size={13} color="#9333EA" />;
            case 'rejected': return <AlertTriangle size={13} color="#DC2626" />;
            default: return <Clock size={13} color="#4B5563" />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['left', 'right', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* Top Search & Action Bar */}
            <View className="px-6 pt-2 pb-2 flex-row items-center gap-2 bg-gray-50">
                <View className="flex-1 flex-row items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                    <Search size={20} color="#6B7280" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-gray-900 font-medium"
                        placeholder="Search Invoice"
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* <TouchableOpacity
                    className="w-12 h-12 bg-green-500 rounded-xl items-center justify-center shadow-sm active:opacity-90"
                    onPress={() => { }}
                >
                    <Plus size={24} color="#000000" strokeWidth={2.5} />
                </TouchableOpacity> */}
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mt-4 pl-6"
                    contentContainerStyle={{ paddingRight: 24 }}
                >
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('Reports' as never)}
                    >
                        <LinearGradient
                            colors={['#2563EB', '#3B82F6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            className={`w-40 p-3 rounded-2xl mr-3 shadow-md shadow-blue-200 border-2 ${statusFilter === 'All' ? 'border-blue-300' : 'border-transparent'}`}
                        >
                            <View className="flex-row justify-between items-start">
                                <View className="bg-white/20 p-1.5 rounded-lg">
                                    <TrendingUp size={18} color="white" />
                                </View>
                            </View>
                            <View className="mt-3">
                                <Text className="text-white/90 text-xs font-medium">Revenue</Text>
                                <Text className="text-lg font-bold text-white mt-0.5" numberOfLines={1}>
                                    ₹{(totalAmount / 1000).toFixed(1)}k
                                </Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setStatusFilter('Pending')}
                        className={`w-40 p-3 rounded-2xl mr-3 bg-white shadow-sm border ${statusFilter === 'Pending' ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}
                    >
                        <View className="flex-row justify-between items-start">
                            <View className="bg-orange-50 p-1.5 rounded-lg">
                                <Clock size={18} color="#F97316" />
                            </View>
                        </View>
                        <View className="mt-3">
                            <Text className="text-gray-500 text-xs font-medium">Pending</Text>
                            <Text className="text-lg font-bold text-gray-900 mt-0.5" numberOfLines={1}>
                                ₹{(pendingAmount / 1000).toFixed(1)}k
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setStatusFilter('Paid')}
                        className={`w-40 p-3 rounded-2xl bg-white shadow-sm border mr-2 ${statusFilter === 'Paid' ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}
                    >
                        <View className="flex-row justify-between items-start">
                            <View className="bg-green-50 p-1.5 rounded-lg">
                                <CheckCircle2 size={18} color="#16A34A" />
                            </View>
                        </View>
                        <View className="mt-3">
                            <Text className="text-gray-500 text-xs font-medium">Total Paid</Text>
                            <Text className="text-lg font-bold text-gray-900 mt-0.5">{paidCount}</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>

                <View className="px-6 mt-6">
                    {/* Time Period Tabs */}
                    <View className="flex-row mb-2 bg-gray-100 p-1 rounded-full">
                        {periods.map((period) => (
                            <TouchableOpacity
                                key={period}
                                onPress={() => setSelectedPeriod(period)}
                                className="flex-1 py-2 rounded-full items-center justify-center"
                                style={{ backgroundColor: selectedPeriod === period ? '#4682B4' : 'transparent', ... (selectedPeriod === period ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 } : {}) }}
                            >
                                <Text
                                    className="text-xs"
                                    style={{ color: selectedPeriod === period ? '#ffffff' : '#6B7280', fontWeight: selectedPeriod === period ? 'bold' : '500' }}
                                >
                                    {period}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Invoices List */}
                <View className="px-6 mt-1">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-row items-baseline gap-2">
                            <Text className="text-lg font-bold text-gray-900">Recent {selectedType}s</Text>
                            {statusFilter !== 'All' && (
                                <View className={`px-2 py-0.5 rounded-md ${statusFilter === 'Paid' ? 'bg-green-100' : 'bg-orange-100'}`}>
                                    <Text className={`text-[10px] font-bold ${statusFilter === 'Paid' ? 'text-green-700' : 'text-orange-700'}`}>
                                        {statusFilter.toUpperCase()} ONLY
                                    </Text>
                                </View>
                            )}
                        </View>
                        {statusFilter !== 'All' ? (
                            <TouchableOpacity onPress={() => setStatusFilter('All')}>
                                <Text className="text-blue-600 text-sm font-semibold">Clear Filter</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setSelectedType(prev => prev === 'Invoice' ? 'Estimate' : 'Invoice')}>
                                <Text className="text-blue-600 text-sm font-semibold">
                                    {selectedType === 'Estimate' ? 'Show Invoices' : 'Show Estimates'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {loading ? (
                        <View className="py-20 items-center">
                            <ActivityIndicator size="large" color="#0051ffff" />
                        </View>
                    ) : (
                        <View className="gap-4">
                            {filteredInvoices.map((invoice) => {
                                const customerName = invoice.customer?.full_name || 'Unknown';
                                const initials = customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                                const statusColor = getStatusColor(invoice.status);

                                return (
                                    <TouchableOpacity
                                        key={invoice.id}
                                        activeOpacity={0.7}
                                        onPress={() => (navigation as any).navigate('InvoiceDetail', { invoice })}
                                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                                    >
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-row flex-1">
                                                {/* Avatar */}
                                                <View className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center mr-4">
                                                    <Text className="text-base font-bold text-gray-700">{initials}</Text>
                                                </View>

                                                {/* Info */}
                                                <View className="flex-1">
                                                    <Text className="text-base font-bold text-gray-900 mb-1" numberOfLines={1}>
                                                        {customerName}
                                                    </Text>
                                                    <View className="flex-row items-center gap-2">
                                                        <Text className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md overflow-hidden">
                                                            {invoice.invoice_number}
                                                        </Text>
                                                        <View className="w-1 h-1 rounded-full bg-gray-300" />
                                                        <Text className="text-xs text-gray-500">
                                                            {new Date(invoice.invoice_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Amount */}
                                            <View className="items-end">
                                                <Text className="text-lg font-bold text-gray-900">
                                                    ₹{invoice.total_amount.toLocaleString('en-IN')}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Footer: Vehicle & Status */}
                                        <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-gray-50">
                                            <View className="flex-row items-center">
                                                <View className="bg-gray-100 p-1.5 rounded-lg mr-2">
                                                    <Building2 size={12} color="#6B7280" />
                                                </View>
                                                <Text className="text-xs text-gray-600 font-medium">
                                                    {invoice.vehicle?.make} {invoice.vehicle?.model}
                                                </Text>
                                            </View>

                                            {/* Status Badge */}
                                            <View
                                                className="flex-row items-center px-3 rounded-full gap-1.5 h-7"
                                                style={{ backgroundColor: statusColor.bg }}
                                            >
                                                {getStatusIcon(invoice.status)}
                                                <Text
                                                    className="text-[11px] font-bold"
                                                    style={{
                                                        color: statusColor.text,
                                                        includeFontPadding: false,
                                                        textAlignVertical: 'center',
                                                        marginTop: -3
                                                    }}
                                                >
                                                    {invoice.status}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-around py-4" style={{ backgroundColor: '#4A90E2' }}>
                <TouchableOpacity className="items-center">
                    <LayoutDashboard size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity className="items-center">
                    <Building2 size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity className="items-center">
                    <Users size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity className="items-center">
                    <BarChart3 size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
