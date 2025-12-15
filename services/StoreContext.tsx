import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Transaction, AttendanceRecord } from '../types';
import { storage } from './storage';
import { MOCK_USERS, MOCK_CATALOG } from '../constants';

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  products: Product[];
  transactions: Transaction[];
  attendance: AttendanceRecord[];
  loading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  
  // Actions
  login: (userId: string, pin: string) => boolean;
  logout: () => void;
  recordTransaction: (transaction: Transaction) => Promise<void>;
  toggleAttendance: (userId: string) => Promise<void>;
  toggleTheme: () => void;
  
  // CRUD Actions
  addUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  removeUser: (userId: string) => Promise<void>;
  
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  // Admin
  initializeDatabase: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize Data from LocalStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const loadedUsers = storage.getUsers();
        const loadedProducts = storage.getProducts();
        const loadedTransactions = storage.getTransactions();
        const loadedAttendance = storage.getAttendance();

        setUsers(loadedUsers);
        setProducts(loadedProducts);
        // Sort transactions by date desc
        setTransactions(loadedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        // Sort attendance by clockInTime desc
        setAttendance(loadedAttendance.sort((a, b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime()));
        
        // Load Theme
        const savedTheme = localStorage.getItem('1629salon_theme') as 'light' | 'dark';
        if (savedTheme) {
          setTheme(savedTheme);
          if (savedTheme === 'dark') document.documentElement.classList.add('dark');
        }

        setError(null);
      } catch (err: any) {
        console.error("Storage Load Error:", err);
        setError("Failed to load local data: " + (err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // -- Persistence Helpers --
  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    storage.saveUsers(newUsers);
  };

  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    storage.saveProducts(newProducts);
  };

  const saveTransactions = (newTxs: Transaction[]) => {
    setTransactions(newTxs);
    storage.saveTransactions(newTxs);
  };

  const saveAttendanceRecords = (newRecs: AttendanceRecord[]) => {
    setAttendance(newRecs);
    storage.saveAttendance(newRecs);
  };

  // -- Actions --

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('1629salon_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const login = (userId: string, pin: string) => {
    const user = users.find(u => u.id === userId && u.pin === pin);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const recordTransaction = async (tx: Transaction) => {
    // 1. Add Transaction
    const newTxs = [tx, ...transactions];
    saveTransactions(newTxs);

    // 2. Update Inventory
    const newProducts = products.map(p => {
      const soldItem = tx.items.find(i => i.id === p.id);
      if (soldItem && p.isRetail && p.stockLevel !== undefined) {
        return { 
          ...p, 
          stockLevel: Math.max(0, p.stockLevel - soldItem.quantity) 
        };
      }
      return p;
    });
    saveProducts(newProducts);
  };

  const toggleAttendance = async (userId: string) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;
    const user = users[userIndex];
    
    const now = new Date();
    const timestamp = now.toISOString();
    
    let newAttendance = [...attendance];
    const updatedUser = { ...user };

    if (user.isClockedIn) {
      // Clock Out
      const openRecordIndex = newAttendance.findIndex(r => r.userId === userId && !r.clockOutTime);
      
      if (openRecordIndex !== -1) {
        const record = { ...newAttendance[openRecordIndex] };
        const startTime = new Date(record.clockInTime);
        const totalMs = now.getTime() - startTime.getTime();
        const totalHours = parseFloat((totalMs / (1000 * 60 * 60)).toFixed(2));

        record.clockOutTime = timestamp;
        record.totalHours = totalHours;
        
        newAttendance[openRecordIndex] = record;
      }

      updatedUser.isClockedIn = false;
      // updatedUser.lastClockIn can remain as last known or be cleared. 
      // Keeping it reflects the record.
    } else {
      // Clock In
      const newRecord: AttendanceRecord = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        date: now.toLocaleDateString(),
        clockInTime: timestamp,
      };
      // Add to front
      newAttendance = [newRecord, ...newAttendance];

      updatedUser.isClockedIn = true;
      updatedUser.lastClockIn = timestamp;
    }

    // Sort attendance again just in case, though prepending maintains order if strictly time-based
    saveAttendanceRecords(newAttendance);
    
    const newUsers = [...users];
    newUsers[userIndex] = updatedUser;
    saveUsers(newUsers);
  };

  // --- CRUD Operations ---

  const addUser = async (user: User) => {
    const newUsers = [...users, user];
    saveUsers(newUsers);
  };

  const updateUser = async (user: User) => {
    const newUsers = users.map(u => u.id === user.id ? user : u);
    saveUsers(newUsers);
  };

  const removeUser = async (userId: string) => {
    const newUsers = users.filter(u => u.id !== userId);
    saveUsers(newUsers);
  };

  const addProduct = async (product: Product) => {
    const newProducts = [...products, product];
    saveProducts(newProducts);
  };

  const updateProduct = async (product: Product) => {
    const newProducts = products.map(p => p.id === product.id ? product : p);
    saveProducts(newProducts);
  };

  const deleteProduct = async (productId: string) => {
    const newProducts = products.filter(p => p.id !== productId);
    saveProducts(newProducts);
  };

  const initializeDatabase = async () => {
    // Reset to defaults
    setLoading(true);
    saveUsers(MOCK_USERS);
    saveProducts(MOCK_CATALOG);
    saveTransactions([]);
    saveAttendanceRecords([]);
    setLoading(false);
  };

  return (
    <StoreContext.Provider value={{
      currentUser,
      users,
      products,
      transactions,
      attendance,
      loading,
      error,
      theme,
      toggleTheme,
      login,
      logout,
      recordTransaction,
      toggleAttendance,
      addUser,
      updateUser,
      removeUser,
      addProduct,
      updateProduct,
      deleteProduct,
      initializeDatabase
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};