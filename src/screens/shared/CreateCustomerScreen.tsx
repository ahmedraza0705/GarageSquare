// ============================================
// CREATE CUSTOMER SCREEN
// ============================================

import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { CustomerService } from '@/services/customer.service';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';

export default function CreateCustomerScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { branchId } = useRole();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await CustomerService.create(formData, user?.id || '', branchId);
      Alert.alert('Success', 'Customer created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#36454F]"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false as boolean}
      >
        <Input
          label="Full Name *"
          placeholder="Enter full name"
          value={formData.full_name}
          onChangeText={(text) => setFormData({ ...formData, full_name: text })}
          error={errors.full_name}
        />

        <Input
          label="Email"
          placeholder="Enter email"
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <Input
          label="Phone *"
          placeholder="Enter phone number"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <Input
          label="Address"
          placeholder="Enter address"
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          multiline
          numberOfLines={3}
          error={errors.address}
        />

        <Button
          title="Create Customer"
          onPress={handleSubmit}
          loading={loading}
          className="mt-4"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

