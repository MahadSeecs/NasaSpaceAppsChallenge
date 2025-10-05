// App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MissionSelectPage from './components/MissionSelectPage';
import ExoplanetExplorer from './components/ExoplanetExplorer';
import Analyze from './components/Analyze';
import { EarthMoodProvider } from "./context/EarthMoodContext";
import AnimatedEarth from "./components/AnimatedEarth";

const App = () => {
  return (
    <EarthMoodProvider>
    <Router>
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
