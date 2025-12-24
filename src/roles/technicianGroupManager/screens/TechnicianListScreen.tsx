
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TechnicianListScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Technicians List</Text>
            <Text>List of technicians under your group will appear here.</Text>
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
        marginBottom: 16,
        color: '#0f172a',
    },
});
