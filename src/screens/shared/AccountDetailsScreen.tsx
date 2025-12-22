
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth.service';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function AccountDetailsScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { theme, themeName } = useTheme();
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
        // Use formData if available (editing), otherwise fallback to user object directly
        const nameSource = formData.firstName || user?.profile?.full_name || user?.email || '';
        const firstChar = nameSource.trim().charAt(0);
        return firstChar.toUpperCase() || 'A';
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Profile Avatar Section */}
                <View style={styles.avatarContainer}>
                    <View style={[
                        styles.avatar,
                        {
                            backgroundColor: themeName === 'dark' ? '#C37125' : '#4682B4',
                            opacity: 0.8
                        }
                    ]}>
                        <Text style={[styles.avatarText, { color: '#fff' }]}>{getInitials()}</Text>
                    </View>
                    {isEditing && (
                        <TouchableOpacity style={[styles.editIconContainer, { backgroundColor: theme.surface }]}>
                            <Ionicons name="pencil" size={16} color={themeName === 'dark' ? '#C37125' : '#4682B4'} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Form Card */}
                <View style={[styles.card, { backgroundColor: theme.surface }]}>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>First Name</Text>
                        <TextInput
                            style={[
                                styles.input,
                                { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
                                !isEditing && { color: theme.textMuted }
                            ]}
                            value={formData.firstName}
                            onChangeText={(t) => handleChange('firstName', t)}
                            placeholder="Enter Your First Name"
                            placeholderTextColor={theme.textMuted}
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Last Name</Text>
                        <TextInput
                            style={[
                                styles.input,
                                { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
                                !isEditing && { color: theme.textMuted }
                            ]}
                            value={formData.lastName}
                            onChangeText={(t) => handleChange('lastName', t)}
                            placeholder="Enter Your Last Name"
                            placeholderTextColor={theme.textMuted}
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Gmail</Text>
                        <TextInput
                            style={[
                                styles.input,
                                styles.disabledInput,
                                { color: theme.textMuted, backgroundColor: theme.disabledBg || theme.background, borderColor: theme.border }
                            ]}
                            value={formData.email}
                            onChangeText={(t) => handleChange('email', t)}
                            placeholder="Enter Your Gmail"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Phone No:</Text>
                        <TextInput
                            style={[
                                styles.input,
                                { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
                                !isEditing && { color: theme.textMuted }
                            ]}
                            value={formData.phone}
                            onChangeText={(t) => handleChange('phone', t)}
                            placeholder="Enter Your Phone no."
                            placeholderTextColor={theme.textMuted}
                            keyboardType="phone-pad"
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Address</Text>
                        <TextInput
                            style={[
                                styles.input,
                                styles.textArea,
                                { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
                                !isEditing && { color: theme.textMuted }
                            ]}
                            value={formData.address}
                            onChangeText={(t) => handleChange('address', t)}
                            placeholder="Enter Your Address"
                            placeholderTextColor={theme.textMuted}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Pin Code:</Text>
                        <TextInput
                            style={[
                                styles.input,
                                { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
                                !isEditing && { color: theme.textMuted }
                            ]}
                            value={formData.pinCode}
                            onChangeText={(t) => handleChange('pinCode', t)}
                            placeholder="Enter Your Pin-Code"
                            placeholderTextColor={theme.textMuted}
                            keyboardType="numeric"
                            editable={isEditing}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={[styles.label, { color: theme.text }]}>City</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
                                    !isEditing && { color: theme.textMuted }
                                ]}
                                value={formData.city}
                                onChangeText={(t) => handleChange('city', t)}
                                placeholder="Enter Your City"
                                placeholderTextColor={theme.textMuted}
                                editable={isEditing}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                            <Text style={[styles.label, { color: theme.text }]}>State</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    { color: theme.text, backgroundColor: theme.background, borderColor: theme.border },
                                    !isEditing && { color: theme.textMuted }
                                ]}
                                value={formData.state}
                                onChangeText={(t) => handleChange('state', t)}
                                placeholder="Enter Your State"
                                placeholderTextColor={theme.textMuted}
                                editable={isEditing}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            !isEditing && { backgroundColor: theme.primary }, // Default 'Edit' color from theme
                            isLoading && styles.disabledButton
                        ]}
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
                            <Text style={[styles.cancelButtonText, { color: theme.notification }]}>Cancel</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    editIconContainer: {
        position: 'absolute',
        top: -4,
        right: -4,
        borderRadius: 12,
        padding: 4,
    },
    editIcon: {
        fontSize: 16,
    },
    card: {
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
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    disabledInput: {
        // Additional disabled styling if needed
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
        fontSize: 14,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    }
});
