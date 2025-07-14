// Core data types for IMMIOS

export interface User {
  id: string;
  email: string;
  password?: string; // Only for creation, not stored in DB
  role: 'admin' | 'staff';
  staffId?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Staff {
  id: string;
  name: string;
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
  notes?: string;
  availability: {
    isAvailable: boolean;
    unavailableDates?: Date[];
    preferredHours?: {
      start: string;
      end: string;
    };
  };
  linkedUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Component {
  id: string;
  name: string;
  description?: string;
  category: string;
  stockLevel: number;
  minStockLevel: number;
  usedInProducts: string[]; // Product IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  components: string[]; // Component IDs
  stockLevel: number;
  minStockLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  registration: string;
  maintenanceSchedule: {
    lastMaintenance?: Date;
    nextMaintenance?: Date;
    maintenanceNotes?: string;
  };
  availability: {
    isAvailable: boolean;
    assignedJobs: string[]; // Job IDs
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  clientDetails: {
    name: string;
    contact: {
      phone?: string;
      email?: string;
      address?: string;
    };
    notes?: string;
  };
  dates: {
    startDate: Date;
    endDate: Date;
    setupDate?: Date;
    teardownDate?: Date;
  };
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
    notes?: string;
  };
  products: Array<{
    productId: string;
    quantity: number;
    notes?: string;
  }>;
  status: 'quote' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  assignedStaff: string[]; // Staff IDs
  assignedVehicles: string[]; // Vehicle IDs
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Real-time event types
export interface RealtimeEvent {
  type: 'job_update' | 'stock_update' | 'staff_update' | 'vehicle_update';
  data: any;
  timestamp: Date;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface JobForm {
  clientDetails: Job['clientDetails'];
  dates: Job['dates'];
  location: Job['location'];
  products: Job['products'];
  assignedStaff: string[];
  assignedVehicles: string[];
  notes?: string;
}

// UI State types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ThemeState {
  isDarkMode: boolean;
}

// Navigation types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
} 