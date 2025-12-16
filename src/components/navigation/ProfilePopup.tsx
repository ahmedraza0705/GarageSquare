
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';

type ProfilePopupProps = {
    visible: boolean;
    onClose: () => void;
};

export default function ProfilePopup({ visible, onClose }: ProfilePopupProps) {
    const navigation = useNavigation();
    const { theme, toggleTheme, themeName } = useTheme();
    const { user } = useAuth();

    const handleNavigate = (screen: string) => {
        onClose();
        navigation.navigate(screen as never);
    };

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    {/* Position the popup relative to where the profile icon usually is */}
                    <TouchableWithoutFeedback>
                        <View style={styles.popupContainer}>
                            {/* Header Section */}
                            <View style={styles.header}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {user?.profile?.full_name?.[0]?.toUpperCase() || 'A'}
                                        {user?.profile?.full_name?.split(' ')?.[1]?.[0]?.toUpperCase() || 'R'}
                                    </Text>
                                </View>
                                <View style={styles.userInfo}>
                                    <Text style={styles.userName}>{user?.profile?.full_name || 'Ahmed Raza'}</Text>
                                    <Text style={styles.userBranch}>Branch Name: Surat</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* Menu Options */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => handleNavigate('AccountDetails')}
                            >
                                <Text style={styles.menuIcon}>👤</Text>
                                <Text style={styles.menuText}>Account Details</Text>
                            </TouchableOpacity>

                            <View style={styles.menuDivider} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => handleNavigate('ChangePassword')}
                            >
                                <Text style={styles.menuIcon}>🔒</Text>
                                <Text style={styles.menuText}>Change Password</Text>
                            </TouchableOpacity>

                            <View style={styles.menuDivider} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={toggleTheme}
                            >
                                <Text style={styles.menuIcon}>{themeName === 'dark' ? '☀️' : '🌙'}</Text>
                                <Text style={styles.menuText}>Mode</Text>
                            </TouchableOpacity>

                            <View style={styles.menuDivider} />

                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => handleNavigate('Settings')}
                            >
                                <Text style={styles.menuIcon}>⚙️</Text>
                                <Text style={styles.menuText}>Settings</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)', // Slight dim
    },
    popupContainer: {
        position: 'absolute',
        top: 60, // Adjust based on header height
        right: 16,
        width: 280,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fca5a5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#7f1d1d',
        fontWeight: 'bold',
        fontSize: 14,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    userBranch: {
        fontSize: 12,
        color: '#6b7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginBottom: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    menuIcon: {
        fontSize: 18,
        marginRight: 12,
        width: 24,
        textAlign: 'center',
    },
    menuText: {
        fontSize: 15,
        color: '#1f2937',
        fontWeight: '500',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginLeft: 36, // Indent to align with text
    }
});
