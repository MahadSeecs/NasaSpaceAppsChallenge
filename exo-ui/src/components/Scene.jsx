// components/Scene.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import Planet from './Planet';
import Tooltip from './Tooltip';
import { OrbitControls, Html, Line, Float, Stars, Environment } from "@react-three/drei";
import { motion } from "framer-motion";
import { EffectComposer, Bloom } from '@react-three/postprocessing';

function Scene({ planets, speedScale, sizeScale, filters, setHoverPlanet , selectedPlanet, setSelectedPlanet}) {
  const [hover, setHover] = useState(null);
  const [screenPos, setScreenPos] = useState(null);

  // Get star radius from first planet's data (all planets in view share same star)
  const starRadius = planets.length > 0 && planets[0].starRadius ? planets[0].starRadius : 1;
  const starRadiusVisual = Math.max(1.5, Math.min(4, starRadius * 1.5)); // Scale star for visibility
  // const starRadiusVisual = Math.max(1.5, Math.min(4, starRadius * 2)); // Scale star for visibility

  // project 3d to 2d for tooltip
  const onHover = (p, point) => {
    setHover(p);
    setHoverPlanet?.(p);
    setSelectedPlanet(null)
  };

  useEffect(() => {
    const onMove = (e) => {
      if (hover) {
        setScreenPos([e.clientX, e.clientY, e.clientZ]);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [hover]);

  const visible = useMemo(() => {
    return planets.filter((p) => {
      const okDisp = filters[p.disp];
      const okRad = p.planetRadiusRe >= filters.radMin && p.planetRadiusRe <= filters.radMax;
      const okPer = p.orbitalPeriod >= filters.perMin && p.orbitalPeriod <= filters.perMax;
      return okDisp && okRad && okPer;
    });
  }, [planets, filters]);

  return (
    <div className="relative h-full w-full">
      <Canvas shadows camera={{ position: [0, 30, 80], fov: 65 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 12, 6]} intensity={1.1} castShadow />
        <pointLight position={[-12, 8, -6]} intensity={0.4} />
        <Stars radius={400} depth={100} count={8000} factor={4} fade speed={0.6} />
        <Environment preset="city" />

        {/* host star */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[starRadiusVisual, 48, 48]} />
          <EffectComposer>
  <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={1.2} />
</EffectComposer> 
        </mesh>

                {planets.map((p) => (
          <Planet 
            key={p.id} 
            data={p} 
            scale={sizeScale} 
            speedScale={speedScale} 
            onHover={onHover} 
            starRadius={starRadius} 
            isSelected={selectedPlanet?.id === p.id} // Check for selection
          />
        ))}

        {/* {visible.map((p) => (
          <Planet key={p.id} data={p} scale={sizeScale} speedScale={speedScale} onHover={onHover} starRadius={starRadius} />)
        )} */}
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
      <Tooltip planet={hover} screenPos={screenPos} />
    </div>
  );
}

export default Scene;