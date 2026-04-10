// src/types/index.ts

// ==========================================
// 1. SYSTEM SECURITY & USERS (RBAC)
// ==========================================

export interface Permission {
  module: string;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  scope: 'All' | 'Own';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface SystemUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  altPhone: string;
  roleId: string;
  status: 'Active' | 'Pending Invite';
  teamId?: string; // <-- AÑADIDO PARA EL TEAM CATALOG
}

// ==========================================
// 2. CORE BUSINESS LOGIC (Properties/Jobs)
// ==========================================

export interface Property {
  id: string;
  client: string;
  address: string;
  statusId: string;
  invoiceStatus: string;
  receiveDate: string;
  scheduleDate: string;
  serviceId: string;
  priorityId: string;
  teamId: string;
  timeIn: string;
  timeOut: string;
  rooms: string;
  bathrooms: string;
  note: string;
  employeeNote: string;
  
  // Propiedades para la asignación de personal
  assignedWorkers?: string[]; // <-- AÑADIDO PARA LOS TRABAJADORES DEL DÍA
  
  // Propiedades para la subida de imágenes
  beforePhotos?: string[];
  afterPhotos?: string[];
  
  // ==========================================
  // Propiedades opcionales / Visuales (Legacy)
  // ==========================================
  description?: string;
  city?: string;
  size?: string;
  bottomNote?: string;
  borderColorClass?: string;
  tag?: {
    text: string;
    type: string;
  };
}

// ==========================================
// 3. SETTINGS & CATALOGS
// ==========================================

export interface Status {
  id: string;
  name: string;
  color: string;
  order?: number | string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface Priority {
  id: string;
  name: string;
  color: string;
}

export interface Service {
  id: string;
  name: string;
  color?: string; 
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface SettingOption {
  id: string;
  label: string;
  icon: React.ElementType;
}

// Interfaces faltantes que estaban en el SettingsView pero no en tu copia
export interface CategoryExpense { id: string; name: string; }
export interface Responsable { id: string; name: string; color: string; }
export interface Tax { id: string; percentage: number; }
export interface Place { id: string; name: string; }
export interface PaymentMethod { id: string; name: string; }
export interface Task { id: string; placeId: string; name: string; }
export interface Product { id: string; name: string; price: string | number; }
export interface Business { id: string; name: string; }