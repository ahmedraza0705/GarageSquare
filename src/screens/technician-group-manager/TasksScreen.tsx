// ============================================
// TASKS SCREEN (Technician Group Manager)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TaskService } from '@/services/task.service';
import { Task } from '@/types';

export default function TechnicianGroupManagerTasksScreen() {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await TaskService.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (taskId: string) => {
    // TODO: Show technician selection modal
    Alert.alert('Assign Task', 'Select a technician to assign this task to.');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
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
          <View
            key={task.id}
            className="bg-white rounded-lg p-4 mb-4 shadow-sm"
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
            
            {task.assigned_user ? (
              <Text className="text-gray-600 text-sm mb-2">
                Assigned to: {task.assigned_user.full_name || task.assigned_user.email}
              </Text>
            ) : (
              <TouchableOpacity
                className="bg-primary-600 rounded-lg p-2 mb-2"
                onPress={() => handleAssign(task.id)}
              >
                <Text className="text-white text-sm font-medium text-center">
                  Assign Technician
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={() => (navigation as any).navigate('TaskDetail', { taskId: task.id })}
            >
              <Text className="text-primary-600 text-sm font-medium">
                View Details →
              </Text>
            </TouchableOpacity>
          </View>
        ))}

        {tasks.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-gray-500">No tasks found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}


