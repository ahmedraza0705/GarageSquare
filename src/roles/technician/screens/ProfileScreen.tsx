
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
    const { signOut, user } = useAuth();
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{user?.profile?.full_name || 'N/A'}</Text>

                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{user?.email || 'N/A'}</Text>

                <Text style={styles.label}>Role:</Text>
                <Text style={styles.value}>{String(user?.profile?.role || 'Technician')}</Text>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#0f172a',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#64748b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 16,
    },
    logoutButton: {
        backgroundColor: '#ef4444',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
