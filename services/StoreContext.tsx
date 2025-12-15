import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, Transaction, AttendanceRecord } from '../types';
import { supabase } from './supabase';
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
  login: (userId: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  recordTransaction: (transaction: Transaction) => Promise<void>;
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

  // Real-time subscriptions
  useEffect(() => {
    const productsSubscription = supabase
      .channel('custom-products-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Products change received!', payload)
          loadData();
        }
      )
      .subscribe();

    const usersSubscription = supabase
      .channel('custom-users-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          console.log('Users change received!', payload)
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsSubscription);
      supabase.removeChannel(usersSubscription);
    };
  }, []);

  // Auth and Data Loading
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setError('Could not fetch user profile.');
          setCurrentUser(null);
        } else {
          setCurrentUser(userData as User);
        }

        loadData();
      } else {
        setCurrentUser(null);
      }
    });

    // Initial load
    loadData();

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        { data: usersData, error: usersError },
        { data: productsData, error: productsError },
        { data: transactionsData, error: transactionsError },
        { data: attendanceData, error: attendanceError },
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('products').select('*'),
        supabase.from('transactions').select('*, transaction_items(*)'),
        supabase.from('attendance').select('*'),
      ]);

      if (usersError) throw usersError;
      if (productsError) throw productsError;
      if (transactionsError) throw transactionsError;
      if (attendanceError) throw attendanceError;

      setUsers(usersData as User[]);
      setProducts(productsData as Product[]);
      setTransactions(transactionsData as any[]); // Adjust type later
      setAttendance(attendanceData as AttendanceRecord[]);

      // Load Theme
      const savedTheme = localStorage.getItem('1629salon_theme') as 'light' | 'dark';
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'dark') document.documentElement.classList.add('dark');
      }

      setError(null);
    } catch (err: any) {
      console.error("Supabase Load Error:", err);
      setError("Failed to load data from Supabase: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
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

  const login = async (userId: string, pin: string) => {
    // This is a temporary solution for the demo.
    // In a real application, you would have a more secure way of handling this.
    const email = `${userId}@salon.local`;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pin,
    });

    if (error) {
      console.error('Login Error:', error.message);
      return false;
    }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const recordTransaction = async (tx: Transaction) => {
    const { data, error } = await supabase.functions.invoke('record-transaction', {
      body: { transaction: tx },
    });

    if (error) {
      console.error('Error recording transaction:', error);
      return;
    }
    
    // Manually update the local state for now
    // Later, this will be handled by real-time subscriptions
    loadData();
  };


  // --- CRUD Operations ---

  const addUser = async (user: User) => {
    const { data, error } = await supabase.from('users').insert(user).select();
    if (error) {
      console.error('Error adding user:', error);
      return;
    }
    setUsers([...users, ...data]);
  };

  const updateUser = async (user: User) => {
    const { data, error } = await supabase.from('users').update(user).eq('id', user.id).select();
    if (error) {
      console.error('Error updating user:', error);
      return;
    }
    setUsers(users.map(u => u.id === user.id ? data[0] : u));
  };

  const removeUser = async (userId: string) => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      console.error('Error removing user:', error);
      return;
    }
    setUsers(users.filter(u => u.id !== userId));
  };

  const addProduct = async (product: Product) => {
    const { data, error } = await supabase.from('products').insert(product).select();
    if (error) {
      console.error('Error adding product:', error);
      return;
    }
    setProducts([...products, ...data]);
  };

  const updateProduct = async (product: Product) => {
    const { data, error } = await supabase.from('products').update(product).eq('id', product.id).select();
    if (error) {
      console.error('Error updating product:', error);
      return;
    }
    setProducts(products.map(p => p.id === product.id ? data[0] : p));
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      console.error('Error deleting product:', error);
      return;
    }
    setProducts(products.filter(p => p.id !== productId));
  };

  const initializeDatabase = async () => {
    // This will be handled by seeding the Supabase database directly.
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