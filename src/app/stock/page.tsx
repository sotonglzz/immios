'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { StockService, StockProduct, StockComponent, AssemblyAlert } from '@/services/stockService';

// Force dynamic rendering to prevent static generation issues with Firebase
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function StockManagementPage() {
  const [activeTab, setActiveTab] = useState('products');

  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<'product' | 'component'>('product');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedItemName, setSelectedItemName] = useState<string>('');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState<string>('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  // State for adding new items
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemType, setNewItemType] = useState<'product' | 'component'>('product');
  const [newItemData, setNewItemData] = useState({
    name: '',
    category: '',
    description: '',
    currentStock: 0,
    minStockLevel: 0,
    components: [] as string[],
    type: '',
    size: '',
    color: '',
    condition: 'New',
    usedInProducts: [] as string[]
  });
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  // State for duplication
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [duplicatingItemId, setDuplicatingItemId] = useState<string>('');
  const [duplicatingItemType, setDuplicatingItemType] = useState<'product' | 'component'>('product');

  // State for adjust modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<StockProduct | StockComponent | null>(null);
  const [adjustingItemType, setAdjustingItemType] = useState<'product' | 'component'>('product');
  const [adjustingItemName, setAdjustingItemName] = useState('');
  const [adjustingItemQuantity, setAdjustingItemQuantity] = useState(0);
  const [adjustingItemReason, setAdjustingItemReason] = useState('');

  const [isAdjusting, setIsAdjusting] = useState(false);

  // State for real data
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [components, setComponents] = useState<StockComponent[]>([]);
  const [assemblyAlerts, setAssemblyAlerts] = useState<AssemblyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for completing assembly tasks
  const [isCompletingTask, setIsCompletingTask] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string>('');

  // State for component linking with quantities
  const [componentSearchTerm, setComponentSearchTerm] = useState('');
  const [showComponentDropdown, setShowComponentDropdown] = useState(false);
  const [linkedComponents, setLinkedComponents] = useState<Array<{
    componentId: string;
    componentName: string;
    quantity: number;
  }>>([]);

  // State for editing components in edit modal
  const [editingComponents, setEditingComponents] = useState<Array<{
    componentId: string;
    componentName: string;
    quantity: number;
  }>>([]);
  const [editingComponentSearchTerm, setEditingComponentSearchTerm] = useState('');
  const [showEditingComponentDropdown, setShowEditingComponentDropdown] = useState(false);

  // State for editing component details
  const [editingComponentType, setEditingComponentType] = useState('');
  const [editingComponentSize, setEditingComponentSize] = useState('');
  const [editingComponentColor, setEditingComponentColor] = useState('');
  const [editingComponentCondition, setEditingComponentCondition] = useState('New');

  // Ref and dirty state for edit modal
  const editModalBackdropRef = useRef<HTMLDivElement | null>(null);
  const [editModalDirty, setEditModalDirty] = useState(false);
  const [editModalInitialState, setEditModalInitialState] = useState<any>(null);
  const [showEditModalConfirm, setShowEditModalConfirm] = useState(false);

  // Track initial state when opening edit modal
  useEffect(() => {
    if (showEditModal && adjustingItem) {
      setEditModalInitialState({
        name: adjustingItem.name,
        quantity: adjustingItemQuantity,
        reason: adjustingItemReason,
        components: JSON.stringify(editingComponents),
        type: editingComponentType,
        size: editingComponentSize,
        color: editingComponentColor,
        condition: editingComponentCondition,
      });
      setEditModalDirty(false);
    }
  }, [showEditModal, adjustingItem]);

  // Detect dirty state
  useEffect(() => {
    if (!showEditModal || !editModalInitialState) return;
    const isDirty =
      adjustingItemName !== editModalInitialState.name ||
      adjustingItemQuantity !== editModalInitialState.quantity ||
      adjustingItemReason !== editModalInitialState.reason ||
      JSON.stringify(editingComponents) !== editModalInitialState.components ||
      editingComponentType !== editModalInitialState.type ||
      editingComponentSize !== editModalInitialState.size ||
      editingComponentColor !== editModalInitialState.color ||
      editingComponentCondition !== editModalInitialState.condition;
    setEditModalDirty(isDirty);
  }, [adjustingItemName, adjustingItemQuantity, adjustingItemReason, editingComponents, editingComponentType, editingComponentSize, editingComponentColor, editingComponentCondition, showEditModal, editModalInitialState]);

  // Focus edit modal backdrop on open
  useEffect(() => {
    if (showEditModal && editModalBackdropRef.current) {
      editModalBackdropRef.current.focus();
    }
  }, [showEditModal]);

  // Handler for closing edit modal with dirty check
  const handleEditModalClose = () => {
    if (editModalDirty) {
      setShowEditModalConfirm(true);
    } else {
      setShowEditModal(false);
      setAdjustingItem(null);
      setAdjustingItemName('');
      setAdjustingItemQuantity(0);
      setAdjustingItemReason('');
      setEditingComponents([]);
      setEditingComponentSearchTerm('');
      setShowEditingComponentDropdown(false);
      setEditingComponentType('');
      setEditingComponentSize('');
      setEditingComponentColor('');
      setEditingComponentCondition('New');
    }
  };

  // State for sorting and filtering
  const [sortField, setSortField] = useState<'name' | 'category' | 'currentStock' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // State for description modal
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedItemForDescription, setSelectedItemForDescription] = useState<StockProduct | StockComponent | null>(null);
  const descriptionModalBackdropRef = useRef<HTMLDivElement | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingDescription, setEditingDescription] = useState('');
  const [isSavingDescription, setIsSavingDescription] = useState(false);

  useEffect(() => {
    if (showDescriptionModal && descriptionModalBackdropRef.current) {
      descriptionModalBackdropRef.current.focus();
    }
  }, [showDescriptionModal]);

  // Mock user data
  const user = {
    name: 'John Smith',
    email: 'john.smith@instantmarquees.com.au',
    role: 'admin' as const,
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Initialize stock data if database is empty
        await StockService.initializeStockData();
        
        // Set up real-time listeners
        const unsubscribeProducts = StockService.subscribeToProducts(setProducts);
        const unsubscribeComponents = StockService.subscribeToComponents(setComponents);
        const unsubscribeAlerts = StockService.subscribeToAssemblyAlerts(setAssemblyAlerts);
        
        setLoading(false);
        
        // Cleanup listeners on unmount
        return () => {
          unsubscribeProducts();
          unsubscribeComponents();
          unsubscribeAlerts();
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stock data');
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  const handleStockAdjustment = async () => {
    try {
      if (!selectedItemId || !selectedItemName) {
        alert('Please select an item to adjust');
        return;
      }

      await StockService.adjustStock(
        adjustmentType,
        selectedItemId,
        selectedItemName,
        adjustmentQuantity,
        adjustmentReason || 'No reason provided',
        user.name
      );

      setIsAdjustmentModalOpen(false);
      setAdjustmentQuantity(0);
      setAdjustmentReason('');
      setSelectedItemId('');
      setSelectedItemName('');
      
      alert('Stock adjustment saved successfully!');
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert(`Error adjusting stock: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteItem = async () => {
    try {
      if (!selectedItemId || !selectedItemName) {
        alert('Please select an item to delete');
        return;
      }

      console.log('Starting deletion of:', selectedItemName, 'with ID:', selectedItemId, 'type:', adjustmentType);
      setIsDeleting(true);

      if (adjustmentType === 'product') {
        console.log('Deleting product...');
        await StockService.deleteProduct(selectedItemId);
        console.log('Product deletion completed');
      } else {
        console.log('Deleting component...');
        await StockService.deleteComponent(selectedItemId);
        console.log('Component deletion completed');
      }

      // Add a small delay to show the animation
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsAdjustmentModalOpen(false);
      setSelectedItemId('');
      setSelectedItemName('');
      setShowDeleteConfirmation(false);
      setIsDeleting(false);
      
      console.log('Deletion process completed successfully');
      alert(`${adjustmentType === 'product' ? 'Product' : 'Component'} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting item:', error);
      setIsDeleting(false);
      alert(`Error deleting ${adjustmentType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCreateNewItem = async () => {
    try {
      if (!newItemData.name.trim()) {
        alert('Please enter a name for the item');
        return;
      }

      setIsCreatingItem(true);

      if (newItemType === 'product') {
        // Validate required fields for products
        if (!newItemData.category.trim()) {
          alert('Please enter a category for the product');
          return;
        }

        // Convert linked components to component unique IDs array and create quantities mapping
        const componentUniqueIds = linkedComponents.map(lc => lc.componentId);
        const componentQuantities: { [componentUniqueId: string]: number } = {};
        linkedComponents.forEach(lc => {
          componentQuantities[lc.componentId] = lc.quantity;
        });

        const productData = {
          name: newItemData.name.trim(),
          category: newItemData.category.trim(),
          description: newItemData.description.trim(),
          currentStock: newItemData.currentStock,
          minStockLevel: newItemData.minStockLevel,
          components: componentUniqueIds,
          componentQuantities: componentQuantities,
          status: StockService.calculateStockStatus(newItemData.currentStock, newItemData.minStockLevel),
          price: 0,
          rentalPrice: 0
        };

        await StockService.createProduct(productData);
        alert('Product created successfully!');
      } else {
        // Validate required fields for components
        if (!newItemData.type.trim() || !newItemData.size.trim() || !newItemData.color.trim()) {
          alert('Please enter type, size, and color for the component');
          return;
        }

        const componentData = {
          name: newItemData.name.trim(),
          type: newItemData.type.trim(),
          size: newItemData.size.trim(),
          color: newItemData.color.trim(),
          condition: newItemData.condition,
          currentStock: newItemData.currentStock,
          minStockLevel: newItemData.minStockLevel,
          usedInProducts: newItemData.usedInProducts,
          description: newItemData.description.trim()
        };

        await StockService.createComponent(componentData);
        alert('Component created successfully!');
      }

      // Reset form and close modal
      setNewItemData({
        name: '',
        category: '',
        description: '',
        currentStock: 0,
        minStockLevel: 0,
        components: [],
        type: '',
        size: '',
        color: '',
        condition: 'New',
        usedInProducts: []
      });
      setLinkedComponents([]);
      setShowAddItemModal(false);
      setItemSearchTerm('');
      setShowItemDropdown(false);
      
    } catch (error) {
      console.error('Error creating item:', error);
      alert(`Error creating ${newItemType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingItem(false);
    }
  };

  const handleDuplicateItem = async (itemId: string, itemType: 'product' | 'component') => {
    try {
      setIsDuplicating(true);
      setDuplicatingItemId(itemId);
      setDuplicatingItemType(itemType);

      if (itemType === 'product') {
        await StockService.duplicateProduct(itemId);
        alert('Product duplicated successfully!');
      } else {
        await StockService.duplicateComponent(itemId);
        alert('Component duplicated successfully!');
      }
    } catch (error) {
      console.error('Error duplicating item:', error);
      alert(`Error duplicating ${itemType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDuplicating(false);
      setDuplicatingItemId('');
    }
  };

  const handleOpenEditModal = (item: StockProduct | StockComponent, type: 'product' | 'component') => {
    setAdjustingItem(item);
    setAdjustingItemType(type);
    setAdjustingItemName(item.name);
    setAdjustingItemQuantity(0);
    setAdjustingItemReason('');
    
    // Initialize editing components for products
    if (type === 'product') {
      const product = item as StockProduct;
      const initialComponents = product.components.map(componentUniqueId => {
        const component = components.find(c => c.uniqueId === componentUniqueId);
        return {
          componentId: component?.uniqueId || '',
          componentName: component?.name || '',
          quantity: product.componentQuantities?.[componentUniqueId] || 1
        };
      });
      setEditingComponents(initialComponents);
    } else {
      setEditingComponents([]);
      // Initialize component-specific fields
      const component = item as StockComponent;
      setEditingComponentType(component.type);
      setEditingComponentSize(component.size);
      setEditingComponentColor(component.color);
      setEditingComponentCondition(component.condition);
    }
    
    setShowEditModal(true);
  };

  const handleEditItem = async () => {
    if (!adjustingItem) {
      alert('Please select an item to adjust');
      return;
    }

    try {
      setIsAdjusting(true);

      if (adjustingItemType === 'product') {
        const product = adjustingItem as StockProduct;
        
        // Update product name if changed
        if (adjustingItemName !== product.name) {
          await StockService.updateProduct(product.id!, { name: adjustingItemName });
        }

        // Update product components if changed
        const componentUniqueIds = editingComponents.map(ec => ec.componentId);
        const componentQuantities: { [componentUniqueId: string]: number } = {};
        editingComponents.forEach(ec => {
          componentQuantities[ec.componentId] = ec.quantity;
        });

        // Update product with new components
        await StockService.updateProduct(product.id!, {
          components: componentUniqueIds,
          componentQuantities: componentQuantities
        });

        // Adjust product stock directly
        await StockService.adjustStock(
          'product',
          product.id!,
          adjustingItemName,
          adjustingItemQuantity,
          adjustingItemReason || 'No reason provided',
          user.name
        );

        // Create assembly task for product adjustment
        if (adjustingItemQuantity !== 0) {
          const taskType: 'Assemble' | 'Disassemble' = adjustingItemQuantity > 0 ? 'Assemble' : 'Disassemble';
          const taskData: Omit<AssemblyAlert, 'id' | 'createdAt'> = {
            product: adjustingItemName,
            quantity: Math.abs(adjustingItemQuantity),
            priority: Math.abs(adjustingItemQuantity) > 5 ? 'High' : 'Medium',
            status: 'Pending' as const,
            notes: `${taskType} ${Math.abs(adjustingItemQuantity)} units.${adjustingItemReason ? ` Reason: ${adjustingItemReason}` : ''}`,
            taskType: taskType
          };

          await StockService.createAssemblyAlert(taskData);
        }

        alert('Product stock adjusted successfully! Assembly task created.');
        setShowEditModal(false);
      } else {
        const component = adjustingItem as StockComponent;
        
        // Update component details if changed
        const updateData: any = {};
        if (adjustingItemName !== component.name) {
          updateData.name = adjustingItemName;
        }
        if (editingComponentType !== component.type) {
          updateData.type = editingComponentType;
        }
        if (editingComponentSize !== component.size) {
          updateData.size = editingComponentSize;
        }
        if (editingComponentColor !== component.color) {
          updateData.color = editingComponentColor;
        }
        if (editingComponentCondition !== component.condition) {
          updateData.condition = editingComponentCondition;
        }

        // Update component if any fields changed
        if (Object.keys(updateData).length > 0) {
          await StockService.updateComponent(component.id!, updateData);
        }

        // Adjust component stock directly
        await StockService.adjustStock(
          'component',
          component.id!,
          adjustingItemName,
          adjustingItemQuantity,
          adjustingItemReason || 'No reason provided',
          user.name
        );

        alert('Component updated successfully!');
        setShowEditModal(false);
      }
    } catch (error) {
      console.error('Error adjusting item:', error);
      alert(`Error adjusting ${adjustingItemType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleCompleteAssemblyTask = async (taskId: string) => {
    try {
      setIsCompletingTask(true);
      setCompletingTaskId(taskId);

      await StockService.deleteAssemblyAlert(taskId);
      alert('Assembly task completed and removed successfully!');
    } catch (error) {
      console.error('Error completing assembly task:', error);
      alert(`Error completing task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCompletingTask(false);
      setCompletingTaskId('');
    }
  };



  const openAddItemModal = (type: 'product' | 'component', itemName: string) => {
    setNewItemType(type);
    setNewItemData({
      ...newItemData,
      name: itemName.trim()
    });
    setShowAddItemModal(true);
    setShowItemDropdown(false);
  };

  const openAddItemModalClean = (type: 'product' | 'component') => {
    console.log('openAddItemModalClean called with type:', type);
    console.log('Current showAddItemModal state:', showAddItemModal);
    
    setNewItemType(type);
    setNewItemData({
      name: '',
      category: '',
      description: '',
      currentStock: 0,
      minStockLevel: 0,
      components: [],
      type: '',
      size: '',
      color: '',
      condition: 'New',
      usedInProducts: []
    });
    setLinkedComponents([]);
    setShowAddItemModal(true);
    setShowItemDropdown(false);
    
    console.log('After setting showAddItemModal to true');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'LOW': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'CRITICAL': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'Low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  // Sorting and filtering functions
  const handleSort = (field: 'name' | 'category' | 'currentStock' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedAndFilteredProducts = () => {
    let filteredProducts = products;

    // Apply filters
    if (categoryFilter) {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }

    if (statusFilter) {
      filteredProducts = filteredProducts.filter(product => 
        product.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply sorting
    filteredProducts.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'currentStock') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredProducts;
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(products.map(product => product.category))];
    return categories.sort();
  };

  const getUniqueStatuses = () => {
    const statuses = [...new Set(products.map(product => product.status))];
    return statuses.sort();
  };

  // Helper functions for component linking
  const addLinkedComponent = (componentId: string, componentName: string) => {
    // Check if component is already added
    if (linkedComponents.some(lc => lc.componentId === componentId)) {
      return;
    }
    
    setLinkedComponents([...linkedComponents, {
      componentId,
      componentName,
      quantity: 1
    }]);
    setComponentSearchTerm('');
    setShowComponentDropdown(false);
  };

  const removeLinkedComponent = (componentId: string) => {
    setLinkedComponents(linkedComponents.filter(lc => lc.componentId !== componentId));
  };

  const updateLinkedComponentQuantity = (componentId: string, quantity: number) => {
    setLinkedComponents(linkedComponents.map(lc => 
      lc.componentId === componentId ? { ...lc, quantity } : lc
    ));
  };

  const addMoreComponentRow = () => {
    setComponentSearchTerm('');
    setShowComponentDropdown(false);
  };

  // Helper functions for editing components in edit modal
  const addEditingComponent = (componentId: string, componentName: string) => {
    // Check if component is already added
    if (editingComponents.some(lc => lc.componentId === componentId)) {
      return;
    }
    
    setEditingComponents([...editingComponents, {
      componentId,
      componentName,
      quantity: 1
    }]);
    setEditingComponentSearchTerm('');
    setShowEditingComponentDropdown(false);
  };

  const removeEditingComponent = (componentId: string) => {
    setEditingComponents(editingComponents.filter(lc => lc.componentId !== componentId));
  };

  const updateEditingComponentQuantity = (componentId: string, quantity: number) => {
    setEditingComponents(editingComponents.map(lc => 
      lc.componentId === componentId ? { ...lc, quantity } : lc
    ));
  };

  const getFilteredItems = () => {
    const items = adjustmentType === 'product' ? products : components;
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(itemSearchTerm.toLowerCase())
    );
    
    // If search term doesn't match any items, add "Add item to catalog" option
    if (itemSearchTerm && filtered.length === 0) {
      return [{ id: 'add-new', name: `Add "${itemSearchTerm}" to catalog`, currentStock: 0 } as (StockProduct | StockComponent | { id: string; name: string; currentStock: number })];
    }
    
    return filtered;
  };

  const getComponentsForProduct = (product: StockProduct) => {
    return components.filter(component => 
      product.components.includes(component.uniqueId)
    );
  };

  const getProductsUsingComponent = (component: StockComponent) => {
    return products.filter(product => 
      product.components.includes(component.uniqueId)
    );
  };

  const handleShowDescription = (item: StockProduct | StockComponent) => {
    setSelectedItemForDescription(item);
    setShowDescriptionModal(true);
    setIsEditingDescription(false);
    setEditingDescription('');
  };

  const handleEditDescription = () => {
    if (selectedItemForDescription) {
      setIsEditingDescription(true);
      setEditingDescription(selectedItemForDescription.description || '');
    }
  };

  const handleSaveDescription = async () => {
    if (!selectedItemForDescription) return;

    try {
      setIsSavingDescription(true);
      
      // Check if it's a product by looking for the category property
      if ('category' in selectedItemForDescription) {
        // It's a product
        await StockService.updateProduct(selectedItemForDescription.id!, {
          description: editingDescription
        });
      } else {
        // It's a component
        await StockService.updateComponent(selectedItemForDescription.id!, {
          description: editingDescription
        });
      }

      // Update the local state
      setSelectedItemForDescription({
        ...selectedItemForDescription,
        description: editingDescription
      });
      
      setIsEditingDescription(false);
      setEditingDescription('');
    } catch (error) {
      console.error('Error saving description:', error);
      alert(`Error saving description: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSavingDescription(false);
    }
  };

  // Ref and dirty state for add item modal
  const addItemModalBackdropRef = useRef<HTMLDivElement | null>(null);
  const [addItemModalDirty, setAddItemModalDirty] = useState(false);
  const [addItemModalInitialState, setAddItemModalInitialState] = useState<any>(null);
  const [showAddItemModalConfirm, setShowAddItemModalConfirm] = useState(false);

  // Track initial state when opening add item modal
  useEffect(() => {
    if (showAddItemModal) {
      setAddItemModalInitialState({
        name: newItemData.name,
        category: newItemData.category,
        description: newItemData.description,
        currentStock: newItemData.currentStock,
        minStockLevel: newItemData.minStockLevel,
        type: newItemData.type,
        size: newItemData.size,
        color: newItemData.color,
        condition: newItemData.condition,
        components: JSON.stringify(linkedComponents),
      });
      setAddItemModalDirty(false);
    }
  }, [showAddItemModal]);

  // Detect dirty state for add item modal
  useEffect(() => {
    if (!showAddItemModal || !addItemModalInitialState) return;
    const isDirty =
      newItemData.name !== addItemModalInitialState.name ||
      newItemData.category !== addItemModalInitialState.category ||
      newItemData.description !== addItemModalInitialState.description ||
      newItemData.currentStock !== addItemModalInitialState.currentStock ||
      newItemData.minStockLevel !== addItemModalInitialState.minStockLevel ||
      newItemData.type !== addItemModalInitialState.type ||
      newItemData.size !== addItemModalInitialState.size ||
      newItemData.color !== addItemModalInitialState.color ||
      newItemData.condition !== addItemModalInitialState.condition ||
      JSON.stringify(linkedComponents) !== addItemModalInitialState.components;
    setAddItemModalDirty(isDirty);
  }, [newItemData, linkedComponents, showAddItemModal, addItemModalInitialState]);

  // Focus add item modal backdrop on open
  useEffect(() => {
    if (showAddItemModal && addItemModalBackdropRef.current) {
      addItemModalBackdropRef.current.focus();
    }
  }, [showAddItemModal]);

  // Handler for closing add item modal with dirty check
  const handleAddItemModalClose = () => {
    if (addItemModalDirty) {
      setShowAddItemModalConfirm(true);
    } else {
      setShowAddItemModal(false);
      setNewItemData({
        name: '',
        category: '',
        description: '',
        currentStock: 0,
        minStockLevel: 0,
        components: [],
        type: '',
        size: '',
        color: '',
        condition: 'New',
        usedInProducts: []
      });
      setLinkedComponents([]);
      setComponentSearchTerm('');
      setShowComponentDropdown(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout user={user} onLogout={handleLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading stock data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout user={user} onLogout={handleLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 mb-4">Error loading stock data</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const mainContent = (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Stock Management
          </h1>
          <div className="flex gap-3">
            <Button
              onClick={() => openAddItemModalClean('product')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Add Product
            </Button>
            <Button
              onClick={() => openAddItemModalClean('component')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Add Component
            </Button>
            <Button
              onClick={() => {
                console.log('Edit Stock button clicked (empty state)');
                console.log('Current isAdjustmentModalOpen state:', isAdjustmentModalOpen);
                setIsAdjustmentModalOpen(true);
                setTimeout(() => {
                  console.log('After setting isAdjustmentModalOpen to true:', isAdjustmentModalOpen);
                }, 100);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Edit Stock
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'products', name: 'Products', count: products.length },
              { id: 'components', name: 'Components', count: components.length },
              { id: 'assembly', name: 'Assembly Tasks', count: assemblyAlerts.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.name}
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Products Overview
                  </h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {getSortedAndFilteredProducts().length} of {products.length} products
                  </div>
                </div>
              </div>
              
              {/* Filters */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-48">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Filter by Category
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">All Categories</option>
                      {getUniqueCategories().map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-48">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Filter by Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">All Statuses</option>
                      {getUniqueStatuses().map(status => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setCategoryFilter('');
                        setStatusFilter('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        <button
                          onClick={() => handleSort('name')}
                          className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          <span>Product</span>
                          <div className="flex flex-col">
                            <svg className={`w-3 h-3 ${sortField === 'name' && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            <svg className={`w-3 h-3 ${sortField === 'name' && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Min Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {getSortedAndFilteredProducts().map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            <button
                              onClick={() => handleShowDescription(product)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer underline"
                            >
                              {product.name}
                            </button>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.components.length} components
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {product.currentStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {product.minStockLevel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(product.status)}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">

                                                      <button 
                              onClick={() => handleOpenEditModal(product, 'product')}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-4"
                            >
                              Edit
                            </button>
                          <button
                            onClick={() => handleDuplicateItem(product.id!, 'product')}
                            disabled={isDuplicating && duplicatingItemId === product.id}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            {isDuplicating && duplicatingItemId === product.id ? 'Duplicating...' : 'Duplicate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Components Tab */}
        {activeTab === 'components' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Components Overview
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Component
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Size/Color
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Condition
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Current Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Assembled Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Total Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {components.map((component) => (
                      <tr key={component.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            <button
                              onClick={() => handleShowDescription(component)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer underline"
                            >
                              {component.name}
                            </button>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Used in {component.usedInProducts.length} products
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {component.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {component.size} / {component.color}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {component.condition}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {component.currentStock - StockService.calculateAssembledStock(component.uniqueId, products)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {StockService.calculateAssembledStock(component.uniqueId, products)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {component.currentStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">

                          <button 
                            onClick={() => handleOpenEditModal(component, 'component')}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDuplicateItem(component.id!, 'component')}
                            disabled={isDuplicating && duplicatingItemId === component.id}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                          >
                            {isDuplicating && duplicatingItemId === component.id ? 'Duplicating...' : 'Duplicate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Assembly Tasks Tab */}
        {activeTab === 'assembly' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Assembly Tasks
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Task Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {assemblyAlerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {alert.product}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {alert.taskType || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {alert.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(alert.priority)}`}>
                            {alert.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {alert.status === 'Pending' && (
                            <button 
                              onClick={() => handleCompleteAssemblyTask(alert.id!)}
                              disabled={isCompletingTask && completingTaskId === alert.id}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              {isCompletingTask && completingTaskId === alert.id ? 'Completing...' : 'Complete Task'}
                            </button>
                          )}
                          {alert.status === 'In Progress' && (
                            <button 
                              onClick={() => handleCompleteAssemblyTask(alert.id!)}
                              disabled={isCompletingTask && completingTaskId === alert.id}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              {isCompletingTask && completingTaskId === alert.id ? 'Completing...' : 'Complete'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );

  return (
    <>
      {mainContent}
      {/* Modals always rendered at root, controlled by their own state */}
      {showAddItemModal && (
        <div 
          ref={addItemModalBackdropRef}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleAddItemModalClose();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleAddItemModalClose();
            }
          }}
          tabIndex={0}
        >
          <div 
            className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Add New {newItemType === 'product' ? 'Product' : 'Component'}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your business data
                </div>
                <button
                  onClick={() => {
                    setShowAddItemModal(false);
                    setNewItemData({
                      name: '',
                      category: '',
                      description: '',
                      currentStock: 0,
                      minStockLevel: 0,
                      components: [],
                      type: '',
                      size: '',
                      color: '',
                      condition: 'New',
                      usedInProducts: []
                    });
                    setLinkedComponents([]);
                    setComponentSearchTerm('');
                    setShowComponentDropdown(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Help Text */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> {newItemType === 'product' 
                      ? 'Products are assembled items like tents, furniture, or equipment that customers rent.'
                      : 'Components are individual parts like poles, fabric, or hardware used to build products.'
                    }
                  </p>
                </div>

                {/* Common Fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newItemData.name}
                    onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newItemData.description}
                    onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Enter description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Total Stock
                    </label>
                    <input
                      type="number"
                      value={newItemData.currentStock}
                      onChange={(e) => setNewItemData({...newItemData, currentStock: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Stock Level
                    </label>
                    <input
                      type="number"
                      value={newItemData.minStockLevel}
                      onChange={(e) => setNewItemData({...newItemData, minStockLevel: parseInt(e.target.value) || 0})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="0"
                    />
                  </div>
                </div>

                {/* Product-specific fields */}
                {newItemType === 'product' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category *
                      </label>
                      <input
                        type="text"
                        value={newItemData.category}
                        onChange={(e) => setNewItemData({...newItemData, category: e.target.value})}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="e.g., Tents, Furniture, Equipment"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Link Components
                      </label>
                      <div className="space-y-2">
                        {components.length === 0 ? (
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              No components available. Create components first to link them to this product.
                            </p>
                          </div>
                        ) : (
                          <>
                            {/* Component Selection Rows */}
                            {linkedComponents.map((linkedComponent, index) => {
                              const component = components.find(c => c.id === linkedComponent.componentId);
                              return (
                                <div key={linkedComponent.componentId} className="grid grid-cols-2 gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                      Component
                                    </label>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {component?.name || linkedComponent.componentName}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => removeLinkedComponent(linkedComponent.componentId)}
                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                    {component && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {component.type} • {component.size}/{component.color} • Stock: {component.currentStock}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                      Quantity
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={linkedComponent.quantity}
                                      onChange={(e) => updateLinkedComponentQuantity(linkedComponent.componentId, parseInt(e.target.value) || 1)}
                                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    />
                                  </div>
                                </div>
                              );
                            })}

                            {/* Add Component Row */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="relative">
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Select Component
                                </label>
                                <input
                                  type="text"
                                  value={componentSearchTerm}
                                  onChange={(e) => {
                                    setComponentSearchTerm(e.target.value);
                                    setShowComponentDropdown(true);
                                  }}
                                  onFocus={() => setShowComponentDropdown(true)}
                                  onBlur={() => {
                                    setTimeout(() => setShowComponentDropdown(false), 200);
                                  }}
                                  placeholder="Search components..."
                                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                                
                                {/* Component Dropdown */}
                                {showComponentDropdown && componentSearchTerm.length > 0 && (
                                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {components
                                      .filter(component => 
                                        component.name.toLowerCase().includes(componentSearchTerm.toLowerCase()) &&
                                        !linkedComponents.some(lc => lc.componentId === component.uniqueId)
                                      )
                                      .slice(0, 10)
                                      .map((component) => (
                                        <button
                                          key={component.id}
                                          onClick={() => addLinkedComponent(component.uniqueId || '', component.name)}
                                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                                        >
                                          <div className="font-medium">{component.name}</div>
                                          <div className="text-gray-500 dark:text-gray-400 text-xs">
                                            {component.type || 'N/A'} • {component.size || 'N/A'}/{component.color || 'N/A'}/{component.condition || 'N/A'} • Stock: {component.currentStock}
                                          </div>
                                        </button>
                                      ))}
                                    {components                                      .filter(component => 
                                        component.name.toLowerCase().includes(componentSearchTerm.toLowerCase()) &&
                                        !linkedComponents.some(lc => lc.componentId === component.uniqueId)
                                      ).length === 0 && (
                                      <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                                        No components found matching "{componentSearchTerm}"
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                  Quantity
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value="1"
                                  disabled
                                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm"
                                  placeholder="1"
                                />
                              </div>
                            </div>

                            {/* Add More Component Button */}
                            {linkedComponents.length > 0 && (
                              <button
                                type="button"
                                onClick={addMoreComponentRow}
                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                              >
                                + Add more component
                              </button>
                            )}

                            {/* Selection Summary */}
                            {linkedComponents.length > 0 && (
                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  <strong>Linked:</strong> {linkedComponents.length} component{linkedComponents.length !== 1 ? 's' : ''} with quantities
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Component-specific fields */}
                {newItemType === 'component' && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Type *
                        </label>
                        <input
                          type="text"
                          value={newItemData.type}
                          onChange={(e) => setNewItemData({...newItemData, type: e.target.value})}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., Pole, Fabric, Frame"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Size *
                        </label>
                        <input
                          type="text"
                          value={newItemData.size}
                          onChange={(e) => setNewItemData({...newItemData, size: e.target.value})}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., 3m, Large, Standard"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Color *
                        </label>
                        <input
                          type="text"
                          value={newItemData.color}
                          onChange={(e) => setNewItemData({...newItemData, color: e.target.value})}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., White, Blue, Red"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Condition
                      </label>
                      <select
                        value={newItemData.condition}
                        onChange={(e) => setNewItemData({...newItemData, condition: e.target.value})}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="New">New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleAddItemModalClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNewItem}
                  disabled={isCreatingItem || !newItemData.name.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isCreatingItem ? 'Creating...' : 'Create Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isAdjustmentModalOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAdjustmentModalOpen(false);
              setSelectedItemId('');
              setSelectedItemName('');
              setAdjustmentQuantity(0);
              setAdjustmentReason('');
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsAdjustmentModalOpen(false);
              setSelectedItemId('');
              setSelectedItemName('');
              setAdjustmentQuantity(0);
              setAdjustmentReason('');
            }
          }}
          tabIndex={0}
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Edit Stock
                </h3>
                <button
                  onClick={() => {
                    setIsAdjustmentModalOpen(false);
                    setSelectedItemId('');
                    setSelectedItemName('');
                    setAdjustmentQuantity(0);
                    setAdjustmentReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Edit Type
                  </label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => {
                      setAdjustmentType(e.target.value as 'product' | 'component');
                      setSelectedItemId('');
                      setSelectedItemName('');
                    }}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="product">Product</option>
                    <option value="component">Component</option>
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Item
                  </label>
                  <input
                    type="text"
                    value={itemSearchTerm}
                    onChange={(e) => {
                      setItemSearchTerm(e.target.value);
                      setShowItemDropdown(true);
                      setSelectedItemId('');
                      setSelectedItemName('');
                    }}
                    onFocus={() => setShowItemDropdown(true)}
                    placeholder="Search for an item..."
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {showItemDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                      {getFilteredItems().map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.id === 'add-new') {
                              // Handle adding new item to catalog
                              openAddItemModal(adjustmentType, itemSearchTerm);
                            } else {
                              const itemName = item.name ?? '';
                              setSelectedItemId(item.id ?? '');
                              setSelectedItemName(itemName);
                              setItemSearchTerm(itemName);
                              setShowItemDropdown(false);
                            }
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm"
                        >
                          {item.id === 'add-new' ? (
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {item.name}
                            </span>
                          ) : (
                            <span>
                              {item.name} (Current: {'currentStock' in item ? item.currentStock : 0})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity (+/-)
                  </label>
                  <input
                    type="number"
                    value={adjustmentQuantity}
                    onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter quantity (use negative for reduction)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Enter reason for adjustment"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setShowDeleteConfirmation(true)}
                  disabled={!selectedItemId}
                  className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 rounded-md hover:bg-red-200 dark:hover:bg-red-900/40 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Delete Item
                </button>
                <button
                  onClick={handleStockAdjustment}
                  disabled={!selectedItemId}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEditModal && adjustingItem && (
        <div
          ref={editModalBackdropRef}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleEditModalClose();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleEditModalClose();
            }
          }}
          tabIndex={0}
        >
          <div
            className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Edit {adjustingItemType === 'product' ? 'Product' : 'Component'}
                </h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setAdjustingItem(null);
                    setAdjustingItemName('');
                    setAdjustingItemQuantity(0);
                    setAdjustingItemReason('');
                    setEditingComponents([]);
                    setEditingComponentSearchTerm('');
                    setShowEditingComponentDropdown(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={adjustingItemName}
                    onChange={(e) => setAdjustingItemName(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Quantity Adjustment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity Adjustment (+/-)
                  </label>
                  <input
                    type="number"
                    value={adjustingItemQuantity}
                    onChange={(e) => setAdjustingItemQuantity(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter quantity (use negative for reduction)"
                  />
                </div>

                {/* Reason */}
                <div>
                                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Adjustment
                    </label>
                  <textarea
                    value={adjustingItemReason}
                    onChange={(e) => setAdjustingItemReason(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Enter reason for adjustment"
                  />
                </div>

                {/* Product-specific: Edit components */}
                {adjustingItemType === 'product' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Components Used
                    </label>
                    <div className="space-y-2">
                      {components.length === 0 ? (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            No components available. Create components first to link them to this product.
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Component Selection Rows */}
                          {editingComponents.map((editingComponent, index) => {
                            const component = components.find(c => c.id === editingComponent.componentId);
                            return (
                              <div key={editingComponent.componentId} className="grid grid-cols-2 gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-md">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Component
                                  </label>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {component?.name || editingComponent.componentName}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeEditingComponent(editingComponent.componentId)}
                                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>
                                  {component && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {component.type} • {component.size}/{component.color} • Stock: {component.currentStock}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Quantity
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={editingComponent.quantity}
                                    onChange={(e) => updateEditingComponentQuantity(editingComponent.componentId, parseInt(e.target.value) || 1)}
                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  />
                                </div>
                              </div>
                            );
                          })}

                          {/* Add Component Row */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="relative">
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Select Component
                              </label>
                              <input
                                type="text"
                                value={editingComponentSearchTerm}
                                onChange={(e) => {
                                  setEditingComponentSearchTerm(e.target.value);
                                  setShowEditingComponentDropdown(true);
                                }}
                                onFocus={() => setShowEditingComponentDropdown(true)}
                                onBlur={() => {
                                  setTimeout(() => setShowEditingComponentDropdown(false), 200);
                                }}
                                placeholder="Search components..."
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              
                              {/* Component Dropdown */}
                              {showEditingComponentDropdown && editingComponentSearchTerm.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
                                  {components
                                    .filter(component => 
                                      component.name.toLowerCase().includes(editingComponentSearchTerm.toLowerCase()) &&
                                      !editingComponents.some(lc => lc.componentId === component.id)
                                    )
                                    .slice(0, 10)
                                    .map((component) => (
                                                                              <button
                                          key={component.id}
                                          onClick={() => addEditingComponent(component.uniqueId || '', component.name)}
                                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                                        >
                                        <div className="font-medium">{component.name}</div>
                                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                                          {component.type || 'N/A'} • {component.size || 'N/A'}/{component.color || 'N/A'}/{component.condition || 'N/A'} • Stock: {component.currentStock}
                                        </div>
                                      </button>
                                    ))}
                                  {components.filter(component => 
                                    component.name.toLowerCase().includes(editingComponentSearchTerm.toLowerCase()) &&
                                    !editingComponents.some(lc => lc.componentId === component.id)
                                  ).length === 0 && (
                                    <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                                      No components found matching "{editingComponentSearchTerm}"
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Quantity
                              </label>
                              <input
                                type="number"
                                min="1"
                                value="1"
                                disabled
                                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm"
                                placeholder="1"
                              />
                            </div>
                          </div>

                          {/* Add More Component Button */}
                          {editingComponents.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingComponentSearchTerm('');
                                setShowEditingComponentDropdown(false);
                              }}
                              className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                            >
                              + Add more component
                            </button>
                          )}

                          {/* Selection Summary */}
                          {editingComponents.length > 0 && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                              <p className="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Linked:</strong> {editingComponents.length} component{editingComponents.length !== 1 ? 's' : ''} with quantities
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Component-specific: Edit component details */}
                {adjustingItemType === 'component' && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Type *
                        </label>
                        <input
                          type="text"
                          value={editingComponentType}
                          onChange={(e) => setEditingComponentType(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., Pole, Fabric, Frame"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Size *
                        </label>
                        <input
                          type="text"
                          value={editingComponentSize}
                          onChange={(e) => setEditingComponentSize(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., 3m, Large, Standard"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Color *
                        </label>
                        <input
                          type="text"
                          value={editingComponentColor}
                          onChange={(e) => setEditingComponentColor(e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="e.g., White, Blue, Red"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Condition
                      </label>
                      <select
                        value={editingComponentCondition}
                        onChange={(e) => setEditingComponentCondition(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="New">New</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Used In Products
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        {getProductsUsingComponent(adjustingItem as StockComponent).map((product, index) => (
                          <div key={product.id} className="flex justify-between items-center py-1">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {product.name} ({product.category})
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Stock: {product.currentStock}
                            </span>
                          </div>
                        ))}
                        {getProductsUsingComponent(adjustingItem as StockComponent).length === 0 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            This component is not used in any products
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleEditModalClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditItem}
                  disabled={isAdjusting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isAdjusting ? 'Processing...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Confirm Delete
                </h3>
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                        Warning
                      </h3>
                      <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                        <p>Are you sure you want to delete <strong>{selectedItemName}</strong>?</p>
                        <p className="mt-1">This action cannot be undone.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteItem}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Description Modal */}
      {showDescriptionModal && selectedItemForDescription && (
        <div 
          ref={descriptionModalBackdropRef}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDescriptionModal(false);
              setSelectedItemForDescription(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowDescriptionModal(false);
              setSelectedItemForDescription(null);
            }
          }}
          tabIndex={0}
        >
          <div 
            className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedItemForDescription.name}
                </h3>
                <button
                  onClick={() => {
                    setShowDescriptionModal(false);
                    setSelectedItemForDescription(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Item Type Badge */}
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    'category' in selectedItemForDescription 
                      ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20' 
                      : 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/20'
                  }`}>
                    {'category' in selectedItemForDescription ? 'Product' : 'Component'}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    {!isEditingDescription && (
                      <button
                        onClick={handleEditDescription}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Edit description"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {isEditingDescription ? (
                    <div className="relative">
                      <textarea
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        rows={4}
                        placeholder="Enter description..."
                        autoFocus
                      />
                      <button
                        onClick={handleSaveDescription}
                        disabled={isSavingDescription}
                        className="absolute bottom-2 right-2 p-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 rounded-md text-white transition-colors"
                        title="Save description"
                      >
                        {isSavingDescription ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      {selectedItemForDescription.description ? (
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedItemForDescription.description}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                          No description available
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Product-specific details */}
                {'category' in selectedItemForDescription && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {(selectedItemForDescription as StockProduct).category}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Stock Level
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedItemForDescription.currentStock} / {selectedItemForDescription.minStockLevel} min
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Component-specific details */}
                {'type' in selectedItemForDescription && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedItemForDescription.type}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Size
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedItemForDescription.size}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Color
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {selectedItemForDescription.color}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stock Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Information
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Stock:</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedItemForDescription.currentStock}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Min Stock Level:</span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedItemForDescription.minStockLevel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowDescriptionModal(false);
                    setSelectedItemForDescription(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal Unsaved Changes Confirmation */}
      {showEditModalConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-40 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Unsaved Changes
                </h3>
              </div>
              <div className="mb-4 text-gray-700 dark:text-gray-300">
                Do you wish to save changes?
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditModalConfirm(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  No, Keep Editing
                </button>
                <button
                  onClick={() => {
                    setShowEditModalConfirm(false);
                    setShowEditModal(false);
                    setAdjustingItem(null);
                    setAdjustingItemName('');
                    setAdjustingItemQuantity(0);
                    setAdjustingItemReason('');
                    setEditingComponents([]);
                    setEditingComponentSearchTerm('');
                    setShowEditingComponentDropdown(false);
                    setEditingComponentType('');
                    setEditingComponentSize('');
                    setEditingComponentColor('');
                    setEditingComponentCondition('New');
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Yes, Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Add Item Modal Unsaved Changes Confirmation */}
      {showAddItemModalConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-40 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800" onClick={e => e.stopPropagation()}>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Unsaved Changes
                </h3>
              </div>
              <div className="mb-4 text-gray-700 dark:text-gray-300">
                Do you wish to save changes?
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddItemModalConfirm(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  No, Keep Editing
                </button>
                <button
                  onClick={() => {
                    setShowAddItemModalConfirm(false);
                    setShowAddItemModal(false);
                    setNewItemData({
                      name: '',
                      category: '',
                      description: '',
                      currentStock: 0,
                      minStockLevel: 0,
                      components: [],
                      type: '',
                      size: '',
                      color: '',
                      condition: 'New',
                      usedInProducts: []
                    });
                    setLinkedComponents([]);
                    setComponentSearchTerm('');
                    setShowComponentDropdown(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Yes, Discard Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 