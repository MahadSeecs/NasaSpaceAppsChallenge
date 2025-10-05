import React from "react";

const DISP_MAP = {
    confirmed: "Confirmed",
    candidate: "Candidate",
    fp: "False Positive",
};


function PlanetDetails({ planet, onClose }) {
  return (
    <div className="fixed right-4 top-1/4 w-1/6 h-1/2 bg-gray-800 bg-opacity-90 p-4 rounded-lg shadow-lg overflow-y-auto">
      <button onClick={onClose} className="text-white absolute top-2 right-2 text-lg">
        &times; {/* Cross icon */}
      </button>
      <h2 className="text-lg font-bold text-white">{planet.name}</h2>
      <div className="text-white mt-2">
        <p><strong>Host:</strong> {planet.host}</p>
        <p><strong>Orbital Period:</strong> {planet.orbitalPeriod.toFixed(2)} days</p>
        <p><strong>Planet Radius:</strong> {planet.planetRadiusRe} R⊕</p>
        {planet.starRadius && <p><strong>Star Radius:</strong> {planet.starRadius.toFixed(2)} R☉</p>}
        {planet.starTemp && <p><strong>Star Temp:</strong> {planet.starTemp.toFixed(0)} K</p>}
        <p><strong>Transit Depth:</strong> {planet.transitDepthPpm} ppm</p>
        <p><strong>Status:</strong> {DISP_MAP[planet.disp] || "Unknown"}</p>
      </div>
    </div>
  );
}

export default PlanetDetails;