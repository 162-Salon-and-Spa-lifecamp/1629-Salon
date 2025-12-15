export enum UserRole {
  STAFF = 'STAFF',
  SUPERVISOR = 'SUPERVISOR',
  MANAGER = 'MANAGER'
}

export enum ServiceCategory {
  HAIR = 'Hair Salon',
  BARBER = 'Barbers',
  NAILS = 'Nails & Foot Services',
  SPA = 'Spa',
  LAUNDRY = 'Laundry',
  RETAIL = 'Retail Product'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  pin: string; // Simplified login for demo
  jobTitle: string; // e.g., "Senior Stylist"
  isClockedIn: boolean;
  lastClockIn?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ServiceCategory;
  subCategory: string;
  isRetail: boolean;
  stockLevel?: number; // Only for retail
  minReorderPoint?: number; // Only for retail
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  totalHours?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  staffId: string;
  staffName: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: 'Cash' | 'Card' | 'Transfer';
}

export interface QRCodeData {
  userId: string;
  timestamp: number;
  validUntil: number;
  signature: string; // Mock signature for security
}