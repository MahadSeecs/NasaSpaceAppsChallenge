// AnalyzeMenu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AnalyzeMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-gradient-to-b from-slate-900 to-black flex justify-center items-center p-8">
      <div className="flex gap-4 w-full max-w-3xl">
        {/* Left column */}
        <div className="flex flex-col gap-4 flex-1">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-lg w-full"
            onClick={() => navigate("/analyze")}
          >
            Predict existing TESS Candidate
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 rounded-lg w-full"
          >
            Predict existing Kepler Candidate
          </button>
        </div>

        {/* Right button */}
        <div className="flex-1 flex">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg w-full"
          >
            Predict through Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeMenu;
