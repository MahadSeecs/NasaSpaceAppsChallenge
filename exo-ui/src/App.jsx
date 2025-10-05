// App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MissionSelectPage from './components/MissionSelectPage';
import ExoplanetExplorer from './components/ExoplanetExplorer';
import Analyze from './components/Analyze';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/visualize" element={<MissionSelectPage />} />
        <Route path="/visualize/:mission" element={<ExoplanetExplorer />} />
        <Route path="/analyze" element={<Analyze />} />
      </Routes>
    </Router>
  );
};

export default App;
