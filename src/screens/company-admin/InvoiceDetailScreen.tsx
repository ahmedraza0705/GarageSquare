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
    Calendar,
    FileText,
    MapPin
} from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

type InvoiceDetailRouteParams = {
    invoice: {
        id: string;
        invoice_number: string;
        invoice_type: 'estimate' | 'invoice';
        status: string;
        payment_status: string;
        invoice_date: string;
        total_amount: number;
        customer?: {
            full_name: string;
            phone?: string;
            email?: string;
            address?: string;
        };
        vehicle?: {
            make: string;
            model: string;
            license_plate?: string;
            year?: string;
        };
        job_card_id?: string;
    };
};

type RouteParams = RouteProp<{ InvoiceDetail: InvoiceDetailRouteParams }, 'InvoiceDetail'>;

export default function InvoiceDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute<RouteParams>();
    const { invoice } = route.params;

    // Helper: Status Configuration
    const getStatusConfig = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return {
                    color: '#16A34A',
                    bg: '#DCFCE7',
                    icon: <CheckCircle2 size={16} color="#16A34A" strokeWidth={2.5} />,
                    label: 'PAID',
                    gradient: ['#22c55e', '#16a34a']
                };
            case 'unpaid':
            case 'pending':
                return {
                    color: '#F97316',
                    bg: '#FFEDD5',
                    icon: <Clock size={16} color="#F97316" strokeWidth={2.5} />,
                    label: 'PENDING',
                    gradient: ['#fb923c', '#f97316']
                };
            default:
                return {
                    color: '#6B7280',
                    bg: '#F3F4F6',
                    icon: <FileText size={16} color="#6B7280" strokeWidth={2.5} />,
                    label: status.toUpperCase(),
                    gradient: ['#9ca3af', '#6b7280']
                };
        }
    };

    const statusConfig = getStatusConfig(invoice.payment_status);

    // Derived State
    const customerName = invoice.customer?.full_name || 'Unknown Customer';
    const customerInitials = customerName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    const formattedDate = new Date(invoice.invoice_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    const vehicleInfo = invoice.vehicle ? `${invoice.vehicle.make} ${invoice.vehicle.model}` : 'No Vehicle';

    // Mock Billing Items (Ideally should come from invoice object)
    const billingItems = [
        { name: 'Full Service - Synthetic Oil', qty: 1, price: 4500 },
        { name: 'Oil Filter Replacement', qty: 1, price: 350 },
        { name: 'Air Filter Cleaning', qty: 1, price: 150 },
        { name: 'Brake Pad Inspection', qty: 4, price: 800 },
        { name: 'General Labour Charges', qty: 1, price: 1200 },
    ];

    const subtotal = billingItems.reduce((sum, item) => sum + item.price, 0);
    const taxRate = 0.18;
    const taxAmount = subtotal * taxRate;
    const grandTotal = subtotal + taxAmount;

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Invoice ${invoice.invoice_number} from GarageSquare for ₹${grandTotal.toFixed(0)}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Top Navigation Bar */}
            <View className="px-4 py-3 bg-white border-b border-gray-100 flex-row items-center justify-between shadow-sm">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100 active:bg-gray-100"
                >
                    <ArrowLeft size={20} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">Invoice Details</Text>
                <TouchableOpacity
                    onPress={handleShare}
                    className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100 active:bg-gray-100"
                >
                    <Share2 size={18} color="#374151" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Status Banner */}
                <View className="px-5 pt-6 pb-2">
                    <View className="flex-row justify-between items-start">
                        <View>
                            <Text className="text-sm font-semibold text-gray-500 mb-1">Invoice Amount</Text>
                            <Text className="text-4xl font-extrabold text-gray-900">
                                ₹{invoice.total_amount.toLocaleString('en-IN')}
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
                        <View className="bg-blue-50 px-2.5 py-1 rounded-md">
                            <Text className="text-blue-700 text-xs font-bold tracking-wider">{invoice.invoice_number}</Text>
                        </View>
                        <Text className="text-gray-400 text-sm">•</Text>
                        <Text className="text-gray-500 text-sm font-medium">{formattedDate}</Text>
                    </View>
                </View>

                <View className="h-px bg-gray-200 mx-5 my-6" />

                {/* Customer & Vehicle Cards */}
                <View className="px-5 gap-4">
                    {/* Customer Card */}
                    <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <View className="flex-row items-center gap-3 mb-4">
                            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center">
                                <User size={20} color="#2563EB" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide">Billed To</Text>
                                <Text className="text-base font-bold text-gray-900 mt-0.5">{customerName}</Text>
                            </View>
                        </View>

                        <View className="bg-gray-50 rounded-xl p-3 gap-2">
                            <View className="flex-row items-start gap-3">
                                <View className="mt-0.5"><Phone size={14} color="#6B7280" /></View>
                                <Text className="text-sm text-gray-600 font-medium flex-1">+91 {invoice.customer?.phone || '98765 43210'}</Text>
                            </View>
                            {invoice.customer?.email && (
                                <View className="flex-row items-start gap-3">
                                    <View className="mt-0.5"><Mail size={14} color="#6B7280" /></View>
                                    <Text className="text-sm text-gray-600 font-medium flex-1">{invoice.customer.email}</Text>
                                </View>
                            )}
                            <View className="flex-row items-start gap-3">
                                <View className="mt-0.5"><MapPin size={14} color="#6B7280" /></View>
                                <Text className="text-sm text-gray-600 font-medium flex-1 leading-5">{invoice.customer?.address || 'Mumbai, India'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Vehicle Card */}
                    {invoice.vehicle && (
                        <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                            <View className="flex-row items-center gap-3 mb-4">
                                <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center">
                                    <Car size={20} color="#F97316" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-xs font-bold text-gray-400 uppercase tracking-wide">Vehicle Details</Text>
                                    <Text className="text-base font-bold text-gray-900 mt-0.5">{vehicleInfo}</Text>
                                </View>
                            </View>

                            <View className="flex-row gap-3">
                                <View className="flex-1 bg-gray-50 p-2.5 rounded-xl items-center border border-gray-100">
                                    <Text className="text-xs text-gray-400 font-medium mb-0.5">License Plate</Text>
                                    <Text className="text-sm font-bold text-gray-800">{invoice.vehicle.license_plate || 'N/A'}</Text>
                                </View>
                                <View className="flex-1 bg-gray-50 p-2.5 rounded-xl items-center border border-gray-100">
                                    <Text className="text-xs text-gray-400 font-medium mb-0.5">Job Card ID</Text>
                                    <Text className="text-sm font-bold text-gray-800">{invoice.job_card_id || 'JC-001'}</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Line Items Table */}
                <View className="mt-8 px-5">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Services & Parts</Text>
                    <View className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Header */}
                        <View className="flex-row bg-gray-50 px-4 py-3 border-b border-gray-100">
                            <Text className="flex-[2] text-xs font-bold text-gray-400 uppercase">Item Description</Text>
                            <Text className="flex-1 text-center text-xs font-bold text-gray-400 uppercase">Qty</Text>
                            <Text className="flex-1 text-right text-xs font-bold text-gray-400 uppercase">Price</Text>
                        </View>

                        {/* Items */}
                        {billingItems.map((item, index) => (
                            <View key={index} className="flex-row px-4 py-3.5 border-b border-gray-50 last:border-0 items-center">
                                <Text className="flex-[2] text-sm font-medium text-gray-700 leading-5">{item.name}</Text>
                                <Text className="flex-1 text-center text-sm font-semibold text-gray-600">{item.qty}</Text>
                                <Text className="flex-1 text-right text-sm font-bold text-gray-900">₹{item.price}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Summary Breakdown */}
                <View className="mx-5 mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500 font-medium">Subtotal</Text>
                        <Text className="text-gray-900 font-bold">₹{subtotal.toLocaleString('en-IN')}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500 font-medium">Tax (18%)</Text>
                        <Text className="text-gray-900 font-bold">₹{taxAmount.toLocaleString('en-IN')}</Text>
                    </View>
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-500 font-medium">Discount</Text>
                        <Text className="text-green-600 font-bold">- ₹0</Text>
                    </View>

                    <View className="h-px bg-gray-100 mb-4" />

                    <View className="flex-row justify-between items-center">
                        <Text className="text-lg font-extrabold text-gray-900">Grand Total</Text>
                        <Text className="text-2xl font-extrabold text-blue-600">₹{grandTotal.toLocaleString('en-IN')}</Text>
                    </View>
                </View>

                {/* Notes Section - Optional */}
                <View className="mx-5 mt-6 mb-8 bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <Text className="text-xs font-bold text-yellow-700 uppercase mb-1">Payment Note</Text>
                    <Text className="text-sm text-yellow-800 leading-5">
                        Please ensure payment is made within 15 days of the invoice date. Thank you for your business!
                    </Text>
                </View>

            </ScrollView>

            {/* Bottom Action Footer */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-3 pb-8 flex-row gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <TouchableOpacity
                    className="flex-1 bg-white border border-gray-200 py-3.5 rounded-xl items-center flex-row justify-center gap-2 active:bg-gray-50"
                    onPress={() => Alert.alert('Coming Soon', 'PDF generation will be available soon.')}
                >
                    <Printer size={18} color="#374151" strokeWidth={2.5} />
                    <Text className="text-gray-700 font-bold">Print / PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-1 py-3.5 rounded-xl items-center flex-row justify-center gap-2 active:opacity-90"
                    style={{ backgroundColor: '#2563EB' }}
                >
                    <Share2 size={18} color="white" strokeWidth={2.5} />
                    <Text className="text-white font-bold">Send Invoice</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}