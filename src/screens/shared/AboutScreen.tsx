
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function AboutScreen() {
    return (
        <View style={[styles.container, { backgroundColor: '#f3f4f6' }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={styles.title}>About us</Text>
                    <Text style={styles.description}>
                        GarageSquares is dedicated to providing organization solutions for various spaces.
                        We believe in maximizing the use of every square foot and transforming spaces into
                        Functional and efficient areas.
                    </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.title}>Our goal</Text>
                    <Text style={styles.description}>
                        Our mission is to offer innovative and high-quality products that help our clients
                        achieve a clutter-free and organized space.
                    </Text>
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
        padding: 24,
    },
    section: {
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#374151',
        textAlign: 'justify',
    },
    divider: {
        height: 1,
        backgroundColor: '#d1d5db',
        marginVertical: 24,
        width: '100%',
    },
});
