// ============================================
// TASK DETAIL SCREEN
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { TaskService } from '@/services/task.service';
import { Task, TaskStatus } from '@/types';
import Button from '@/components/shared/Button';
import { useAuth } from '@/hooks/useAuth';

export default function TaskDetailScreen() {
  const route = useRoute();
  const { taskId } = route.params as { taskId: string };
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTask();
  }, []);

  const loadTask = async () => {
    try {
      setLoading(true);
      const data = await TaskService.getById(taskId);
      setTask(data);
    } catch (error) {
      console.error('Error loading task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: TaskStatus) => {
    try {
      setUpdating(true);
      await TaskService.update(taskId, { status: newStatus });
      await loadTask();
      Alert.alert('Success', 'Task status updated');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update task');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !task) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  const canUpdate = task.assigned_to === user?.id;
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
        <RefreshControl refreshing={loading} onRefresh={loadTask} />
      }
    >
      <View className="px-6 py-4">
        <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <View className="flex-row justify-between items-start mb-4">
            <Text className="text-2xl font-bold text-gray-900 flex-1">
              {task.title}
            </Text>
            <View className={`px-3 py-1 rounded-full ${getStatusColor(task.status)}`}>
              <Text className={`text-xs font-medium capitalize`}>
                {task.status.replace('_', ' ')}
              </Text>
            </View>
          </View>

          {task.description && (
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Description</Text>
              <Text className="text-base text-gray-900">
                {task.description}
              </Text>
            </View>
          )}

          {task.assigned_user && (
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Assigned To</Text>
              <Text className="text-base text-gray-900">
                {task.assigned_user.full_name || task.assigned_user.email}
              </Text>
            </View>
          )}

          {task.estimated_time && (
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Estimated Time</Text>
              <Text className="text-base text-gray-900">
                {task.estimated_time} minutes
              </Text>
            </View>
          )}

          {task.actual_time && (
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Actual Time</Text>
              <Text className="text-base text-gray-900">
                {task.actual_time} minutes
              </Text>
            </View>
          )}
        </View>

        {canUpdate && task.status !== 'completed' && (
          <View className="bg-white rounded-lg p-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Update Status
            </Text>
            
            {task.status === 'pending' && (
              <Button
                title="Start Task"
                onPress={() => handleUpdateStatus('in_progress')}
                loading={updating}
                className="mb-3"
              />
            )}
            
            {task.status === 'in_progress' && (
              <>
                <Button
                  title="Mark as Completed"
                  onPress={() => handleUpdateStatus('completed')}
                  loading={updating}
                  className="mb-3"
                />
                <Button
                  title="Mark as Blocked"
                  onPress={() => handleUpdateStatus('blocked')}
                  variant="outline"
                  loading={updating}
                />
              </>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

