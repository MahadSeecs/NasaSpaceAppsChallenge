// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ExoplanetExplorer from './components/ExoplanetExplorer'; // Your existing component
import Analyze from './components/Analyze'; // Replace with your actual Analyze component

const App = () => {
  return (
    <Router>
      <Routes> {/* Use Routes instead of Switch */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/visualize/:mission" element={<ExoplanetExplorer />} />
        <Route path="/analyze" element={<Analyze />} />
      </Routes>
    </Router>
  );
};

export default App;
