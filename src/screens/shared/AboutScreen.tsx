
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export default function AboutScreen() {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={[styles.title, { color: theme.text }]}>About us</Text>
                    <Text style={[styles.description, { color: theme.textMuted }]}>
                        GarageSquares is dedicated to providing organization solutions for various spaces.
                        We believe in maximizing the use of every square foot and transforming spaces into
                        Functional and efficient areas.
                    </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.section}>
                    <Text style={[styles.title, { color: theme.text }]}>Our goal</Text>
                    <Text style={[styles.description, { color: theme.textMuted }]}>
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
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'justify',
    },
    divider: {
        height: 1,
        marginVertical: 24,
        width: '100%',
    },
});
