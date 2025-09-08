// Main App Component with Authentication and Routing
// Entry point for the Jackie Platform application

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import DashboardRouter from './components/DashboardRouter';
import IntegratedTestForm from './pages/landingPages/forms/IntegratedTestForm';

// Simple router based on URL path
const AppRouter: React.FC = () => {
  const path = window.location.pathname;

  // Route to admin dashboard
  if (path === '/admin' || path === '/admin/dashboard') {
    return <DashboardRouter type="admin" />;
  }

  // Route to user dashboard
  if (path === '/dashboard') {
    return <DashboardRouter type="user" />;
  }

  // Route to integrated test form
  if (path === '/form' || path === '/test-form') {
    return <IntegratedTestForm />;
  }

  // Default route - show test form
  return <IntegratedTestForm />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div className="App">
        <AppRouter />
      </div>
    </AuthProvider>
  );
};

export default App;
