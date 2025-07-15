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
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types for our data models
export interface User {
  id?: string;
  email: string;
  role: 'admin' | 'staff';
  staffId?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Staff {
  id?: string;
  name: string;
  contactInfo: {
    email?: string;
    phone?: string;
  };
  notes?: string;
  availability: boolean;
  linkedUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id?: string;
  name: string;
  description?: string;
  category: string;
  components: string[];
  stockLevel: number;
  minStockLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id?: string;
  clientDetails: {
    name: string;
    email?: string;
    phone?: string;
  };
  dates: {
    start: Date;
    end: Date;
  };
  location: string;
  products: string[];
  status: 'quote' | 'job';
  assignedStaff: string[];
  assignedVehicles: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id?: string;
  name: string;
  type: string;
  registration?: string;
  maintenanceSchedule?: Date;
  availability: boolean;
  assignedJobs: string[];
  createdAt: Date;
}

export interface Component {
  id?: string;
  name: string;
  description?: string;
  category: string;
  stockLevel: number;
  minStockLevel: number;
  usedInProducts: string[];
  createdAt: Date;
}

// Generic CRUD operations
export class DatabaseService {
  // Generic get document
  static async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  // Generic get all documents
  static async getDocuments<T>(collectionName: string): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      throw error;
    }
  }

  // Generic add document
  static async addDocument<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error);
      throw error;
    }
  }

  // Generic update document
  static async updateDocument<T>(collectionName: string, docId: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  // Generic delete document
  static async deleteDocument(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  // Real-time listener
  static subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void
  ): () => void {
    const q = query(collection(db, collectionName));
    
    const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      callback(data);
    });

    return unsubscribe;
  }
}

// Specific service classes for each collection
export class UserService extends DatabaseService {
  static async getUser(userId: string): Promise<User | null> {
    return this.getDocument<User>('users', userId);
  }

  static async getAllUsers(): Promise<User[]> {
    return this.getDocuments<User>('users');
  }

  static async createUser(userData: Omit<User, 'id'>): Promise<string> {
    return this.addDocument<User>('users', userData);
  }

  static async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    return this.updateDocument<User>('users', userId, userData);
  }

  static async deleteUser(userId: string): Promise<void> {
    return this.deleteDocument('users', userId);
  }
}

export class StaffService extends DatabaseService {
  static async getStaff(staffId: string): Promise<Staff | null> {
    return this.getDocument<Staff>('staff', staffId);
  }

  static async getAllStaff(): Promise<Staff[]> {
    return this.getDocuments<Staff>('staff');
  }

  static async createStaff(staffData: Omit<Staff, 'id'>): Promise<string> {
    return this.addDocument<Staff>('staff', staffData);
  }

  static async updateStaff(staffId: string, staffData: Partial<Staff>): Promise<void> {
    return this.updateDocument<Staff>('staff', staffId, staffData);
  }

  static async deleteStaff(staffId: string): Promise<void> {
    return this.deleteDocument('staff', staffId);
  }
}

export class ProductService extends DatabaseService {
  static async getProduct(productId: string): Promise<Product | null> {
    return this.getDocument<Product>('products', productId);
  }

  static async getAllProducts(): Promise<Product[]> {
    return this.getDocuments<Product>('products');
  }

  static async createProduct(productData: Omit<Product, 'id'>): Promise<string> {
    return this.addDocument<Product>('products', productData);
  }

  static async updateProduct(productId: string, productData: Partial<Product>): Promise<void> {
    return this.updateDocument<Product>('products', productId, productData);
  }

  static async deleteProduct(productId: string): Promise<void> {
    return this.deleteDocument('products', productId);
  }
}

export class JobService extends DatabaseService {
  static async getJob(jobId: string): Promise<Job | null> {
    return this.getDocument<Job>('jobs', jobId);
  }

  static async getAllJobs(): Promise<Job[]> {
    return this.getDocuments<Job>('jobs');
  }

  static async createJob(jobData: Omit<Job, 'id'>): Promise<string> {
    return this.addDocument<Job>('jobs', jobData);
  }

  static async updateJob(jobId: string, jobData: Partial<Job>): Promise<void> {
    return this.updateDocument<Job>('jobs', jobId, jobData);
  }

  static async deleteJob(jobId: string): Promise<void> {
    return this.deleteDocument('jobs', jobId);
  }
}

export class VehicleService extends DatabaseService {
  static async getVehicle(vehicleId: string): Promise<Vehicle | null> {
    return this.getDocument<Vehicle>('vehicles', vehicleId);
  }

  static async getAllVehicles(): Promise<Vehicle[]> {
    return this.getDocuments<Vehicle>('vehicles');
  }

  static async createVehicle(vehicleData: Omit<Vehicle, 'id'>): Promise<string> {
    return this.addDocument<Vehicle>('vehicles', vehicleData);
  }

  static async updateVehicle(vehicleId: string, vehicleData: Partial<Vehicle>): Promise<void> {
    return this.updateDocument<Vehicle>('vehicles', vehicleId, vehicleData);
  }

  static async deleteVehicle(vehicleId: string): Promise<void> {
    return this.deleteDocument('vehicles', vehicleId);
  }
}

export class ComponentService extends DatabaseService {
  static async getComponent(componentId: string): Promise<Component | null> {
    return this.getDocument<Component>('components', componentId);
  }

  static async getAllComponents(): Promise<Component[]> {
    return this.getDocuments<Component>('components');
  }

  static async createComponent(componentData: Omit<Component, 'id'>): Promise<string> {
    return this.addDocument<Component>('components', componentData);
  }

  static async updateComponent(componentId: string, componentData: Partial<Component>): Promise<void> {
    return this.updateDocument<Component>('components', componentId, componentData);
  }

  static async deleteComponent(componentId: string): Promise<void> {
    return this.deleteDocument('components', componentId);
  }
} 