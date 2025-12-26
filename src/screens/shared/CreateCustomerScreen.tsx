// ============================================
// CREATE CUSTOMER SCREEN - WIZARD
// ============================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useTheme } from '@/context/ThemeContext';
import { CustomerService } from '@/services/customer.service';
import { VehicleService } from '@/services/vehicle.service';

import { ArrowLeft } from 'lucide-react-native';

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
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Data State
  const [customerData, setCustomerData] = useState({
    full_name: '',
    email: '',
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
    license_plate: '',
    year_manufacture: undefined as number | undefined,
    year_purchase: undefined as number | undefined,
    fuel_type: '',
    delivery_type: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation for Step 1
  const validateField = (field: string, value: string) => {
    let error = '';
    if (field === 'full_name' && !value.trim()) error = 'Full name is required';
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) error = 'Email is required';
      else if (!emailRegex.test(value)) error = 'Invalid email format';
    }
    if (field === 'phone') {
      const phoneRegex = /^\d{10,}$/;
      if (!value.trim()) error = 'Phone is required';
      else if (!phoneRegex.test(value.replace(/\D/g, ''))) error = 'Min 10 digits';
    }
    if (field === 'address' && !value.trim()) error = 'Address is required';
    if (field === 'country' && !value.trim()) error = 'Country is required';
    if (field === 'state' && !value.trim()) error = 'State is required';
    if (field === 'zip_code' && !value.trim()) error = 'ZIP Code is required';
    if (field === 'city' && !value.trim()) error = 'City is required';

    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) newErrors[field] = error;
      else delete newErrors[field];
      return newErrors;
    });
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,}$/;

    if (!customerData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!customerData.email.trim() || !emailRegex.test(customerData.email)) newErrors.email = 'Invalid email';
    if (!customerData.phone.trim() || !phoneRegex.test(customerData.phone.replace(/\D/g, ''))) newErrors.phone = 'Invalid phone';
    if (!customerData.address.trim()) newErrors.address = 'Address is required';
    if (!customerData.country.trim()) newErrors.country = 'Country is required';
    if (!customerData.state.trim()) newErrors.state = 'State is required';
    if (!customerData.zip_code.trim()) newErrors.zip_code = 'ZIP Code is required';
    if (!customerData.city.trim()) newErrors.city = 'City is required';

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
    } else if (currentStep === 3) {
      if (!vehicleData.brand || vehicleData.brand === 'Other') {
        setErrors(prev => ({ ...prev, brand: 'Brand is required' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.brand;
          return newErrors;
        });
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      const stepErrors: Record<string, string> = {};

      const modelVal = vehicleData.model || '';
      if (!modelVal.trim() || modelVal === 'Other' || modelVal === 'NaN') {
        stepErrors.model = 'Model is required';
      }

      if (!vehicleData.fuel_type) {
        stepErrors.fuel_type = 'Fuel type is required';
      }

      if (!vehicleData.license_plate.trim()) {
        stepErrors.license_plate = 'Vehicle number is required';
      } else {
        const plateRegex = /^[A-Z]{2}[ -]?[0-9]{2}[ -]?[A-Z]{0,2}[ -]?[0-9]{1,4}$/i;
        if (!plateRegex.test(vehicleData.license_plate.trim())) {
          stepErrors.license_plate = 'Invalid format (e.g. GJ-05-JR-1234)';
        }
      }

      if (Object.keys(stepErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...stepErrors }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.model;
          delete newErrors.fuel_type;
          delete newErrors.license_plate;
          return newErrors;
        });
        setCurrentStep(5);
      }
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
      console.log('Starting customer creation process...');
      console.log('Customer Data:', customerData);
      console.log('Vehicle Data:', vehicleData);

      // 1. Create Customer
      const fullAddress = `${customerData.address}, ${customerData.city}, ${customerData.state} - ${customerData.zip_code}`;

      console.log('Branch ID for creation:', branchId);
      if (!branchId) {
        console.warn('⚠️ No Branch ID found for current user. Customer will be created with branch_id = NULL.');
      }

      console.log('Creating customer in Supabase...');
      const newCustomer = await CustomerService.create({
        full_name: customerData.full_name,
        phone: customerData.phone,
        email: customerData.email,
        address: fullAddress,
      }, user?.id || '', branchId);

      console.log('Customer created successfully:', newCustomer?.id);

      // 2. Create Vehicle
      if (newCustomer && newCustomer.id) {
        console.log('Creating vehicle in Supabase...');
        await VehicleService.create({
          customer_id: newCustomer.id,
          brand: vehicleData.brand,
          model: vehicleData.model,
          year_manufacture: vehicleData.year_manufacture,
          color: '',
          license_plate: (vehicleData.license_plate || '').trim().toUpperCase(),
          vin: '',
        }, branchId);
        console.log('Vehicle created successfully');
      }

      // Show success modal directly
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error('Final Step Error:', error);
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
              if (brand && brand !== 'Other') {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.brand;
                  return newErrors;
                });
              }
            }}
            onNext={handleNext}
            error={errors.brand}
          />
        );
      case 4:
        return (
          <ModelSelectionStep
            selectedBrand={vehicleData.brand}
            selectedModel={vehicleData.model}
            selectedFuelType={vehicleData.fuel_type}
            selectedLicensePlate={vehicleData.license_plate}
            onSelectModel={(model) => {
              setVehicleData({ ...vehicleData, model });
              if (model && model !== 'Other') {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.model;
                  return newErrors;
                });
              }
            }}
            onSelectFuelType={(fuel_type) => {
              setVehicleData({ ...vehicleData, fuel_type });
              if (fuel_type) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.fuel_type;
                  return newErrors;
                });
              }
            }}
            onSelectLicensePlate={(license_plate: string) => {
              setVehicleData({ ...vehicleData, license_plate });
              if (license_plate.trim()) {
                const plateRegex = /^[A-Z]{2}[ -]?[0-9]{2}[ -]?[A-Z]{0,2}[ -]?[0-9]{1,4}$/i;
                if (plateRegex.test(license_plate.trim())) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.license_plate;
                    return newErrors;
                  });
                }
              }
            }}
            onNext={handleNext}
            errors={errors}
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View className="flex-1 pt-2">
        {/* Header */}
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity onPress={handleBack} className="mr-4">
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        {/* Segmented Progress Bar - Hide on splash screen */}
        {currentStep > 1 && (
          <View className="flex-row gap-2 px-6 mb-6">
            <View style={{ backgroundColor: currentStep >= 2 ? theme.primary : '#D1D5DB' }} className="h-1 flex-1 rounded-full" />
            <View style={{ backgroundColor: currentStep >= 3 ? theme.primary : '#D1D5DB' }} className="h-1 flex-1 rounded-full" />
            <View style={{ backgroundColor: currentStep >= 4 ? theme.primary : '#D1D5DB' }} className="h-1 flex-1 rounded-full" />
            <View style={{ backgroundColor: currentStep >= 5 ? theme.primary : '#D1D5DB' }} className="h-1 flex-1 rounded-full" />
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
              <View style={{ backgroundColor: '#F0F9FF' }} className="w-20 h-20 rounded-full items-center justify-center mb-6">
                <Text style={{ color: theme.primary }} className="text-4xl">✓</Text>
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
                style={{ backgroundColor: theme.primary }}
                className="w-full py-4 rounded-xl"
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
