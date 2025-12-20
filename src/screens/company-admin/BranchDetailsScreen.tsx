import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Alert, Platform, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Branch } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { branchService } from '@/services/branchService';

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

export default function BranchDetailsScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { branch: initialBranch, onDelete } = route.params as { branch: Branch, onDelete?: (id: string) => void };
    const { theme, toggleTheme, themeName } = useTheme();
    const { user } = useAuth();

    const [branch, setBranch] = useState<Branch>(initialBranch);
    const [manager, setManager] = useState<any>(null);
    const [loadingManager, setLoadingManager] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editName, setEditName] = useState(initialBranch.name);
    const [editAddress, setEditAddress] = useState(initialBranch.address || '');
    const [editLocation, setEditLocation] = useState(initialBranch.location || '');

    // Fetch manager details
    useEffect(() => {
        const fetchManager = async () => {
            if (branch.manager_id) {
                setLoadingManager(true);
                const managerData = await branchService.getBranchManager(branch.manager_id);
                setManager(managerData);
                setLoadingManager(false);
            }
        };
        fetchManager();
    }, [branch.manager_id]);

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

    const handleCall = () => {
        const phoneNumber = manager?.phone || branch.phone || '+919662280843';
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleEmail = () => {
        const emailAddress = manager?.email || branch.email || 'ahmed.raza@gmail.com';
        Linking.openURL(`mailto:${emailAddress}`);
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

    const handleSave = async () => {
        if (!editName.trim()) {
            Alert.alert('Error', 'Branch name is required');
            return;
        }


        try {
            setIsSaving(true);
            const updatedBranch = await branchService.updateBranch(branch.id, {
                name: editName,
                address: editAddress,
                location: editLocation
            });
            // Update local location state manually as backend might not return it yet
            setBranch({ ...updatedBranch, location: editLocation });
            setIsEditing(false);
            Alert.alert('Success', 'Branch details updated successfully');
        } catch (error: any) {
            Alert.alert('Error', 'Failed to update branch');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const openEditModal = () => {
        setEditName(branch.name);
        setEditAddress(branch.address || '');
        setEditLocation(branch.location || (branch.address ? branch.address.split(',')[0] : ''));
        setIsEditing(true);
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            {/* Custom Header */}
            <View style={{
                backgroundColor: theme.headerBg,
                paddingHorizontal: 20,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottomColor: theme.headerBorder,
                marginTop: Platform.OS === 'ios' ? 40 : 0
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={28} color={theme.headerText} />
                    </TouchableOpacity>
                    <Text style={{
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: theme.headerText,
                    }}>
                        Branch Management
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        onPress={handleDelete}
                        style={{
                            backgroundColor: '#FEE2E2',
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={openEditModal}
                        style={{
                            backgroundColor: '#D1FAE5',
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons name="add" size={24} color="#059669" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>

                <View style={{
                    backgroundColor: theme.surface,
                    borderRadius: 24,
                    padding: 24,
                    marginBottom: 16,
                    alignItems: 'center',
                }}>
                    <Text style={{
                        fontSize: 28,
                        fontWeight: 'bold',
                        color: theme.text,
                        marginBottom: 4,
                        textAlign: 'center',
                    }}>{branch.name}</Text>
                    <Text style={{
                        color: theme.text,
                        fontWeight: 'bold',
                        marginBottom: 16,
                        textAlign: 'center',
                        fontSize: 18,
                    }}>{branch.address || 'No Address'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="location-outline" size={18} color={theme.textMuted} />
                        <Text style={{
                            color: theme.textMuted,
                            fontSize: 13,
                            marginLeft: 4,
                            textAlign: 'center',
                        }}>
                            {branch.location || 'No Location'} <Text style={{
                                fontWeight: 'bold',
                                textDecorationLine: 'underline',
                                color: theme.text,
                            }}>(MAP)</Text>
                        </Text>
                    </View>
                </View>

                {/* Stats Grid 2x3 */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 }}>
                    {stats.map((stat, index) => (
                        <View key={index} style={{
                            width: '48%',
                            backgroundColor: theme.surface,
                            borderRadius: 16,
                            padding: 12,
                            marginBottom: 12,
                        }}>
                            <Text style={{
                                color: theme.text,
                                fontSize: 11,
                                fontWeight: 'bold',
                                marginBottom: 4,
                            }}>{stat.title}</Text>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                color: theme.text,
                            }}>{stat.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Inventory Status */}
                <View style={{
                    backgroundColor: theme.surface,
                    borderRadius: 20,
                    padding: 16,
                    marginBottom: 16,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Ionicons name="cube-outline" size={24} color={theme.text} />
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: theme.text,
                            marginLeft: 8,
                        }}>Inventory Status</Text>
                    </View>

                    <View style={{ gap: 10, marginBottom: 16 }}>
                        {inventory.map((item, index) => (
                            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{
                                    color: theme.textMuted,
                                    fontWeight: '500',
                                    fontSize: 13
                                }}>{item.name}</Text>
                                <Text style={{ fontSize: 13, color: item.color }}>{item.status}</Text>
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity style={{
                        width: '100%',
                        paddingVertical: 10,
                        backgroundColor: theme.surfaceAlt,
                        borderRadius: 12,
                        alignItems: 'center',
                    }}>
                        <Text style={{
                            color: theme.textMuted,
                            fontWeight: '500',
                            fontSize: 13,
                        }}>Open Branch Inventory</Text>
                    </TouchableOpacity>
                </View>

                {/* Staff and Vehicles Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                    {/* Staff */}
                    <View style={{
                        width: '48%',
                        backgroundColor: theme.surface,
                        borderRadius: 20,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: theme.border,
                    }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: theme.text,
                            marginBottom: 12,
                        }}>Staff</Text>
                        <View style={{ gap: 8 }}>
                            {staff.map((s, i) => (
                                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ color: theme.textMuted, fontSize: 12, flex: 1 }}>{s.role}</Text>
                                    <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13 }}>{s.count}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Vehicles Status */}
                    <View style={{
                        width: '48%',
                        backgroundColor: theme.surface,
                        borderRadius: 20,
                        padding: 16,
                    }}>
                        <Text style={{
                            fontSize: 14,
                            fontWeight: 'bold',
                            color: theme.text,
                            marginBottom: 12,
                        }}>Vehicles Status</Text>
                        <View style={{ gap: 8 }}>
                            {vehiclesStatus.map((v, i) => (
                                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ color: theme.textMuted, fontSize: 10 }}>{v.status}</Text>
                                    <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 12 }}>{v.count}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Alerts and Contacts Column */}
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    {/* Alerts Card */}
                    <View style={{
                        flex: 0.9,
                        backgroundColor: theme.surface,
                        borderRadius: 20,
                        padding: 16,
                        marginRight: 12,
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <Ionicons name="warning-outline" size={20} color={theme.text} />
                            <Text style={{ fontWeight: 'bold', color: theme.text, marginLeft: 8, fontSize: 16 }}>Alerts</Text>
                        </View>
                        <View style={{ gap: 12 }}>
                            {alerts.map((alert, index) => (
                                <Text key={index} style={{ color: theme.textMuted, fontSize: 12, fontWeight: '500' }}>{alert}</Text>
                            ))}
                        </View>
                    </View>

                    {/* Nested Contact Card Container */}
                    <View style={{
                        flex: 1,
                        backgroundColor: '#FFFFFF',
                        borderRadius: 24,
                        padding: 16,
                        gap: 16,
                    }}>
                        {/* Manager Profile */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}>
                            <View style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: '#587eb5',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 12,
                            }}>
                                {loadingManager ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 }}>
                                        {manager?.full_name ? getInitials(manager.full_name) : 'AR'}
                                    </Text>
                                )}
                            </View>
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>
                                    {loadingManager ? 'Loading...' : (manager?.full_name || 'Ahmed Raza')}
                                </Text>
                                <Text style={{ fontSize: 13, color: theme.textMuted }}>Branch Manager</Text>
                            </View>
                        </View>

                        {/* Phone Card */}
                        <TouchableOpacity onPress={handleCall} style={{
                            backgroundColor: '#587eb5',
                            borderRadius: 15,
                            padding: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            height: 50,
                            justifyContent: 'center',
                        }}>
                            <View style={{ marginRight: 10 }}>
                                <Ionicons name="call" size={18} color="white" />
                            </View>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' }}>
                                {loadingManager ? '...' : (manager?.phone || branch.phone || '+91 96622 80843')}
                            </Text>
                        </TouchableOpacity>

                        {/* Email Card */}
                        <TouchableOpacity onPress={handleEmail} style={{
                            backgroundColor: theme.surfaceAlt,
                            borderRadius: 15,
                            padding: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            height: 50,
                            justifyContent: 'center',
                        }}>
                            <View style={{ marginRight: 5 }}>
                                <Ionicons name="mail" size={18} color="#587eb5" />
                            </View>
                            <Text style={{ fontSize: 10, color: theme.textMuted, fontWeight: '600' }} numberOfLines={1}>
                                {loadingManager ? '...' : (manager?.email || branch.email || 'ahmed.raza@gmail.com')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{
                    backgroundColor: theme.surface,
                    borderRadius: 24,
                    padding: 24,
                    marginBottom: 40,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                        <Ionicons name="time-outline" size={24} color={theme.text} />
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text, marginLeft: 10 }}>Operating Hours</Text>
                    </View>

                    <View style={{ gap: 10 }}>
                        {operatingHours.map((item, index) => (
                            <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: theme.textMuted, fontSize: 14 }}>{item.day}</Text>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: item.time === 'Closed' ? '#EF4444' : theme.textMuted,
                                }}>{item.time}</Text>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>

            {/* Edit Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isEditing}
                onRequestClose={() => setIsEditing(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                    <View style={{ backgroundColor: theme.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>Edit Branch Details</Text>
                            <TouchableOpacity onPress={() => setIsEditing(false)}>
                                <Ionicons name="close" size={24} color={theme.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <Text style={{ fontSize: 14, fontWeight: '500', color: theme.textMuted, marginBottom: 6 }}>Branch Name</Text>
                        <TextInput
                            value={editName}
                            onChangeText={setEditName}
                            style={{
                                borderWidth: 1,
                                borderColor: theme.border,
                                borderRadius: 12,
                                padding: 12,
                                marginBottom: 16,
                                fontSize: 16,
                                color: theme.text
                            }}
                            placeholder="Enter branch name"
                            placeholderTextColor={theme.textMuted}
                        />

                        <Text style={{ fontSize: 14, fontWeight: '500', color: theme.textMuted, marginBottom: 6 }}>Full Address</Text>
                        <TextInput
                            value={editAddress}
                            onChangeText={setEditAddress}
                            style={{
                                borderWidth: 1,
                                borderColor: theme.border,
                                borderRadius: 12,
                                padding: 12,
                                marginBottom: 16,
                                fontSize: 16,
                                color: theme.text,
                                height: 60,
                                textAlignVertical: 'top'
                            }}
                            multiline
                            placeholder="Enter full address (e.g. Workshop, Vesu)"
                            placeholderTextColor={theme.textMuted}
                        />

                        <Text style={{ fontSize: 14, fontWeight: '500', color: theme.textMuted, marginBottom: 6 }}>Location (Map Label)</Text>
                        <TextInput
                            value={editLocation}
                            onChangeText={setEditLocation}
                            style={{
                                borderWidth: 1,
                                borderColor: theme.border,
                                borderRadius: 12,
                                padding: 12,
                                marginBottom: 24,
                                fontSize: 16,
                                color: theme.text
                            }}
                            placeholder="Enter map location (e.g. Adajan)"
                            placeholderTextColor={theme.textMuted}
                        />

                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={isSaving}
                            style={{
                                backgroundColor: '#2563EB',
                                borderRadius: 12,
                                paddingVertical: 14,
                                alignItems: 'center',
                                marginBottom: 10
                            }}
                        >
                            {isSaving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
