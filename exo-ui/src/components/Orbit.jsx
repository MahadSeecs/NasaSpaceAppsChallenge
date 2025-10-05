// components/Orbit.jsx
import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";

function Orbit({ radius = 5, segments = 128, color = "#555" }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      pts.push([Math.cos(t) * radius, 0, Math.sin(t) * radius]);
    }
    return pts;
  }, [radius, segments]);
  return <Line points={points} color={color} lineWidth={0.75} />;
}

export default Orbit;