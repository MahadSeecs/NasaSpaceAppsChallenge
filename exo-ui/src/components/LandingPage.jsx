import React from 'react';
import { useNavigate } from 'react-router-dom';
import StarfieldBackground from './StarfieldBackground';
import AnimatedEarth from "./AnimatedEarth";
import { useEarthMood } from "../context/EarthMoodContext";


const LandingPage = () => {
  const navigate = useNavigate();
  const { cheerUp } = useEarthMood();

  const handleAnalyzeClick = () => {
    cheerUp();
    navigate('/analyze');
};

  const handleVisualizeClick = () => {
    cheerUp();
    navigate('/visualize');};   

  return (
    <div className="relative h-screen w-full overflow-hidden text-white font-sans">
      {/* Starry background */}
      <StarfieldBackground />
  
      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4">
        
        <h1 className="text-6xl font-extrabold mb-6 drop-shadow-lg">
          🌍 Earth’s Lonely Journey
        </h1>

        <p className="text-xl max-w-2xl mb-14 leading-relaxed text-gray-300">
    After being left <span className="italic text-pink-400">“on read”</span> by its Solar System neighbors, 
    Earth has decided to look beyond the Milky Way for new friends — distant exoplanets 
    scattered across the galaxy. Join Earth on its quest to explore, visualize, and analyze 
    the worlds beyond, on a <span className = "italic text-pink-400"> red shift</span>.

        </p>

        <div className="flex flex-col sm:flex-row gap-10">
          {/* Visualize Button */}
          <button
            onClick={handleVisualizeClick}
            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-8 px-16 rounded-xl text-3xl flex items-center justify-center gap-4 shadow-2xl transition-all transform hover:scale-110 active:scale-100"
          >
            <span role="img" aria-label="telescope" className="text-4xl">🔭</span>
            Visualize
          </button>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyzeClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-8 px-16 rounded-xl text-3xl flex items-center justify-center gap-4 shadow-2xl transition-all transform hover:scale-110 active:scale-100"
          >
            <span role="img" aria-label="magnifying-glass" className="text-4xl">🔍</span>
            Analyze
          </button>
        </div>

        <footer className="absolute bottom-8 text-gray-500 text-sm">
          “Sometimes you have to leave your orbit to find real friends.”
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
