import React, { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './services/StoreContext';
import { Layout } from './components/Layout';
import { POS } from './components/POS';
import { Dashboard } from './components/Dashboard';
import { AttendanceScanner } from './components/AttendanceScanner';
import { BarcodeDisplay } from './components/BarcodeDisplay';
import { Scissors, Database, Loader2, AlertTriangle } from 'lucide-react';

const LoginScreen: React.FC = () => {
  const { login, users, loading, error, initializeDatabase } = useStore();
  const [selectedUser, setSelectedUser] = useState('');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Set initial selected user once users are loaded
  useEffect(() => {
    if (users.length > 0 && !selectedUser) {
      setSelectedUser(users[0].id);
    }
  }, [users, selectedUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(selectedUser, pin)) {
      setLoginError('Invalid PIN');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Connecting to SalonSync...</h2>
        <p className="text-slate-400 mt-2">Checking database connection</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl text-center border border-slate-200 dark:border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Connection Error</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg text-left text-xs text-slate-600 dark:text-slate-300 font-mono overflow-auto max-h-40 border border-slate-200 dark:border-slate-700">
             Technical Details: Ensure Firestore Database is created in your Firebase Console (Test Mode) and rules allow read/write.
          </div>
          <button 
             onClick={() => window.location.reload()}
             className="mt-6 w-full bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // --- FIRST RUN SETUP SCREEN ---
  if (users.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl text-center border border-slate-200 dark:border-slate-700">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
              <Database className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Initialize Database</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Your system appears to be empty. Would you like to seed it with initial staff and product data?
          </p>
          
          <button 
            onClick={initializeDatabase}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
          >
            Yes, Seed Database
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
            <Scissors className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Welcome to SalonSync</h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Select your account to continue</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select User</label>
            <select 
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Enter PIN</label>
            <input 
              type="password"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              placeholder="e.g. 1111"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setLoginError(''); }}
              maxLength={4}
            />
            {loginError && <p className="text-red-500 text-sm mt-1">{loginError}</p>}
            <p className="text-xs text-slate-400 mt-2 text-center">
              (Demo PINs: Manager: 1111, Supervisor: 2222, Staff: 3333, 4444, 5555)
            </p>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

const MainApp: React.FC = () => {
  const { currentUser, loading } = useStore();
  const [activeTab, setActiveTab] = useState('pos');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center text-slate-600 dark:text-slate-400">
         <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600 dark:text-indigo-400" />
         <p className="font-medium">Syncing...</p>
      </div>
    );
  }

  if (!currentUser) return <LoginScreen />;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'pos' && <POS />}
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'scanner' && <AttendanceScanner />}
      {activeTab === 'barcode_display' && <BarcodeDisplay />}
    </Layout>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}