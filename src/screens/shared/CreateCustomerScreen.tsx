// ============================================
// CREATE CUSTOMER SCREEN - WIZARD
// ============================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { CustomerService } from '@/services/customer.service';
import { VehicleService } from '@/services/vehicle.service';

// Steps
import CustomerOnboardingSplash from '@/components/customer/wizard/CustomerOnboardingSplash';
import CombinedOnboardingStep from '@/components/customer/wizard/CombinedOnboardingStep';
import BrandSelectionStep from '@/components/customer/wizard/BrandSelectionStep';
import ModelSelectionStep from '@/components/customer/wizard/ModelSelectionStep';
import VehicleDetailsStep from '@/components/customer/wizard/VehicleDetailsStep';

export default function CreateCustomerScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { branchId } = useRole();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Data State
  const [customerData, setCustomerData] = useState({
    full_name: '',
    phone: '',
    address: '',
    country: '',
    state: '',
    zip_code: '',
    city: '',
  });

  const [vehicleData, setVehicleData] = useState({
    brand: '',
    model: '',
    year: undefined as number | undefined,
    fuel_type: '',
    delivery_type: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation for Step 1
  const validateField = (field: string, value: string) => {
    let error = '';
    if (field === 'full_name' && !value.trim()) error = 'Full name is required';
    if (field === 'phone' && !value.trim()) error = 'Phone is required';
    if (field === 'address' && !value.trim()) error = 'Address is required'; // Added address validation

    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors[field] = error;
      else delete newErrors[field];
      return newErrors;
    });
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!customerData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!customerData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!customerData.address.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update handler that validates in real-time
  const updateCustomerData = (updates: any) => {
    setCustomerData(prev => {
      const newState = { ...prev, ...updates };
      // Validate changed fields
      Object.keys(updates).forEach(key => {
        validateField(key, updates[key]);
      });
      return newState;
    });
  };

  const handleNext = () => {
    if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigation.goBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      setLoading(true);

      // Show alert for new customer creation
      Alert.alert(
        'Creating New Customer',
        `Customer: ${customerData.full_name}\nPhone: ${customerData.phone}\nVehicle: ${vehicleData.brand} ${vehicleData.model} (${vehicleData.year})`,
        [{ text: 'OK' }]
      );

      // 1. Create Customer
      const fullAddress = `${customerData.address}, ${customerData.city}, ${customerData.state} - ${customerData.zip_code}`;

      const newCustomer = await CustomerService.create({
        full_name: customerData.full_name,
        phone: customerData.phone,
        email: '',
        address: fullAddress,
      }, user?.id || '', branchId);

      // 2. Create Vehicle
      if (newCustomer && newCustomer.id) {
        await VehicleService.create({
          customer_id: newCustomer.id,
          make: vehicleData.brand,
          model: vehicleData.model,
          year: vehicleData.year,
          color: '',
          license_plate: '',
          vin: '',
        }, branchId);
      }

      // Show success alert
      Alert.alert(
        'Success!',
        'New customer created successfully on localhost',
        [{ text: 'OK', onPress: () => setShowSuccessModal(true) }]
      );

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create customer and vehicle');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CustomerOnboardingSplash
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <CombinedOnboardingStep
            data={customerData}
            onUpdate={updateCustomerData}
            onNext={handleNext}
            errors={errors}
          />
        );
      case 3:
        return (
          <BrandSelectionStep
            selectedBrand={vehicleData.brand}
            onSelect={(brand) => {
              setVehicleData({ ...vehicleData, brand });
            }}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <ModelSelectionStep
            selectedBrand={vehicleData.brand}
            selectedModel={vehicleData.model}
            selectedFuelType={vehicleData.fuel_type}
            selectedYear={vehicleData.year?.toString() || ''}
            onSelectModel={(model) => setVehicleData({ ...vehicleData, model })}
            onSelectFuelType={(fuel_type) => setVehicleData({ ...vehicleData, fuel_type })}
            onSelectYear={(year) => setVehicleData({ ...vehicleData, year: parseInt(year) })}
            onNext={handleNext}
          />
        );
      case 5:
        return (
          <VehicleDetailsStep
            data={vehicleData}
            onUpdate={(updates) => setVehicleData({ ...vehicleData, ...updates })}
            onFinish={handleFinish}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Initial Onboarding';
      case 2: return 'Initial Onboarding';
      case 3: return 'Pick your Car Brand';
      case 4: return 'Car Model';
      case 5: return 'Vehicle Details';
      default: return '';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 pt-2">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pb-4 border-b border-gray-100">
          <TouchableOpacity onPress={handleBack} className="w-10 h-10 items-center justify-center -ml-2">
            <Text className="text-2xl text-gray-900">←</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 flex-1 text-center mr-8">
            {getStepTitle()}
          </Text>
        </View>

        {/* Progress Bar - Hide on splash screen */}
        {currentStep > 1 && (
          <View className="flex-row h-1 bg-gray-100 w-full">
            <View
              className="bg-blue-600 h-full"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />
          </View>
        )}

        {renderStep()}

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
        >
          <View className="flex-1 bg-black/50 items-center justify-center p-6">
            <View className="bg-white rounded-3xl p-8 w-full items-center">
              <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-6">
                <Text className="text-4xl text-blue-600">✓</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-900 mb-2">Customer Added</Text>
              <Text className="text-gray-500 text-center mb-8">
                Your New Customer Has Been Successfully Added.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.goBack();
                }}
                className="w-full bg-[#4682B4] py-4 rounded-xl"
              >
                <Text className="text-white text-center font-bold text-lg">Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
