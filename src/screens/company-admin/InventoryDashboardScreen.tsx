import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    Modal,
    Animated,
    Alert,
    Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth.service';
import { InventoryService } from '@/services/InventoryService';
import { Category, InventoryItem } from '@/types';
import { Package, TrendingDown, AlertCircle, DollarSign, Search, Plus, Layers, Filter, AlertTriangle, Trash2, Edit } from 'lucide-react-native';

export default function InventoryDashboardScreen() {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();
    const { user } = useAuth();
    const companyId = user?.profile?.company_id || user?.profile?.branch_id || '';

    // Data State
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalItems: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
    });

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // UI State
    const [fabMenuVisible, setFabMenuVisible] = useState(false);
    const [valueBreakdownVisible, setValueBreakdownVisible] = useState(false);
    const [addItemModalVisible, setAddItemModalVisible] = useState(false);
    const [addCategoryModalVisible, setAddCategoryModalVisible] = useState(false);

    // Form states
    const [itemName, setItemName] = useState('');
    const [sku, setSku] = useState('');
    const [formCategory, setFormCategory] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [formUnit, setFormUnit] = useState('piece');
    const [lowStockThreshold, setLowStockThreshold] = useState('10');
    const [description, setDescription] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');

    const UNITS = ['piece', 'liter', 'set', 'bottle', 'can', 'box', 'kg', 'meter', 'pair', 'roll'];

    React.useEffect(() => {
        if (companyId) {
            loadData();
        }
    }, [companyId]);

    React.useEffect(() => {
        loadItems();
    }, [selectedCategory, selectedUnit, searchQuery, filterStatus]);

    // ==========================================
    // DATA LOADING FUNCTION
    // ==========================================
    // This function fetches fresh data from Supabase via InventoryService
    const loadData = async () => {
        setLoading(true);
        try {
            // STEP 1: Verify we have a Company ID
            // Without this, we cannot filter data for the specific company
            if (!companyId) {
                console.warn('No company ID found for inventory');
                setLoading(false);
                return;
            }
            const targetId = companyId;

            // STEP 2: Fetch Categories and Stats in parallel for performance
            // InventoryService.getCategories() -> SELECT * FROM inventory_categories WHERE company_id = ...
            // InventoryService.getStats() -> Calculates totals from inventory_items
            const [fetchedCategories, fetchedStats] = await Promise.all([
                InventoryService.getCategories(targetId),
                InventoryService.getStats(targetId),
            ]);
            setCategories(fetchedCategories);
            setStats(fetchedStats);

            // STEP 3: Load the actual item list
            await loadItems();
        } catch (error) {
            console.error('Failed to load inventory data', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // ==========================================
    // ITEM FETCHING FUNCTION
    // ==========================================
    const loadItems = async () => {
        try {
            if (!companyId) return;
            const targetId = companyId;

            // Call Supabase Service with current active filters
            // This builds a query like: 
            // SELECT * FROM inventory_items WHERE company_id = ... AND category_id = ...
            const fetchedItems = await InventoryService.getItems(targetId, {
                categoryId: selectedCategory === 'all' ? null : selectedCategory,
                unit: selectedUnit === 'all' ? null : selectedUnit,
                searchQuery: searchQuery,
                status: filterStatus,
            });
            setItems(fetchedItems);
        } catch (error) {
            console.error('Failed to load items', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleCreateCategory = async () => {
        if (!categoryName.trim()) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }

        setSubmitting(true);
        try {
            if (!companyId) throw new Error('No Company ID');

            if (editingCategory) {
                // Update
                await InventoryService.updateCategory(companyId, editingCategory.id, {
                    name: categoryName,
                    description: categoryDescription,
                });
                Alert.alert('Success', 'Category updated successfully');
            } else {
                // Create
                await InventoryService.createCategory(companyId, {
                    name: categoryName,
                    description: categoryDescription,
                });
                Alert.alert('Success', 'Category created successfully');
            }

            // Reset
            setCategoryName('');
            setCategoryDescription('');
            setEditingCategory(null);

            // Close modal after success to navigate back to inventory
            setAddCategoryModalVisible(false);

            loadData(); // Refresh categories
        } catch (error) {
            console.error('Failed to save category', error);
            Alert.alert('Error', 'Failed to save category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditCategory = (cat: Category) => {
        setEditingCategory(cat);
        setCategoryName(cat.name || '');
        setCategoryDescription(cat.description || '');
    };

    const handleDeleteCategory = async (cat: Category) => {
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete "${cat.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            if (!companyId) throw new Error('No Company Id');
                            await InventoryService.deleteCategory(companyId, cat.id);
                            loadData();
                        } catch (error) {
                            console.error('Failed to delete category', error);
                            Alert.alert('Error', 'Failed to delete category');
                        } finally {
                            setSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    const handleCreateItem = async () => {
        if (!itemName.trim()) {
            Alert.alert('Error', 'Please enter an item name');
            return;
        }
        if (!formCategory) {
            Alert.alert('Error', 'Please select a category');
            return;
        }
        if (!quantity) {
            Alert.alert('Error', 'Please enter quantity');
            return;
        }

        setSubmitting(true);
        try {
            if (!companyId) throw new Error('No Company ID');
            const targetId = companyId;

            if (editingItem) {
                // Update existing item
                await InventoryService.updateItem(targetId, editingItem.id, {
                    name: itemName,
                    sku,
                    category_id: formCategory,
                    quantity: Number(quantity) || 0,
                    unit_price: Number(unitPrice) || 0,
                    unit: formUnit,
                    low_stock_threshold: Number(lowStockThreshold) || 10,
                    description,
                });
                Alert.alert('Success', 'Item updated successfully');
            } else {
                // Create new item
                await InventoryService.createItem(targetId, {
                    name: itemName,
                    sku,
                    category_id: formCategory,
                    quantity: Number(quantity) || 0,
                    unit_price: Number(unitPrice) || 0,
                    unit: formUnit,
                    low_stock_threshold: Number(lowStockThreshold) || 10,
                    description,
                });
                Alert.alert('Success', 'Item added successfully');
            }

            // Reset form
            resetForm();
            setAddItemModalVisible(false);

            loadData(); // Refresh items and stats
        } catch (error) {
            console.error('Failed to save item', error);
            Alert.alert('Error', 'Failed to save item. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setItemName('');
        setSku('');
        setFormCategory('');
        setQuantity('');
        setUnitPrice('');
        setFormUnit('piece');
        setDescription('');
        setEditingItem(null);
    };

    const handleEditItem = (item: InventoryItem) => {
        setEditingItem(item);
        setItemName(item.name || '');
        setSku(item.sku || '');
        setFormCategory(item.category_id || '');
        setQuantity(String(item.quantity || 0));
        setUnitPrice(String(item.unit_price || 0));
        setFormUnit(item.unit || 'piece');
        setLowStockThreshold(String(item.low_stock_threshold || 10));
        setDescription(item.description || '');
        setAddItemModalVisible(true);
    };

    const handleDeleteItem = async () => {
        if (!editingItem) return;

        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setSubmitting(true);
                        try {
                            if (!companyId) throw new Error('No Company ID');
                            await InventoryService.deleteItem(companyId, editingItem.id);
                            Alert.alert('Success', 'Item deleted successfully');
                            setAddItemModalVisible(false);
                            resetForm();
                            loadData();
                        } catch (error) {
                            console.error('Error deleting item:', error);
                            Alert.alert('Error', 'Failed to delete item');
                        } finally {
                            setSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    const toggleFabMenu = () => {
        setFabMenuVisible(!fabMenuVisible);
    };

    const handleAddItem = () => {
        setFabMenuVisible(false);
        setAddItemModalVisible(true);
    };

    const handleAddCategory = () => {
        setFabMenuVisible(false);
        setAddCategoryModalVisible(true);
    };

    const handleTotalValuePress = () => {
        setValueBreakdownVisible(true);
    };

    const getStatusColor = (item: InventoryItem) => {
        const qty = item.quantity || 0;
        const threshold = item.low_stock_threshold || 10;

        if (qty <= 0) return '#EF4444'; // Red (Out of Stock)
        if (qty <= threshold) return '#F59E0B'; // Orange (Low Stock)
        return '#10B981'; // Green (In Stock)
    };

    const renderItem = ({ item }: { item: InventoryItem }) => (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: theme.card }]}
            onPress={() => handleEditItem(item)}
            activeOpacity={0.7}
        >
            <View style={styles.itemHeader}>
                <View style={[styles.itemIconContainer, { backgroundColor: `${getStatusColor(item)}15` }]}>
                    <AlertTriangle size={20} color={getStatusColor(item)} />
                </View>
                <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>

                    <View style={styles.itemDetailsRow}>
                        <Layers size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={[styles.itemCategory, { color: theme.textSecondary }]}>
                            {item.category?.name || 'Uncategorized'}
                        </Text>
                    </View>

                    <Text style={[styles.quantityValue, { color: theme.text, marginTop: 4, fontWeight: '600' }]}>
                        {item.quantity} <Text style={{ fontSize: 12, fontWeight: '400' }}>{item.unit}</Text>
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const handleLogout = async () => {
        try {
            await AuthService.signOut();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!loading && !companyId) {
        console.warn('InventoryDashboard: No company ID found.', JSON.stringify(user?.profile, null, 2));

        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <AlertTriangle size={48} color="#EF4444" style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 8, textAlign: 'center' }}>
                    Profile Incomplete
                </Text>
                <Text style={{ fontSize: 16, color: theme.textSecondary, marginBottom: 24, textAlign: 'center' }}>
                    We could not find a Company linked to your account.
                </Text>

                {user?.profile && (
                    <View style={{ padding: 10, backgroundColor: '#f0f0f0', borderRadius: 5, marginBottom: 20, width: '100%' }}>
                        <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#333' }}>
                            Debug: {JSON.stringify({
                                id: user.id,
                                email: user.email,
                                role: user.profile.role_id,
                                company: user.profile.company_id
                            }, null, 2)}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={{ backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginBottom: 16 }}
                    // @ts-ignore - refreshUser added to hook but TS might complain if types aren't fully updated yet
                    onPress={async () => {
                        setLoading(true);
                        // @ts-ignore
                        if (user && typeof useAuth().refreshUser === 'function') {
                            // @ts-ignore
                            await useAuth().refreshUser();
                        }
                        loadData();
                    }}
                >
                    <Text style={{ color: 'white', fontWeight: '600' }}>Retry / Refresh Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ backgroundColor: '#EF4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
                    onPress={handleLogout}
                >
                    <Text style={{ color: 'white', fontWeight: '600' }}>Log Out & Refresh</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>


            {/* Search Bar with Add Button */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.card }]}>
                    <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search inventory..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Add Button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setFabMenuVisible(!fabMenuVisible)}
                >
                    <Plus size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Stats Cards - Horizontal Slider */}
            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.statsScrollContainer}
                    style={styles.statsScroller}
                    snapToInterval={190}
                    decelerationRate="fast"
                >
                    {/* 1. All Items Card */}
                    <TouchableOpacity
                        style={[
                            styles.statCardSlider,
                            { backgroundColor: theme.card },
                            filterStatus === 'all' && { borderColor: '#10B981', borderWidth: 2 }
                        ]}
                        onPress={() => setFilterStatus('all')}
                    >
                        <View style={styles.statHeaderRow}>
                            <Text style={[styles.statLabel, { color: theme.text }]}>All Items</Text>
                            {/* Dynamic Icon Color based on global health */}
                            <AlertTriangle
                                size={20}
                                color={
                                    stats.outOfStock > 0 ? '#EF4444' :
                                        (stats.lowStock > 0 ? '#F59E0B' : '#10B981')
                                }
                            />
                        </View>
                        <Text style={[styles.statValue, { color: theme.text }]}>{stats.totalItems}</Text>
                    </TouchableOpacity>

                    {/* 2. Low Stock Card */}
                    <TouchableOpacity
                        style={[
                            styles.statCardSlider,
                            { backgroundColor: theme.card },
                            filterStatus === 'low_stock' && { borderColor: '#F59E0B', borderWidth: 2 }
                        ]}
                        onPress={() => setFilterStatus(filterStatus === 'low_stock' ? 'all' : 'low_stock')}
                    >
                        <View style={styles.statHeaderRow}>
                            <Text style={[styles.statLabel, { color: theme.text }]}>Low Stock</Text>
                            <AlertTriangle size={20} color="#F59E0B" />
                        </View>
                        <Text style={[styles.statValue, { color: '#F59E0B' }]}>{stats.lowStock}</Text>
                    </TouchableOpacity>

                    {/* 3. Out of Stock Card */}
                    <TouchableOpacity
                        style={[
                            styles.statCardSlider,
                            { backgroundColor: theme.card },
                            filterStatus === 'out_of_stock' && { borderColor: '#EF4444', borderWidth: 2 }
                        ]}
                        onPress={() => setFilterStatus(filterStatus === 'out_of_stock' ? 'all' : 'out_of_stock')}
                    >
                        <View style={styles.statHeaderRow}>
                            <Text style={[styles.statLabel, { color: theme.text }]}>Out of Stock</Text>
                            <AlertTriangle size={20} color="#EF4444" />
                        </View>
                        <Text style={[styles.statValue, { color: '#EF4444' }]}>{stats.outOfStock}</Text>
                    </TouchableOpacity>

                    {/* 4. Total Value Card */}
                    <TouchableOpacity
                        style={[styles.statCardSlider, { backgroundColor: theme.card }]}
                        onPress={handleTotalValuePress}
                    >
                        <View style={styles.statHeaderRow}>
                            <Text style={[styles.statLabel, { color: theme.text }]}>Total Inventory Value</Text>
                        </View>
                        {/* Premium Look: No icon, just bold currency */}
                        <Text style={[styles.statValue, { color: '#10B981', fontSize: 28, fontWeight: '800' }]}>
                            ₹{stats.totalValue.toLocaleString()}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Filters Section */}
            <View style={styles.filtersSection}>
                {/* Categories Swiper */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScrollContent}
                    style={styles.filterScroller}
                >
                    <TouchableOpacity
                        style={[
                            styles.filterPill,
                            !selectedCategory && styles.filterPillActive
                        ]}
                        onPress={() => setSelectedCategory(null)}
                    >
                        <Text style={[
                            styles.filterPillText,
                            !selectedCategory && styles.filterPillTextActive,
                            { color: !selectedCategory ? '#FFFFFF' : theme.text }
                        ]}>
                            All
                        </Text>
                    </TouchableOpacity>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.filterPill,
                                selectedCategory === cat.id && styles.filterPillActive,
                                { backgroundColor: selectedCategory === cat.id ? '#10B981' : theme.card }
                            ]}
                            onPress={() => setSelectedCategory(cat.id)}
                        >
                            <Text style={[
                                styles.filterPillText,
                                selectedCategory === cat.id && styles.filterPillTextActive,
                                { color: selectedCategory === cat.id ? '#FFFFFF' : theme.text }
                            ]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Main Items List */}
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#10B981" />
                </View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Package size={60} color="#D1D5DB" />
                            <Text style={styles.emptyStateText}>No items found</Text>
                            <TouchableOpacity
                                style={styles.emptyStateButton}
                                onPress={() => {
                                    resetForm();
                                    setAddItemModalVisible(true);
                                }}
                            >
                                {/* <Text style={styles.emptyStateButtonText}>Add First Item</Text> */}
                                <Plus size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Menu Dropdown */}
            {fabMenuVisible && (
                <View style={styles.fabMenu}>
                    <TouchableOpacity
                        style={styles.fabMenuItem}
                        onPress={handleAddItem}
                    >
                        <View style={styles.fabMenuItemContent}>
                            <Package size={20} color="#374151" />
                            <Text style={styles.fabMenuItemText}>Add Item</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.fabMenuItem}
                        onPress={handleAddCategory}
                    >
                        <View style={styles.fabMenuItemContent}>
                            <Layers size={20} color="#374151" />
                            <Text style={styles.fabMenuItemText}>Add Category</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Value Breakdown Modal */}
            <Modal
                visible={valueBreakdownVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setValueBreakdownVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Inventory Value Breakdown</Text>
                            <TouchableOpacity onPress={() => setValueBreakdownVisible(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.grandTotalCard}>
                            <Text style={styles.grandTotalLabel}>Grand Total Value</Text>
                            <Text style={styles.grandTotalValue}>₹{stats.totalValue.toFixed(2)}</Text>
                        </View>

                        <Text style={[styles.breakdownLabel, { color: theme.text }]}>Itemized Breakdown</Text>

                        <FlatList
                            data={items}
                            keyExtractor={(item) => item.id}
                            style={styles.breakdownList}
                            contentContainerStyle={styles.breakdownListContent}
                            renderItem={({ item }) => (
                                <View style={styles.breakdownItem}>
                                    <View style={styles.breakdownItemInfo}>
                                        <Text style={[styles.breakdownItemName, { color: theme.text }]}>{item.name}</Text>
                                        <Text style={styles.breakdownItemDetail}>
                                            {item.quantity} {item.unit} x ₹{item.unit_price}
                                        </Text>
                                    </View>
                                    <Text style={[styles.breakdownItemValue, { color: theme.text }]}>
                                        ₹{(item.quantity * item.unit_price).toFixed(2)}
                                    </Text>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyBreakdownText}>No items to display</Text>
                            }
                        />

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => setValueBreakdownVisible(false)}
                        >
                            <Text style={styles.modalCloseButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add/Edit Item Modal */}
            <Modal
                visible={addItemModalVisible}
                animationType="slide"
                onRequestClose={() => setAddItemModalVisible(false)}
            >
                <SafeAreaView style={[styles.fullScreenModal, { backgroundColor: theme.background }]}>
                    <View style={[styles.fullScreenModalHeader, { paddingTop: insets.top }]}>
                        <TouchableOpacity
                            onPress={() => setAddItemModalVisible(false)}
                            style={styles.headerLeftAction}
                        >
                            <Image
                                source={require('../../assets/back_icon_v2.png')}
                                style={{ width: 24, height: 24, resizeMode: 'contain' }}
                            />
                        </TouchableOpacity>

                        <View style={styles.headerTitleContainer}>
                            <Text style={[styles.fullScreenModalTitle, { color: theme.text }]}>
                                {editingItem ? 'Edit Item' : 'Add New Item'}
                            </Text>
                        </View>

                        <View style={styles.headerRightAction}>
                            {editingItem && (
                                <TouchableOpacity onPress={handleDeleteItem}>
                                    <Text style={[styles.closeButtonText, { color: '#EF4444' }]}>Delete</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <ScrollView contentContainerStyle={styles.formContainer}>
                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Item Name <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={styles.formInputText}
                                placeholder="e.g. Brake Pads"
                                placeholderTextColor="#9CA3AF"
                                value={itemName}
                                onChangeText={setItemName}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>SKU (Optional)</Text>
                            <TextInput
                                style={styles.formInputText}
                                placeholder="e.g. BP-001"
                                placeholderTextColor="#9CA3AF"
                                value={sku}
                                onChangeText={setSku}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.formLabel}>Category <Text style={styles.required}>*</Text></Text>
                                <TouchableOpacity onPress={() => { setAddItemModalVisible(false); setAddCategoryModalVisible(true); }}>
                                    <Text style={styles.addNewLink}>+ New Category</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dropdownContainer}>
                                {categories.length === 0 ? (
                                    <View style={styles.emptyDropdown}>
                                        <Text style={styles.emptyDropdownText}>No categories found. Create one first.</Text>
                                    </View>
                                ) : (
                                    <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
                                        {categories.map((cat) => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                style={[
                                                    styles.dropdownItem,
                                                    formCategory === cat.id && styles.dropdownItemActive
                                                ]}
                                                onPress={() => setFormCategory(cat.id)}
                                            >
                                                <Text style={[
                                                    styles.dropdownItemText,
                                                    formCategory === cat.id && styles.dropdownItemTextActive
                                                ]}>{cat.name}</Text>
                                                {formCategory === cat.id && <View style={styles.activeDot} />}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.halfInput, styles.formGroup]}>
                                <Text style={styles.formLabel}>Quantity <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.formInputText}
                                    placeholder="0"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    value={quantity}
                                    onChangeText={setQuantity}
                                />
                            </View>
                            <View style={[styles.halfInput, styles.formGroup]}>
                                <Text style={styles.formLabel}>Unit Price <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.formInputText}
                                    placeholder="0.00"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="numeric"
                                    value={unitPrice}
                                    onChangeText={setUnitPrice}
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Unit <Text style={styles.required}>*</Text></Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitSelector}>
                                {UNITS.map((unit) => (
                                    <TouchableOpacity
                                        key={unit}
                                        style={[
                                            styles.unitButton,
                                            formUnit === unit && styles.unitButtonActive
                                        ]}
                                        onPress={() => setFormUnit(unit)}
                                    >
                                        <Text style={[
                                            styles.unitButtonText,
                                            formUnit === unit && styles.unitButtonTextActive
                                        ]}>{unit}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Low Stock Threshold</Text>
                            <TextInput
                                style={styles.formInputText}
                                placeholder="10"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={lowStockThreshold}
                                onChangeText={setLowStockThreshold}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Description</Text>
                            <TextInput
                                style={[styles.formInputText, styles.formInputMultiline]}
                                placeholder="Enter description..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={3}
                                value={description}
                                onChangeText={setDescription}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                            onPress={handleCreateItem}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>
                                    {editingItem ? 'Save Changes' : 'Add Item'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Add Category Modal */}
            <Modal
                visible={addCategoryModalVisible}
                animationType="slide"
                onRequestClose={() => setAddCategoryModalVisible(false)}
            >
                <SafeAreaView style={[styles.fullScreenModal, { backgroundColor: theme.background }]}>
                    <View style={[styles.fullScreenModalHeader, { paddingTop: insets.top }]}>
                        <TouchableOpacity
                            onPress={() => {
                                setAddCategoryModalVisible(false);
                                setEditingCategory(null);
                                setCategoryName('');
                                setCategoryDescription('');
                            }}
                            style={styles.headerLeftAction}
                        >
                            <Image
                                source={require('../../assets/back_icon_v2.png')}
                                style={{ width: 24, height: 24, resizeMode: 'contain' }}
                            />
                        </TouchableOpacity>

                        <View style={styles.headerTitleContainer}>
                            <Text style={[styles.fullScreenModalTitle, { color: theme.text }]}>Manage Categories</Text>
                        </View>

                        <View style={styles.headerRightAction} />
                    </View>

                    {/* Main Content Area */}
                    <View style={{ flex: 1 }}>
                        <ScrollView contentContainerStyle={styles.formContainer}>
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>{editingCategory ? 'Edit Category' : 'Add New Category'}</Text>
                                <TextInput
                                    style={styles.formInputText}
                                    placeholder="Category Name (e.g. Engine Parts)"
                                    placeholderTextColor="#9CA3AF"
                                    value={categoryName}
                                    onChangeText={setCategoryName}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <TextInput
                                    style={[styles.formInputText, styles.formInputMultiline, { minHeight: 60 }]}
                                    placeholder="Description (Optional)"
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    numberOfLines={2}
                                    value={categoryDescription}
                                    onChangeText={setCategoryDescription}
                                />
                            </View>

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity
                                    style={[styles.submitButton, submitting && styles.submitButtonDisabled, { flex: 1, marginTop: 10 }]}
                                    onPress={handleCreateCategory}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>
                                            {editingCategory ? 'Update Category' : 'Create Category'}
                                        </Text>
                                    )}
                                </TouchableOpacity>

                                {editingCategory && (
                                    <TouchableOpacity
                                        style={[styles.submitButton, { flex: 1, marginTop: 10, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', shadowOpacity: 0 }]}
                                        onPress={() => {
                                            setEditingCategory(null);
                                            setCategoryName('');
                                            setCategoryDescription('');
                                        }}
                                    >
                                        <Text style={[styles.submitButtonText, { color: '#374151' }]}>Cancel Edit</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={{ marginTop: 30, marginBottom: 10 }}>
                                <Text style={[styles.formLabel, { fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 8 }]}>Existing Categories</Text>
                            </View>

                            {categories.map((cat) => (
                                <View key={cat.id} style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    paddingVertical: 12,
                                    borderBottomWidth: 1,
                                    borderBottomColor: '#F3F4F6'
                                }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '500', color: theme.text }}>{cat.name}</Text>
                                        {cat.description && (
                                            <Text style={{ fontSize: 12, color: '#9CA3AF' }} numberOfLines={1}>{cat.description}</Text>
                                        )}
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 16 }}>
                                        <TouchableOpacity onPress={() => handleEditCategory(cat)} style={{ padding: 4 }}>
                                            <Edit size={18} color="#3B82F6" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDeleteCategory(cat)} style={{ padding: 4 }}>
                                            <Trash2 size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </Modal>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    warningBanner: {
        backgroundColor: '#EF4444',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    warningText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 12,
        marginRight: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    statsScroller: {
        maxHeight: 140, // Constrain height
        marginBottom: 10,
    },
    statsScrollContainer: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        alignItems: 'center',
    },
    statCardSlider: {
        width: 180,
        height: 100,
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        justifyContent: 'center',
        borderWidth: 0,
        backgroundColor: '#fff',
    },
    statCardPrimary: {
        borderWidth: 1.5,
        borderColor: '#10B981',
        backgroundColor: '#ECFDF5',
    },
    statHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    filtersSection: {
        paddingVertical: 10,
    },
    filterScroller: {
        maxHeight: 50,
    },
    filterScrollContent: {
        paddingHorizontal: 20,
    },
    filterPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    filterPillActive: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    filterPillText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    filterPillTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingTop: 0,
    },
    itemCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    itemSku: {
        fontSize: 12,
        color: '#6B7280',
    },
    itemQuantity: {
        alignItems: 'flex-end',
    },
    quantityValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantityUnit: {
        fontSize: 12,
        fontWeight: 'normal',
        color: '#6B7280',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    itemCategory: {
        fontSize: 12,
        color: '#6B7280',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptyState: {
        flex: 1,
        paddingTop: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: '#9CA3AF',
    },
    emptyStateButton: {
        marginTop: 16,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#10B981',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    fabMenu: {
        position: 'absolute',
        top: 70,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        minWidth: 160,
        zIndex: 1000,
    },
    fabMenuItem: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    fabMenuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    fabMenuItemText: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalClose: {
        fontSize: 24,
        color: '#9CA3AF',
        padding: 4,
    },
    grandTotalCard: {
        backgroundColor: '#ECFDF5',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    grandTotalLabel: {
        fontSize: 14,
        color: '#059669',
        marginBottom: 4,
    },
    grandTotalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#059669',
    },
    breakdownLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
    },
    breakdownList: {
        maxHeight: 300,
    },
    breakdownListContent: {
        paddingBottom: 10,
    },
    breakdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    breakdownItemInfo: {
        flex: 1,
    },
    breakdownItemName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    breakdownItemDetail: {
        fontSize: 12,
        color: '#6B7280',
    },
    breakdownItemValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    emptyBreakdownText: {
        textAlign: 'center',
        color: '#9CA3AF',
        padding: 20,
    },
    modalCloseButton: {
        marginTop: 16,
        backgroundColor: '#F3F4F6',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 14,
    },
    fullScreenModal: {
        flex: 1,
    },
    fullScreenModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        minHeight: 64,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerLeftAction: {
        zIndex: 10,
        padding: 4,
        minWidth: 48,
        alignItems: 'flex-start',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerRightAction: {
        zIndex: 10,
        minWidth: 48,
        alignItems: 'flex-end',
    },
    fullScreenModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    closeButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    formContainer: {
        padding: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8,
        marginTop: 12,
    },
    formInputText: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: '#111827',
    },
    formInputMultiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    unitSelector: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    unitButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        marginRight: 8,
    },
    unitButtonActive: {
        backgroundColor: '#ECFDF5',
        borderColor: '#10B981',
    },
    unitButtonText: {
        fontSize: 14,
        color: '#6B7280',
    },
    unitButtonTextActive: {
        color: '#10B981',
        fontWeight: '600',
    },
    categorySelectorStart: {
        flexDirection: 'row',
        marginBottom: 10,
        maxHeight: 50,
    },
    categorySelectPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        marginRight: 8,
        height: 40,
    },
    categorySelectPillActive: {
        backgroundColor: '#ECFDF5',
        borderColor: '#10B981',
    },
    categorySelectText: {
        fontSize: 14,
        color: '#6B7280',
    },
    categorySelectTextActive: {
        color: '#10B981',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#10B981',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    formGroup: {
        marginBottom: 16,
    },
    required: {
        color: '#EF4444',
        marginLeft: 4,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 12,
    },
    addNewLink: {
        color: '#10B981',
        fontWeight: '600',
        fontSize: 14,
    },
    dropdownContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        maxHeight: 200,
        overflow: 'hidden',
    },
    emptyDropdown: {

        padding: 16,
        alignItems: 'center',
    },
    emptyDropdownText: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    dropdownList: {
        maxHeight: 200,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    dropdownItemActive: {
        backgroundColor: '#ECFDF5',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#374151',
    },
    dropdownItemTextActive: {
        color: '#10B981',
        fontWeight: '600',
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
    },
    itemDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
});
