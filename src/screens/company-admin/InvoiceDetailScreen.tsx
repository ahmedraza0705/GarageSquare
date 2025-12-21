// ============================================
// INVOICE DETAIL SCREEN (Company Admin)
// Modern 2025 UI Design
// ============================================

import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, Download } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type InvoiceDetailRouteParams = {
    invoice: {
        id: string;
        customerName: string;
        customerInitials: string;
        location: string;
        jobNumber: string;
        amount: number;
        invoiceNumber: string;
        date: string;
        avatarColor: string;
    };
};

type RouteParams = RouteProp<{ InvoiceDetail: InvoiceDetailRouteParams }, 'InvoiceDetail'>;

export default function InvoiceDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute<RouteParams>();
    const { invoice } = route.params;

    // Generate invoice number from estimate number
    const invoiceNumber = invoice.invoiceNumber.replace('EST', 'INV');

    // Sample billing items
    const billingItems = [
        { name: 'Engine Oil', price: 7200 },
        { name: 'Brake Pads', price: 3000 },
        { name: 'Labour', price: 3000 },
    ];

    const subtotal = billingItems.reduce((sum, item) => sum + item.price, 0);
    const cgst = Math.round(subtotal * 0.05); // 5% CGST
    const sgst = Math.round(subtotal * 0.05); // 5% SGST
    const grandTotal = subtotal + cgst + sgst;

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Invoice ${invoiceNumber} - ₹${grandTotal.toLocaleString('en-IN')}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDownload = () => {
        // TODO: Implement PDF download functionality
        console.log('Download invoice');
    };

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: '#F8F9FA' }}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View
                className="px-4 py-3 bg-white flex-row items-center justify-between"
                style={{
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                }}
            >
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mr-3"
                    >
                        <ArrowLeft size={24} color="#1F2937" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold" style={{ color: '#1F2937' }}>
                        {invoiceNumber}
                    </Text>
                </View>
                <View className="flex-row gap-3">
                    <TouchableOpacity onPress={handleShare}>
                        <Share2 size={22} color="#1F2937" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDownload}>
                        <Download size={22} color="#1F2937" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                {/* Customer Info Card */}
                <View
                    className="mb-4 rounded-2xl overflow-hidden p-4"
                    style={{
                        backgroundColor: '#FFFFFF',
                        elevation: 2,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                    }}
                >
                    <View className="flex-row items-center">
                        <View
                            className="w-14 h-14 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: invoice.avatarColor }}
                        >
                            <Text className="text-white font-bold text-lg">
                                {invoice.customerInitials}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold mb-1" style={{ color: '#1F2937' }}>
                                {invoice.customerName}
                            </Text>
                            <View className="flex-row justify-between">
                                <View>
                                    <Text className="text-xs mb-0.5" style={{ color: '#757575' }}>
                                        Phone :
                                    </Text>
                                    <Text className="text-xs font-semibold" style={{ color: '#1F2937' }}>
                                        Email
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-xs mb-0.5" style={{ color: '#757575' }}>
                                        +91 9033786017
                                    </Text>
                                    <Text className="text-xs" style={{ color: '#757575' }}>
                                        funky@gmail.com
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Vehicle Info Card */}
                <View
                    className="mb-4 rounded-2xl overflow-hidden p-4"
                    style={{
                        backgroundColor: '#FFFFFF',
                        elevation: 2,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                    }}
                >
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-xl font-bold" style={{ color: '#1F2937' }}>
                            {invoice.location}
                        </Text>
                        <Text className="text-sm" style={{ color: '#757575' }}>
                            {invoice.jobNumber}
                        </Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-sm font-semibold" style={{ color: '#1F2937' }}>
                            Fuel Type
                        </Text>
                        <Text className="text-sm" style={{ color: '#757575' }}>
                            Petrol
                        </Text>
                    </View>
                </View>

                {/* Billing Summary Card */}
                <View
                    className="mb-4 rounded-2xl overflow-hidden p-4"
                    style={{
                        backgroundColor: '#FFFFFF',
                        elevation: 2,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                    }}
                >
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-bold" style={{ color: '#1F2937' }}>
                            Billing Summary
                        </Text>
                        <Text className="text-sm" style={{ color: '#9E9E9E' }}>
                            SubTotal
                        </Text>
                    </View>

                    {/* Billing Items */}
                    {billingItems.map((item, index) => (
                        <View key={index} className="flex-row justify-between mb-3">
                            <Text className="text-base" style={{ color: '#1F2937' }}>
                                {item.name}
                            </Text>
                            <Text className="text-base font-semibold" style={{ color: '#1F2937' }}>
                                ₹ {item.price.toLocaleString('en-IN')}
                            </Text>
                        </View>
                    ))}

                    {/* Subtotal */}
                    <View
                        className="flex-row justify-between py-3 mb-3"
                        style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB' }}
                    >
                        <Text className="text-base font-bold" style={{ color: '#1F2937' }}>
                            Total
                        </Text>
                        <Text className="text-base font-bold" style={{ color: '#1F2937' }}>
                            ₹ {subtotal.toLocaleString('en-IN')}
                        </Text>
                    </View>

                    {/* Warning Message */}
                    <View className="mb-3 py-2 px-3 rounded-lg" style={{ backgroundColor: '#FFF3E0' }}>
                        <Text className="text-xs text-center" style={{ color: '#E65100' }}>
                            This invoice cannot be edited after finalization
                        </Text>
                    </View>

                    {/* Tax Details */}
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-base font-semibold" style={{ color: '#1F2937' }}>
                            CGST
                        </Text>
                        <Text className="text-base" style={{ color: '#757575' }}>
                            ₹ {cgst.toLocaleString('en-IN')}
                        </Text>
                    </View>
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-base font-semibold" style={{ color: '#1F2937' }}>
                            SGST
                        </Text>
                        <Text className="text-base" style={{ color: '#757575' }}>
                            ₹ {sgst.toLocaleString('en-IN')}
                        </Text>
                    </View>

                    {/* Grand Total */}
                    <View
                        className="flex-row justify-between pt-3"
                        style={{ borderTopWidth: 1, borderTopColor: '#E5E7EB' }}
                    >
                        <Text className="text-lg font-bold" style={{ color: '#1F2937' }}>
                            Grand Total
                        </Text>
                        <Text className="text-lg font-bold" style={{ color: '#1F2937' }}>
                            ₹ {grandTotal.toLocaleString('en-IN')}
                        </Text>
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View className="h-24" />
            </ScrollView>
        </SafeAreaView>
    );
}