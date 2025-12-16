// ============================================
// MY TASKS SCREEN (Technician)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { TaskService } from '@/services/task.service';
import { Task } from '@/types';

export default function TechnicianMyTasksScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await TaskService.getAll({ assigned_to: user?.id });
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadTasks} />
      }
    >
      <View className="px-6 py-4">
        {tasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            className="bg-white rounded-lg p-4 mb-4 shadow-sm"
            onPress={() => navigation.navigate('TaskDetail' as never, { taskId: task.id } as never)}
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-semibold text-gray-900 flex-1">
                {task.title}
              </Text>
              <View className={`px-3 py-1 rounded-full ml-2 ${getStatusColor(task.status)}`}>
                <Text className={`text-xs font-medium capitalize`}>
                  {task.status.replace('_', ' ')}
                </Text>
              </View>
            </View>
            
            {task.description && (
              <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                {task.description}
              </Text>
            )}
            {task.estimated_time && (
              <Text className="text-gray-500 text-xs">
                Est. Time: {task.estimated_time} min
              </Text>
            )}
          </TouchableOpacity>
        ))}

        {tasks.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-gray-500">No tasks assigned</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

