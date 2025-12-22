// ============================================
// CREATE VEHICLE SCREEN - WIZARD
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Modal, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { useTheme } from '@/context/ThemeContext';
import { VehicleService } from '@/services/vehicle.service';
import { ArrowLeft } from 'lucide-react-native';

// Steps
import BrandSelectionStep from '@/components/customer/wizard/BrandSelectionStep';
import ModelSelectionStep from '@/components/customer/wizard/ModelSelectionStep';
import VehicleDetailsStep from '@/components/customer/wizard/VehicleDetailsStep';

export default function CreateVehicleScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { user } = useAuth();
  const { isCompanyAdmin, branchId } = useRole();
  const { theme } = useTheme();

  const params = route.params as { customerId?: string, customerName?: string };
  const [customerId, setCustomerId] = useState<string | undefined>(params?.customerId);
  const [customerName, setCustomerName] = useState<string | undefined>(params?.customerName);

  // Sync if params change, but state will hold them independently
  useEffect(() => {
    if (params?.customerId !== undefined) {
      setCustomerId(params.customerId);
    }
    if (params?.customerName !== undefined) {
      setCustomerName(params.customerName);
    }
  }, [params?.customerId, params?.customerName]);

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [vehicleData, setVehicleData] = useState({
    brand: '',
    model: '',
    license_plate: '',
    year_manufacture: undefined as number | undefined,
    year_purchase: undefined as number | undefined,
    fuel_type: '',
    delivery_type: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    if (currentStep === 1) {
      if (!vehicleData.brand || vehicleData.brand === 'Other') {
        setErrors(prev => ({ ...prev, brand: 'Brand is required' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.brand;
          return newErrors;
        });
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
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
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      navigation.goBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const wrapFinish = async () => {
    try {
      setLoading(true);

      // If customerId is provided, we use it. 
      // Note: If customerId is just a string from the manual input in VehiclesScreen, 
      // we might need to handle it differently if it's not a UUID, 
      // but assuming the user provides a valid ID or we treat it as a placeholder.

      if (!customerId) {
        throw new Error('Customer identification missing');
      }

      await VehicleService.create({
        customer_id: customerId,
        make: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year_manufacture,
        year_purchase: vehicleData.year_purchase,
        fuel_type: vehicleData.fuel_type,
        delivery_type: vehicleData.delivery_type,
        license_plate: (vehicleData.license_plate || '').trim().toUpperCase(),
        notes: vehicleData.notes || undefined,
      }, branchId);

      setShowSuccessModal(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
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
      case 2:
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
      case 3:
        return (
          <VehicleDetailsStep
            data={{
              year_manufacture: vehicleData.year_manufacture,
              year_purchase: vehicleData.year_purchase,
              fuel_type: vehicleData.fuel_type,
              delivery_type: vehicleData.delivery_type,
            }}
            onUpdate={(updates) => setVehicleData({ ...vehicleData, ...updates })}
            onFinish={wrapFinish}
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
          <Text className="text-xl font-bold text-gray-900">Add Vehicle</Text>
        </View>

        {/* Segmented Progress Bar */}
        <View className="flex-row gap-2 px-6 mb-6">
          <View style={{ backgroundColor: currentStep >= 1 ? theme.primary : '#D1D5DB' }} className="h-1 flex-1 rounded-full" />
          <View style={{ backgroundColor: currentStep >= 2 ? theme.primary : '#D1D5DB' }} className="h-1 flex-1 rounded-full" />
          <View style={{ backgroundColor: currentStep >= 3 ? theme.primary : '#D1D5DB' }} className="h-1 flex-1 rounded-full" />
        </View>

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
              <Text className="text-2xl font-bold text-gray-900 mb-2">Vehicle Added</Text>
              <Text className="text-gray-500 text-center mb-8">
                Your New Vehicle Has Been Successfully Added for {customerName || 'the customer'}.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowSuccessModal(false);

                  if (isCompanyAdmin) {
                    // Navigate to Vehicles inside the DashboardStack within MainTabs
                    navigation.navigate('Main', {
                      screen: 'MainTabs',
                      params: {
                        screen: 'DashboardTab',
                        initial: false,
                        params: {
                          screen: 'Vehicles',
                          initial: false
                        }
                      }
                    });
                  } else {
                    // Path for Manager or other roles where Vehicles is a direct tab in Main
                    navigation.navigate('Main', {
                      screen: 'Vehicles',
                      initial: false
                    });
                  }
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

