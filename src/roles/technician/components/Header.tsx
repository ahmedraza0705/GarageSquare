import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
    const navigation = useNavigation();
    const { user } = useAuth();
    const userImage = user?.profile?.avatar_url || null;

    return (
        <SafeAreaView
            edges={['top']}
        // className=""
        >
            <View className="flex-row items-center justify-between px-5 py-3">
                <Text className="text-xl font-bold text-slate-900">
                    {title}
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ProfileStack' as never)}
                    className="active:opacity-70"
                >
                    {userImage ? (
                        <Image
                            source={{ uri: userImage }}
                            className="w-9 h-9 rounded-full border border-slate-200"
                        />
                    ) : (
                        <View className="w-9 h-9 rounded-full bg-slate-200 items-center justify-center border border-slate-300">
                            <Text className="text-sm font-bold text-slate-600">
                                {user?.profile?.full_name?.[0]}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
