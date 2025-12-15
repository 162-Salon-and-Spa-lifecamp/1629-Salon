import { User, Product, Transaction, AttendanceRecord } from '../types';
import { MOCK_USERS, MOCK_CATALOG } from '../constants';

const KEYS = {
  USERS: 'salonsync_users',
  PRODUCTS: 'salonsync_products',
  TRANSACTIONS: 'salonsync_transactions',
  ATTENDANCE: 'salonsync_attendance'
};

export const storage = {
  getUsers: (): User[] => {
    try {
      const data = localStorage.getItem(KEYS.USERS);
      return data ? JSON.parse(data) : MOCK_USERS;
    } catch (e) {
      console.error("Failed to load users", e);
      return MOCK_USERS;
    }
  },
  saveUsers: (users: User[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(users)),

  getProducts: (): Product[] => {
    try {
      const data = localStorage.getItem(KEYS.PRODUCTS);
      return data ? JSON.parse(data) : MOCK_CATALOG;
    } catch (e) {
      console.error("Failed to load products", e);
      return MOCK_CATALOG;
    }
  },
  saveProducts: (products: Product[]) => localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products)),

  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  saveTransactions: (txs: Transaction[]) => localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs)),

  getAttendance: (): AttendanceRecord[] => {
    try {
      const data = localStorage.getItem(KEYS.ATTENDANCE);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },
  saveAttendance: (records: AttendanceRecord[]) => localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records)),
};