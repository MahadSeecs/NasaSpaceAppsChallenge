import React, { useState } from "react";

const GENERAL_MODEL = import.meta.env.GENERAL_MODEL || "http://localhost:8000/api/predict";

function ResultModal({ isOpen, onClose, result, planetName }) {
  if (!isOpen) return null;

  const confirmedProb = result?.probabilities?.["CONFIRMED"] || 0;
  const falsePositiveProb = result?.probabilities?.["FALSE POSITIVE"] || 0;
  const isConfirmed = result?.prediction === "CONFIRMED";

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md mx-4 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-purple-500/30 overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-6 py-4 border-b border-purple-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-white">🔍 Classification Result</h2>
          <p className="text-sm text-purple-300 mt-1">{planetName}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Prediction Badge */}
          <div className="flex justify-center">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg ${
              isConfirmed 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                : 'bg-red-500/20 text-red-400 border border-red-500/50'
            }`}>
              {isConfirmed ? '✓' : '✗'}
              <span>{result?.prediction}</span>
            </div>
          </div>

          {/* Probability Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-400 font-medium">Confirmed</span>
                <span className="text-white font-bold">{(confirmedProb * 100).toFixed(2)}%</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${confirmedProb * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-red-400 font-medium">False Positive</span>
                <span className="text-white font-bold">{(falsePositiveProb * 100).toFixed(2)}%</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-1000 ease-out rounded-full"
                  style={{ width: `${falsePositiveProb * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Confidence Indicator */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <div className="text-xs text-purple-300 mb-1">Confidence Level</div>
            <div className="text-lg font-bold text-white">
              {Math.max(confirmedProb, falsePositiveProb) > 0.9 ? 'Very High' :
               Math.max(confirmedProb, falsePositiveProb) > 0.75 ? 'High' :
               Math.max(confirmedProb, falsePositiveProb) > 0.6 ? 'Moderate' : 'Low'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-900/50 border-t border-purple-500/30">
          <button
            onClick={onClose}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function Tooltip({ planet, screenPos }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState(null);

  if (!planet || !screenPos) return null;
  const [x, y] = screenPos;

const handleInspect = async () => {
  setIsLoading(true);
  try {
    // List of required fields and their names for error messages
    const requiredFields = [
      "mission",
      "orbitalPeriod",
      "t0_bjd",
      "duration_hours",
      "transitDepthPpm",
      "ror",
      "planetRadiusRe",
      "insolation_se",
      "teq_k",
      "starTemp",
      "st_logg_cgs",
      "starRadius"
    ];

    // Check for missing or invalid values
    for (const field of requiredFields) {
      if (
        planet[field] === undefined ||
        planet[field] === null ||
        (typeof planet[field] === "number" && isNaN(planet[field]))
      ) {
        throw new Error(`Missing or invalid field: ${field}`);
      }
    }

    const requestBody = {
      mission: planet.mission,
      period_days: parseFloat(planet.orbitalPeriod),
      t0_bjd: planet.t0_bjd,
      duration_hours: planet.duration_hours,
      depth_ppm: parseFloat(planet.transitDepthPpm),
      ror: planet.ror,
      radius_re: parseFloat(planet.planetRadiusRe),
      insolation_se: planet.insolation_se,
      teq_k: planet.teq_k,
      st_teff_k: parseFloat(planet.starTemp),
      st_logg_cgs: planet.st_logg_cgs,
      st_rad_re: parseFloat(planet.starRadius)
    };

    const response = await fetch(GENERAL_MODEL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    setResult(data);
    setShowModal(true);

  } catch (error) {
    alert(`Error inspecting planet: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <>
      <div
        className="fixed z-50 rounded-xl bg-black/90 px-4 py-3 text-xs text-white shadow-2xl backdrop-blur border border-purple-500/50"
        style={{ 
          left: `${x + 15}px`, 
          top: `${y + 15}px`,
          maxWidth: '250px'
        }}
      >
        <div className="font-bold text-sm mb-1">{planet.name}</div>
        <div className="opacity-90">Host: {planet.host}</div>
        <div className="opacity-90">Period: {typeof planet.orbitalPeriod === 'number' ? planet.orbitalPeriod.toFixed(2) : planet.orbitalPeriod} days</div>
        <div className="opacity-90">Planet Radius: {planet.planetRadiusRe} R⊕</div>
        {planet.starRadius && <div className="opacity-90">Star Radius: {planet.starRadius.toFixed(2)} R☉</div>}
        {planet.starTemp && <div className="opacity-90">Star Temp: {planet.starTemp.toFixed(0)} K</div>}
        <div className="opacity-90">Transit Depth: {planet.transitDepthPpm} ppm</div>
        <div className="opacity-90 capitalize">Status: {planet.disp == "fp" ? "False Positive" : planet.disp}</div>
        
        <button
          onClick={handleInspect}
          disabled={isLoading}
          className="mt-3 w-full pointer-events-auto rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 px-3 py-2 text-xs font-semibold transition-colors"
        >
          {isLoading ? 'Inspecting...' : 'Inspect Planet'}
        </button>
      </div>

      <ResultModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        result={result}
        planetName={planet.name}
      />
    </>
  );
}

export default Tooltip;