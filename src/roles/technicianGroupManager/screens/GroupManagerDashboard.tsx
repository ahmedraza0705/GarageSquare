
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GroupManagerDashboard() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Group Manager Dashboard</Text>
            <Text style={styles.subtitle}>Welcome, Group Manager</Text>
            {/* Placeholder for future widgets */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#64748b',
    },
});
