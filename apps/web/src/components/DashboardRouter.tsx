// Dashboard Router Component
// Handles routing to admin and user dashboards with authentication

import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserDashboard from '@/pages/client/UserDashboard';
import Auth from './Auth';

interface DashboardRouterProps {
  type?: 'admin' | 'user';
}

const DashboardRouter: React.FC<DashboardRouterProps> = ({ type = 'user' }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth mode="login" redirectTo={type === 'admin' ? '/admin/dashboard' : '/dashboard'} />;
  }

  // Admin dashboard route
  if (type === 'admin') {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access the admin dashboard.</p>
            <Auth mode="login" redirectTo="/dashboard" />
          </div>
        </div>
      );
    }
    return <AdminDashboard />;
  }

  // User dashboard route
  return <UserDashboard />;
};

export default DashboardRouter;
