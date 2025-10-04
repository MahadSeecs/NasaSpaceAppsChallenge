// components/useMockPlanets.js
// import { useMemo } from "react";
import React, { useMemo } from "react";


function useMockPlanets(count = 100) {
  return useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 10 + Math.random() * 50; // orbital radius - MUCH MORE SPREAD OUT
      const period = 5 + Math.random() * 95; // days (normalized)
      const radius = 0.2 + Math.random() * 0.8; // planet radius (scaled)
      const disp = Math.random() < 0.6 ? "confirmed" : Math.random() < 0.5 ? "candidate" : "fp";
      arr.push({
        id: `mock-${i}`,
        name: `P-${i.toString().padStart(3, "0")}`,
        host: `KIC ${100000 + i}`,
        orbitalPeriod: period,
        transitDepthPpm: Math.round(500 + Math.random() * 5000),
        planetRadiusRe: (radius * 2.5).toFixed(2),
        semiMajorAxis: r,
        phase0: a,
        disp,
      });
    }
    return arr;
  }, [count]);
}

export default useMockPlanets;