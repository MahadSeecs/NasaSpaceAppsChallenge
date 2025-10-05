// components/MissionSelectPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import StarfieldBackground from './StarfieldBackground';
import {useEarthMood} from '../context/EarthMoodContext'

const MissionSelectPage = () => {

  const navigate = useNavigate();
  const {cheerUp} = useEarthMood()

  const handleMissionSelect = (mission) => {
    cheerUp();
    navigate(`/visualize/${mission.toLowerCase()}`);
  };

  return (
    <div className="relative h-screen flex flex-col items-center justify-center text-white overflow-hidden">
      <StarfieldBackground />

      <h1 className="text-4xl font-extrabold mb-10 text-center">
        Select a Mission to Visualize
      </h1>

      <div className="flex flex-col sm:flex-row gap-10 z-10">
        <button
          onClick={() => handleMissionSelect('Kepler')}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-8 px-16 rounded-xl text-3xl flex items-center justify-center gap-3 shadow-2xl transition-all transform hover:scale-110 active:scale-100"
        >
          🪐 Kepler
        </button>
{/* 
        <button
          onClick={() => handleMissionSelect('K2')}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-8 px-16 rounded-xl text-3xl flex items-center justify-center gap-3 shadow-2xl transition-all transform hover:scale-110 active:scale-100"
        >
          🚀 K2
        </button> */}

        <button
          onClick={() => handleMissionSelect('TESS')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-8 px-16 rounded-xl text-3xl flex items-center justify-center gap-3 shadow-2xl transition-all transform hover:scale-110 active:scale-100"
        >
          🌟 TESS
        </button>
      </div>
    </div>
  );
};

export default MissionSelectPage;
