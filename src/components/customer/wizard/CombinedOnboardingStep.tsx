import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import WizardInput from '@/components/customer/wizard/WizardInput';
import Button from '@/components/shared/Button';

interface CombinedOnboardingStepProps {
    data: {
        full_name: string;
        phone: string;
        address: string;
        country: string;
        state: string;
        zip_code: string;
        city: string;
    };
    onUpdate: (data: any) => void;
    onNext: () => void;
    errors: Record<string, string>;
}

export default function CombinedOnboardingStep({ data, onUpdate, onNext, errors }: CombinedOnboardingStepProps) {
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    return (
        <View className="flex-1 bg-gray-50">
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 150}
            >
                <ScrollView
                    className="flex-1 px-6 pt-4"
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    <WizardInput
                        label="Full Name"
                        placeholder="Enter Your Name"
                        value={data.full_name}
                        onChangeText={(text) => onUpdate({ ...data, full_name: text })}
                        onBlur={() => handleBlur('full_name')}
                        error={errors.full_name}
                        touched={touched.full_name}
                    />

                    <WizardInput
                        label="Phone Number"
                        placeholder="9820756577"
                        value={data.phone}
                        onChangeText={(text) => onUpdate({ ...data, phone: text })}
                        onBlur={() => handleBlur('phone')}
                        keyboardType="phone-pad"
                        error={errors.phone}
                        touched={touched.phone}
                    />

                    <WizardInput
                        label="Your Address"
                        placeholder="Enter your Address"
                        value={data.address}
                        onChangeText={(text) => onUpdate({ ...data, address: text })}
                        onBlur={() => handleBlur('address')}
                        error={errors.address}
                        touched={touched.address}
                    />

                    <WizardInput
                        label="Country"
                        placeholder="Enter Country"
                        value={data.country}
                        onChangeText={(text) => onUpdate({ ...data, country: text })}
                        onBlur={() => handleBlur('country')}
                        error={errors.country}
                        touched={touched.country}
                    />

                    <WizardInput
                        label="State"
                        placeholder="Enter State"
                        value={data.state}
                        onChangeText={(text) => onUpdate({ ...data, state: text })}
                        onBlur={() => handleBlur('state')}
                        error={errors.state}
                        touched={touched.state}
                    />

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <WizardInput
                                label="ZIP Code"
                                placeholder="Enter ZIP Code"
                                value={data.zip_code}
                                onChangeText={(text) => onUpdate({ ...data, zip_code: text })}
                                onBlur={() => handleBlur('zip_code')}
                                keyboardType="numeric"
                                error={errors.zip_code}
                                touched={touched.zip_code}
                            />
                        </View>
                        <View className="flex-1">
                            <WizardInput
                                label="City"
                                placeholder="Enter City"
                                value={data.city}
                                onChangeText={(text) => onUpdate({ ...data, city: text })}
                                onBlur={() => handleBlur('city')}
                                error={errors.city}
                                touched={touched.city}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Fixed Button at Bottom */}
            <View className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-3 bg-gray-50 border-t border-gray-200">
                <Button
                    title="Next"
                    onPress={onNext}
                />
            </View>
        </View>
    );
}
