// components/Planet.jsx

import { Float } from "@react-three/drei";
import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import Orbit from "./Orbit"

const DISP_COLORS = {
  confirmed: "#00ff99",
  candidate: "#66aaff",
  fp: "#ff5c5c",
};

function Planet({ data, scale = 1, speedScale = 1, onHover, isSelected }) {
  const ref = useRef();
  const t0 = useRef(Math.random() * 1000);
  const [hovered, setHovered] = useState(false);

  // const color = DISP_COLORS[data.disp] || "#aaa";
  const color = isSelected ? "yellow" : DISP_COLORS[data.disp] || "#aaa";

  // Scale planet radius relative to star radius
  const planetRadiusInSolarRadii = data.planetRadiusRe / 109; // Convert to solar radii
  const relativeRadius = (planetRadiusInSolarRadii / data.starRadius) * 2; // Visual scaling factor
  const radius = Math.max(0.05, Math.min(1.5, relativeRadius * 30)) * scale; // Scale for visibility
  
  const orbitalR = Math.max(10, Math.min(60, data.semiMajorAxis * 200)); // SCALED FOR REAL DATA
  const omega = (2 * Math.PI) / Math.max(1, data.orbitalPeriod); // rad/day (normalized)

  useFrame((state) => {
    const t = (state.clock.getElapsedTime() + t0.current) * speedScale * 0.25; // slow it down
    const theta = data.phase0 + t * omega;
    const x = Math.cos(theta) * orbitalR;
    const z = Math.sin(theta) * orbitalR;
    if (ref.current) {
      ref.current.position.set(x, 0, z);
      ref.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      <Orbit radius={orbitalR} color="#333" />
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh
          ref={ref}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover?.(data, e.intersections?.[0]?.point);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover?.(null);
          }}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial color={color} metalness={hovered ? 0.4 : 0.2} roughness={0.4} />
        </mesh>
      </Float>
    </group>
  );
}

export default Planet;