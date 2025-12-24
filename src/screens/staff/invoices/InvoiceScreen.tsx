import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function InvoiceScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Invoices</Text>
            <Text style={styles.subtitle}>Invoice management coming soon</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 8,
    },
});
