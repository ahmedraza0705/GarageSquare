
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AssignJobScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Assign Job</Text>
            <Text>Interface to assign jobs to technicians.</Text>
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
