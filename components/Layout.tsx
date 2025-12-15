import React from 'react';
import { useStore } from '../services/StoreContext';
import { UserRole } from '../types';
import { LayoutDashboard, QrCode, LogOut, Scissors, ShoppingBag, Menu, X, Monitor, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const { currentUser, logout, theme, toggleTheme } = useStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (!currentUser) return <>{children}</>;

  const menuItems = [
    { id: 'pos', label: 'Sales / POS', icon: ShoppingBag, roles: [UserRole.STAFF, UserRole.SUPERVISOR, UserRole.MANAGER] },
    { id: 'scanner', label: 'Clock In/Out', icon: QrCode, roles: [UserRole.STAFF, UserRole.SUPERVISOR, UserRole.MANAGER] },
    { id: 'dashboard', label: 'Reports & Admin', icon: LayoutDashboard, roles: [UserRole.SUPERVISOR, UserRole.MANAGER] },
    { id: 'barcode_display', label: 'Time Clock Display', icon: Monitor, roles: [UserRole.SUPERVISOR, UserRole.MANAGER] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 dark:bg-slate-950 text-white transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r border-slate-800 dark:border-slate-800
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Scissors className="w-6 h-6 text-indigo-400" />
            <span>SalonSync</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6 px-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Logged in as</p>
            <div className="flex items-center gap-3 bg-slate-800 dark:bg-slate-900 rounded-lg p-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-bold shadow-lg">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{currentUser.name}</p>
                <p className="text-xs text-slate-400">{currentUser.jobTitle}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {filteredItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-slate-800 space-y-2">
           <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>
          
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center transition-colors">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
            <Scissors className="w-5 h-5 text-indigo-600" />
            SalonSync
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 dark:text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};