import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleAnalyzeClick = () => {
        navigate('/analyze');
    };

    const handleMissionSelect = (mission) => {
        console.log(`Selected mission: ${mission}`);
        navigate(`/visualize/${mission.toLowerCase()}`);
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-slate-900 to-black text-white">
            <h1 className="text-4xl font-bold mb-8">Welcome to the Exoplanet Explorer</h1>
            
            <div className="mb-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl mb-4">Select a Mission to Visualize:</h2>
                <div className="flex flex-col space-y-3">
                    <button 
                        onClick={() => handleMissionSelect('Kepler')} 
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-200">
                        Kepler Mission
                    </button>
                    <button 
                        onClick={() => handleMissionSelect('K2')} 
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-200">
                        K2 Mission
                    </button>
                    <button 
                        onClick={() => handleMissionSelect('TESS')} 
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition duration-200">
                        TESS Mission
                    </button>
                </div>
            </div>

            <button 
                onClick={handleAnalyzeClick} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg text-xl transition duration-200">
                Analyze Data
            </button>
        </div>
    );
};

export default LandingPage;