import React, { useState, useMemo } from 'react';
import { useStore } from '../services/StoreContext';
import { Product, ServiceCategory, CartItem, Transaction } from '../types';
import { Search, ShoppingCart, Trash2, CreditCard, Banknote, Smartphone, Plus } from 'lucide-react';

export const POS: React.FC = () => {
  const { products, currentUser, recordTransaction } = useStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const categories = ['All', ...Object.values(ServiceCategory)];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = (method: 'Cash' | 'Card' | 'Transfer') => {
    if (!currentUser) return;

    const transaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      staffId: currentUser.id,
      staffName: currentUser.name,
      items: [...cart],
      totalAmount,
      paymentMethod: method
    };

    recordTransaction(transaction);
    setCart([]);
    setIsCheckingOut(false);
    alert('Transaction Recorded Successfully!');
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-100 dark:bg-slate-950 transition-colors">
      {/* Product Catalog */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-slate-200 dark:border-slate-800">
        <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search services or products..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 content-start bg-slate-50 dark:bg-slate-950">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => addToCart(product)}
              className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded uppercase tracking-wider">{product.category}</span>
                {product.isRetail && product.stockLevel !== undefined && (
                   <span className={`text-xs px-2 py-0.5 rounded ${product.stockLevel < (product.minReorderPoint || 0) ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                     Stock: {product.stockLevel}
                   </span>
                )}
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{product.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{product.subCategory}</p>
              <div className="mt-auto flex justify-between items-center">
                <span className="font-bold text-lg text-slate-900 dark:text-white">₦{product.price.toLocaleString()}</span>
                <button className="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 p-2 rounded-full hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white dark:bg-slate-900 shadow-xl flex flex-col z-20 transition-colors border-l border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
          <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Current Sale
          </h2>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{currentUser?.name}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-900">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
              <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
              <p>Cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-3 bg-white dark:bg-slate-900">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">₦{item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-white">
                      <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 px-2">-</button>
                      <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                      <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 px-2">+</button>
                   </div>
                   <button onClick={() => removeFromCart(item.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-500 dark:text-slate-400">Total</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">₦{totalAmount.toLocaleString()}</span>
          </div>

          {!isCheckingOut ? (
            <button 
              onClick={() => setIsCheckingOut(true)}
              disabled={cart.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
            >
              Checkout
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button onClick={() => handleCheckout('Cash')} className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg p-2 text-slate-700 dark:text-slate-300 transition-all">
                <Banknote className="w-6 h-6 mb-1 text-green-600 dark:text-green-500" />
                <span className="text-xs font-medium">Cash</span>
              </button>
              <button onClick={() => handleCheckout('Card')} className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg p-2 text-slate-700 dark:text-slate-300 transition-all">
                <CreditCard className="w-6 h-6 mb-1 text-blue-600 dark:text-blue-500" />
                <span className="text-xs font-medium">Card</span>
              </button>
              <button onClick={() => handleCheckout('Transfer')} className="flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg p-2 text-slate-700 dark:text-slate-300 transition-all">
                <Smartphone className="w-6 h-6 mb-1 text-purple-600 dark:text-purple-500" />
                <span className="text-xs font-medium">Transfer</span>
              </button>
              <button onClick={() => setIsCheckingOut(false)} className="col-span-3 mt-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};