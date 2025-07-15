'use client';

import { useState } from 'react';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    role: 'admin' | 'staff';
  } | null;
  onLogout?: () => void;
}

export default function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, this would persist to localStorage and update the document class
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header
        user={user}
        onLogout={onLogout}
        onThemeToggle={handleThemeToggle}
        isDarkMode={isDarkMode}
      />

      {/* Main Content */}
      <div className="flex h-screen pt-16">
        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 