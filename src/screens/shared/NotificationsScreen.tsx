
import React, { useState } from 'react';
import { View, Text, Switch, ScrollView, StyleSheet } from 'react-native';

export default function NotificationsScreen() {
    const [allowNotifications, setAllowNotifications] = useState(true);

    const [toggles, setToggles] = useState<Record<string, boolean>>({
        'New Job Created': true,
        'Job Assigned': true,
        'Job Completed': true,
        'Payment Received': true,
        'Invoice Sent': true,
        'Estimate Accepted': true,
        'Low Inventory': false,
        'Staff Activity': false,
        'Customer Arrived': true,
        'Enable Push Notification': true,
    });

    const notificationItems = Object.keys(toggles);

    const toggleSwitch = (key: string) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <View style={[styles.container, { backgroundColor: '#f3f4f6' }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.headerRow}>
                        <Text style={styles.headerLabel}>Allow Notifications</Text>
                        <Switch
                            value={allowNotifications}
                            onValueChange={setAllowNotifications}
                            trackColor={{ false: '#767577', true: '#22c55e' }}
                            thumbColor={'#f4f3f4'}
                        />
                    </View>

                    {notificationItems.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <Text style={styles.itemText}>{item}</Text>
                            <Switch
                                value={toggles[item]}
                                onValueChange={() => toggleSwitch(item)}
                                disabled={!allowNotifications}
                                trackColor={{ false: '#767577', true: '#22c55e' }}
                                thumbColor={'#f4f3f4'}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                        </View>
                    ))}
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
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    itemText: {
        fontSize: 15,
        color: '#1f2937',
    },
});
