import React, { useState } from "react";
import StarfieldBackground from './StarfieldBackground';
// const GENERAL_MODEL = import.meta.env.GENERAL_MODEL || "http://localhost:8000/api/predict";
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

const Analyze = () => {
  const [formData, setFormData] = useState({
    mission: "Kepler",
    period_days: "",
    t0_bjd: "",
    duration_hours: "",
    depth_ppm: "",
    ror: "",
    radius_re: "",
    insolation_se: "",
    teq_k: "",
    st_teff_k: "",
    st_logg_cgs: "",
    st_rad_re: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const GENERAL_MODEL = import.meta.env.VITE_GENERAL_MODEL || "http://localhost:8000/api/predict";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert fields to numbers where necessary
      const requestBody = {
        mission: formData.mission,
        period_days: parseFloat(formData.period_days),
        t0_bjd: parseFloat(formData.t0_bjd),
        duration_hours: parseFloat(formData.duration_hours),
        depth_ppm: parseFloat(formData.depth_ppm),
        ror: parseFloat(formData.ror),
        radius_re: parseFloat(formData.radius_re),
        insolation_se: parseFloat(formData.insolation_se),
        teq_k: parseFloat(formData.teq_k),
        st_teff_k: parseFloat(formData.st_teff_k),
        st_logg_cgs: parseFloat(formData.st_logg_cgs),
        st_rad_re: parseFloat(formData.st_rad_re),
      };

      const response = await fetch(GENERAL_MODEL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setShowModal(true);
    } catch (error) {
      alert(`Error analyzing planet: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-auto text-white">
    {/* Starfield covers the whole page */}
    <div className="absolute inset-0 -z-10">
      <StarfieldBackground />
    </div>
    
      <div className="relative z-10 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Analyze Exoplanet Data</h1>
      
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg space-y-4"
      >
        {/* Mission Dropdown */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Mission</label>
          <select
            name="mission"
            value={formData.mission}
            onChange={handleChange}
            className="p-2 rounded-md bg-gray-700 text-white"
          >
            <option value="Kepler">Kepler</option>
            <option value="TESS">TESS</option>
          </select>
        </div>

        {/* Other Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Orbital Period (days)" name="period_days" value={formData.period_days} onChange={handleChange} />
          <InputField label="Transit Time (BJD)" name="t0_bjd" value={formData.t0_bjd} onChange={handleChange} />
          <InputField label="Transit Duration (hours)" name="duration_hours" value={formData.duration_hours} onChange={handleChange} />
          <InputField label="Transit Depth (ppm)" name="depth_ppm" value={formData.depth_ppm} onChange={handleChange} />
          <InputField label="Planet/Star Radius Ratio" name="ror" value={formData.ror} onChange={handleChange} />
          <InputField label="Planet Radius (Earth radii)" name="radius_re" value={formData.radius_re} onChange={handleChange} />
          <InputField label="Insolation Flux (Earth=1)" name="insolation_se" value={formData.insolation_se} onChange={handleChange} />
          <InputField label="Equilibrium Temp (K)" name="teq_k" value={formData.teq_k} onChange={handleChange} />
          <InputField label="Star Temp (K)" name="st_teff_k" value={formData.st_teff_k} onChange={handleChange} />
          <InputField label="Star Surface Gravity" name="st_logg_cgs" value={formData.st_logg_cgs} onChange={handleChange} />
          <InputField label="Star Radius (Solar radii)" name="st_rad_re" value={formData.st_rad_re} onChange={handleChange} />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-xl font-bold text-xl transition-all disabled:opacity-50"
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      <ResultModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        result={result}
        planetName="Custom Input Planet"
      />
    </div>
    </div>
  );
};

// Reusable input component
const InputField = ({ label, name, value, onChange }) => (
  <div className="flex flex-col">
    <label className="mb-1 font-semibold">{label}</label>
    <input
      type="number"
      step="any"
      name={name}
      value={value}
      onChange={onChange}
      className="p-2 rounded-md bg-gray-700 text-white"
    />
  </div>
);

export default Analyze;
