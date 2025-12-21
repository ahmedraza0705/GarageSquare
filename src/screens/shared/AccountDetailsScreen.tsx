
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth.service';

export default function AccountDetailsScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Initial state setup
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        pinCode: '',
        city: '',
        state: '',
    });

    useEffect(() => {
        if (user) {
            const profile = user.profile;
            // Split full_name into first and last name
            let first = '';
            let last = '';
            if (profile?.full_name) {
                const parts = profile.full_name.split(' ');
                first = parts[0] || '';
                last = parts.slice(1).join(' ') || '';
            }

            setFormData({
                firstName: first,
                lastName: last,
                email: user.email || '',
                phone: profile?.phone || '',
                address: profile?.address || '',
                pinCode: profile?.postal_code || '',
                city: profile?.city || '',
                state: profile?.state || '',
            });
        }
    }, [user]);

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            // Join first and last name
            const fullName = `${formData.firstName} ${formData.lastName}`.trim();

            const updates = {
                full_name: fullName,
                phone: formData.phone,
                address: formData.address,
                postal_code: formData.pinCode,
                city: formData.city,
                state: formData.state,
                // We'll update updated_at automatically in service or DB
            };

            await AuthService.updateProfile(user.id, updates);

            Alert.alert('Success', 'Profile updated successfully');
            setIsEditing(false);
        } catch (error: any) {
            console.error('Error saving profile:', error);
            Alert.alert('Error', error.message || 'Failed to save profile');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleEdit = () => {
        if (isEditing) {
            handleSave();
        } else {
            setIsEditing(true);
        }
    };

    const getInitials = () => {
        const first = formData.firstName?.[0] || '';
        return first.toUpperCase() || 'A';
    };

    return (
        <View style={[styles.container, { backgroundColor: '#f3f4f6' }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Profile Avatar Section */}
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials()}</Text>
                    </View>
                    {isEditing && (
                        <TouchableOpacity style={styles.editIconContainer}>
                            <Text style={styles.editIcon}>✏️</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Form Card */}
                <View style={styles.card}>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>First Name</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.disabledInput]}
                            value={formData.firstName}
                            onChangeText={(t) => handleChange('firstName', t)}
                            placeholder="Enter Your First Name"
                            placeholderTextColor="#9ca3af"
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Last Name</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.disabledInput]}
                            value={formData.lastName}
                            onChangeText={(t) => handleChange('lastName', t)}
                            placeholder="Enter Your Last Name"
                            placeholderTextColor="#9ca3af"
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gmail</Text>
                        <TextInput
                            style={[styles.input, styles.disabledInput]} // Email always disabled typically
                            value={formData.email}
                            onChangeText={(t) => handleChange('email', t)}
                            placeholder="Enter Your Gmail"
                            placeholderTextColor="#9ca3af"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone No:</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.disabledInput]}
                            value={formData.phone}
                            onChangeText={(t) => handleChange('phone', t)}
                            placeholder="Enter Your Phone no."
                            placeholderTextColor="#9ca3af"
                            keyboardType="phone-pad"
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, !isEditing && styles.disabledInput]}
                            value={formData.address}
                            onChangeText={(t) => handleChange('address', t)}
                            placeholder="Enter Your Address"
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Pin Code:</Text>
                        <TextInput
                            style={[styles.input, !isEditing && styles.disabledInput]}
                            value={formData.pinCode}
                            onChangeText={(t) => handleChange('pinCode', t)}
                            placeholder="Enter Your Pin-Code"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.disabledInput]}
                                value={formData.city}
                                onChangeText={(t) => handleChange('city', t)}
                                placeholder="Enter Your City"
                                placeholderTextColor="#9ca3af"
                                editable={isEditing}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={styles.label}>State</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.disabledInput]}
                                value={formData.state}
                                onChangeText={(t) => handleChange('state', t)}
                                placeholder="Enter Your State"
                                placeholderTextColor="#9ca3af"
                                editable={isEditing}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, !isEditing && styles.editButton, isLoading && styles.disabledButton]}
                        onPress={toggleEdit}
                        disabled={isLoading}
                    >
                        <Text style={styles.saveButtonText}>
                            {isLoading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
                        </Text>
                    </TouchableOpacity>

                    {isEditing && !isLoading && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setIsEditing(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        alignItems: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 20,
        backgroundColor: '#fca5a5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#7f1d1d',
    },
    editIconContainer: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 4,
    },
    editIcon: {
        fontSize: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db', // lighter border for clean look
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: '#1f2937',
        backgroundColor: '#ffffff',
    },
    disabledInput: {
        backgroundColor: '#f9fafb', // Light grey for read-only
        borderColor: 'transparent',
        color: '#4b5563', // Slightly darker text for readability
    },
    textArea: {
        height: 80,
    },
    row: {
        flexDirection: 'row',
    },
    saveButton: {
        backgroundColor: '#22c55e',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    editButton: {
        backgroundColor: '#2563eb', // Blue for Edit
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        marginTop: 12,
        alignItems: 'center',
        padding: 8,
    },
    cancelButtonText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    }
});
