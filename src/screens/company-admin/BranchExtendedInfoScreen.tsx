import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Branch } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

export default function BranchExtendedInfoScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { branch } = route.params as { branch: Branch };
    const { theme, toggleTheme, themeName } = useTheme();
    const { user } = useAuth();

    // Mock data matching the image
    const stats = [
        { title: 'Jobs Today', value: '22' },
        { title: 'Jobs in Progress', value: '10' },
        { title: 'Pending Payment', value: '22' },
        { title: 'Revenue Week', value: '25,000' },
        { title: 'Revenue Month', value: '2,50,000' },
        { title: 'Revenue Year', value: '25,00,000' },
    ];

    const inventory = [
        { name: 'OIL', status: '12 Units remaining', color: themeName === 'dark' ? '#9CA3AF' : '#6B7280' },
        { name: 'Tyre Stock', status: 'Out of Stock', color: '#EF4444' },
        { name: 'Brake Fluid', status: '3 Units remaining', color: themeName === 'dark' ? '#9CA3AF' : '#6B7280' },
        { name: 'Coolant', status: '16 Units remaining', color: themeName === 'dark' ? '#9CA3AF' : '#6B7280' },
    ];

    const staff = [
        { role: 'Branch Manager', count: 1 },
        { role: 'Supervisor', count: 4 },
        { role: 'Technician Manager', count: 10 },
        { role: 'Technician', count: 40 },
    ];

    const vehiclesStatus = [
        { status: 'Check In', count: 12 },
        { status: 'In Progress', count: 10 },
        { status: 'On Hold', count: 10 },
        { status: 'Ready To Deliver', count: 12 },
        { status: 'Delivered', count: 18 },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: themeName === 'dark' ? '#272727' : '#F9FAFB' }}>
            {/* Custom Header */}
            <View style={{
                backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                paddingHorizontal: 20,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomWidth: 1,
                borderBottomColor: themeName === 'dark' ? '#444444' : '#E5E7EB',
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={themeName === 'dark' ? '#F9FAFB' : '#111827'} />
                </TouchableOpacity>
                <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                }}>
                    Branch Information
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        onPress={toggleTheme}
                        style={{
                            backgroundColor: themeName === 'dark' ? '#60A5FA' : '#DBEAFE',
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons
                            name={themeName === 'dark' ? 'sunny' : 'moon'}
                            size={20}
                            color={themeName === 'dark' ? '#1E3A8A' : '#1E40AF'}
                        />
                    </TouchableOpacity>
                    <View style={{
                        backgroundColor: themeName === 'dark' ? '#FCA5A5' : '#FECACA',
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: themeName === 'dark' ? '#7F1D1D' : '#991B1B',
                        }}>
                            {user?.profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 80 }}>

                {/* Stats Grid */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 }}>
                    {stats.map((stat, index) => (
                        <View key={index} style={{
                            width: '48%',
                            backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                            borderRadius: 20,
                            padding: 16,
                            marginBottom: 12,
                            borderWidth: 1,
                            borderColor: themeName === 'dark' ? '#444444' : '#E5E7EB',
                        }}>
                            <Text style={{
                                color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                                fontSize: 12,
                                fontWeight: 'bold',
                                marginBottom: 8,
                            }}>{stat.title}</Text>
                            <Text style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                            }}>{stat.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Inventory Status */}
                <View style={{
                    backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                    borderRadius: 20,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: themeName === 'dark' ? '#444444' : '#E5E7EB',
                    marginBottom: 16,
                    height: 256,
                    justifyContent: 'space-between',
                }}>
                    <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <Ionicons name="cube-outline" size={24} color={themeName === 'dark' ? '#F9FAFB' : '#000'} />
                            <Text style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                                marginLeft: 8,
                            }}>Inventory Status</Text>
                        </View>

                        <View style={{ gap: 12 }}>
                            {inventory.map((item, index) => (
                                <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{
                                        color: themeName === 'dark' ? '#9CA3AF' : '#6B7280',
                                        fontWeight: '500',
                                    }}>{item.name}</Text>
                                    <Text style={{ fontSize: 14, color: item.color }}>{item.status}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity style={{
                        width: '100%',
                        paddingVertical: 10,
                        backgroundColor: themeName === 'dark' ? '#272727' : '#FFFFFF',
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: themeName === 'dark' ? '#444444' : '#D1D5DB',
                        alignItems: 'center',
                    }}>
                        <Text style={{
                            color: themeName === 'dark' ? '#9CA3AF' : '#6B7280',
                            fontWeight: '500',
                            fontSize: 14,
                        }}>Open Branch Inventory</Text>
                    </TouchableOpacity>
                </View>

                {/* Staff and Vehicles Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                    {/* Staff */}
                    <View style={{
                        width: '48%',
                        backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                        borderRadius: 20,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: themeName === 'dark' ? '#444444' : '#E5E7EB',
                    }}>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                            marginBottom: 16,
                        }}>Staff</Text>
                        <View style={{ gap: 12 }}>
                            {staff.map((s, i) => (
                                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{
                                        color: themeName === 'dark' ? '#9CA3AF' : '#6B7280',
                                        fontSize: 11,
                                        flex: 1,
                                        marginRight: 4,
                                    }} numberOfLines={1}>{s.role}</Text>
                                    <Text style={{
                                        color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                                        fontWeight: 'bold',
                                        fontSize: 14,
                                    }}>{s.count}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Vehicles Status */}
                    <View style={{
                        width: '48%',
                        backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                        borderRadius: 20,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: themeName === 'dark' ? '#444444' : '#E5E7EB',
                    }}>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                            marginBottom: 16,
                        }}>Vehicles Status</Text>
                        <View style={{ gap: 12 }}>
                            {vehiclesStatus.map((v, i) => (
                                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{
                                        color: themeName === 'dark' ? '#9CA3AF' : '#6B7280',
                                        fontSize: 11,
                                        flex: 1,
                                        marginRight: 4,
                                    }}>{v.status}</Text>
                                    <Text style={{
                                        color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                                        fontWeight: 'bold',
                                        fontSize: 14,
                                    }}>{v.count}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                </View>
                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
}
