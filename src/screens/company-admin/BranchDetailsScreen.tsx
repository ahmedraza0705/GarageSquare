import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Branch } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

export default function BranchDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { branch, onDelete } = route.params as { branch: Branch, onDelete?: (id: string) => void };
    const { theme, toggleTheme, themeName } = useTheme();
    const { user } = useAuth();

    // Mock data for display since these fields aren't in the Branch type yet
    const operatingHours = [
        { day: 'Monday', time: '9:30 - 6:00' },
        { day: 'Tuesday', time: '9:30 - 6:00' },
        { day: 'Wednesday', time: '9:30 - 6:00' },
        { day: 'Thursday', time: '9:30 - 6:00' },
        { day: 'Friday', time: '9:30 - 6:00' },
        { day: 'Saturday', time: '9:30 - 6:00' },
        { day: 'Sunday', time: 'Closed' },
    ];

    const alerts = [
        'Inventory shortage',
        'Employee Shortage',
        'Less revenue'
    ];

    const handleCall = () => {
        if (branch.phone) Linking.openURL(`tel:${branch.phone}`);
    };

    const handleEmail = () => {
        if (branch.email) Linking.openURL(`mailto:${branch.email}`);
    };

    const handleDelete = () => {
        Alert.alert('Delete Branch', 'Are you sure you want to delete this branch?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => {
                    if (onDelete) {
                        onDelete(branch.id);
                        navigation.goBack();
                    }
                }
            }
        ]);
    };

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
                    Branch Management
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

            <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>

                {/* Header Card */}
                <View style={{
                    backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                    borderRadius: 20,
                    padding: 24,
                    marginBottom: 16,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: themeName === 'dark' ? '#444444' : '#FED7AA',
                }}>
                    <Text style={{
                        fontSize: 24,
                        fontWeight: 'bold',
                        color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                        marginBottom: 4,
                        textAlign: 'center',
                    }}>{branch.name}</Text>
                    <Text style={{
                        color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                        fontWeight: 'bold',
                        marginBottom: 12,
                        textAlign: 'center',
                        fontSize: 18,
                    }}>Workshop, Vesu</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="location-outline" size={18} color={themeName === 'dark' ? '#9CA3AF' : '#6B7280'} />
                        <Text style={{
                            color: themeName === 'dark' ? '#9CA3AF' : '#6B7280',
                            fontSize: 14,
                            marginLeft: 4,
                            textAlign: 'center',
                        }} numberOfLines={2}>
                            {branch.address || '1234, Main St. Vesu, Surat, Gujarat'} <Text style={{
                                fontWeight: 'bold',
                                textDecorationLine: 'underline',
                                color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                            }}>(MAP)</Text>
                        </Text>
                    </View>
                </View>

                {/* Middle Section: Alerts and Manager */}
                <View style={{ flexDirection: 'row', marginBottom: 16, height: 192 }}>

                    {/* Alerts Card */}
                    <View style={{
                        flex: 0.8,
                        backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                        borderRadius: 20,
                        padding: 16,
                        marginRight: 12,
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        borderColor: themeName === 'dark' ? '#444444' : '#FED7AA',
                    }}>
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                                <Ionicons name="warning-outline" size={20} color={themeName === 'dark' ? '#F9FAFB' : '#000'} />
                                <Text style={{
                                    fontWeight: 'bold',
                                    color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                                    marginLeft: 8,
                                    fontSize: 16,
                                }}>Alerts</Text>
                            </View>
                            <View style={{ gap: 12 }}>
                                {alerts.map((alert, index) => (
                                    <Text key={index} style={{
                                        color: themeName === 'dark' ? '#9CA3AF' : '#6B7280',
                                        fontSize: 12,
                                        fontWeight: '500',
                                    }}>{alert}</Text>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Manager Card */}
                    <View style={{
                        flex: 1,
                        backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                        borderRadius: 20,
                        padding: 16,
                        justifyContent: 'space-between',
                        borderWidth: 1,
                        borderColor: themeName === 'dark' ? '#444444' : '#FED7AA',
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                            <View style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: '#4A72B2',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                            }}>
                                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>
                                    {(branch.manager_id || 'AR').substring(0, 2).toUpperCase()}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                                }} numberOfLines={1}>{branch.manager_id || 'Ahmed Raza'}</Text>
                                <Text style={{
                                    fontSize: 10,
                                    color: themeName === 'dark' ? '#9CA3AF' : '#6B7280',
                                }} numberOfLines={1}>Branch Manager</Text>
                            </View>
                        </View>

                        <View style={{ gap: 8 }}>
                            <TouchableOpacity onPress={handleCall} style={{
                                backgroundColor: '#4A72B2',
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                borderRadius: 12,
                                width: '100%',
                            }}>
                                <Ionicons name="call" size={14} color="white" />
                                <Text style={{
                                    color: '#FFFFFF',
                                    fontSize: 10,
                                    fontWeight: 'bold',
                                    marginLeft: 8,
                                }}>{branch.phone || '+91 96622 80843'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleEmail} style={{
                                backgroundColor: themeName === 'dark' ? '#272727' : '#F3F4F6',
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 12,
                                paddingVertical: 10,
                                borderRadius: 12,
                                width: '100%',
                                borderWidth: 1,
                                borderColor: themeName === 'dark' ? '#444444' : '#E5E7EB',
                            }}>
                                <Ionicons name="mail" size={14} color="#4A72B2" />
                                <Text style={{
                                    color: themeName === 'dark' ? '#9CA3AF' : '#6B7280',
                                    fontSize: 10,
                                    fontWeight: '500',
                                    marginLeft: 8,
                                }} numberOfLines={1}>{branch.email || 'ahmed.raza@gmail.com'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Operating Hours */}
                <View style={{
                    backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: themeName === 'dark' ? '#444444' : '#FED7AA',
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="time-outline" size={22} color={themeName === 'dark' ? '#F9FAFB' : '#000'} />
                        <Text style={{
                            fontSize: 18,
                            fontWeight: 'bold',
                            color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                            marginLeft: 8,
                        }}>Operating Hours</Text>
                    </View>

                    <View style={{ gap: 8 }}>
                        {operatingHours.map((item, index) => (
                            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{
                                    color: themeName === 'dark' ? '#9CA3AF' : '#6B7280',
                                    fontSize: 14,
                                }}>{item.day}</Text>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: item.time === 'Closed' ? '#EF4444' : (themeName === 'dark' ? '#9CA3AF' : '#6B7280'),
                                }}>
                                    {item.time}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer Buttons */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40, gap: 8 }}>
                    <TouchableOpacity onPress={handleDelete} style={{
                        borderWidth: 1,
                        borderColor: '#FECACA',
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                        minWidth: 80,
                        alignItems: 'center',
                    }}>
                        <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Delete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{
                        borderWidth: 1,
                        borderColor: '#BBF7D0',
                        borderRadius: 12,
                        paddingHorizontal: 24,
                        paddingVertical: 12,
                        backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                        minWidth: 80,
                        alignItems: 'center',
                    }}>
                        <Text style={{ color: '#16A34A', fontWeight: 'bold' }}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{
                            flex: 1,
                            backgroundColor: themeName === 'dark' ? '#333333' : '#FFFFFF',
                            borderWidth: 1,
                            borderColor: '#EAC4A0',
                            borderRadius: 12,
                            paddingVertical: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={() => (navigation as any).navigate('BranchExtendedInfo', { branch })}
                    >
                        <Text style={{
                            color: themeName === 'dark' ? '#F9FAFB' : '#111827',
                            fontWeight: 'bold',
                        }}>Branch Information</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}
