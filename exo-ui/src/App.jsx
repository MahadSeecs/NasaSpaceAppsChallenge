import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import LandingPage from './components/LandingPage';
import MissionSelectPage from './components/MissionSelectPage';
import ExoplanetExplorer from './components/ExoplanetExplorer';
import Analyze from './components/Analyze';
import { EarthMoodProvider } from "./context/EarthMoodContext";
import AnimatedEarth from "./components/AnimatedEarth";

const HomeButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Don't show the home button on the landing page
  if (location.pathname === '/') return null;
  
  return (
    <button
      onClick={() => navigate('/')}
      className="absolute bottom-6 right-6 z-50 bg-blue-500/20 hover:bg-blue-500/40 backdrop-blur-sm border border-blue-400/30 rounded-full p-3 transition-all duration-300 hover:scale-110 group"
      aria-label="Go to homepage"
    >
      <Home className="w-6 h-6 text-blue-300 group-hover:text-blue-100 transition-colors" />
    </button>
  );
};

const App = () => {
  return (
    <EarthMoodProvider>
    <Router>
      <HomeButton />
      <div className="absolute top-6 right-6 z-50">
          <AnimatedEarth size="small" />
        </div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/visualize" element={<MissionSelectPage />} />
        <Route path="/visualize/:mission" element={<ExoplanetExplorer />} />
        <Route path="/analyze" element={<Analyze />} />
      </Routes>
    </Router>
    </EarthMoodProvider>
  );
};

export default App;