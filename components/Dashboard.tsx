import React, { useMemo, useState } from 'react';
import { useStore } from '../services/StoreContext';
import { ServiceCategory, UserRole, User, Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Users, DollarSign, Plus, Edit2, Trash2, Save, X, Search, Briefcase, Calendar } from 'lucide-react';

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#3b82f6'];

// --- Shared Components ---

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-6 border border-slate-100 dark:border-slate-700 scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4 text-red-600 dark:text-red-400">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium shadow-md transition-colors"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---

const OverviewTab: React.FC = () => {
  const { transactions, users, products } = useStore();

  const totalSales = useMemo(() => transactions.reduce((sum, t) => sum + t.totalAmount, 0), [transactions]);
  
  const salesByCategory = useMemo(() => {
    const data: Record<string, number> = {};
    Object.values(ServiceCategory).forEach(c => data[c] = 0);
    
    transactions.forEach(t => {
      t.items.forEach(item => {
        data[item.category] = (data[item.category] || 0) + (item.price * item.quantity);
      });
    });

    return Object.keys(data).map(name => ({ name, value: data[name] })).filter(d => d.value > 0);
  }, [transactions]);

  const salesByStaff = useMemo(() => {
    const data: Record<string, number> = {};
    transactions.forEach(t => {
      data[t.staffName] = (data[t.staffName] || 0) + t.totalAmount;
    });
    return Object.keys(data).map(name => ({ name, sales: data[name] }));
  }, [transactions]);

  const lowStockItems = useMemo(() => {
    return products.filter(p => p.isRetail && p.stockLevel !== undefined && p.minReorderPoint !== undefined && p.stockLevel <= p.minReorderPoint);
  }, [products]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400"><DollarSign className="w-6 h-6" /></div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Revenue</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">₦{totalSales.toLocaleString()}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400"><Users className="w-6 h-6" /></div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Active Staff</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{users.filter(u => u.isClockedIn).length} <span className="text-base font-normal text-slate-400">/ {users.length}</span></h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400"><TrendingUp className="w-6 h-6" /></div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Transactions</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{transactions.length}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
             <div className="p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400"><AlertTriangle className="w-6 h-6" /></div>
             {lowStockItems.length > 0 && <span className="animate-pulse w-2 h-2 rounded-full bg-red-500"></span>}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Low Stock Alerts</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{lowStockItems.length}</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-96 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={salesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {salesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `₦${Number(value).toLocaleString()}`} 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 h-96 transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-white mb-6">Staff Performance (Sales)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={salesByStaff}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `₦${val/1000}k`}/>
              <Tooltip 
                 cursor={{fill: '#334155', opacity: 0.1}} 
                 formatter={(value) => `₦${Number(value).toLocaleString()}`} 
                 contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                 itemStyle={{ color: '#f8fafc' }}
              />
              <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Table */}
      {lowStockItems.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden transition-colors">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h3 className="font-bold text-red-900 dark:text-red-200">Inventory Alerts</h3>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="p-4 font-medium">Item Name</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Current Stock</th>
                <th className="p-4 font-medium">Reorder Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {lowStockItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{item.subCategory}</td>
                  <td className="p-4 text-red-600 dark:text-red-400 font-bold">{item.stockLevel}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{item.minReorderPoint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const StaffManagementTab: React.FC = () => {
  const { users, addUser, updateUser, removeUser } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Confirmation Modal State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<User>>({
    name: '', role: UserRole.STAFF, jobTitle: '', pin: ''
  });

  const resetForm = () => {
    setFormData({ name: '', role: UserRole.STAFF, jobTitle: '', pin: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const existingUser = users.find(u => u.id === editingId);
      if (existingUser) {
        updateUser({ ...existingUser, ...formData } as User);
      }
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        isClockedIn: false,
        name: formData.name!,
        role: formData.role!,
        jobTitle: formData.jobTitle!,
        pin: formData.pin!
      };
      addUser(newUser);
    }
    resetForm();
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({ name: user.name, role: user.role, jobTitle: user.jobTitle, pin: user.pin });
    setIsAdding(true);
  };
  
  const initiateDelete = (userId: string) => {
    setUserToDelete(userId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      removeUser(userToDelete);
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal 
        isOpen={deleteConfirmOpen}
        title="Delete Staff Account?"
        message="Are you sure you want to delete this staff member? This action cannot be undone and will remove their access to the system."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Staff Directory
        </h2>
        <button 
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-indigo-100 dark:border-indigo-900/50 animate-in fade-in slide-in-from-top-4 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">{editingId ? 'Edit Staff Member' : 'Create New Staff Account'}</h3>
            <button onClick={resetForm}><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
              <input 
                required
                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">System Role</label>
              <select 
                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
              >
                {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Job Title (e.g. Senior Stylist)</label>
              <input 
                required
                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.jobTitle}
                onChange={e => setFormData({...formData, jobTitle: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Login PIN</label>
              <input 
                required
                type="text"
                pattern="\d{4}"
                maxLength={4}
                placeholder="4 digits"
                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.pin}
                onChange={e => setFormData({...formData, pin: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors">
                <Save className="w-4 h-4" /> Save Account
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Job Title</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="p-4 font-medium text-slate-900 dark:text-white">{user.name}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{user.jobTitle}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === UserRole.MANAGER ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' :
                    user.role === UserRole.SUPERVISOR ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                    'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isClockedIn ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isClockedIn ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                    {user.isClockedIn ? 'Clocked In' : 'Clocked Out'}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => initiateDelete(user.id)} 
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CatalogManagementTab: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Confirmation Modal State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', price: 0, category: ServiceCategory.HAIR, subCategory: '', isRetail: false, stockLevel: 0, minReorderPoint: 0
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.subCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '', price: 0, category: ServiceCategory.HAIR, subCategory: '', isRetail: false, stockLevel: 0, minReorderPoint: 0
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: Number(formData.price),
      stockLevel: formData.isRetail ? Number(formData.stockLevel) : undefined,
      minReorderPoint: formData.isRetail ? Number(formData.minReorderPoint) : undefined,
    };

    if (editingId) {
      const existing = products.find(p => p.id === editingId);
      if (existing) {
        updateProduct({ ...existing, ...productData } as Product);
      }
    } else {
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        ...productData
      } as Product;
      addProduct(newProduct);
    }
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({ ...product });
    setIsAdding(true);
  };

  const initiateDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteProduct(itemToDelete);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmationModal 
        isOpen={deleteConfirmOpen}
        title="Delete Catalog Item?"
        message="Are you sure you want to delete this product or service? This will remove it from the sales menu immediately."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Services & Products
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Search catalog..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shrink-0 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-indigo-100 dark:border-indigo-900/50 animate-in fade-in slide-in-from-top-4 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
            <button onClick={resetForm}><X className="w-5 h-5 text-slate-400" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Item Name</label>
              <input required className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
              <select className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as ServiceCategory})}>
                {Object.values(ServiceCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Sub-Category</label>
              <input required className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Price (₦)</label>
              <input required type="number" min="0" className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" id="isRetail" className="w-4 h-4 text-indigo-600 rounded" checked={formData.isRetail} onChange={e => setFormData({...formData, isRetail: e.target.checked})} />
              <label htmlFor="isRetail" className="text-sm font-medium text-slate-700 dark:text-slate-300">Is Retail Product?</label>
            </div>
            
            {formData.isRetail && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Current Stock</label>
                  <input type="number" min="0" className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.stockLevel} onChange={e => setFormData({...formData, stockLevel: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Min Reorder Point</label>
                  <input type="number" min="0" className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.minReorderPoint} onChange={e => setFormData({...formData, minReorderPoint: Number(e.target.value)})} />
                </div>
              </>
            )}

            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-4 border-t border-slate-100 dark:border-slate-700 pt-4">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors">
                <Save className="w-4 h-4" /> Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 font-medium">Item Name</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <td className="p-4">
                  <p className="font-medium text-slate-900 dark:text-white">{product.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{product.subCategory}</p>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{product.category}</td>
                <td className="p-4">
                  {product.isRetail 
                    ? <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-full font-medium">Product</span>
                    : <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">Service</span>
                  }
                </td>
                <td className="p-4 font-medium text-slate-900 dark:text-white">₦{product.price.toLocaleString()}</td>
                <td className="p-4">
                  {product.isRetail ? (
                    <span className={`font-medium ${
                      (product.stockLevel || 0) <= (product.minReorderPoint || 0) ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'
                    }`}>
                      {product.stockLevel} units
                    </span>
                  ) : <span className="text-slate-400">-</span>}
                </td>
                <td className="p-4 flex justify-end gap-2">
                  <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                     onClick={() => initiateDelete(product.id)} 
                     className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TransactionsTab: React.FC = () => {
  const { transactions, users } = useStore();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterPayment, setFilterPayment] = useState('');

  const filteredTransactions = transactions.filter(t => {
    // Date Range Logic
    let dateMatch = true;
    if (startDate || endDate) {
      const txTime = new Date(t.date).getTime();
      const startTime = startDate ? new Date(startDate).setHours(0,0,0,0) : -8640000000000000;
      const endTime = endDate ? new Date(endDate).setHours(23,59,59,999) : 8640000000000000;
      dateMatch = txTime >= startTime && txTime <= endTime;
    }

    const matchesStaff = !filterStaff || t.staffId === filterStaff;
    const matchesPayment = !filterPayment || t.paymentMethod === filterPayment;
    return dateMatch && matchesStaff && matchesPayment;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="col-span-1 md:col-span-2 lg:col-span-2 flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Start Date</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={startDate} 
                  onChange={e => setStartDate(e.target.value)} 
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">End Date</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={endDate} 
                  onChange={e => setEndDate(e.target.value)} 
                />
              </div>
            </div>
          </div>
          
          <div className="flex-1">
             <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Filter by Staff</label>
             <select 
               className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
               value={filterStaff} 
               onChange={e => setFilterStaff(e.target.value)}
             >
               <option value="">All Staff</option>
               {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
             </select>
          </div>
          <div className="flex-1">
             <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Payment Method</label>
             <select 
               className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
               value={filterPayment} 
               onChange={e => setFilterPayment(e.target.value)}
             >
               <option value="">All Methods</option>
               <option value="Cash">Cash</option>
               <option value="Card">Card</option>
               <option value="Transfer">Transfer</option>
             </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); setFilterStaff(''); setFilterPayment(''); }}
              className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <X className="w-4 h-4" /> Clear Filters
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Staff Member</th>
                <th className="p-4 font-medium">Items</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 dark:text-slate-500">No transactions found matching your filters.</td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {new Date(tx.date).toLocaleDateString()} <span className="text-slate-400 dark:text-slate-500 text-xs">{new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-900 dark:text-white">{tx.staffName}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {tx.items.map((item, idx) => (
                          <span key={idx} className="text-xs text-slate-600 dark:text-slate-300">
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900 dark:text-white">
                      ₦{tx.totalAmount.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export const Dashboard: React.FC = () => {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState('overview');

  if (!currentUser) return null;

  // Define available tabs based on role
  const tabs = [
    { id: 'overview', label: 'Overview', allowed: [UserRole.MANAGER, UserRole.SUPERVISOR] },
    { id: 'transactions', label: 'Transactions', allowed: [UserRole.MANAGER, UserRole.SUPERVISOR] },
    { id: 'staff', label: 'Staff Management', allowed: [UserRole.MANAGER] },
    { id: 'catalog', label: 'Catalog', allowed: [UserRole.MANAGER] },
  ].filter(tab => tab.allowed.includes(currentUser.role));

  if (!tabs.find(t => t.id === activeTab)) {
     setActiveTab(tabs[0].id);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Management Dashboard</h1>
           <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {currentUser.name} ({currentUser.role})</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'staff' && <StaffManagementTab />}
        {activeTab === 'catalog' && <CatalogManagementTab />}
        {activeTab === 'transactions' && <TransactionsTab />}
      </div>
    </div>
  );
};