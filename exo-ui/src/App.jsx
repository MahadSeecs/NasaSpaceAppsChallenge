import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line, Float, Stars, Environment } from "@react-three/drei";
import { motion } from "framer-motion";

// simple color palette for dispositions
const DISP_COLORS = {
  confirmed: "#00ff99",
  candidate: "#66aaff",
  fp: "#ff5c5c",
};

// utility to map range
const lerp = (a, b, t) => a + (b - a) * t;
const mapRange = (value, inMin, inMax, outMin, outMax) => {
  const t = (value - inMin) / (inMax - inMin || 1);
  return lerp(outMin, outMax, Math.min(1, Math.max(0, t)));
};

// procedurally make mock planets when no data is provided
function useMockPlanets(count = 80) {
  return useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 18; // orbital radius
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

function Planet({ data, scale = 1, speedScale = 1, onHover }) {
  const ref = useRef();
  const t0 = useRef(Math.random() * 1000);
  const [hovered, setHovered] = useState(false);

  const color = DISP_COLORS[data.disp] || "#aaa";
  const radius = Math.max(0.1, Math.min(1.4, data.planetRadiusRe / 2.5)) * scale;
  const orbitalR = Math.max(2, Math.min(25, data.semiMajorAxis));
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

function Tooltip({ planet, screenPos }) {
  if (!planet || !screenPos) return null;
  const [x, y] = screenPos;
  return (
    <div
      className="pointer-events-none fixed z-40 rounded-xl bg-black/70 px-3 py-2 text-xs text-white shadow-lg backdrop-blur"
      style={{ left: x + 12, top: y + 12 }}
    >
      <div className="font-medium text-sm">{planet.name}</div>
      <div className="opacity-80">host {planet.host}</div>
      <div className="opacity-80">period {planet.orbitalPeriod.toFixed?.(2) || planet.orbitalPeriod} d</div>
      <div className="opacity-80">radius {planet.planetRadiusRe} R⊕</div>
      <div className="opacity-80">depth {planet.transitDepthPpm} ppm</div>
      <div className="opacity-80">class {planet.disp}</div>
    </div>
  );
}

function Scene({ planets, speedScale, sizeScale, filters, setHoverPlanet }) {
  const [hover, setHover] = useState(null);
  const [screenPos, setScreenPos] = useState(null);
  const camRef = useRef();

  // project 3d to 2d for tooltip
  const onHover = (p, point) => {
    setHover(p);
    setHoverPlanet?.(p);
  };

  useEffect(() => {
    const onMove = (e) => setScreenPos([e.clientX, e.clientY]);
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

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
      <Canvas shadows camera={{ position: [0, 12, 32], fov: 55 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 12, 6]} intensity={1.1} castShadow />
        <pointLight position={[-12, 8, -6]} intensity={0.4} />
        <Stars radius={200} depth={60} count={8000} factor={4} fade speed={0.6} />
        <Environment preset="city" />

        {/* host star */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[2, 48, 48]} />
          <meshStandardMaterial emissive="#ffaa00" emissiveIntensity={0.8} color="#442200" />
        </mesh>

        {visible.map((p) => (
          <Planet key={p.id} data={p} scale={sizeScale} speedScale={speedScale} onHover={onHover} />)
        )}
        <OrbitControls enablePan enableZoom enableRotate />
      </Canvas>
      <Tooltip planet={hover} screenPos={screenPos} />
    </div>
  );
}

export default function ExoplanetExplorer() {
  const mock = useMockPlanets(120);
  const [planets, setPlanets] = useState(mock);
  const [hoverPlanet, setHoverPlanet] = useState(null);

  const [filters, setFilters] = useState({
    confirmed: true,
    candidate: true,
    fp: false,
    radMin: 0,
    radMax: 10,
    perMin: 0,
    perMax: 120,
  });
  const [speedScale, setSpeedScale] = useState(1);
  const [sizeScale, setSizeScale] = useState(1);

  // handle CSV upload (KOI/TOI/K2 style) minimal stub: expects columns planetRadiusRe, orbitalPeriod, semiMajorAxis, disp
  const onUpload = async (file) => {
    const text = await file.text();
    const rows = text.split(/\r?\n/).filter(Boolean);
    const header = rows.shift().split(",").map((s) => s.trim());
    const col = (name) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
    const cName = col("pl_name") !== -1 ? col("pl_name") : col("name");
    const cHost = col("hostname") !== -1 ? col("hostname") : col("host");
    const cPer = col("orbitalPeriod") !== -1 ? col("orbitalPeriod") : col("pl_orbper");
    const cRad = col("planetRadiusRe") !== -1 ? col("planetRadiusRe") : col("pl_rade");
    const cSma = col("semiMajorAxis") !== -1 ? col("semiMajorAxis") : col("pl_orbsmax");
    const cDisp = col("disp") !== -1 ? col("disp") : col("disposition");
    const cDepth = col("transitDepthPpm") !== -1 ? col("transitDepthPpm") : col("tran_depth_ppm");

    const parsed = rows.slice(0, 1000).map((line, i) => {
      const cells = line.split(",");
      const get = (idx) => (idx >= 0 ? cells[idx] : "");
      const dispRaw = (get(cDisp) || "candidate").toLowerCase();
      const disp = dispRaw.startsWith("conf") ? "confirmed" : dispRaw.startsWith("fp") ? "fp" : "candidate";
      const per = parseFloat(get(cPer)) || Math.random() * 100 + 5;
      const rad = parseFloat(get(cRad)) || Math.random() * 3 + 0.5;
      const sma = parseFloat(get(cSma)) || Math.random() * 20 + 3;
      return {
        id: `u-${i}`,
        name: get(cName) || `U-${i}`,
        host: get(cHost) || `Host-${i}`,
        orbitalPeriod: per,
        planetRadiusRe: rad,
        semiMajorAxis: sma,
        disp,
        transitDepthPpm: parseFloat(get(cDepth)) || Math.round(500 + Math.random() * 5000),
        phase0: Math.random() * Math.PI * 2,
      };
    });
    setPlanets(parsed.length ? parsed : mock);
  };

  return (
    <div className="relative flex h-screen w-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100">
      {/* left control panel */}
      <motion.aside
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="z-30 flex w-80 flex-col gap-4 border-r border-white/10 bg-black/40 p-4 backdrop-blur"
      >
        <div className="text-lg">exoplanet explorer</div>
        <div className="text-xs opacity-75">drag to orbit. scroll to zoom. hover for details.</div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.confirmed}
              onChange={(e) => setFilters({ ...filters, confirmed: e.target.checked })}
            />
            <span className="rounded px-2 py-0.5" style={{ background: DISP_COLORS.confirmed + "22" }}>confirmed</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.candidate}
              onChange={(e) => setFilters({ ...filters, candidate: e.target.checked })}
            />
            <span className="rounded px-2 py-0.5" style={{ background: DISP_COLORS.candidate + "22" }}>candidate</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.fp}
              onChange={(e) => setFilters({ ...filters, fp: e.target.checked })}
            />
            <span className="rounded px-2 py-0.5" style={{ background: DISP_COLORS.fp + "22" }}>false positive</span>
          </label>
        </div>

        <div className="mt-2">
          <div className="mb-1 text-sm opacity-75">planet radius (R⊕)</div>
          <input
            type="range"
            min={0}
            max={15}
            step={0.1}
            value={filters.radMin}
            onChange={(e) => setFilters({ ...filters, radMin: parseFloat(e.target.value) })}
          />
          <input
            type="range"
            min={0}
            max={15}
            step={0.1}
            value={filters.radMax}
            onChange={(e) => setFilters({ ...filters, radMax: parseFloat(e.target.value) })}
          />
          <div className="text-xs">{filters.radMin} – {filters.radMax}</div>
        </div>

        <div className="mt-2">
          <div className="mb-1 text-sm opacity-75">orbital period (days)</div>
          <input
            type="range"
            min={0}
            max={200}
            step={1}
            value={filters.perMin}
            onChange={(e) => setFilters({ ...filters, perMin: parseFloat(e.target.value) })}
          />
          <input
            type="range"
            min={0}
            max={200}
            step={1}
            value={filters.perMax}
            onChange={(e) => setFilters({ ...filters, perMax: parseFloat(e.target.value) })}
          />
          <div className="text-xs">{filters.perMin} – {filters.perMax}</div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <label className="flex items-center justify-between gap-2">
            speed
            <input
              type="range"
              min={0.25}
              max={4}
              step={0.25}
              value={speedScale}
              onChange={(e) => setSpeedScale(parseFloat(e.target.value))}
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            size
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={sizeScale}
              onChange={(e) => setSizeScale(parseFloat(e.target.value))}
            />
          </label>
        </div>

        <div className="mt-2">
          <label className="text-sm opacity-75">upload csv (optional)</label>
          <input
            type="file"
            accept=".csv"
            className="mt-1 w-full text-xs file:mr-3 file:rounded-lg file:border file:border-white/20 file:bg-white/5 file:px-3 file:py-1 file:text-white"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          />
          <div className="mt-1 text-xs opacity-60">columns recognized: pl_name, hostname, pl_orbper, pl_rade, pl_orbsmax, disposition</div>
        </div>

        <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed">
          <div className="font-medium">how to use</div>
          <ul className="mt-1 list-disc pl-4 opacity-80">
            <li>hover a planet to see its details</li>
            <li>filter by class, radius, and period</li>
            <li>upload your csv to replace the mock catalog</li>
          </ul>
        </div>
      </motion.aside>

      {/* main 3D scene */}
      <div className="relative flex-1">
        <Scene planets={planets} speedScale={speedScale} sizeScale={sizeScale} filters={filters} setHoverPlanet={setHoverPlanet} />

        {/* top bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 130, damping: 16, delay: 0.2 }}
          className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-2xl bg-black/40 px-4 py-2 text-sm text-white backdrop-blur"
        >
          nasa exoplanet ai/ml challenge – interactive template
        </motion.div>

        {/* bottom info card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 130, damping: 16, delay: 0.3 }}
          className="pointer-events-auto absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/50 p-3 text-xs text-white backdrop-blur"
        >
          <div className="flex items-center gap-3">
            <span className="opacity-80">legend</span>
            <span className="h-3 w-3 rounded-full" style={{ background: DISP_COLORS.confirmed }}></span>
            <span className="opacity-80">confirmed</span>
            <span className="h-3 w-3 rounded-full" style={{ background: DISP_COLORS.candidate }}></span>
            <span className="opacity-80">candidate</span>
            <span className="h-3 w-3 rounded-full" style={{ background: DISP_COLORS.fp }}></span>
            <span className="opacity-80">false positive</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
