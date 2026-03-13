export interface Property {
  id: string;
  statusId: string;
  invoiceStatus: 'Needs Invoice' | 'Pending' | 'Paid' | '';
  receiveDate: string;
  scheduleDate: string;
  client: string;
  note: string;
  address: string;
  employeeNote: string;
  serviceId: string;
  rooms: string;
  bathrooms: string;
  priorityId: string;
  teamId: string;
  timeIn: string;
  timeOut: string;
  
  // Campos opcionales para las tarjetas iniciales
  city?: string;
  size?: string;
  description?: string;
  tag?: { text: string; type: 'team' | 'prepaid' };
  bottomNote?: string;
  borderColorClass?: string;
}

export interface SettingOption {
  id: string;
  label: string;
  icon: React.ElementType;
}

export interface CategoryExpense { id: string; name: string; }
export interface Team { id: string; name: string; business: string; color: string; }
export interface Responsable { id: string; name: string; color: string; }
export interface Priority { id: string; name: string; business: string; color: string; }
export interface Status { id: string; order: string | number; name: string; business: string; color: string; }
export interface Tax { id: string; percentage: number; }
export interface Place { id: string; name: string; }
export interface Service { id: string; name: string; estimatedTime: string; business: string; }
export interface PaymentMethod { id: string; name: string; }
export interface Task { id: string; placeId: string; name: string; }
export interface Product { id: string; name: string; price: string | number; }
export interface Business { id: string; name: string; }

export interface Customer {
  id: string;
  color: string;
  type: string;
  name: string;
  business: string;
  note: string;
  address: string;
  cityStateZip: string;
  email: string;
}