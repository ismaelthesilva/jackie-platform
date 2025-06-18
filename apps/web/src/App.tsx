import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Techniques from './pages/Techniques';
import Diet from './pages/Diet';
import Ptnz from "./pages/landingPages/pten/ptnz";
import Nzcoachonline from "./pages/landingPages/pten/nzcoachonline";
import FitnessBR from './pages/landingPages/forms/FitnessBR';
import FitnessUSA from './pages/landingPages/forms/FitnessUSA';
import NutritionBR from './pages/landingPages/forms/NutritionBR';
import NutritionUSA from './pages/landingPages/forms/NutritionUSA';

const LayoutWithNavbar: React.FC = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const LayoutWithoutNavbar: React.FC = () => {
  return <Outlet />;
};

function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Pages with Navbar */}
          <Route element={<LayoutWithNavbar />}>
            <Route path="/" element={<Home />} />
            <Route path="/techniques" element={<Techniques />} />
            <Route path="/diet" element={<Diet />} />
          </Route>

          {/* Pages without Navbar */}
          <Route element={<LayoutWithoutNavbar />}>
            <Route path="/ptnz" element={<Ptnz />} />
            <Route path="/nzcoachonline" element={<Nzcoachonline />} />
            <Route path="/fitness-br" element={<FitnessBR />} />
            <Route path="/fitness-usa" element={<FitnessUSA />} />
            <Route path="/nutrition-br" element={<NutritionBR />} />
            <Route path="/nutrition-usa" element={<NutritionUSA />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;