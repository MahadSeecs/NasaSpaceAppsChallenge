// components/Tooltip.jsx
import React, { useState } from "react";

function Tooltip({ planet, screenPos }) {
  const [isLoading, setIsLoading] = useState(false);

  if (!planet || !screenPos) return null;
  const [x, y] = screenPos;

  const handleInspect = async () => {
    setIsLoading(true);
    try {
      // Example API call - replace with your actual endpoint
      const response = await fetch(`/api/planets/${planet.name}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Display results as alert
      alert(JSON.stringify(data, null, 2));
    } catch (error) {
      alert(`Error inspecting planet: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
      <div className="opacity-90 capitalize">Status: {planet.disp}</div>
      
      <button
        onClick={handleInspect}
        disabled={isLoading}
        className="mt-3 w-full pointer-events-auto rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:opacity-50 px-3 py-2 text-xs font-semibold transition-colors"
      >
        {isLoading ? 'Inspecting...' : 'Inspect Planet'}
      </button>
    </div>
  );
}

export default Tooltip;