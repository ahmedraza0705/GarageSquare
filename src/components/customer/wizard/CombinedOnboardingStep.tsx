import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import WizardInput from '@/components/customer/wizard/WizardInput';
import Button from '@/components/shared/Button';

interface CombinedOnboardingStepProps {
    data: {
        full_name: string;
        email: string;
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
                keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 80}
            >
                <ScrollView
                    className="flex-1 px-6 pt-4"
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    automaticallyAdjustKeyboardInsets={true}
                >
                    <WizardInput
                        label="Your Name"
                        placeholder="Enter Your Name"
                        value={data.full_name}
                        onChangeText={(text) => onUpdate({ ...data, full_name: text })}
                        onBlur={() => handleBlur('full_name')}
                        error={errors.full_name}
                        touched={touched.full_name}
                    />

                    <WizardInput
                        label="Gmail"
                        placeholder="yourmail@gmail.com"
                        value={data.email}
                        onChangeText={(text) => onUpdate({ ...data, email: text })}
                        onBlur={() => handleBlur('email')}
                        error={errors.email}
                        touched={touched.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <WizardInput
                        label="Phone Number"
                        placeholder="Enter Your Number"
                        value={data.phone}
                        onChangeText={(text) => onUpdate({ ...data, phone: text.slice(0, 10).replace(/\D/g, '') })}
                        onBlur={() => handleBlur('phone')}
                        keyboardType="phone-pad"
                        error={errors.phone}
                        touched={touched.phone}
                    />

                    <WizardInput
                        label="Address"
                        placeholder="Enter Your Address"
                        value={data.address}
                        onChangeText={(text) => onUpdate({ ...data, address: text })}
                        onBlur={() => handleBlur('address')}
                        error={errors.address}
                        touched={touched.address}
                    />

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <WizardInput
                                label="Country"
                                placeholder="Enter Country"
                                value={data.country}
                                onChangeText={(text) => onUpdate({ ...data, country: text })}
                                onBlur={() => handleBlur('country')}
                                error={errors.country}
                                touched={touched.country}
                            />
                        </View>
                        <View className="flex-1">
                            <WizardInput
                                label="State"
                                placeholder="Enter State"
                                value={data.state}
                                onChangeText={(text) => onUpdate({ ...data, state: text })}
                                onBlur={() => handleBlur('state')}
                                error={errors.state}
                                touched={touched.state}
                            />
                        </View>
                    </View>

                    <View className="flex-row gap-4 mt-1">
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
                        <View className="flex-1">
                            <WizardInput
                                label="ZIP Code"
                                placeholder="Enter Zip Code"
                                value={data.zip_code}
                                onChangeText={(text) => onUpdate({ ...data, zip_code: text })}
                                onBlur={() => handleBlur('zip_code')}
                                keyboardType="numeric"
                                error={errors.zip_code}
                                touched={touched.zip_code}
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
