import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    ScrollView,
    Image,
    Alert,
    StatusBar,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const { signOut, user } = useAuth();
    const navigation = useNavigation();
    const route = useRoute();

    const [profileData, setProfileData] = useState({
        firstName: user?.profile?.full_name?.split(' ')[0] || 'Technician',
        lastName: user?.profile?.full_name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || 'technician@example.com',
        role: user?.profile?.role || 'Technician',
        image: null as string | null,
    });

    useEffect(() => {
        if ((route.params as any)?.updatedProfile) {
            const updated = (route.params as any).updatedProfile;
            setProfileData(prev => ({
                ...prev,
                firstName: updated.firstName,
                lastName: updated.lastName,
                email: updated.email,
                image: updated.image,
            }));
        }
    }, [(route.params as any)?.updatedProfile]);

    const sections = [
        {
            title: 'Account',
            items: [
                { icon: 'person-outline', label: 'Edit Profile', action: () => (navigation as any).navigate('EditProfile', { profileData }) },
                { icon: 'lock-closed-outline', label: 'Change Password', action: () => (navigation as any).navigate('ChangePassword') },
                { icon: 'notifications-outline', label: 'Notifications', action: () => (navigation as any).navigate('Notifications') },
            ]
        },
        {
            title: 'Support & Legal',
            items: [
                { icon: 'help-circle-outline', label: 'Help & Support', action: () => (navigation as any).navigate('Support') },
                { icon: 'document-text-outline', label: 'Terms & Privacy', action: () => (navigation as any).navigate('Legal', { title: 'Terms & Privacy', contentType: 'terms' }) },
                { icon: 'information-circle-outline', label: 'About GarageSquare', action: () => (navigation as any).navigate('About') },
            ]
        }
    ];

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await signOut();
                    } catch {
                        Alert.alert('Error', 'Failed to logout');
                    }
                },
            },
        ]);
    };

    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const MenuItem = ({ item, isLast }: { item: any, isLast: boolean }) => (
        <TouchableOpacity
            onPress={item.action}
            activeOpacity={0.7}
            className={`flex-row items-center justify-between p-4 bg-white ${!isLast ? 'border-b border-slate-100' : ''}`}
        >
            <View className="flex-row items-center gap-4">
                <View className="w-8 h-8 rounded-full bg-slate-50 items-center justify-center">
                    <Ionicons name={item.icon} size={18} color="#475569" />
                </View>
                <Text className="text-[15px] font-medium text-slate-700">
                    {item.label}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle='dark-content' backgroundColor="#fff" />

            {/* ===== HEADER ===== */}
            <SafeAreaView edges={['top']} className="bg-white z-10 shadow-sm border-b border-slate-100/50">
                <View className="h-14 px-5 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mr-3 p-1 -ml-1"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-slate-800 tracking-tight">
                        Settings
                    </Text>
                </View>
            </SafeAreaView>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* ===== PROFILE CARD (ANIMATED & CENTERED) ===== */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    }}
                    className="m-5 mt-6 p-6 bg-[#4682B4] rounded-2xl shadow-sm border border-[#4682B4] items-center"
                >
                    <View className="w-20 h-20 rounded-full bg-[#4682B4] items-center justify-center overflow-hidden border border-[#4682B4] shadow-sm mb-4">
                        {profileData.image ? (
                            <Image source={{ uri: profileData.image }} className="w-full h-full" />
                        ) : (
                            <Text className="text-3xl font-bold text-white">
                                {profileData.firstName?.[0]?.toUpperCase()}
                            </Text>
                        )}
                    </View>
                    <View className="items-center">
                        <Text className="text-xl font-bold text-white leading-tight mb-1">
                            {profileData.firstName} {profileData.lastName}
                        </Text>
                        <Text className="text-sm text-white mb-3">
                            {profileData.email}
                        </Text>
                        <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                            <Text className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                                {profileData.role}
                            </Text>
                        </View>
                    </View>
                </Animated.View>

                {/* ===== MENU SECTIONS ===== */}
                <View className="px-5">
                    {sections.map((section, idx) => (
                        <View key={idx} className="mb-6">
                            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">
                                {section.title}
                            </Text>
                            <View className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100/80">
                                {section.items.map((item, itemIdx) => (
                                    <MenuItem
                                        key={itemIdx}
                                        item={item}
                                        isLast={itemIdx === section.items.length - 1}
                                    />
                                ))}
                            </View>
                        </View>
                    ))}
                </View>

                {/* ===== LOGOUT ===== */}
                <View className="px-5 mt-2">
                    <TouchableOpacity
                        onPress={handleLogout}
                        activeOpacity={0.8}
                        className="flex-row items-center justify-center bg-red-50 py-3.5 rounded-xl border border-red-100"
                    >
                        <Ionicons name="log-out-outline" size={20} color="#dc2626" style={{ marginRight: 8 }} />
                        <Text className="text-red-600 font-semibold text-base">
                            Log Out
                        </Text>
                    </TouchableOpacity>
                    <Text className="text-center text-slate-300 text-xs mt-6">
                        Version 1.0.2 (Build 45)
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
