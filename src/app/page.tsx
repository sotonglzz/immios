import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            IMMIOS
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Instant Marquees Melbourne Internal Operations Software
          </p>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome to IMMIOS
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Streamline your operations with our comprehensive management system for job scheduling, 
              stock management, staff coordination, and vehicle tracking.
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Link 
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-center transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/jobs"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg text-center transition-colors"
              >
                Job Management
              </Link>
              <Link 
                href="/stock"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg text-center transition-colors"
              >
                Stock Management
              </Link>
              <Link 
                href="/staff"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg text-center transition-colors"
              >
                Staff Management
              </Link>
            </div>
          </section>

          {/* Features Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Job Scheduling
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Manage quotes, bookings, and job assignments with real-time updates and calendar integration.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Stock Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track inventory levels, monitor availability, and manage product components efficiently.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Staff Coordination
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Manage staff availability, assignments, and contact information in one centralized system.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Vehicle Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track vehicle assignments, maintenance schedules, and availability for job coordination.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Real-time Updates
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get instant notifications and live updates across all team members and devices.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Offline Capability
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Critical functions work without internet connection, with automatic sync when online.
              </p>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p>&copy; 2025 Instant Marquees Melbourne. Internal Operations Software.</p>
        </footer>
      </div>
    </div>
  );
}
