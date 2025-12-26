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
    StyleSheet,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
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
import { Invoice } from '@/types';

const { width } = Dimensions.get('window');

type TimePeriod = 'Today' | 'Week' | 'Month' | 'Quarter' | 'Year';
type InvoiceType = 'Estimate' | 'Invoice';

export default function InvoiceScreen() {
    const navigation = useNavigation<any>();
    const { theme, themeName } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('Month');
    const [selectedType, setSelectedType] = useState<InvoiceType>('Invoice');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadInvoices();
    }, [selectedPeriod, selectedType]);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await InvoiceService.getByTimePeriod(
                selectedPeriod,
                undefined,
                selectedType.toLowerCase() as 'estimate' | 'invoice'
            );

            setInvoices(data as Invoice[]);
        } catch (err: any) {
            console.error('Error loading invoices:', err);
            setError(err.message || 'Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const periods: TimePeriod[] = ['Today', 'Week', 'Month', 'Quarter', 'Year'];

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

    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const pendingAmount = filteredInvoices
        .filter(inv => inv.payment_status === 'unpaid')
        .reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidCount = filteredInvoices.filter(inv => inv.payment_status === 'paid').length;

    const getStatusColor = (status: string) => {
        const colors: Record<string, { bg: string, text: string }> = {
            draft: { bg: themeName === 'dark' ? 'rgba(75, 85, 99, 0.2)' : '#F3F4F6', text: theme.textMuted },
            sent: { bg: themeName === 'dark' ? 'rgba(2, 132, 199, 0.2)' : '#E0F2FE', text: '#0284C7' },
            approved: { bg: themeName === 'dark' ? 'rgba(22, 163, 74, 0.2)' : '#DCFCE7', text: '#16A34A' },
            rejected: { bg: themeName === 'dark' ? 'rgba(220, 38, 38, 0.2)' : '#FEE2E2', text: '#DC2626' },
            converted: { bg: themeName === 'dark' ? 'rgba(147, 51, 234, 0.2)' : '#F3E8FF', text: '#9333EA' },
            paid: { bg: themeName === 'dark' ? 'rgba(22, 163, 74, 0.2)' : '#DCFCE7', text: '#16A34A' },
            cancelled: { bg: themeName === 'dark' ? 'rgba(220, 38, 38, 0.2)' : '#FEE2E2', text: '#DC2626' },
        };
        return colors[status.toLowerCase()] || colors.draft;
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
            case 'approved': return <CheckCircle2 size={13} color="#16A34A" />;
            case 'draft': return <Clock size={13} color={theme.textMuted} />;
            case 'sent': return <TrendingUp size={13} color="#0284C7" />;
            case 'converted': return <Clock size={13} color="#9333EA" />;
            case 'rejected': return <AlertTriangle size={13} color="#DC2626" />;
            default: return <Clock size={13} color={theme.textMuted} />;
        }
    };

    return (
        <SafeAreaView className="flex-1" edges={['left', 'right', 'bottom']} style={{ backgroundColor: theme.background }}>
            <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            {/* Top Search & Action Bar */}
            <View className="px-6 pt-2 pb-2 flex-row items-center gap-2">
                <View className="flex-1 flex-row items-center border rounded-xl px-4 py-3" style={{ backgroundColor: theme.surface, borderColor: theme.border }}>
                    <Search size={20} color={theme.textMuted} />
                    <TextInput
                        className="flex-1 ml-3 text-base font-medium"
                        placeholder="Search Invoice"
                        placeholderTextColor={theme.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{ color: theme.text }}
                    />
                </View>
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
                        onPress={() => navigation.navigate('MainTabs', { screen: 'ReportsTab' })}
                    >
                        <LinearGradient
                            colors={['#2563EB', '#3B82F6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                            className={`w-40 p-3 rounded-2xl mr-3 border-2 ${statusFilter === 'All' ? 'border-white/30' : 'border-transparent'}`}
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
                        onPress={() => setStatusFilter(statusFilter === 'Pending' ? 'All' : 'Pending')}
                        className={`w-40 p-3 rounded-2xl mr-3 border ${statusFilter === 'Pending' ? 'border-orange-500' : 'border-transparent'}`}
                        style={{ backgroundColor: statusFilter === 'Pending' ? (themeName === 'dark' ? 'rgba(249, 115, 22, 0.1)' : '#FFF7ED') : theme.surface }}
                    >
                        <View className="flex-row justify-between items-start">
                            <View className="bg-orange-50 p-1.5 rounded-lg">
                                <Clock size={18} color="#F97316" />
                            </View>
                        </View>
                        <View className="mt-3">
                            <Text className="text-xs font-medium" style={{ color: theme.textMuted }}>Pending</Text>
                            <Text className="text-lg font-bold mt-0.5" numberOfLines={1} style={{ color: theme.text }}>
                                ₹{(pendingAmount / 1000).toFixed(1)}k
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setStatusFilter(statusFilter === 'Paid' ? 'All' : 'Paid')}
                        className={`w-40 p-3 rounded-2xl border ${statusFilter === 'Paid' ? 'border-green-500' : 'border-transparent'}`}
                        style={{ backgroundColor: statusFilter === 'Paid' ? (themeName === 'dark' ? 'rgba(22, 163, 74, 0.1)' : '#F0FDF4') : theme.surface }}
                    >
                        <View className="flex-row justify-between items-start">
                            <View className="bg-green-50 p-1.5 rounded-lg">
                                <CheckCircle2 size={18} color="#16A34A" />
                            </View>
                        </View>
                        <View className="mt-3">
                            <Text className="text-xs font-medium" style={{ color: theme.textMuted }}>Total Paid</Text>
                            <Text className="text-lg font-bold mt-0.5" style={{ color: theme.text }}>{paidCount}</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>

                <View className="px-6 mt-6">
                    {/* Time Period Tabs */}
                    <View className="flex-row mb-2 p-1 rounded-full" style={{ backgroundColor: theme.surfaceAlt }}>
                        {periods.map((period) => (
                            <TouchableOpacity
                                key={period}
                                onPress={() => setSelectedPeriod(period)}
                                className="flex-1 py-2 rounded-full items-center justify-center"
                                style={{
                                    backgroundColor: selectedPeriod === period ? theme.primary : 'transparent',
                                    ...(selectedPeriod === period && themeName === 'light' ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1, elevation: 2 } : {})
                                }}
                            >
                                <Text
                                    className="text-xs"
                                    style={{ color: selectedPeriod === period ? '#ffffff' : theme.textMuted, fontWeight: selectedPeriod === period ? 'bold' : '500' }}
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
                            <Text className="text-lg font-bold" style={{ color: theme.text }}>Recent {selectedType}s</Text>
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
                            <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                    ) : (
                        <View className="gap-4">
                            {filteredInvoices.length > 0 ? filteredInvoices.map((invoice) => {
                                const customerName = invoice.customer?.full_name || 'Unknown';
                                const initials = customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                                const statusColor = getStatusColor(invoice.status);

                                return (
                                    <TouchableOpacity
                                        key={invoice.id}
                                        activeOpacity={0.7}
                                        onPress={() => navigation.navigate('InvoiceDetail', { invoice })}
                                        className="rounded-2xl p-4 border"
                                        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                                    >
                                        <View className="flex-row justify-between items-start">
                                            <View className="flex-row flex-1">
                                                {/* Avatar */}
                                                <View className="w-12 h-12 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: theme.surfaceAlt }}>
                                                    <Text className="text-base font-bold" style={{ color: theme.text }}>{initials}</Text>
                                                </View>

                                                {/* Info */}
                                                <View className="flex-1">
                                                    <Text className="text-base font-bold mb-1" numberOfLines={1} style={{ color: theme.text }}>
                                                        {customerName}
                                                    </Text>
                                                    <View className="flex-row items-center gap-2">
                                                        <Text className="text-xs font-medium px-2 py-0.5 rounded-md overflow-hidden" style={{ backgroundColor: theme.surfaceAlt, color: theme.textMuted }}>
                                                            {invoice.invoice_number}
                                                        </Text>
                                                        <View className="w-1 h-1 rounded-full bg-gray-300" />
                                                        <Text className="text-xs" style={{ color: theme.textMuted }}>
                                                            {new Date(invoice.invoice_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Amount */}
                                            <View className="items-end">
                                                <Text className="text-lg font-bold" style={{ color: theme.text }}>
                                                    ₹{invoice.total_amount.toLocaleString('en-IN')}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Footer: Vehicle & Status */}
                                        <View className="flex-row justify-between items-center mt-4 pt-4 border-t" style={{ borderTopColor: theme.border }}>
                                            <View className="flex-row items-center">
                                                <View className="p-1.5 rounded-lg mr-2" style={{ backgroundColor: theme.surfaceAlt }}>
                                                    <Building2 size={12} color={theme.textMuted} />
                                                </View>
                                                <Text className="text-xs font-medium" style={{ color: theme.textMuted }}>
                                                    {invoice.vehicle?.brand} {invoice.vehicle?.model}
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
                                                    {invoice.status.toUpperCase()}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )
                            }) : (
                                <View className="py-20 items-center justify-center">
                                    <FileText size={48} color={theme.border} />
                                    <Text className="mt-4 font-medium" style={{ color: theme.textMuted }}>No invoices found</Text>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View className="absolute bottom-0 left-0 right-0 flex-row items-center justify-around py-4" style={{ backgroundColor: theme.primary, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                <TouchableOpacity
                    className="items-center"
                    onPress={() => navigation.navigate('MainTabs', { screen: 'DashboardTab' })}
                >
                    <LayoutDashboard size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    className="items-center"
                    onPress={() => navigation.navigate('MainTabs', { screen: 'BranchesTab' })}
                >
                    <Building2 size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    className="items-center"
                    onPress={() => navigation.navigate('MainTabs', { screen: 'UsersTab' })}
                >
                    <Users size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    className="items-center"
                    onPress={() => navigation.navigate('MainTabs', { screen: 'ReportsTab' })}
                >
                    <BarChart3 size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
});
