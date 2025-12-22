// ============================================
// INVENTORY MANAGEMENT SCREEN (Company Admin)
// ============================================

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Alert, TextInput, Modal, Platform, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
// Removed SafeAreaView import
import {
  Package,
  Search,
  Plus,
  X,
  Check,
  AlertCircle,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Layers,
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { InventoryService } from '@/services/inventory.service';
import {
  InventoryItemWithStock,
  InventoryCategory,
  StockStatus,
} from '@/types';

// Types
type CategoryFilter = 'all' | string;
type StockFilter = 'all' | 'low' | 'out';

export default function InventoryScreen() {
  const { theme } = useTheme();
  // State
  const [inventory, setInventory] = useState<InventoryItemWithStock[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [showModal, setShowModal] = useState(false);
  const [showValueModal, setShowValueModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemWithStock | null>(null);
  const [saving, setSaving] = useState(false);

  // User context
  const [companyId, setCompanyId] = useState<string>('');
  const [branchId, setBranchId] = useState<string | undefined>();

  // Form State
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category_id: '',
    quantity: '',
    low_stock_threshold: '',
    unit_price: '',
    unit: 'piece',
    description: '',
  });

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  // Load user profile to get company_id and branch_id
  const loadUserProfile = useCallback(async () => {
    try {
      if (!supabase) {
        console.error('Supabase client not initialized');
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user found');
        setLoading(false);
        return;
      }

      console.log('Loading profile for user:', user.id);

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle missing profile

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        Alert.alert(
          'Profile Not Found',
          'Your user profile is missing. Please contact support or run the fix_missing_profile.sql script.'
        );
        setLoading(false);
        return;
      }

      if (!profile) {
        console.error('No profile found for user');
        Alert.alert(
          'Profile Not Found',
          'Your user profile does not exist. Please run the fix_missing_profile.sql script in Supabase.'
        );
        setLoading(false);
        return;
      }

      console.log('User profile:', profile);

      // Check if user has a branch assigned
      if (profile?.branch_id) {
        // Fetch branch to get company_id
        const { data: branch, error: branchError } = await supabase
          .from('branches')
          .select('company_id')
          .eq('id', profile.branch_id)
          .single();

        if (branchError) {
          console.error('Error fetching branch:', branchError);
        } else if (branch) {
          console.log('User has branch, company_id:', branch.company_id);
          setCompanyId(branch.company_id);
          setBranchId(profile.branch_id);
          return; // Exit early, we have what we need
        }
      }

      // User has no branch or branch fetch failed - try to get company_id directly
      console.log('User has no branch assigned, fetching first company');
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single();

      if (company) {
        console.log('Using company_id:', company.id);
        setCompanyId(company.id);
        // No branch_id - will show all inventory across all branches
      } else {
        console.error('No company found in database');
        Alert.alert(
          'Setup Required',
          'No company found. Please create a company and branch first.'
        );
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading user profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
      setLoading(false);
    }
  }, []);

  // Load inventory data
  const loadInventoryData = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      const items = await InventoryService.getInventoryItems(companyId, branchId);
      const sortedItems = InventoryService.sortByStockPriority(items);
      setInventory(sortedItems);
    } catch (error) {
      console.error('Error loading inventory:', error);
      Alert.alert('Error', 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }, [companyId, branchId]);

  // Load categories
  const loadCategories = useCallback(async () => {
    if (!companyId) return;

    try {
      const cats = await InventoryService.getCategories(companyId);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, [companyId]);

  // Initial load
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  useEffect(() => {
    if (companyId) {
      loadInventoryData();
      loadCategories();
    }
  }, [companyId, loadInventoryData, loadCategories]);

  // Filtered and Sorted Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      // Category filter
      const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;

      // Search filter
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());

      // Stock status filter
      let matchesStockFilter = true;
      if (stockFilter === 'low') {
        matchesStockFilter = item.stock_status === 'low_stock';
      } else if (stockFilter === 'out') {
        matchesStockFilter = item.stock_status === 'out_of_stock';
      }

      return matchesCategory && matchesSearch && matchesStockFilter;
    });
  }, [inventory, selectedCategory, searchQuery, stockFilter]);

  // Stock Status Helper
  const getStockStatusDisplay = (status: StockStatus) => {
    switch (status) {
      case 'out_of_stock':
        return { label: 'Out of Stock', color: '#EF4444', bgColor: '#FEE2E2' };
      case 'low_stock':
        return { label: 'Low Stock', color: '#F59E0B', bgColor: '#FEF3C7' };
      case 'in_stock':
        return { label: 'In Stock', color: '#10B981', bgColor: '#D1FAE5' };
    }
  };

  // Handlers
  const openAddModal = () => {
    setEditingItem(null);
    setForm({
      name: '',
      sku: '',
      category_id: categories[0]?.id || '',
      quantity: '',
      low_stock_threshold: '10',
      unit_price: '',
      unit: 'piece',
      description: '',
    });
    setShowModal(true);
  };

  const openEditModal = (item: InventoryItemWithStock) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      sku: item.sku,
      category_id: item.category_id || '',
      quantity: item.stock_quantity.toString(),
      low_stock_threshold: item.low_stock_threshold.toString(),
      unit_price: item.unit_price.toString(),
      unit: item.unit,
      description: item.description || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    // Validation
    if (!form.name.trim() || !form.sku.trim() || !form.unit_price) {
      Alert.alert('Required Fields', 'Please fill in Name, SKU, and Price.');
      return;
    }

    if (!companyId) {
      Alert.alert('Error', 'Company information not found');
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        // Update existing item
        await InventoryService.updateInventoryItem(editingItem.id, {
          name: form.name,
          sku: form.sku,
          category_id: form.category_id || undefined,
          unit_price: parseFloat(form.unit_price),
          low_stock_threshold: parseInt(form.low_stock_threshold) || 10,
          unit: form.unit,
          description: form.description,
        });

        // Update stock if quantity changed
        const newQuantity = parseInt(form.quantity) || 0;
        if (newQuantity !== editingItem.stock_quantity && branchId) {
          await InventoryService.recordTransaction({
            item_id: editingItem.id,
            branch_id: branchId,
            type: 'ADJUST',
            quantity: newQuantity,
            notes: 'Manual adjustment from edit',
          });
        }

        Alert.alert('Success', 'Item updated successfully.');
      } else {
        // Add new item
        await InventoryService.createInventoryItem({
          company_id: companyId,
          category_id: form.category_id || undefined,
          name: form.name,
          sku: form.sku,
          unit_price: parseFloat(form.unit_price),
          low_stock_threshold: parseInt(form.low_stock_threshold) || 10,
          unit: form.unit,
          description: form.description,
          initial_quantity: parseInt(form.quantity) || 0,
          branch_id: branchId,
        });

        Alert.alert('Success', 'Item added successfully.');
      }

      setShowModal(false);
      await loadInventoryData();
    } catch (error: any) {
      console.error('Error saving item:', error);
      Alert.alert('Error', error.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInventoryData();
    await loadCategories();
    setRefreshing(false);
  };

  const openCategoryModal = () => {
    setCategoryForm({ name: '', description: '' });
    setShowCategoryModal(true);
    setShowAddMenu(false);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      Alert.alert('Required Field', 'Please enter a category name.');
      return;
    }

    if (!companyId) {
      Alert.alert('Error', 'Company information not found');
      return;
    }

    setSaving(true);
    try {
      await InventoryService.createCategory(
        companyId,
        categoryForm.name,
        categoryForm.description || undefined
      );

      Alert.alert('Success', 'Category added successfully.');
      setShowCategoryModal(false);
      await loadCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      Alert.alert('Error', error.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const lowStock = inventory.filter(item => item.stock_status === 'low_stock').length;
    const outOfStock = inventory.filter(item => item.stock_status === 'out_of_stock').length;
    const totalValue = inventory.reduce((sum, item) => sum + item.total_value, 0);

    return { totalItems, lowStock, outOfStock, totalValue };
  }, [inventory]);

  // Category options for filter
  const categoryOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Items', color: '#6B7280' },
      ...categories.map(cat => ({
        value: cat.id,
        label: cat.name,
        color: theme.primary,
      })),
    ];
  }, [categories]);

  if (loading && inventory.length === 0) {
    return (
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text className="mt-4" style={{ color: theme.textMuted }}>Loading inventory...</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => setShowAddMenu(false)}>
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        {/* Search Bar */}
        <View className="px-4 py-2">
          <View className="flex-row items-center gap-2.5">
            {/* Search Input */}
            <View className="flex-1 flex-row items-center rounded-lg px-3" style={{ backgroundColor: theme.surface }}>
              <Search size={18} color={theme.textMuted} />
              <TextInput
                className="flex-1 ml-2.5 text-base"
                placeholder="Search inventory..."
                placeholderTextColor={theme.textMuted}
                style={{ color: theme.text }}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Add Button with Menu */}
            <View>
              <TouchableOpacity
                onPress={() => setShowAddMenu(!showAddMenu)}
                className="w-10 h-10 rounded-lg items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Plus size={20} color="white" />
              </TouchableOpacity>

              {/* Dropdown Menu */}
              {showAddMenu && (
                <View
                  className="absolute top-12 right-0 rounded-lg shadow-lg z-50"
                  style={{
                    minWidth: 180,
                    backgroundColor: theme.surface,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      openAddModal();
                      setShowAddMenu(false);
                    }}
                    className="flex-row items-center px-4 py-3 border-b"
                    style={{ borderBottomColor: theme.border }}
                  >
                    <Package size={18} color={theme.primary} />
                    <Text className="ml-3 text-base" style={{ color: theme.text }}>Add Item</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={openCategoryModal}
                    className="flex-row items-center px-4 py-3"
                  >
                    <Layers size={18} color={theme.primary} />
                    <Text className="ml-3 text-base" style={{ color: theme.text }}>Add Category</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View className="px-4 pb-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
            {/* Total Items Card */}
            <TouchableOpacity
              onPress={() => setStockFilter('all')}
              className="rounded-xl p-4 min-w-[140px]"
              style={{
                backgroundColor: theme.surface,
                borderWidth: 2,
                borderColor: stockFilter === 'all' ? theme.primary : 'transparent',
              }}
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm" style={{ color: theme.textMuted }}>Total Items</Text>
                <Package size={18} color={theme.primary} />
              </View>
              <Text className="text-2xl font-bold" style={{ color: theme.text }}>{stats.totalItems}</Text>
            </TouchableOpacity>

            {/* Low Stock Card */}
            <TouchableOpacity
              onPress={() => setStockFilter('low')}
              className="rounded-xl p-4 min-w-[140px]"
              style={{
                backgroundColor: theme.surface,
                borderWidth: 2,
                borderColor: stockFilter === 'low' ? '#F59E0B' : 'transparent',
              }}
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm" style={{ color: theme.textMuted }}>Low Stock</Text>
                <TrendingDown size={18} color="#F59E0B" />
              </View>
              <Text className="text-2xl font-bold" style={{ color: '#F59E0B' }}>{stats.lowStock}</Text>
            </TouchableOpacity>

            {/* Out of Stock Card */}
            <TouchableOpacity
              onPress={() => setStockFilter('out')}
              className="rounded-xl p-4 min-w-[140px]"
              style={{
                backgroundColor: theme.surface,
                borderWidth: 2,
                borderColor: stockFilter === 'out' ? '#EF4444' : 'transparent',
              }}
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm" style={{ color: theme.textMuted }}>Out of Stock</Text>
                <AlertCircle size={18} color="#EF4444" />
              </View>
              <Text className="text-2xl font-bold" style={{ color: '#EF4444' }}>{stats.outOfStock}</Text>
            </TouchableOpacity>

            {/* Total Value Card */}
            <TouchableOpacity
              onPress={() => setShowValueModal(true)}
              className="rounded-xl p-4 min-w-[140px]"
              style={{ backgroundColor: theme.surface }}
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm" style={{ color: theme.textMuted }}>Total Value</Text>
                <DollarSign size={18} color="#10B981" />
              </View>
              <Text className="text-2xl font-bold" style={{ color: '#10B981' }}>₹{stats.totalValue.toFixed(0)}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Category Filter */}
        <View className="px-4 pb-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {categoryOptions.map(cat => {
              const isSelected = selectedCategory === cat.value;
              return (
                <TouchableOpacity
                  key={cat.value}
                  onPress={() => setSelectedCategory(cat.value)}
                  className="px-4 py-2 rounded-full border"
                  style={{
                    backgroundColor: isSelected ? cat.color : theme.surface,
                    borderColor: isSelected ? cat.color : theme.border,
                  }}
                >
                  <Text
                    className={`text-sm font-medium ${isSelected ? 'text-white' : ''}`}
                    style={{ color: isSelected ? '#FFFFFF' : theme.text }}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Inventory List */}
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {filteredInventory.map(item => {
            const stockStatus = getStockStatusDisplay(item.stock_status);

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => openEditModal(item)}
                className="rounded-xl p-4 mb-3 flex-row items-center justify-between"
                style={{
                  backgroundColor: theme.surface,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                {/* Left: Category Icon + Info */}
                <View className="flex-row items-center flex-1">
                  {/* Category Icon */}
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: theme.tabIconBg }}
                  >
                    <Package size={24} color={theme.primary} />
                  </View>

                  {/* Info */}
                  <View className="flex-1">
                    <Text className="font-semibold text-base" style={{ color: theme.text }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text className="text-sm" style={{ color: theme.textMuted }} numberOfLines={1}>
                      SKU: {item.sku} • {item.stock_quantity} {item.unit}
                    </Text>
                  </View>
                </View>

                {/* Right: Stock Status Icon (Only for Low/Out of Stock) */}
                {item.stock_status !== 'in_stock' && (
                  <View className="items-center justify-center" style={{ minWidth: 40 }}>
                    {item.stock_status === 'low_stock' && (
                      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: stockStatus.bgColor }}>
                        <AlertTriangle size={20} color={stockStatus.color} strokeWidth={2.5} />
                      </View>
                    )}
                    {item.stock_status === 'out_of_stock' && (
                      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: stockStatus.bgColor }}>
                        <AlertCircle size={20} color={stockStatus.color} strokeWidth={2.5} />
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Empty State */}
          {!loading && filteredInventory.length === 0 && (
            <View className="items-center py-12">
              <Package size={48} color="#E5E7EB" />
              <Text className="mt-4 text-center" style={{ color: theme.textMuted }}>
                {searchQuery || selectedCategory !== 'all' ? 'No matching items found' : 'No inventory items yet'}
              </Text>
              {(searchQuery || selectedCategory !== 'all') && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-3"
                >
                  <Text className="text-blue-600 font-medium">Clear filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>

        {/* Value Breakdown Modal */}
        <Modal visible={showValueModal} animationType="slide" presentationStyle="pageSheet">
          <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View className="px-6 py-4 border-b flex-row justify-between items-center" style={{ borderBottomColor: theme.border }}>
              <Text className="text-xl font-bold" style={{ color: theme.text }}>Inventory Value Breakdown</Text>
              <TouchableOpacity onPress={() => setShowValueModal(false)} className="p-2 rounded-full" style={{ backgroundColor: theme.surfaceAlt }}>
                <X size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Grand Total Card */}
            <View className="px-6 py-4">
              <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200" style={{ backgroundColor: '#D1FAE5' }}>
                <Text className="text-sm font-medium" style={{ color: '#047857' }}>Grand Total Value</Text>
                <Text className="text-4xl font-bold mt-2" style={{ color: '#059669' }}>₹{stats.totalValue.toFixed(2)}</Text>
                <Text className="text-xs mt-1" style={{ color: '#059669' }}>{inventory.length} items in inventory</Text>
              </View>
            </View>

            {/* Item List */}
            <ScrollView className="flex-1 px-6">
              <Text className="text-sm font-semibold mb-3" style={{ color: theme.textMuted }}>Item Breakdown</Text>
              {inventory.map((item) => {
                const itemTotal = item.total_value;
                return (
                  <View
                    key={item.id}
                    className="rounded-xl p-4 mb-3"
                    style={{
                      backgroundColor: theme.surface,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="font-semibold text-base" style={{ color: theme.text }}>{item.name}</Text>
                        <Text className="text-xs" style={{ color: theme.textMuted }}>SKU: {item.sku}</Text>
                      </View>
                      <Text className="text-lg font-bold" style={{ color: '#10B981' }}>₹{itemTotal.toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between items-center pt-2 border-t" style={{ borderTopColor: theme.border }}>
                      <View className="flex-row gap-4">
                        <View>
                          <Text className="text-xs" style={{ color: theme.textMuted }}>Quantity</Text>
                          <Text className="text-sm font-semibold" style={{ color: theme.text }}>{item.stock_quantity} {item.unit}</Text>
                        </View>
                        <View>
                          <Text className="text-xs" style={{ color: theme.textMuted }}>Price/Unit</Text>
                          <Text className="text-sm font-semibold" style={{ color: theme.text }}>₹{item.unit_price.toFixed(2)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
              <View className="h-6" />
            </ScrollView>
          </View>
        </Modal>

        {/* Add/Edit Modal */}
        <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
          <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View className="px-6 py-4 border-b flex-row justify-between items-center" style={{ borderBottomColor: theme.border }}>
              <Text className="text-xl font-bold" style={{ color: theme.text }}>
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)} className="p-2 rounded-full" style={{ backgroundColor: theme.surfaceAlt }}>
                <X size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 py-6" keyboardShouldPersistTaps="handled">
              {/* Item Name */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-1.5" style={{ color: theme.text }}>Item Name *</Text>
                <View className="flex-row items-center border rounded-xl px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                  <Package size={20} color={theme.textMuted} />
                  <TextInput
                    className="flex-1 ml-2.5 text-base"
                    placeholder="e.g., Engine Oil (5W-30)"
                    placeholderTextColor={theme.textMuted}
                    style={{ color: theme.text }}
                    value={form.name}
                    onChangeText={(text) => setForm({ ...form, name: text })}
                  />
                </View>
              </View>

              {/* SKU */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-1.5" style={{ color: theme.text }}>SKU *</Text>
                <View className="flex-row items-center border rounded-xl px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                  <Layers size={20} color={theme.textMuted} />
                  <TextInput
                    className="flex-1 ml-2.5 text-base"
                    placeholder="e.g., OIL-5W30-001"
                    placeholderTextColor={theme.textMuted}
                    style={{ color: theme.text }}
                    value={form.sku}
                    onChangeText={(text) => setForm({ ...form, sku: text })}
                  />
                </View>
              </View>

              {/* Category */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-1.5" style={{ color: theme.text }}>Category</Text>
                <View className="border rounded-xl" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-2 py-2">
                    {categories.map(cat => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setForm({ ...form, category_id: cat.id })}
                        className="px-4 py-2 rounded-full mr-2"
                        style={{
                          backgroundColor: form.category_id === cat.id ? theme.primary : theme.surfaceAlt,
                        }}
                      >
                        <Text style={{ color: form.category_id === cat.id ? 'white' : theme.text }}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Quantity */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-1.5" style={{ color: theme.text }}>Quantity</Text>
                <View className="flex-row items-center border rounded-xl px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                  <TextInput
                    className="flex-1 text-base"
                    placeholder="0"
                    placeholderTextColor={theme.textMuted}
                    style={{ color: theme.text }}
                    keyboardType="numeric"
                    value={form.quantity}
                    onChangeText={(text) => setForm({ ...form, quantity: text })}
                  />
                </View>
              </View>

              {/* Unit Price */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-1.5" style={{ color: theme.text }}>Unit Price (₹) *</Text>
                <View className="flex-row items-center border rounded-xl px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                  <DollarSign size={20} color={theme.textMuted} />
                  <TextInput
                    className="flex-1 ml-2.5 text-base"
                    placeholder="0.00"
                    placeholderTextColor={theme.textMuted}
                    style={{ color: theme.text }}
                    keyboardType="decimal-pad"
                    value={form.unit_price}
                    onChangeText={(text) => setForm({ ...form, unit_price: text })}
                  />
                </View>
              </View>

              {/* Unit */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-1.5" style={{ color: theme.text }}>Unit</Text>
                <View className="border rounded-xl" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-2 py-2">
                    {['piece', 'liter', 'set', 'bottle', 'can', 'tube', 'pair'].map(unit => (
                      <TouchableOpacity
                        key={unit}
                        onPress={() => setForm({ ...form, unit })}
                        className="px-4 py-2 rounded-full mr-2"
                        style={{
                          backgroundColor: form.unit === unit ? theme.primary : theme.surfaceAlt,
                        }}
                      >
                        <Text style={{ color: form.unit === unit ? 'white' : theme.text }}>
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Low Stock Threshold */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-1.5" style={{ color: theme.text }}>Low Stock Threshold</Text>
                <View className="flex-row items-center border rounded-xl px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                  <AlertTriangle size={20} color={theme.textMuted} />
                  <TextInput
                    className="flex-1 ml-2.5 text-base"
                    placeholder="10"
                    placeholderTextColor={theme.textMuted}
                    style={{ color: theme.text }}
                    keyboardType="numeric"
                    value={form.low_stock_threshold}
                    onChangeText={(text) => setForm({ ...form, low_stock_threshold: text })}
                  />
                </View>
              </View>

              {/* Description */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-1.5" style={{ color: theme.text }}>Description</Text>
                <View className="border rounded-xl px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                  <TextInput
                    className="text-base"
                    placeholder="Optional description..."
                    placeholderTextColor={theme.textMuted}
                    style={{ color: theme.text }}
                    multiline
                    numberOfLines={3}
                    value={form.description}
                    onChangeText={(text) => setForm({ ...form, description: text })}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View className="px-6 py-4 border-t border-gray-100">
              <TouchableOpacity
                onPress={handleSave}
                disabled={saving}
                className="rounded-xl py-4 items-center"
                style={{ backgroundColor: saving ? theme.textMuted : theme.primary }}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Category Modal */}
        <Modal visible={showCategoryModal} animationType="slide" presentationStyle="pageSheet">
          <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View className="px-6 py-4 border-b flex-row justify-between items-center" style={{ borderBottomColor: theme.border }}>
              <Text className="text-xl font-bold" style={{ color: theme.text }}>Add New Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)} className="p-2 rounded-full" style={{ backgroundColor: theme.surfaceAlt }}>
                <X size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 py-6" keyboardShouldPersistTaps="handled">
              {/* Category Name */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-1.5" style={{ color: theme.text }}>Category Name *</Text>
                <View className="flex-row items-center border rounded-xl px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                  <Layers size={20} color={theme.textMuted} />
                  <TextInput
                    className="flex-1 ml-2.5 text-base"
                    placeholder="e.g., Engine Parts"
                    placeholderTextColor={theme.textMuted}
                    style={{ color: theme.text }}
                    value={categoryForm.name}
                    onChangeText={(text) => setCategoryForm({ ...categoryForm, name: text })}
                  />
                </View>
              </View>

              {/* Description */}
              <View className="mb-4">
                <Text className="text-sm font-medium mb-1.5" style={{ color: theme.text }}>Description</Text>
                <View className="border rounded-xl px-4 py-3" style={{ borderColor: theme.border, backgroundColor: theme.surface }}>
                  <TextInput
                    className="text-base"
                    placeholder="Optional description..."
                    placeholderTextColor={theme.textMuted}
                    style={{ color: theme.text }}
                    multiline
                    numberOfLines={3}
                    value={categoryForm.description}
                    onChangeText={(text) => setCategoryForm({ ...categoryForm, description: text })}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Save Button */}
            <View className="px-6 py-4 border-t border-gray-100">
              <TouchableOpacity
                onPress={handleSaveCategory}
                disabled={saving}
                className="rounded-xl py-4 items-center"
                style={{ backgroundColor: saving ? '#9CA3AF' : '#3B82F6' }}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-base">Add Category</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}