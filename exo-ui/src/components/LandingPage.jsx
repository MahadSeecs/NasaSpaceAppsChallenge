import React from 'react';
import { useNavigate } from 'react-router-dom';
import StarfieldBackground from './StarfieldBackground';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleAnalyzeClick = () => navigate('/analyze');
  const handleVisualizeClick = () => navigate('/visualize');

  return (
    <div className="relative h-screen w-full overflow-hidden text-white">
      {/* Starfield background */}
      <StarfieldBackground />

      {/* Foreground content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <h1 className="text-5xl font-extrabold mb-16 text-center drop-shadow-lg">
          Welcome to the Exoplanet Explorer
        </h1>

        <div className="flex flex-col sm:flex-row gap-10">
          {/* Visualize Button */}
          <button
            onClick={handleVisualizeClick}
            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-15 px-16 rounded-xl text-3xl flex items-center justify-center gap-4 shadow-2xl transition-all transform hover:scale-110 active:scale-100"
          >
            <span role="img" aria-label="telescope" className="text-4xl">🔭</span>
            Visualize
          </button>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyzeClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-15 px-16 rounded-xl text-3xl flex items-center justify-center gap-4 shadow-2xl transition-all transform hover:scale-110 active:scale-100"
          >
            <span role="img" aria-label="magnifying-glass" className="text-4xl">🔍</span>
            Analyze
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
