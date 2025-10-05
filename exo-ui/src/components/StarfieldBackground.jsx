import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function InteractiveStars() {
  const starsRef = useRef();
  const { camera } = useThree();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMouse({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.02;
      starsRef.current.rotation.x += delta * 0.01;
    }
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, mouse.x * 0.2, 0.05);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, mouse.y * 0.2, 0.05);
  });

  return <Stars ref={starsRef} radius={100} depth={50} count={5000} factor={4} fade />;
}

const StarfieldBackground = () => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
      <Canvas camera={{ position: [0, 0, 1] }}>
        <color attach="background" args={['#000']} />
        <InteractiveStars />
      </Canvas>
    </div>
  );
};

export default StarfieldBackground;
