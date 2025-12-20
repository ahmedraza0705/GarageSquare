import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CompanyService } from '@/services/company.service';
import { Company } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function ShopTimingScreen() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [company, setCompany] = useState<Company | null>(null);

    // Time states
    const [openingTime, setOpeningTime] = useState(new Date());
    const [closingTime, setClosingTime] = useState(new Date());

    // Time picker visibility
    const [showOpeningPicker, setShowOpeningPicker] = useState(false);
    const [showClosingPicker, setShowClosingPicker] = useState(false);

    useEffect(() => {
        loadShopTiming();
    }, []);

    const loadShopTiming = async () => {
        try {
            setLoading(true);

            const defaultCompany = await CompanyService.getDefaultCompany();

            if (defaultCompany) {
                setCompany(defaultCompany);

                const opening = parseTimeString(defaultCompany.shop_opening_time);
                const closing = parseTimeString(defaultCompany.shop_closing_time);

                setOpeningTime(opening);
                setClosingTime(closing);
            }
        } catch (error: any) {
            console.error('Error loading shop timing:', error);
            Alert.alert('Error', 'Failed to load shop timing settings');
        } finally {
            setLoading(false);
        }
    };

    const parseTimeString = (timeStr: string): Date => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    };

    const formatTimeForDB = (date: Date): string => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}:00`;
    };

    const formatTimeForDisplay = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const handleSave = async () => {
        if (!company) {
            Alert.alert('Error', 'No company found');
            return;
        }

        if (closingTime <= openingTime) {
            Alert.alert('Invalid Time', 'Closing time must be after opening time');
            return;
        }

        try {
            setSaving(true);

            const openingTimeStr = formatTimeForDB(openingTime);
            const closingTimeStr = formatTimeForDB(closingTime);

            await CompanyService.updateShopTiming(
                company.id,
                openingTimeStr,
                closingTimeStr
            );

            Alert.alert(
                'Success',
                'Shop timing has been updated successfully',
                [{ text: 'OK', onPress: loadShopTiming }]
            );
        } catch (error: any) {
            console.error('Error saving shop timing:', error);
            Alert.alert('Error', error.message || 'Failed to update shop timing');
        } finally {
            setSaving(false);
        }
    };

    const onOpeningTimeChange = (event: any, selectedDate?: Date) => {
        setShowOpeningPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setOpeningTime(selectedDate);
        }
    };

    const onClosingTimeChange = (event: any, selectedDate?: Date) => {
        setShowClosingPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setClosingTime(selectedDate);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading shop timing...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Ionicons name="time-outline" size={48} color="#007AFF" />
                <Text style={styles.title}>Shop Timing Configuration</Text>
                <Text style={styles.subtitle}>
                    Set your shop's daily working hours. Employees can only log in during these times.
                </Text>
            </View>

            <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={24} color="#FF9500" />
                <Text style={styles.infoText}>
                    Company Admins can log in at any time, regardless of shop hours.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Working Hours</Text>

                <View style={styles.timeRow}>
                    <View style={styles.timeLabel}>
                        <Ionicons name="sunny-outline" size={24} color="#34C759" />
                        <Text style={styles.timeLabelText}>Opening Time</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => setShowOpeningPicker(true)}
                    >
                        <Text style={styles.timeButtonText}>{formatTimeForDisplay(openingTime)}</Text>
                        <Ionicons name="chevron-down" size={20} color="#007AFF" />
                    </TouchableOpacity>
                </View>

                {showOpeningPicker && (
                    <DateTimePicker
                        value={openingTime}
                        mode="time"
                        is24Hour={false}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onOpeningTimeChange}
                    />
                )}

                <View style={styles.timeRow}>
                    <View style={styles.timeLabel}>
                        <Ionicons name="moon-outline" size={24} color="#5856D6" />
                        <Text style={styles.timeLabelText}>Closing Time</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.timeButton}
                        onPress={() => setShowClosingPicker(true)}
                    >
                        <Text style={styles.timeButtonText}>{formatTimeForDisplay(closingTime)}</Text>
                        <Ionicons name="chevron-down" size={20} color="#007AFF" />
                    </TouchableOpacity>
                </View>

                {showClosingPicker && (
                    <DateTimePicker
                        value={closingTime}
                        mode="time"
                        is24Hour={false}
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onClosingTimeChange}
                    />
                )}
            </View>

            <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>Current Shop Hours</Text>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Opens at:</Text>
                    <Text style={styles.statusValue}>{formatTimeForDisplay(openingTime)}</Text>
                </View>
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Closes at:</Text>
                    <Text style={styles.statusValue}>{formatTimeForDisplay(closingTime)}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#FFFFFF" />
                ) : (
                    <>
                        <Ionicons name="save-outline" size={24} color="#FFFFFF" />
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </>
                )}
            </TouchableOpacity>

            <View style={styles.helpCard}>
                <Ionicons name="help-circle-outline" size={20} color="#8E8E93" />
                <Text style={styles.helpText}>
                    These hours apply to all employees except Company Admins. Changes take effect immediately.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#8E8E93',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000000',
        marginTop: 12,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#8E8E93',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#FFF3CD',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#856404',
        lineHeight: 20,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 20,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    timeLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeLabelText: {
        fontSize: 16,
        color: '#000000',
        marginLeft: 12,
        fontWeight: '500',
    },
    timeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    timeButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
        marginRight: 8,
    },
    statusCard: {
        backgroundColor: '#E8F5E9',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E7D32',
        marginBottom: 12,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    statusLabel: {
        fontSize: 16,
        color: '#4CAF50',
    },
    statusValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E7D32',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    saveButtonDisabled: {
        backgroundColor: '#C7C7CC',
        shadowOpacity: 0,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    helpCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    helpText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 20,
    },
});
