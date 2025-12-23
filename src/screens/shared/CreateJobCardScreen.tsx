// ============================================
// CREATE JOB CARD SCREEN (Premium Redesign)
// ============================================

import React, { useState } from 'react';
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
import { ChevronDown, ChevronUp, Plus, Menu, Search, MapPin, Pencil, Trash2 } from 'lucide-react-native';
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

const STATIC_CUSTOMERS = [
  {
    name: 'Ahmed Raza',
    phone: '9876543210',
    brand: 'Toyota',
    model: 'Camry',
    licensePlate: 'ABC-1234',
  },
  {
    name: 'John Doe',
    phone: '1234567890',
    brand: 'Honda',
    model: 'Civic',
    licensePlate: 'XYZ-5678',
  },
  {
    name: 'Jane Smith',
    phone: '5551234444',
    brand: 'Ford',
    model: 'Mustang',
    licensePlate: 'FAST-99',
  },
  {
    name: 'Sara Khan',
    phone: '9988776655',
    brand: 'Maruti',
    model: 'Swift',
    licensePlate: 'DL-01-AB-1234',
  },
];

export default function CreateJobCardScreen() {
  const navigation = useNavigation<any>();
  const { addJob } = useJobs();

  // State for Accordion Sections
  const [sections, setSections] = useState({
    customer: true,
    vehicle: true,
    services: true,
    address: true,
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
    deliveryTime: '' // Added deliveryTime field
  });

  const [priority, setPriority] = useState<'Normal' | 'Urgent'>('Normal');
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [newEstimateHour, setNewEstimateHour] = useState('');
  const [newEstimateMin, setNewEstimateMin] = useState('');
  const [newCost, setNewCost] = useState('');

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

  const filteredCustomers = STATIC_CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(formData.customerName.toLowerCase())
  );

  const toggleSection = (section: keyof typeof sections) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCustomerSelect = (customer: typeof STATIC_CUSTOMERS[0]) => {
    setFormData({
      ...formData,
      customerName: customer.name,
      phone: customer.phone,
      brand: customer.brand,
      model: customer.model,
      licensePlate: customer.licensePlate,
    });
    setShowCustomerDropdown(false);
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

  const handleSubmit = () => {
    // Basic validation
    if (!formData.customerName || !formData.phone || !formData.brand || !formData.model) {
      Alert.alert('Incomplete Form', 'Please fill in all required fields marked with *');
      return;
    }

    // Validate Delivery Date Format (DD-MM-YYYY)
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (formData.deliveryDate && !dateRegex.test(formData.deliveryDate)) {
      Alert.alert('Invalid Date', 'Please enter delivery date in DD-MM-YYYY format (e.g., 25-12-2025)');
      return;
    }

    // Validate Delivery Time Format (HH:MM AM/PM)
    // Matches 1:00 AM to 12:59 PM (case insensitive)
    const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] [APap][Mm]$/;
    if (formData.deliveryTime && !timeRegex.test(formData.deliveryTime)) {
      Alert.alert('Invalid Time', 'Please enter delivery time in HH:MM AM/PM format (e.g., 5:00 PM)');
      return;
    }

    const totalCost = selectedServices.reduce((sum, s) => sum + s.cost, 0);

    addJob({
      customer: formData.customerName,
      phone: formData.phone,
      vehicle: `${formData.brand} ${formData.model}`,
      regNo: formData.licensePlate || 'Pending',
      brand: formData.brand,
      model: formData.model,
      odometer: formData.odometer,
      pickupAddress: formData.pickupAddress,
      dropoffAddress: formData.dropoffAddress,
      deliveryDate: formData.deliveryDate,
      deliveryDue: formData.deliveryTime, // Map deliveryTime to deliveryDue
      services: selectedServices.map(s => ({
        name: s.name,
        cost: s.cost,
        estimate: s.time
      })),
      amount: `₹${totalCost.toLocaleString()}`,
      status: 'Pending',
      priority: priority,
    });

    Alert.alert(
      'Success',
      'Job Card created successfully!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
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
    <SafeAreaView style={styles.container}>
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
                    onFocus={() => setShowCustomerDropdown(true)}
                  />
                  <TouchableOpacity
                    style={styles.inputInnerIcon}
                    onPress={() => navigation.navigate('CreateCustomer')}
                  >
                    <Plus size={20} color="#9ca3af" />
                  </TouchableOpacity>

                  {showCustomerDropdown && filteredCustomers.length > 0 && (
                    <View style={styles.dropdownContainer}>
                      <ScrollView
                        style={{ maxHeight: 200 }}
                        keyboardShouldPersistTaps="handled"
                        nestedScrollEnabled={true}
                        persistentScrollbar={true}
                        showsVerticalScrollIndicator={true}
                      >
                        {filteredCustomers.map((customer, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.dropdownItem}
                            onPress={() => handleCustomerSelect(customer)}
                          >
                            <Text style={styles.dropdownItemText}>{customer.name}</Text>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>
                              {customer.phone} - {customer.brand} {customer.model}
                            </Text>
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
                <Text style={styles.fieldLabel}>Vehicle Brand*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="enter details"
                  placeholderTextColor="#9ca3af"
                  value={formData.brand}
                  onChangeText={text => setFormData({ ...formData, brand: text })}
                />

                <Text style={styles.fieldLabel}>Vehicle Model*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="enter details"
                  placeholderTextColor="#9ca3af"
                  value={formData.model}
                  onChangeText={text => setFormData({ ...formData, model: text })}
                />

                <Text style={styles.fieldLabel}>Vehicle License Plate</Text>
                <TextInput
                  style={styles.input}
                  placeholder="enter license plate"
                  placeholderTextColor="#9ca3af"
                  value={formData.licensePlate}
                  onChangeText={text => setFormData({ ...formData, licensePlate: text })}
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
                      />
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder="Minute"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        value={newEstimateMin}
                        onChangeText={setNewEstimateMin}
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
                />

                <Text style={styles.fieldLabel}>Drop-off Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="enter address"
                  placeholderTextColor="#9ca3af"
                  value={formData.dropoffAddress}
                  onChangeText={text => setFormData({ ...formData, dropoffAddress: text })}
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
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
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
    padding: 16,
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
  }
});
