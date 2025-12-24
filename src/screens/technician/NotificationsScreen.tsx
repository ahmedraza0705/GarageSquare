// ============================================
// NOTIFICATIONS SCREEN
// ============================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';

export default function NotificationsScreen() {
    const [notifications, setNotifications] = useState([
        { id: 1, title: 'New Job Assigned', message: 'You have been assigned to Job #JOB-2023-005 (Toyota Camaro).', time: '2 mins ago', read: false },
        { id: 2, title: 'Part Request Approved', message: 'Your request for Brake Pads (Front) has been approved.', time: '1 hour ago', read: true },
        { id: 3, title: 'Job Approved', message: 'Supervisor accepted your work on Job #JOB-2023-001.', time: 'Yesterday', read: true },
        { id: 4, title: 'Urgent Reminder', message: 'Job #JOB-2023-002 is due today.', time: 'Yesterday', read: true }
    ]);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white px-4 py-4 border-b border-gray-200 flex-row items-center justify-between shadow-sm z-10">
                <Text className="text-2xl font-bold text-gray-900">Notifications</Text>
                <TouchableOpacity onPress={markAllRead}>
                    <Text className="text-blue-600 font-semibold text-sm">Mark all read</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {notifications.map((notif) => (
                    <TouchableOpacity
                        key={notif.id}
                        className={`p-4 mb-3 rounded-xl border ${notif.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}
                    >
                        <View className="flex-row justify-between items-start mb-1">
                            <Text className={`text-base font-bold flex-1 mr-2 ${notif.read ? 'text-gray-800' : 'text-blue-900'}`}>{notif.title}</Text>
                            {!notif.read && <View className="w-2 h-2 rounded-full bg-blue-600 mt-2" />}
                        </View>
                        <Text className="text-sm text-gray-600 mb-2 leading-5">{notif.message}</Text>
                        <Text className="text-xs text-gray-400">{notif.time}</Text>
                    </TouchableOpacity>
                ))}

                {notifications.length === 0 && (
                    <View className="items-center justify-center mt-20">
                        <Text className="text-gray-400 text-lg">No notifications yet</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
