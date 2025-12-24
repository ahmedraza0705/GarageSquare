import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StatusType = 'pending' | 'in_progress' | 'completed' | 'waiting_approval' | 'rejected' | 'waiting_parts';

interface StatusBadgeProps {
    status: string;
    size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return { bg: '#dcfce7', text: '#166534', label: 'Completed' };
            case 'in_progress':
                return { bg: '#dbeafe', text: '#1e40af', label: 'In Progress' };
            case 'waiting_approval':
            case 'need_approval':
                return { bg: '#ffedd5', text: '#9a3412', label: 'Waiting Approval' };
            case 'waiting_parts':
                return { bg: '#fef9c3', text: '#854d0e', label: 'Waiting Parts' };
            case 'rejected':
                return { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' };
            case 'pending':
            default:
                return { bg: '#f3f4f6', text: '#374151', label: 'Pending' };
        }
    };

    const style = getStatusStyle(status);
    const paddingVertical = size === 'sm' ? 2 : 4;
    const paddingHorizontal = size === 'sm' ? 6 : 12;
    const fontSize = size === 'sm' ? 10 : 12;

    return (
        <View style={[styles.badge, { backgroundColor: style.bg, paddingVertical, paddingHorizontal }]}>
            <Text style={[styles.text, { color: style.text, fontSize }]}>
                {style.label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    text: {
        fontWeight: '600',
        textTransform: 'uppercase',
    },
});
