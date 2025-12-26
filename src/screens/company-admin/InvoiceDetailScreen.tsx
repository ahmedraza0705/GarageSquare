// ============================================
// INVOICE DETAIL SCREEN (Company Admin)
// Premium UI Design 2025
// ============================================

import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Share,
    Alert,
    StyleSheet,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Share2,
    Download,
    Printer,
    Mail,
    CheckCircle2,
    Clock,
    User,
    Phone,
    Car,
    FileText,
    MapPin
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { Invoice } from '@/types';

type InvoiceDetailRouteParams = {
    invoice: Invoice;
};

type RouteParams = RouteProp<{ InvoiceDetail: InvoiceDetailRouteParams }, 'InvoiceDetail'>;

export default function InvoiceDetailScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteParams>();
    const { invoice } = route.params;
    const { theme, themeName } = useTheme();

    // Helper: Status Configuration
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return {
                    color: '#16A34A',
                    bg: themeName === 'dark' ? 'rgba(22, 163, 74, 0.2)' : '#DCFCE7',
                    icon: <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.5} />,
                    label: 'PAID',
                    gradient: ['#22c55e', '#16a34a']
                };
            case 'unpaid':
            case 'pending':
                return {
                    color: '#F97316',
                    bg: themeName === 'dark' ? 'rgba(249, 115, 22, 0.2)' : '#FFEDD5',
                    icon: <Clock size={16} color="#F97316" strokeWidth={2.5} />,
                    label: 'PENDING',
                    gradient: ['#fb923c', '#f97316']
                };
            default:
                return {
                    color: theme.textMuted,
                    bg: theme.surfaceAlt,
                    icon: <FileText size={16} color={theme.textMuted} strokeWidth={2.5} />,
                    label: status.toUpperCase(),
                    gradient: themeName === 'dark' ? ['#4b5563', '#374151'] : ['#9ca3af', '#6b7280']
                };
        }
    };

    const statusConfig = getStatusConfig(invoice.payment_status);

    // Derived State
    const customerName = invoice.customer?.full_name || 'Unknown Customer';
    const initials = customerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    const formattedDate = new Date(invoice.invoice_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const vehicleInfo = invoice.vehicle ? `${invoice.vehicle.brand} ${invoice.vehicle.model}` : 'No Vehicle';

    // Use real invoice items
    const billingItems = invoice.invoice_items || [];
    const subtotal = invoice.subtotal || billingItems.reduce((sum, item) => sum + item.total_price, 0);
    const taxAmount = invoice.tax_amount || ((Number(invoice.cgst) || 0) + (Number(invoice.sgst) || 0) + (Number(invoice.igst) || 0));
    const grandTotal = invoice.total_amount;

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Invoice ${invoice.invoice_number} from GarageSquare for ₹${grandTotal.toFixed(0)}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handlePrint = () => {
        Alert.alert('Coming Soon', 'PDF generation and printing will be available soon.');
    };

    return (
        <SafeAreaView className="flex-1" edges={['top', 'left', 'right', 'bottom']} style={{ backgroundColor: theme.background }}>
            <StatusBar barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

            {/* Header */}
            <View className="px-5 py-4 flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: theme.surfaceAlt }}
                >
                    <ArrowLeft size={20} color={theme.text} />
                </TouchableOpacity>
                <Text className="text-lg font-bold" style={{ color: theme.text }}>Invoice Details</Text>
                <TouchableOpacity
                    onPress={handleShare}
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: theme.surfaceAlt }}
                >
                    <Share2 size={20} color={theme.text} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Status Hero Section */}
                <View className="px-5 pt-4 pb-2">
                    <View className="flex-row justify-between items-start">
                        <View>
                            <Text className="text-sm font-semibold mb-1" style={{ color: theme.textMuted }}>Invoice Amount</Text>
                            <Text className="text-4xl font-extrabold" style={{ color: theme.text }}>
                                ₹{grandTotal.toLocaleString('en-IN')}
                            </Text>
                        </View>
                        <View className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5`} style={{ backgroundColor: statusConfig.bg }}>
                            {statusConfig.icon}
                            <Text className="text-xs font-bold tracking-wide" style={{ color: statusConfig.color }}>
                                {statusConfig.label}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mt-3 gap-2">
                        <View className="px-2.5 py-1 rounded-md" style={{ backgroundColor: themeName === 'dark' ? 'rgba(37, 99, 235, 0.2)' : '#EFF6FF' }}>
                            <Text className="text-blue-700 text-xs font-bold tracking-wider">{invoice.invoice_number}</Text>
                        </View>
                        <Text className="text-sm" style={{ color: theme.border }}>•</Text>
                        <Text className="text-sm font-medium" style={{ color: theme.textMuted }}>{formattedDate}</Text>
                    </View>
                </View>

                <View className="h-px mx-5 my-6" style={{ backgroundColor: theme.border }} />

                {/* Info Cards */}
                <View className="px-5 gap-4">
                    {/* Customer Card */}
                    <View className="p-4 rounded-2xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border, ...styles.cardShadow }}>
                        <View className="flex-row items-center gap-3 mb-4">
                            <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: themeName === 'dark' ? 'rgba(37, 99, 235, 0.2)' : '#DBEAFE' }}>
                                <User size={20} color="#2563EB" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>Billed To</Text>
                                <Text className="text-base font-bold mt-0.5" style={{ color: theme.text }}>{customerName}</Text>
                            </View>
                        </View>

                        <View className="rounded-xl p-3 gap-2" style={{ backgroundColor: theme.surfaceAlt }}>
                            <View className="flex-row items-start gap-3">
                                <View className="mt-0.5"><Phone size={14} color={theme.textMuted} /></View>
                                <Text className="text-sm font-medium flex-1" style={{ color: theme.text }}>+91 {invoice.customer?.phone || 'N/A'}</Text>
                            </View>
                            {invoice.customer?.email && (
                                <View className="flex-row items-start gap-3">
                                    <View className="mt-0.5"><Mail size={14} color={theme.textMuted} /></View>
                                    <Text className="text-sm font-medium flex-1" style={{ color: theme.text }}>{invoice.customer.email}</Text>
                                </View>
                            )}
                            <View className="flex-row items-start gap-3">
                                <View className="mt-0.5"><MapPin size={14} color={theme.textMuted} /></View>
                                <Text className="text-sm font-medium flex-1 leading-5" style={{ color: theme.text }}>{invoice.customer?.address || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Vehicle Card */}
                    {invoice.vehicle && (
                        <View className="p-4 rounded-2xl border" style={{ backgroundColor: theme.surface, borderColor: theme.border, ...styles.cardShadow }}>
                            <View className="flex-row items-center gap-3 mb-4">
                                <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: themeName === 'dark' ? 'rgba(249, 115, 22, 0.2)' : '#FFEDD5' }}>
                                    <Car size={20} color="#F97316" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs font-bold uppercase tracking-wide" style={{ color: theme.textMuted }}>Vehicle Details</Text>
                                    <Text className="text-base font-bold mt-0.5" style={{ color: theme.text }}>{vehicleInfo}</Text>
                                </View>
                            </View>

                            <View className="flex-row gap-3">
                                <View className="flex-1 p-2.5 rounded-xl items-center border" style={{ backgroundColor: theme.surfaceAlt, borderColor: theme.border }}>
                                    <Text className="text-xs font-medium mb-0.5" style={{ color: theme.textMuted }}>Plate Number</Text>
                                    <Text className="text-sm font-bold" style={{ color: theme.text }}>{invoice.vehicle.license_plate || 'N/A'}</Text>
                                </View>
                                <View className="flex-1 p-2.5 rounded-xl items-center border" style={{ backgroundColor: theme.surfaceAlt, borderColor: theme.border }}>
                                    <Text className="text-xs font-medium mb-0.5" style={{ color: theme.textMuted }}>Job Card ID</Text>
                                    <Text className="text-sm font-bold" style={{ color: theme.text }}>{invoice.job_card_id || 'N/A'}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Items Table */}
                <View className="mt-8 px-5">
                    <Text className="text-lg font-bold mb-4" style={{ color: theme.text }}>Services & Parts</Text>
                    <View className="rounded-2xl border overflow-hidden" style={{ backgroundColor: theme.surface, borderColor: theme.border, ...styles.cardShadow }}>
                        {/* Table Header */}
                        <View className="flex-row px-4 py-3 border-b" style={{ backgroundColor: theme.surfaceAlt, borderBottomColor: theme.border }}>
                            <Text className="flex-[2] text-xs font-bold uppercase" style={{ color: theme.textMuted }}>Description</Text>
                            <Text className="flex-1 text-center text-xs font-bold uppercase" style={{ color: theme.textMuted }}>Qty</Text>
                            <Text className="flex-1 text-right text-xs font-bold uppercase" style={{ color: theme.textMuted }}>Price</Text>
                        </View>

                        {/* Table Items */}
                        {billingItems.length > 0 ? billingItems.map((item, index) => (
                            <View key={index} className="flex-row px-4 py-3.5 border-b last:border-0 items-center" style={{ borderBottomColor: theme.surfaceAlt }}>
                                <Text className="flex-[2] text-sm font-medium leading-5" style={{ color: theme.text }}>{item.item_name}</Text>
                                <Text className="flex-1 text-center text-sm font-semibold" style={{ color: theme.textMuted }}>{item.quantity}</Text>
                                <Text className="flex-1 text-right text-sm font-bold" style={{ color: theme.text }}>₹{item.unit_price}</Text>
                            </View>
                        )) : (
                            <View className="p-8 items-center">
                                <Text style={{ color: theme.border }}>No items recorded</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Breakdown Summary */}
                <View className="mx-5 mt-6 rounded-2xl border p-4" style={{ backgroundColor: theme.surface, borderColor: theme.border, ...styles.cardShadow }}>
                    <View className="flex-row justify-between mb-2">
                        <Text className="font-medium" style={{ color: theme.textMuted }}>Subtotal</Text>
                        <Text className="font-bold" style={{ color: theme.text }}>₹{subtotal.toLocaleString('en-IN')}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="font-medium" style={{ color: theme.textMuted }}>Tax ({invoice.tax_rate}%)</Text>
                        <Text className="font-bold" style={{ color: theme.text }}>₹{taxAmount.toLocaleString('en-IN')}</Text>
                    </View>
                    <View className="flex-row justify-between mb-4">
                        <Text className="font-medium" style={{ color: theme.textMuted }}>Discount</Text>
                        <Text className="font-bold text-green-600">- ₹{invoice.discount_amount?.toLocaleString('en-IN') || 0}</Text>
                    </View>

                    <View className="h-px mb-4" style={{ backgroundColor: theme.border }} />

                    <View className="flex-row justify-between items-center">
                        <Text className="text-lg font-extrabold" style={{ color: theme.text }}>Grand Total</Text>
                        <Text className="text-2xl font-extrabold text-blue-600">₹{grandTotal.toLocaleString('en-IN')}</Text>
                    </View>
                </View>

                {/* Payment Note */}
                <View className="mx-5 mt-6 mb-8 p-4 rounded-xl border" style={{ backgroundColor: themeName === 'dark' ? 'rgba(234, 179, 8, 0.05)' : '#FEFCE8', borderColor: themeName === 'dark' ? 'rgba(234, 179, 8, 0.2)' : '#FEF08A' }}>
                    <Text className="text-xs font-bold uppercase mb-1" style={{ color: '#A16207' }}>Payment Note</Text>
                    <Text className="text-sm leading-5" style={{ color: '#854D0E' }}>
                        Please ensure payment is made within 15 days. Thank you for choosing GarageSquare!
                    </Text>
                </View>
            </ScrollView>

            {/* Actions Footer */}
            <View
                className="absolute bottom-0 left-0 right-0 border-t px-5 pt-3 pb-8 flex-row gap-3"
                style={{ backgroundColor: theme.surface, borderTopColor: theme.border, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10 }}
            >
                <TouchableOpacity
                    className="flex-1 border py-3.5 rounded-xl items-center flex-row justify-center gap-2"
                    style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                    onPress={handlePrint}
                >
                    <Printer size={18} color={theme.text} strokeWidth={2.5} />
                    <Text className="font-bold" style={{ color: theme.text }}>Print / PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-1 py-3.5 rounded-xl items-center flex-row justify-center gap-2"
                    style={{ backgroundColor: theme.primary }}
                    onPress={handleShare}
                >
                    <Share2 size={18} color="white" strokeWidth={2.5} />
                    <Text className="text-white font-bold">Send Invoice</Text>
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