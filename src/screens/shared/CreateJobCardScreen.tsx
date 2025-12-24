// ============================================
// CREATE JOB CARD SCREEN (Premium Redesign)
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  Alert,
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useJobs } from '@/context/JobContext';
import { CustomerService } from '@/services/customer.service';
import { VehicleService } from '@/services/vehicle.service';
import { JobCardService } from '@/services/jobCard.service';
import { useAuth } from '@/hooks/useAuth';
import { Customer, Vehicle } from '@/types';
import { ChevronDown, ChevronUp, Plus, Menu, Search, MapPin, Pencil, Trash2, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ServiceItem {
  id: string;
  name: string;
  cost: number;
  time: string;
}

const COMMON_SERVICES = [
  'Oil Change',
  'Brake Pad Replacement',
  'Battery Replacement',
  'Tire Rotation',
  'AC Recharge',
  'Wheel Alignment',
  'Suspension Repair',
  'Engine Diagnostics',
  'Alternator Repair',
  'Spark Plug Replacement',
  'Exhaust Leak Repair',
  'Transmission Flush',
  'Wheel Balancing',
  'Radiator Flush',
  'Belt Replacement',
  'Headlight Restoration',
  'Fuel Filter Replacement',
  'Clutch Repair',
  'Power Steering Flush',
  'Cabin Air Filter Change',
];


export default function CreateJobCardScreen() {
  const navigation = useNavigation<any>();
  const { addJob } = useJobs();
  const { user } = useAuth();

  // State for Accordion Sections
  const [sections, setSections] = useState({
    customer: true,
    vehicle: false,
    services: false,
    address: false,
  });

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    brand: '',
    model: '',
    licensePlate: '',
    odometer: '',
    pickupAddress: '',
    dropoffAddress: '',
    deliveryDate: '',
    deliveryTime: '',
    otherRequirements: ''
  });

  const [priority, setPriority] = useState<'Normal' | 'Urgent'>('Normal');
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [newEstimateHour, setNewEstimateHour] = useState('');
  const [newEstimateMin, setNewEstimateMin] = useState('');
  const [newCost, setNewCost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Database State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await CustomerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.customerName) {
      const filtered = customers.filter(c =>
        c.full_name.toLowerCase().includes(formData.customerName.toLowerCase()) ||
        c.phone.includes(formData.customerName)
      );
      setFilteredCustomers(filtered);
    } else {
      // Show all customers (or recent ones) when input is empty
      setFilteredCustomers(customers);
    }
  }, [formData.customerName, customers]);

  const handleCustomerSelect = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      ...formData,
      customerName: customer.full_name,
      phone: customer.phone,
    });
    setShowCustomerDropdown(false);
    Keyboard.dismiss();

    // Fetch customer's vehicles
    try {
      const vehicles = await VehicleService.getAll({ customer_id: customer.id });
      if (vehicles.length > 0) {
        handleVehicleSelect(vehicles[0]);
      } else {
        setSelectedVehicle(null);
        setFormData(prev => ({
          ...prev,
          brand: '',
          model: '',
          licensePlate: '',
        }));
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData(prev => ({
      ...prev,
      brand: vehicle.brand,
      model: vehicle.model,
      licensePlate: vehicle.license_plate || '',
    }));
  };

  // Time Picker State
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempHour, setTempHour] = useState('12');
  const [tempMinute, setTempMinute] = useState('00');
  const [tempAmPm, setTempAmPm] = useState<'AM' | 'PM'>('PM');

  const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0')); // 00, 05, 10... 55
  const AMPM = ['AM', 'PM'];

  const handleTimeSelect = () => {
    const timeStr = `${tempHour}:${tempMinute} ${tempAmPm}`;
    setFormData({ ...formData, deliveryTime: timeStr });
    setShowTimePicker(false);
  };

  const incrementHour = () => {
    setTempHour(prev => {
      const h = parseInt(prev) + 1;
      return h > 12 ? '1' : h.toString();
    });
  };

  const decrementHour = () => {
    setTempHour(prev => {
      const h = parseInt(prev) - 1;
      return h < 1 ? '12' : h.toString();
    });
  };

  const incrementMinute = () => {
    setTempMinute(prev => {
      const index = MINUTES.indexOf(prev);
      const nextIndex = (index + 1) % MINUTES.length;
      return MINUTES[nextIndex];
    });
  };

  const decrementMinute = () => {
    setTempMinute(prev => {
      const index = MINUTES.indexOf(prev);
      const nextIndex = (index - 1 + MINUTES.length) % MINUTES.length;
      return MINUTES[nextIndex];
    });
  };

  const toggleAmPm = () => {
    setTempAmPm(prev => prev === 'AM' ? 'PM' : 'AM');
  };
  const filteredServices = COMMON_SERVICES.filter(s =>
    s.toLowerCase().includes(newServiceName.toLowerCase())
  );

  const toggleSection = (section: keyof typeof sections) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, s) => sum + s.cost, 0);
  };

  const handleAddService = (nameOverride?: string) => {
    const serviceName = nameOverride || newServiceName;
    if (!serviceName) return;

    const newItem: ServiceItem = {
      id: Date.now().toString(),
      name: serviceName,
      cost: parseInt(newCost) || 0,
      time: `${newEstimateHour || '0'} hour ${newEstimateMin || '0'} min`
    };
    setSelectedServices(prev => [...prev, newItem]);
    setNewServiceName('');
    setNewEstimateHour('');
    setNewEstimateMin('');
    setNewCost('');
    setShowServiceDropdown(false);
    Keyboard.dismiss();
  };

  const handleEditService = (service: ServiceItem) => {
    setNewServiceName(service.name);
    setNewCost(service.cost.toString());

    // Parse time: "X hour Y min"
    const timeMatch = service.time.match(/(\d+) hour (\d+) min/);
    if (timeMatch) {
      setNewEstimateHour(timeMatch[1]);
      setNewEstimateMin(timeMatch[2]);
    }

    // Remove from list so user can update and re-add
    setSelectedServices(prev => prev.filter(s => s.id !== service.id));
  };

  const handleDeleteService = (serviceId: string) => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to delete this service?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => setSelectedServices(prev => prev.filter(s => s.id !== serviceId))
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Basic validation
    if (!formData.customerName || !formData.brand || !formData.model) {
      Alert.alert('Incomplete Form', 'Please provide Customer name, Vehicle Brand and Model');
      return;
    }

    // Validate Delivery Date Format (DD-MM-YYYY)
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (formData.deliveryDate && !dateRegex.test(formData.deliveryDate)) {
      Alert.alert('Invalid Date', 'Please enter delivery date in DD-MM-YYYY format (e.g., 25-12-2025)');
      return;
    }

    // Validate Delivery Time Format (HH:MM AM/PM)
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] [APap][Mm]$/;
    if (formData.deliveryTime && !timeRegex.test(formData.deliveryTime)) {
      Alert.alert('Invalid Time', 'Please enter delivery time in HH:MM AM/PM format (e.g., 5:00 PM)');
      return;
    }

    try {
      if (!user) {
        Alert.alert('Error', 'User session not found');
        return;
      }

      setIsSubmitting(true);
      const branchId = user.profile?.branch_id || undefined;
      let finalCustomerId = selectedCustomer?.id;
      let finalVehicleId = selectedVehicle?.id;

      // 1. Create/Find Customer if not selected
      if (!finalCustomerId) {
        // Double check if customer already exists by phone to avoid duplicates
        const existingCustomers = await CustomerService.getAll({ search: formData.phone });
        const match = existingCustomers.find(c => c.phone === formData.phone);

        if (match) {
          finalCustomerId = match.id;
        } else {
          const newCustomer = await CustomerService.create({
            full_name: formData.customerName,
            phone: formData.phone || '',
            email: '',
            address: formData.pickupAddress || '', // Fallback address
          }, user.id, branchId);
          finalCustomerId = newCustomer.id;
        }
      }

      // 2. Create/Find Vehicle if not selected
      if (!finalVehicleId && finalCustomerId) {
        // Check if vehicle already exists by license plate
        const existingVehicles = await VehicleService.getAll({ customer_id: finalCustomerId });
        const match = existingVehicles.find(v => v.license_plate?.toUpperCase() === formData.licensePlate?.toUpperCase());

        if (match) {
          finalVehicleId = match.id;
        } else {
          const newVehicle = await VehicleService.create({
            customer_id: finalCustomerId,
            brand: formData.brand,
            model: formData.model,
            license_plate: formData.licensePlate || '',
            odometer: parseInt(formData.odometer) || 0,
            color: '',
            year_manufacture: new Date().getFullYear(),
          }, branchId);
          finalVehicleId = newVehicle.id;
        }
      }

      if (!finalCustomerId || !finalVehicleId) {
        Alert.alert('Error', 'Could not prepare Customer or Vehicle data');
        setIsSubmitting(false);
        return;
      }

      // Prepare task statuses (all pending initially)
      const taskStatuses: Record<string, string> = {};
      selectedServices.forEach(s => {
        taskStatuses[s.name] = 'pending';
      });

      const createForm: any = {
        customer_id: finalCustomerId,
        vehicle_id: finalVehicleId,
        description: formData.otherRequirements,
        priority: priority.toLowerCase() as any,
        estimated_cost: calculateTotal(),
        estimated_time: '',
        odometer: parseInt(formData.odometer) || 0,
        pickup_address: formData.pickupAddress,
        dropoff_address: formData.dropoffAddress,
        delivery_date: formData.deliveryDate,
        delivery_due: formData.deliveryTime,
        other_requirements: formData.otherRequirements,
        task_statuses: taskStatuses,
        quality_statuses: {},
        manual_services: selectedServices.map(s => ({
          name: s.name,
          cost: s.cost,
          time: s.time
        })),
      };

      await JobCardService.create(createForm, user.id, branchId);

      // Update local context
      if (addJob) {
        addJob({} as any); // Trigger refresh
      }

      Alert.alert('Success', 'Job Card created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error creating job card:', error);
      Alert.alert('Error', error.message || 'Failed to create Job Card');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Helper to format date input with hyphens */
  const handleDateChange = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;

    // Auto-insert hyphens: DD-MM-YYYY
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted = formatted.slice(0, 5) + '-' + cleaned.slice(4, 8);
    }

    setFormData({ ...formData, deliveryDate: formatted });
  };

  /* Helper to format license plate automatically */
  const formatLicensePlate = (text: string) => {
    // 1. Remove existing hyphens/spaces and convert to uppercase
    const clean = text.replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // 2. Logic: State(2) - Dist(2) - Series(Var) - Number(Var)
    // We can't determine the split between Series (letters) and Number (digits) easily 
    // without regex lookahead or manual parsing because user is typing.

    // Simple heuristic for partial typing:
    // 0-2 chars: State (Letters)
    // 2-4 chars: District (Numbers)
    // 4+ chars: Series (Letters) until Numbers start

    let formatted = clean;

    if (clean.length > 2) {
      formatted = clean.slice(0, 2) + '-' + clean.slice(2);
    }
    if (clean.length > 4) {
      // We have State-Dist... now we need to handle the Series-Number split
      // The slice(2) above gave us "05AA1234" (example)
      // Let's re-construct from full clean string
      const part1 = clean.slice(0, 2); // GJ
      const part2 = clean.slice(2, 4); // 05
      const remainder = clean.slice(4); // AA1234...

      // Find where letters end and numbers begin in the remainder (Series vs Number)
      const match = remainder.match(/^([A-Z]*)([0-9]*)$/);

      if (match) {
        const series = match[1];
        const num = match[2];

        if (series && num) {
          // We have both series and number -> "GJ-05-AA-1234"
          formatted = `${part1}-${part2}-${series}-${num}`;
        } else if (series) {
          // We have series but no number yet -> "GJ-05-AA"
          formatted = `${part1}-${part2}-${series}`;
        } else {
          // No series letters? (Unusual but possible for old cars) or just typing numbers??
          // Standard format implies series. If just numbers, maybe "GJ-05-1234" (Old format)
          // Let's just append
          formatted = `${part1}-${part2}-${remainder}`;
        }
      }
    }

    setFormData(prev => ({ ...prev, licensePlate: formatted }));
  };

  const renderSectionHeader = (title: string, section: keyof typeof sections) => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => toggleSection(section)}
      activeOpacity={0.7}
    >
      <Text style={styles.sectionHeaderText}>{title}</Text>
      {sections[section] ? (
        <ChevronUp size={20} color="#000" />
      ) : (
        <ChevronDown size={20} color="#000" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* CUSTOMER SECTION */}
          <View style={[styles.card, { zIndex: 10 }]}>
            {renderSectionHeader('Customer:', 'customer')}
            {sections.customer && (
              <View style={styles.sectionBody}>
                <View style={[styles.inputSearchWrapper, { zIndex: 200 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Search or add customer"
                    placeholderTextColor="#9ca3af"
                    value={formData.customerName}
                    onChangeText={text => {
                      setFormData({ ...formData, customerName: text });
                      setShowCustomerDropdown(true);
                    }}
                    onFocus={() => {
                      setShowCustomerDropdown(true);
                      // If empty, ensure we show the list
                      if (!formData.customerName) setFilteredCustomers(customers);
                    }}
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  <TouchableOpacity
                    style={styles.inputInnerIcon}
                    onPress={() => navigation.navigate('CreateCustomer')}
                  >
                    <Plus size={20} color="#9ca3af" />
                  </TouchableOpacity>

                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
                        {filteredCustomers.map((customer) => (
                          <TouchableOpacity
                            key={customer.id}
                            style={styles.dropdownItem}
                            onPress={() => handleCustomerSelect(customer)}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <User size={16} color="#6b7280" style={{ marginRight: 8 }} />
                              <View>
                                <Text style={styles.dropdownItemText}>{customer.full_name}</Text>
                                <Text style={styles.dropdownSubtext}>{customer.phone}</Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <Text style={styles.fieldLabel}>Customer Number:</Text>
                <View style={styles.inputSearchWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Search or add number"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={text => setFormData({ ...formData, phone: text })}
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                </View>
              </View>
            )}
          </View>

          {/* VEHICLE DETAILS SECTION */}
          <View style={[styles.card, { zIndex: 5 }]}>
            {renderSectionHeader('Vehicle Details:', 'vehicle')}
            {sections.vehicle && (
              <View style={styles.sectionBody}>
                <Text style={styles.fieldLabel}>Vehicle Brand</Text>
                <TextInput
                  style={styles.input}
                  placeholder="enter details"
                  placeholderTextColor="#9ca3af"
                  value={formData.brand}
                  onChangeText={text => setFormData({ ...formData, brand: text })}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />

                <Text style={styles.fieldLabel}>Vehicle Model</Text>
                <TextInput
                  style={styles.input}
                  placeholder="enter details"
                  placeholderTextColor="#9ca3af"
                  value={formData.model}
                  onChangeText={text => setFormData({ ...formData, model: text })}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />

                <Text style={styles.fieldLabel}>Vehicle License Plate</Text>
                <TextInput
                  style={styles.input}
                  placeholder="GJ-01-AB-1234"
                  placeholderTextColor="#9ca3af"
                  value={formData.licensePlate}
                  onChangeText={formatLicensePlate}
                  maxLength={13} // Reasonable max length even with dashes
                  autoCapitalize="characters"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
              </View>
            )}
          </View>

          {/* SERVICES SECTION */}
          <View style={[styles.card, { zIndex: 3 }]}>
            {renderSectionHeader('Services:', 'services')}
            {sections.services && (
              <View style={styles.sectionBody}>
                <Text style={styles.fieldLabel}>Odometer Reading</Text>
                <TextInput
                  style={styles.input}
                  placeholder="enter odometer reading"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  value={formData.odometer}
                  onChangeText={text => setFormData({ ...formData, odometer: text })}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />

                {/* Selected Services List */}
                {selectedServices.map(service => (
                  <View key={service.id} style={[styles.selectedServiceItem, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceMeta}>
                        Estimate Cost: ₹{service.cost} Estimate Time: {service.time}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity
                        onPress={() => handleDeleteService(service.id)}
                        style={{ padding: 8, marginRight: 4 }}
                      >
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleEditService(service)}
                        style={{ padding: 8 }}
                      >
                        <Pencil size={18} color="#4b5563" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                <Text style={styles.fieldLabel}>Service Details</Text>
                <View style={[styles.inputSearchWrapper, { marginTop: 4, marginBottom: 4, zIndex: 100 }]}>
                  <TextInput
                    style={[styles.input, { marginBottom: 8 }]}
                    placeholder="select service"
                    placeholderTextColor="#9ca3af"
                    value={newServiceName}
                    onChangeText={(text) => {
                      setNewServiceName(text);
                      setShowServiceDropdown(true);
                    }}
                    onTouchEnd={() => setShowServiceDropdown(!showServiceDropdown)}
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />

                  {showServiceDropdown && filteredServices.length > 0 && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView
                        style={{ maxHeight: 200 }}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        persistentScrollbar={true}
                        showsVerticalScrollIndicator={true}
                      >
                        {filteredServices.map((service, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setNewServiceName(service);
                              setShowServiceDropdown(false);
                              // Optional: Immediately trigger focus or just let the user click '+'
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{service}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                <View style={[styles.estimateRow, { marginTop: 0 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Estimate:</Text>
                    <Text style={[styles.fieldLabel, { marginTop: 4, fontWeight: '400' }]}>Time</Text>
                    <View style={styles.timeInputs}>
                      <TextInput
                        style={[styles.input, { flex: 1, marginRight: 8 }]}
                        placeholder="Hour"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={newEstimateHour}
                        onChangeText={setNewEstimateHour}
                        onSubmitEditing={() => Keyboard.dismiss()}
                      />
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Minute"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={newEstimateMin}
                        onChangeText={setNewEstimateMin}
                        onSubmitEditing={() => Keyboard.dismiss()}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.costRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Cost:</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Cost"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      value={newCost}
                      onChangeText={setNewCost}
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.addServiceButton}
                    onPress={() => handleAddService()}
                  >
                    <Text style={styles.addServiceButtonText}>add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* ADDRESS SECTION */}
          <View style={[styles.card, { zIndex: 1 }]}>
            {renderSectionHeader('Address:', 'address')}
            {sections.address && (
              <View style={styles.sectionBody}>
                <Text style={styles.fieldLabel}>Pick-up Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="enter address"
                  placeholderTextColor="#9ca3af"
                  value={formData.pickupAddress}
                  onChangeText={text => setFormData({ ...formData, pickupAddress: text })}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />

                <Text style={styles.fieldLabel}>Drop-off Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="enter address"
                  placeholderTextColor="#9ca3af"
                  value={formData.dropoffAddress}
                  onChangeText={text => setFormData({ ...formData, dropoffAddress: text })}
                  onSubmitEditing={() => Keyboard.dismiss()}
                />

                <Text style={styles.fieldLabel}>Delivery Date</Text>

                {/* Quick Date Select Chips */}
                <View style={styles.quickDateRow}>
                  <TouchableOpacity
                    style={styles.dateChip}
                    onPress={() => {
                      const d = new Date();
                      const str = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
                      setFormData({ ...formData, deliveryDate: str });
                    }}
                  >
                    <Text style={styles.dateChipText}>Today</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateChip}
                    onPress={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      const str = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
                      setFormData({ ...formData, deliveryDate: str });
                    }}
                  >
                    <Text style={styles.dateChipText}>Tomorrow</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dateChip}
                    onPress={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      const str = `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
                      setFormData({ ...formData, deliveryDate: str });
                    }}
                  >
                    <Text style={styles.dateChipText}>+7 Days</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.input}
                  placeholder="enter delivery date (DD-MM-YYYY)"
                  placeholderTextColor="#9ca3af"
                  value={formData.deliveryDate}
                  onChangeText={handleDateChange}
                  maxLength={10}
                  keyboardType="numeric"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />

                <Text style={styles.fieldLabel}>Delivery Time</Text>

                {/* Time Input Trigger */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowTimePicker(!showTimePicker)}
                >
                  <View pointerEvents="none">
                    <TextInput
                      style={[styles.input, showTimePicker && { borderColor: '#578fbe', borderWidth: 2 }]}
                      placeholder="tap to select time"
                      placeholderTextColor="#9ca3af"
                      value={formData.deliveryTime}
                      editable={false} // Disable typing, force picker
                    />
                  </View>
                </TouchableOpacity>

                {/* Custom Wheel Picker */}
                {showTimePicker && (
                  <View style={styles.timePickerContainer}>
                    <View style={styles.pickerColumnsContainer}>
                      {/* Hours Column */}
                      <View style={styles.pickerColumn}>
                        <Text style={styles.pickerColumnLabel}>Hour</Text>
                        <ScrollView showsVerticalScrollIndicator={false} style={styles.columnScroll}>
                          {HOURS.map((h) => (
                            <TouchableOpacity
                              key={h}
                              style={[styles.pickerItem, tempHour === h && styles.pickerItemActive]}
                              onPress={() => setTempHour(h)}
                            >
                              <Text style={[styles.pickerItemText, tempHour === h && styles.pickerItemTextActive]}>{h}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>

                      {/* Divider */}
                      <Text style={styles.pickerDivider}>:</Text>

                      {/* Minutes Column */}
                      <View style={styles.pickerColumn}>
                        <Text style={styles.pickerColumnLabel}>Min</Text>
                        <ScrollView showsVerticalScrollIndicator={false} style={styles.columnScroll}>
                          {MINUTES.map((m) => (
                            <TouchableOpacity
                              key={m}
                              style={[styles.pickerItem, tempMinute === m && styles.pickerItemActive]}
                              onPress={() => setTempMinute(m)}
                            >
                              <Text style={[styles.pickerItemText, tempMinute === m && styles.pickerItemTextActive]}>{m}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>

                      {/* Divider */}
                      <View style={{ width: 10 }} />

                      {/* AM/PM Column */}
                      <View style={styles.pickerColumn}>
                        <Text style={styles.pickerColumnLabel}>MD</Text>
                        <ScrollView showsVerticalScrollIndicator={false} style={styles.columnScroll}>
                          {AMPM.map((ap) => (
                            <TouchableOpacity
                              key={ap}
                              style={[styles.pickerItem, tempAmPm === ap && styles.pickerItemActive]}
                              onPress={() => setTempAmPm(ap as 'AM' | 'PM')}
                            >
                              <Text style={[styles.pickerItemText, tempAmPm === ap && styles.pickerItemTextActive]}>{ap}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.pickerConfirmButton} onPress={handleTimeSelect}>
                      <Text style={styles.pickerConfirmText}>Set Time</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* PRIORITY TOGGLE */}
          <View style={styles.priorityContainer}>
            <View style={styles.priorityToggle}>
              <TouchableOpacity
                style={[styles.priorityOption, priority === 'Normal' && styles.priorityActive]}
                onPress={() => setPriority('Normal')}
              >
                <Text style={[styles.priorityText, priority === 'Normal' && styles.priorityTextActive]}>Normal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.priorityOption, priority === 'Urgent' && styles.priorityActive]}
                onPress={() => setPriority('Urgent')}
              >
                <Text style={[styles.priorityText, priority === 'Urgent' && styles.priorityTextActive]}>Urgent</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionBody: {
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    marginBottom: 16,
  },
  inputSearchWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  inputInnerIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  estimateRow: {
    marginTop: 8,
  },
  timeInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  addServiceButton: {
    backgroundColor: '#578fbe',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  addServiceButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedServiceItem: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#94a3b8',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  serviceMeta: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  priorityContainer: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  priorityToggle: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 25,
  },
  priorityActive: {
    backgroundColor: '#578fbe',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  priorityTextActive: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#4a85b2',
    borderRadius: 50,
    paddingVertical: 12,
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 60,
    borderWidth: 2,
    borderColor: '#2b5a80',
    marginTop: 10,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#000',
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dateChip: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  dateChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  timePickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginTop: -8,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickerColumnsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    height: 150, // Fixed height for scrolling
  },
  pickerColumn: {
    width: 60,
    alignItems: 'center',
    height: '100%',
  },
  pickerColumnLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  columnScroll: {
    width: '100%',
  },
  pickerItem: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  pickerItemActive: {
    backgroundColor: '#578fbe',
  },
  pickerItemText: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '400',
  },
  pickerItemTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pickerDivider: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginHorizontal: 8,
    paddingBottom: 20, // Align with list center approx
  },
  pickerConfirmButton: {
    backgroundColor: '#10b981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dropdownSubtext: {
    fontSize: 12,
    color: '#6b7280',
  }
});
