
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleConfirm = () => {
        // In a real app, validation and API call would go here
        setShowSuccessModal(true);
    };

    const handleSuccessOk = () => {
        setShowSuccessModal(false);
        navigation.goBack();
    };

    return (
        <View style={[styles.container, { backgroundColor: '#f3f4f6' }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Old Password</Text>
                        <TextInput
                            style={styles.input}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            placeholder="Enter old Password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Enter new Password</Text>
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Enter new Password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm new Password"
                            placeholderTextColor="#9ca3af"
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowSuccessModal(false)}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>

                        <View style={styles.checkIconContainer}>
                            <Text style={styles.checkIcon}>✓</Text>
                        </View>

                        <Text style={styles.modalTitle}>Password Changed!</Text>
                        <Text style={styles.modalMessage}>
                            Your can now use your new password to login.
                        </Text>

                        <TouchableOpacity
                            style={styles.modalOkButton}
                            onPress={handleSuccessOk}
                        >
                            <Text style={styles.modalOkButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#9ca3af',
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: '#1f2937',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
        borderWidth: 1,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
    },
    cancelButtonText: {
        color: '#ef4444',
        fontWeight: '600',
    },
    confirmButton: {
        borderColor: '#10b981',
        backgroundColor: 'transparent',
    },
    confirmButtonText: {
        color: '#10b981',
        fontWeight: '600',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 16,
    },
    closeButtonText: {
        fontSize: 20,
        color: '#9ca3af',
    },
    checkIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#d1fae5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: '#10b981',
        borderStyle: 'solid', // Simplified for react-native, usually sufficient
    },
    checkIcon: {
        fontSize: 32,
        color: '#10b981',
        fontWeight: 'bold',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    modalMessage: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    modalOkButton: {
        backgroundColor: '#10b981',
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalOkButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
