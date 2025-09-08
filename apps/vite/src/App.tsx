import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
// import { LanguageProvider } from './context/LanguageContextSimple';
// import { ThemeProvider } from './context/ThemeContext';
// import { AuthProvider } from './context/AuthContext';
// import Navbar from './components/Navbar';
// import Home from './pages/Home';
import Techniques from './pages/Techniques';
import Diet from './pages/Diet';
import Contact from './pages/Contact';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/auth/Dashboard';
import AdminDashboardPage from './pages/auth/AdminDashboard';
import Ptnz from "./pages/landingPages/pten/ptnz";
import Nzcoachonline from "./pages/landingPages/pten/nzcoachonline";
import FitnessBR from './pages/landingPages/forms/FitnessBR';
import FitnessUSA from './pages/landingPages/forms/FitnessUSA';
import NutritionBR from './pages/landingPages/forms/NutritionBR';
import NutritionUSA from './pages/landingPages/forms/NutritionUSA';
import TestForm from './pages/landingPages/forms/TestForm';
import DietPlanReview from './pages/admin/DietPlanReview';
import DietPortal from './pages/client/DietPortal';

// Simple Home component for testing
const SimpleHome = () => (
  <div style={{ padding: '20px' }}>
    <h1>Jackie Platform - Testing</h1>
    <p>Home page is working without context providers!</p>
  </div>
);

const LayoutWithNavbar: React.FC = () => {
  return (
    <>
      <div style={{ padding: '10px', background: '#f0f0f0', marginBottom: '20px' }}>
        <h3>Simple Navbar (Testing)</h3>
      </div>
      <Outlet />
    </>
  );
};

const LayoutWithoutNavbar: React.FC = () => {
  React.useEffect(() => {
    // Force light mode for landing pages
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.body.style.backgroundColor = 'white';
    document.body.style.color = '#111827'; // gray-900
    
    return () => {
      // Cleanup - restore saved theme when navigating away
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      document.documentElement.classList.remove('light');
      
      // Restore user's theme preference
      const savedTheme = localStorage.getItem('dr-jackie-theme') || 'system';
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (savedTheme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', isDark);
      }
    };
  }, []);

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <Outlet />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages with Navbar - Support Dark Mode */}
        <Route element={<LayoutWithNavbar />}>
          <Route path="/" element={<SimpleHome />} />
          <Route path="/techniques" element={<Techniques />} />
          <Route path="/diet" element={<Diet />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/diet-plans" element={<DietPlanReview />} />
          <Route path="/client/diet-portal/:planId" element={<DietPortal />} />
        </Route>

        {/* Pages without Navbar - Force Light Mode */}
        <Route element={<LayoutWithoutNavbar />}>
          <Route path="/ptnz" element={<Ptnz />} />
          <Route path="/nzcoachonline" element={<Nzcoachonline />} />
          <Route path="/fitnessbr" element={<FitnessBR />} />
          <Route path="/fitnessusa" element={<FitnessUSA />} />
          <Route path="/nutritionbr" element={<NutritionBR />} />
          <Route path="/nutritionusa" element={<NutritionUSA />} />
          <Route path="/test-form" element={<TestForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;