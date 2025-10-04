// components/Tooltip.jsx
import React from "react";


function Tooltip({ planet, screenPos }) {
  if (!planet || !screenPos) return null;
  const [x, y] = screenPos;
  return (
    <div
      className="pointer-events-none fixed z-50 rounded-xl bg-black/90 px-4 py-3 text-xs text-white shadow-2xl backdrop-blur border border-purple-500/50"
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
    </div>
  );
}

export default Tooltip;