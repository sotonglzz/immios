'use client';

import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';

// Mock data - in real app this would come from API/database
const mockUpcomingJobs = [
  { id: 1, title: 'Client A - Install', date: '2025-01-15', type: 'Install' },
  { id: 2, title: 'Client B - Removal', date: '2025-01-16', type: 'Removal' },
  { id: 3, title: 'Client C - Event', date: '2025-01-17', type: 'Event' },
];

const mockAssemblyAlerts = [
  { id: 1, product: '3x3m Pop-up White', quantity: 5 },
  { id: 2, product: '6m x 6m Structure', quantity: 2 },
];

const mockStockSummary = {
  popupMarquees: 45,
  structureMarquees: 12,
  furnitureItems: 28,
};

const mockRecentActivity = [
  { id: 1, user: 'John Smith', action: 'updated', item: 'Job 123', time: '2 hours ago' },
  { id: 2, user: 'Sarah Johnson', action: 'created', item: 'Quote 456', time: '4 hours ago' },
  { id: 3, user: 'Warehouse', action: 'completed assembly', item: 'Product XYZ', time: '6 hours ago' },
];

const mockModeViews = [
  { name: 'Operations', alert: null },
  { name: 'Rostering', alert: 3 },
  { name: 'LoadList', alert: 1 },
  { name: 'Financial Status', alert: 2 },
];

export default function DashboardPage() {
  const [selectedMode, setSelectedMode] = useState('Operations');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);

  // Mock user data
  const user = {
    name: 'John Smith',
    email: 'john.smith@instantmarquees.com.au',
    role: 'admin' as const,
  };

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logout clicked');
  };

  const handleAddNewJob = () => {
    // Handle adding new job/quote
    console.log('Add new job clicked');
  };

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user.name}!
          </h1>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Overview
            </h2>
            
            {/* Upcoming Jobs */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Upcoming Jobs (Next 7 Days):
              </h3>
              <div className="space-y-2">
                {mockUpcomingJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {job.title}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({job.type}: {job.date})
                    </span>
                  </div>
                ))}
              </div>
              <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2">
                View All Jobs in Calendar
              </button>
            </div>

            {/* Pending Assembly Tasks */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Pending Assembly Tasks:
              </h3>
              <div className="space-y-2">
                {mockAssemblyAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {alert.product}
                    </span>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      (Qty: {alert.quantity})
                    </span>
                  </div>
                ))}
              </div>
              <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-2">
                View All Assembly Tasks
              </button>
            </div>
          </div>

          {/* Action Center */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Action Center
            </h2>
            
            {/* Add New Job Button */}
            <Button 
              onClick={handleAddNewJob}
              className="w-full mb-6 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium"
            >
              + Add New Quote/Job
            </Button>

            {/* Mode Views Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mode Views
              </label>
              <button
                onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
                className="w-full flex items-center justify-between p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <span>{selectedMode}</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isModeDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
                  {mockModeViews.map((mode) => (
                    <button
                      key={mode.name}
                      onClick={() => {
                        setSelectedMode(mode.name);
                        setIsModeDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white flex items-center justify-between"
                    >
                      <span>{mode.name}</span>
                      {mode.alert && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {mode.alert}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stock Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Stock Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Pop-up Marquees:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {mockStockSummary.popupMarquees} available
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Structure Marquees:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {mockStockSummary.structureMarquees} available
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 dark:text-gray-300">Furniture Items:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {mockStockSummary.furnitureItems} available
                </span>
              </div>
            </div>
            <Link href="/stock" className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-4">
              View Full Stock
            </Link>
          </div>

          {/* Recent Activity / Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity / Notifications
            </h2>
            <div className="space-y-3">
              {mockRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.user}</span> {activity.action} {activity.item}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline mt-4">
              View All Notifications
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 