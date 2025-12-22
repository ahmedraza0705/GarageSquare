import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';

type ProfilePopupProps = {
    visible: boolean;
    onClose: () => void;
};

export default function ProfilePopup({ visible, onClose }: ProfilePopupProps) {
    const navigation = useNavigation();
    const { themeName, toggleTheme } = useTheme();
    const { user, signOut } = useAuth();

    const handleNavigate = (screen: string) => {
        onClose();
        navigation.navigate(screen as never);
    };

    const handleLogout = async () => {
        try {
            onClose();
            await signOut();
        } catch (error) {
            console.error('Logout failed:', error);
        }
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
                    <TouchableWithoutFeedback>
                        <View style={styles.popupContainer}>
                            {/* Header Section */}
                            <View style={styles.header}>
                                <View style={styles.profileLeft}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {(user?.profile?.full_name?.[0] || user?.email?.[0] || 'A').toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userName}>
                                            {user?.profile?.full_name || user?.email?.split('@')[0] || 'User'}
                                        </Text>
                                        <Text style={styles.userBranch}>{user?.email}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
                                    <Ionicons name="log-out-outline" size={24} color="#1f2937" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.divider} />

                            {/* Menu Options */}
                            <View style={styles.menuContainer}>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleNavigate('AccountDetails')}
                                >
                                    <Feather name="user" size={20} color="#1f2937" style={styles.menuIcon} />
                                    <Text style={styles.menuText}>Account Details</Text>
                                </TouchableOpacity>

                                <View style={styles.menuDivider} />

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleNavigate('ChangePassword')}
                                >
                                    <Ionicons name="key-outline" size={20} color="#1f2937" style={styles.menuIcon} />
                                    <Text style={styles.menuText}>Change Password</Text>
                                </TouchableOpacity>

                                <View style={styles.menuDivider} />

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={toggleTheme}
                                >
                                    <Feather name={themeName === 'dark' ? 'sun' : 'moon'} size={20} color="#1f2937" style={styles.menuIcon} />
                                    <Text style={styles.menuText}>Mode</Text>
                                </TouchableOpacity>

                                <View style={styles.menuDivider} />

                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleNavigate('Settings')}
                                >
                                    <Feather name="settings" size={20} color="#1f2937" style={styles.menuIcon} />
                                    <Text style={styles.menuText}>Settings</Text>
                                </TouchableOpacity>
                            </View>
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
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    popupContainer: {
        position: 'absolute',
        top: 60,
        right: 16,
        width: 300,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    profileLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fca5a5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    avatarText: {
        color: '#7f1d1d',
        fontWeight: 'bold',
        fontSize: 16,
    },
    userInfo: {
        justifyContent: 'center',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    userBranch: {
        fontSize: 13,
        color: '#6b7280',
    },
    logoutIcon: {
        padding: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginBottom: 8,
    },
    menuContainer: {
        paddingTop: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    menuIcon: {
        marginRight: 16,
        width: 24,
        textAlign: 'center',
    },
    menuText: {
        fontSize: 16,
        color: '#000',
        fontWeight: '400',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginLeft: 40,
    }
});
