import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  DocumentData,
  QuerySnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types for stock management
export interface StockProduct {
  id?: string;
  name: string;
  category: string;
  description?: string;
  currentStock: number;
  minStockLevel: number;
  components: string[];
  componentQuantities?: { [componentName: string]: number };
  status: string;
  price?: number;
  rentalPrice?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockComponent {
  id?: string;
  name: string;
  type: string;
  size: string;
  color: string;
  condition: string;
  currentStock: number;
  minStockLevel: number;
  usedInProducts: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssemblyAlert {
  id?: string;
  product: string;
  quantity: number;
  priority: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  taskType?: 'Assemble' | 'Disassemble';
  createdAt: Date;
  dueDate?: Date;
  assignedTo?: string;
  notes?: string;
}

export interface StockAdjustment {
  id?: string;
  type: 'product' | 'component';
  itemId: string;
  itemName: string;
  quantity: number;
  reason: string;
  adjustedBy: string;
  createdAt: Date;
}

export class StockService {
  // Products
  static async getAllProducts(): Promise<StockProduct[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StockProduct[];
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  static async getProduct(productId: string): Promise<StockProduct | null> {
    try {
      const docRef = doc(db, 'products', productId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as StockProduct;
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  static async createProduct(productData: Omit<StockProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const batch = writeBatch(db);
      
      // Create the product
      const productRef = doc(collection(db, 'products'));
      batch.set(productRef, {
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Update component references if components are specified
      if (productData.components && productData.components.length > 0) {
        await this.updateComponentReferencesInBatch(batch, productRef.id, productData.components, 'add');
      }

      await batch.commit();
      return productRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  static async updateProduct(productId: string, productData: Partial<StockProduct>): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Get the current product to compare components
      const currentProduct = await this.getProduct(productId);
      if (!currentProduct) {
        throw new Error('Product not found');
      }

      // Update the product
      const docRef = doc(db, 'products', productId);
      batch.update(docRef, {
        ...productData,
        updatedAt: new Date()
      });

      // Handle component reference updates if components changed
      if (productData.components !== undefined) {
        const oldComponents = currentProduct.components || [];
        const newComponents = productData.components;

        // Find components to remove
        const componentsToRemove = oldComponents.filter(comp => !newComponents.includes(comp));
        if (componentsToRemove.length > 0) {
          await this.updateComponentReferencesInBatch(batch, productId, componentsToRemove, 'remove');
        }

        // Find components to add
        const componentsToAdd = newComponents.filter(comp => !oldComponents.includes(comp));
        if (componentsToAdd.length > 0) {
          await this.updateComponentReferencesInBatch(batch, productId, componentsToAdd, 'add');
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async deleteProduct(productId: string): Promise<void> {
    try {
      console.log('StockService: Attempting to delete product with ID:', productId);
      const docRef = doc(db, 'products', productId);
      
      // Check if document exists before deleting
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error('StockService: Product document does not exist:', productId);
        throw new Error('Product not found');
      }

      // Get the product to remove component references
      const product = docSnap.data() as StockProduct;
      
      if (product.components && product.components.length > 0) {
        const batch = writeBatch(db);
        
        // Remove component references
        await this.updateComponentReferencesInBatch(batch, productId, product.components, 'remove');
        
        // Delete the product
        batch.delete(docRef);
        
        await batch.commit();
        console.log('StockService: Product and component references deleted successfully:', productId);
      } else {
        // No components to update, just delete the product
        await deleteDoc(docRef);
        console.log('StockService: Product deleted successfully:', productId);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Components
  static async getAllComponents(): Promise<StockComponent[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'components'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StockComponent[];
    } catch (error) {
      console.error('Error getting components:', error);
      throw error;
    }
  }

  static async getComponent(componentId: string): Promise<StockComponent | null> {
    try {
      const docRef = doc(db, 'components', componentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as StockComponent;
      }
      return null;
    } catch (error) {
      console.error('Error getting component:', error);
      throw error;
    }
  }

  static async createComponent(componentData: Omit<StockComponent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'components'), {
        ...componentData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating component:', error);
      throw error;
    }
  }

  static async updateComponent(componentId: string, componentData: Partial<StockComponent>): Promise<void> {
    try {
      const docRef = doc(db, 'components', componentId);
      await updateDoc(docRef, {
        ...componentData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating component:', error);
      throw error;
    }
  }

  static async deleteComponent(componentId: string): Promise<void> {
    try {
      console.log('StockService: Attempting to delete component with ID:', componentId);
      const docRef = doc(db, 'components', componentId);
      
      // Check if document exists before deleting
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error('StockService: Component document does not exist:', componentId);
        throw new Error('Component not found');
      }
      
      console.log('StockService: Component document exists, proceeding with deletion');
      await deleteDoc(docRef);
      console.log('StockService: Component deleted successfully:', componentId);
    } catch (error) {
      console.error('Error deleting component:', error);
      throw error;
    }
  }

  // Duplicate functions
  static async duplicateProduct(productId: string): Promise<string> {
    try {
      const product = await this.getProduct(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if product name already exists
      const allProducts = await this.getAllProducts();
      const existingNames = allProducts.map(p => p.name);
      
      let newName = `${product.name}-copy`;
      let counter = 1;
      while (existingNames.includes(newName)) {
        newName = `${product.name}-copy-${counter}`;
        counter++;
      }

      const duplicatedProduct = {
        ...product,
        name: newName,
        currentStock: 0, // Reset stock for duplicate
        status: this.calculateStockStatus(0, product.minStockLevel)
      };

      // Remove id, createdAt, and updatedAt for new document
      const { id, createdAt, updatedAt, ...productData } = duplicatedProduct;
      
      return await this.createProduct(productData);
    } catch (error) {
      console.error('Error duplicating product:', error);
      throw error;
    }
  }

  static async duplicateComponent(componentId: string): Promise<string> {
    try {
      const component = await this.getComponent(componentId);
      if (!component) {
        throw new Error('Component not found');
      }

      // Check if component name already exists
      const allComponents = await this.getAllComponents();
      const existingNames = allComponents.map(c => c.name);
      
      let newName = `${component.name}-copy`;
      let counter = 1;
      while (existingNames.includes(newName)) {
        newName = `${component.name}-copy-${counter}`;
        counter++;
      }

      const duplicatedComponent = {
        ...component,
        name: newName,
        currentStock: 0, // Reset stock for duplicate
        usedInProducts: [] // Reset product associations for duplicate
      };

      // Remove id, createdAt, and updatedAt for new document
      const { id, createdAt, updatedAt, ...componentData } = duplicatedComponent;
      
      return await this.createComponent(componentData);
    } catch (error) {
      console.error('Error duplicating component:', error);
      throw error;
    }
  }

  // Assembly Tasks
  static async getAllAssemblyAlerts(): Promise<AssemblyAlert[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'assemblyAlerts'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AssemblyAlert[];
    } catch (error) {
      console.error('Error getting assembly tasks:', error);
      throw error;
    }
  }

  static async createAssemblyAlert(alertData: Omit<AssemblyAlert, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'assemblyAlerts'), {
        ...alertData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating assembly task:', error);
      throw error;
    }
  }

  static async updateAssemblyAlert(alertId: string, alertData: Partial<AssemblyAlert>): Promise<void> {
    try {
      const docRef = doc(db, 'assemblyAlerts', alertId);
      await updateDoc(docRef, alertData);
    } catch (error) {
      console.error('Error updating assembly task:', error);
      throw error;
    }
  }

  static async deleteAssemblyAlert(alertId: string): Promise<void> {
    try {
      const docRef = doc(db, 'assemblyAlerts', alertId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting assembly task:', error);
      throw error;
    }
  }

  // Stock Adjustments
  static async createStockAdjustment(adjustmentData: Omit<StockAdjustment, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'stockAdjustments'), {
        ...adjustmentData,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating stock adjustment:', error);
      throw error;
    }
  }

  static async getAllStockAdjustments(): Promise<StockAdjustment[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'stockAdjustments'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StockAdjustment[];
    } catch (error) {
      console.error('Error getting stock adjustments:', error);
      throw error;
    }
  }

  // Stock Operations
  static async adjustStock(
    type: 'product' | 'component',
    itemId: string,
    itemName: string,
    quantity: number,
    reason: string,
    adjustedBy: string
  ): Promise<void> {
    const batch = writeBatch(db);

    try {
      // Create stock adjustment record
      const adjustmentRef = doc(collection(db, 'stockAdjustments'));
      batch.set(adjustmentRef, {
        type,
        itemId,
        itemName,
        quantity,
        reason,
        adjustedBy,
        createdAt: new Date()
      });

      // Update stock level
      const collectionName = type === 'product' ? 'products' : 'components';
      const itemRef = doc(db, collectionName, itemId);
      
      const itemDoc = await getDoc(itemRef);
      if (!itemDoc.exists()) {
        throw new Error(`${type} not found`);
      }

      const currentStock = itemDoc.data().currentStock || 0;
      const newStock = currentStock + quantity;

      if (newStock < 0) {
        throw new Error('Stock cannot go below 0');
      }

      batch.update(itemRef, {
        currentStock: newStock,
        updatedAt: new Date()
      });

      await batch.commit();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw error;
    }
  }

  // Real-time listeners
  static subscribeToProducts(callback: (products: StockProduct[]) => void): () => void {
    const q = query(collection(db, 'products'), orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      console.log('StockService: Products subscription update, docs count:', querySnapshot.docs.length);
      const products = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StockProduct[];
      console.log('StockService: Products processed:', products.length);
      callback(products);
    }, (error) => {
      console.error('StockService: Error in products subscription:', error);
    });

    return unsubscribe;
  }

  static subscribeToComponents(callback: (components: StockComponent[]) => void): () => void {
    const q = query(collection(db, 'components'), orderBy('updatedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const components = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StockComponent[];
      callback(components);
    });

    return unsubscribe;
  }

  static subscribeToAssemblyAlerts(callback: (alerts: AssemblyAlert[]) => void): () => void {
    const q = query(collection(db, 'assemblyAlerts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const alerts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AssemblyAlert[];
      callback(alerts);
    });

    return unsubscribe;
  }

  // Helper functions
  static calculateStockStatus(currentStock: number, minStockLevel: number): string {
    if (currentStock <= 0) return 'CRITICAL';
    if (currentStock <= minStockLevel) return 'LOW';
    if (currentStock <= minStockLevel * 1.5) return 'WARNING';
    return 'OK';
  }

  static calculatePriority(currentStock: number, minStockLevel: number, demand?: number): string {
    if (currentStock <= 0) return 'High';
    if (currentStock <= minStockLevel) return 'High';
    if (currentStock <= minStockLevel * 1.5) return 'Medium';
    return 'Low';
  }

  // Initialize database - only checks if data exists, no mock data import
  static async initializeStockData(): Promise<void> {
    try {
      // Check if data already exists
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const componentsSnapshot = await getDocs(collection(db, 'components'));

      if (!productsSnapshot.empty || !componentsSnapshot.empty) {
        console.log('Database already contains data, skipping initialization');
        console.log(`Found ${productsSnapshot.size} products and ${componentsSnapshot.size} components`);
        return;
      }

      // Database is empty - ready for manual data entry through UI
      console.log('Database is empty, ready for manual data entry through the interface');
      console.log('Use the "Add Product" and "Add Component" features to enter your business data');
    } catch (error) {
      console.error('Error checking database state:', error);
      throw error;
    }
  }

  // Data validation and integrity check
  static async validateDataIntegrity(): Promise<boolean> {
    try {
      const products = await this.getAllProducts();
      const components = await this.getAllComponents();
      
      // Check for orphaned references
      const allComponentNames = components.map(c => c.name);
      const orphanedProducts = products.filter(p => 
        p.components?.some(componentName => !allComponentNames.includes(componentName))
      );
      
      if (orphanedProducts.length > 0) {
        console.warn('Found products with invalid component references:', orphanedProducts.map(p => p.name));
        return false;
      }
      
      console.log('Data integrity check passed');
      return true;
    } catch (error) {
      console.error('Data integrity check failed:', error);
      return false;
    }
  }

  // Helper method to update component references
  static async updateComponentReferences(
    productId: string, 
    componentNames: string[], 
    action: 'add' | 'remove'
  ): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      // Get all components to find the ones that match the names
      const allComponents = await this.getAllComponents();
      
      for (const componentName of componentNames) {
        const component = allComponents.find(c => c.name === componentName);
        if (component) {
          const componentRef = doc(db, 'components', component.id!);
          let updatedUsedInProducts = [...(component.usedInProducts || [])];
          
          if (action === 'add') {
            if (!updatedUsedInProducts.includes(productId)) {
              updatedUsedInProducts.push(productId);
            }
          } else if (action === 'remove') {
            updatedUsedInProducts = updatedUsedInProducts.filter(id => id !== productId);
          }
          
          batch.update(componentRef, {
            usedInProducts: updatedUsedInProducts,
            updatedAt: new Date()
          });
        }
      }
      
      await batch.commit();
    } catch (error) {
      console.error('Error updating component references:', error);
      throw error;
    }
  }

  // Helper method to update component references within an existing batch
  static async updateComponentReferencesInBatch(
    batch: any,
    productId: string, 
    componentNames: string[], 
    action: 'add' | 'remove'
  ): Promise<void> {
    try {
      // Get all components to find the ones that match the names
      const allComponents = await this.getAllComponents();
      
      for (const componentName of componentNames) {
        const component = allComponents.find(c => c.name === componentName);
        if (component) {
          const componentRef = doc(db, 'components', component.id!);
          let updatedUsedInProducts = [...(component.usedInProducts || [])];
          
          if (action === 'add') {
            if (!updatedUsedInProducts.includes(productId)) {
              updatedUsedInProducts.push(productId);
            }
          } else if (action === 'remove') {
            updatedUsedInProducts = updatedUsedInProducts.filter(id => id !== productId);
          }
          
          batch.update(componentRef, {
            usedInProducts: updatedUsedInProducts,
            updatedAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error updating component references in batch:', error);
      throw error;
    }
  }

  // Calculate assembled stock for a component
  static calculateAssembledStock(componentName: string, products: StockProduct[]): number {
    let totalAssembled = 0;
    
    for (const product of products) {
      if (product.components && product.components.includes(componentName)) {
        // Get the quantity of this component used in this product
        const componentQuantity = product.componentQuantities?.[componentName] || 1;
        // Multiply by the current stock of the product
        totalAssembled += componentQuantity * product.currentStock;
      }
    }
    
    return totalAssembled;
  }
} 