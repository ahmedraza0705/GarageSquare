// ============================================
// WORK PROGRESS SCREEN
// ============================================

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WorkProgressScreen() {
    const navigation = useNavigation();
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Engine Diagnostic', completed: true, time: '45 mins' },
        { id: 2, title: 'Brake Pad Replacement', completed: false, time: 'Est. 30 mins' },
        { id: 3, title: 'Oil Change', completed: false, time: 'Est. 20 mins' },
        { id: 4, title: 'Tire Pressure Check', completed: false, time: 'Est. 10 mins' },
        { id: 5, title: 'Coolant Top-up', completed: false, time: 'Est. 5 mins' }
    ]);

    const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

    const toggleTask = (id: number) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="px-4 py-4 border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <Image source={require('../../../assets/Arrow.png')} className="w-6 h-6 tint-gray-900" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">Work Progress</Text>
                    <Text className="text-gray-500 text-xs">Job #JOB-2023-001</Text>
                </View>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-700 font-bold">{progress}% Done</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                {/* Progress Bar */}
                <View className="h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
                    <View
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${progress}%` }}
                    />
                </View>

                {/* Task List */}
                <Text className="text-lg font-bold text-gray-900 mb-4">Service Tasks</Text>

                {tasks.map((task) => (
                    <TouchableOpacity
                        key={task.id}
                        className={`flex-row items-center p-4 mb-3 rounded-xl border ${task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} shadow-sm`}
                        onPress={() => toggleTask(task.id)}
                    >
                        <View className={`w-6 h-6 rounded-full border-2 mr-4 justify-center items-center ${task.completed ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                            {task.completed && (
                                <Text className="text-white text-xs font-bold">✓</Text>
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className={`font-semibold ${task.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>{task.title}</Text>
                            <Text className="text-xs text-gray-400 mt-1">{task.time}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <View className="mt-8">
                    <Text className="text-sm text-gray-500 text-center mb-4">
                        Mark tasks as completed as you finish them. This updates the live status for the manager.
                    </Text>
                    <TouchableOpacity
                        className="bg-gray-900 py-4 rounded-xl"
                        onPress={() => navigation.goBack()}
                    >
                        <Text className="text-white text-center font-bold">Save Progress</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </View>
    );
}

