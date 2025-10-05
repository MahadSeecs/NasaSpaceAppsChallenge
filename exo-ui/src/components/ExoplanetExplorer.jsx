import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Scene from './Scene';
import PlanetDetails from './PlanetDetails';
import useMockPlanets from './useMockPlanets';
import Tooltip from './Tooltip';

const lerp = (a, b, t) => a + (b - a) * t;
const mapRange = (value, inMin, inMax, outMin, outMax) => {
  const t = (value - inMin) / (inMax - inMin || 1);
  return lerp(outMin, outMax, Math.min(1, Math.max(0, t)));
};

const DISP_COLORS = {
  confirmed: "#00ff99",
  candidate: "#66aaff",
  fp: "#ff5c5c",
};

// Mission data file mapping
const MISSION_FILES = {
  kepler: '/data/koi.csv',
  k2: '/data/k2.csv',
  tess: '/data/toi.csv'
};

function ExoplanetExplorer() {
  const { mission } = useParams();
  const mock = useMockPlanets(100);
  const [planets, setPlanets] = useState(mock);
  const [allPlanets, setAllPlanets] = useState(mock);
  const [hoverPlanet, setHoverPlanet] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [selectedKepid, setSelectedKepid] = useState("");
  const [availableKepids, setAvailableKepids] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Load mission data automatically
  useEffect(() => {
    console.log("Mission changed:", mission);
    if (mission && MISSION_FILES[mission]) {
      console.log("Loading mission data for:", mission);
      loadMissionData(mission);
    } else if (mission) {
      console.log("No data file configured for mission:", mission);
      setUploadStatus(`⚠ No data file configured for ${mission.toUpperCase()}`);
    }
  }, [mission]);

  // Load data from public folder
  const loadMissionData = async (missionName) => {
    const filePath = MISSION_FILES[missionName];
    console.log("Attempting to load file from:", filePath);
    
    if (!filePath) {
      setUploadStatus(`⚠ No data file configured for ${missionName}`);
      return;
    }

    try {
      setIsLoading(true);
      setUploadStatus(`Loading ${missionName.toUpperCase()} data...`);
      
      const response = await fetch(filePath);
      console.log("Fetch response:", response.status, response.ok);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${missionName} data (HTTP ${response.status}). Make sure ${filePath} exists in your public folder.`);
      }
      
      const text = await response.text();
      console.log("CSV loaded, length:", text.length);
      await parseCSV(text, missionName);
      
    } catch (error) {
      console.error("Load error:", error);
      setUploadStatus(`✗ Error: ${error.message}`);
      setTimeout(() => setUploadStatus(""), 8000);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse CSV data
  const parseCSV = async (text, source = "upload") => {
    console.log("Parsing CSV, source:", source);
    const rows = text.split(/\r?\n/).filter(Boolean);
    console.log("Total rows:", rows.length);
    
    const header = rows.shift().split(",").map((s) => s.trim());
    console.log("Headers found:", header);
    
    const col = (name) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
    
    // Detect format based on available columns
    const isTESS = col("toi") >= 0 || col("tid") >= 0;
    const isKepler = col("kepid") >= 0 || col("kepoi_name") >= 0;
    
    console.log("Detected format - TESS:", isTESS, "Kepler:", isKepler);
    
    let parsed = [];
    
    if (isTESS) {
      // TESS TOI format
      const cToi = col("toi");
      const cTid = col("tid");
      const cAlias = col("ctoi_alias");
      const cPeriod = col("pl_orbper");
      const cPrad = col("pl_rade");
      const cDepth = col("pl_trandep");
      const cDuration = col("pl_trandurh");
      const cInsolation = col("pl_insol");
      const cEqTemp = col("pl_eqt");
      const cDisp = col("tfopwg_disp");
      const cStTmag = col("st_tmag");
      const cStDist = col("st_dist");
      const cStTeff = col("st_teff");
      const cStRad = col("st_rad");
      // choose random angle of inclination for demo purposes
      const cStIncl = Math.random() * 360;
      
      console.log("Column indices:", { cToi, cTid, cPeriod, cPrad, cDepth, cStRad });
      
      parsed = rows.slice(0, 1000).map((line, i) => {
        const cells = line.split(",");
        const get = (idx) => (idx >= 0 ? cells[idx]?.trim() : "");
        
        const toiStr = get(cToi);
        const tid = get(cTid);
        const alias = get(cAlias);
        
        // tid is the star system ID, toi is the planet name
        const starId = tid || `${i}`;
        const planetName = toiStr ? `TOI ${toiStr}` : `TOI-${i}`;
        
        // Log first few entries to verify
        if (i < 3) {
          console.log(`Planet ${i}: TOI=${toiStr}, TID=${tid}, alias=${alias}, name=${planetName}`);
        }
        
        // TESS disposition mapping
        const dispRaw = (get(cDisp) || "candidate").toLowerCase();
        const disp = dispRaw.includes("cp") || dispRaw.includes("confirmed") ? "confirmed" : 
                     dispRaw.includes("fp") || dispRaw.includes("false") ? "fp" : "candidate";
        
        const host = starId ? `TIC ${starId}` : `TIC-${i}`;
        
        const period = parseFloat(get(cPeriod)) || (Math.random() * 100 + 5);
        const rad = parseFloat(get(cPrad)) || (Math.random() * 3 + 0.5);
        const depth = parseFloat(get(cDepth)) || Math.round(500 + Math.random() * 5000);
        const duration = parseFloat(get(cDuration)) || 2;
        const insolation = parseFloat(get(cInsolation)) || null;
        const eqTemp = parseFloat(get(cEqTemp)) || null;
        const starRadius = parseFloat(get(cStRad)) || 1;
        const starTemp = parseFloat(get(cStTeff)) || 5778;
        const starDist = parseFloat(get(cStDist)) || null;
        
        // Calculate semi-major axis from period (Kepler's third law approximation)
        const sma = period > 0 ? Math.pow(period / 365.25, 2/3) * 100 : (10 + Math.random() * 50);
        
        return {
          id: `toi-${toiStr || i}`,
          kepid: starId, // TIC ID (tid) for grouping by star system
          toi: toiStr, // TOI number is the planet identifier
          name: planetName,
          host,
          orbitalPeriod: period,
          planetRadiusRe: rad,
          semiMajorAxis: sma,
          disp,
          transitDepthPpm: depth * 1000,
          transitDuration: duration,
          insolation,
          equilibriumTemp: eqTemp,
          starRadius,
          starTemp,
          starDistance: starDist,
          phase0: Math.random() * Math.PI * 2,
          inclination: cStIncl,
        };
      }).filter(p => !isNaN(p.orbitalPeriod) && !isNaN(p.planetRadiusRe) && !isNaN(p.semiMajorAxis));
      
    } else {
      // Kepler KOI format (original)
      const cKepid = col("kepid");
      const cKepoi = col("kepoi_name");
      const cKepler = col("kepler_name");
      const cPeriod = col("koi_period");
      const cPrad = col("koi_prad");
      const cSma = col("koi_sma");
      const cDisp = col("koi_disposition");
      const cPDisp = col("koi_pdisposition");
      const cDepth = col("koi_depth");
      const cTeq = col("koi_teq");
      const cSrad = col("koi_srad");
      const cSteff = col("koi_steff");
      const cInc = col("koi_incl");
      
      console.log("Kepler Column indices:", { cKepid, cKepoi, cKepler, cPeriod, cPrad, cSma });
      
      parsed = rows.slice(0, 1000).map((line, i) => {
        const cells = line.split(",");
        const get = (idx) => (idx >= 0 ? cells[idx]?.trim() : "");
        
        const kepid = get(cKepid);
        const dispRaw = (get(cDisp) || get(cPDisp) || "candidate").toLowerCase();
        const disp = dispRaw.includes("conf") ? "confirmed" : 
                     dispRaw.includes("false") ? "fp" : "candidate";
        
        const name = get(cKepler) || get(cKepoi) || `KIC ${get(cKepid)}` || `KOI-${i}`;
        const host = get(cKepid) ? `KIC ${get(cKepid)}` : `Host-${i}`;
        
        const period = parseFloat(get(cPeriod)) || (Math.random() * 100 + 5);
        const rad = parseFloat(get(cPrad)) || (Math.random() * 3 + 0.5);
        const sma = parseFloat(get(cSma)) || (10 + Math.random() * 50);
        const depth = parseFloat(get(cDepth)) || Math.round(500 + Math.random() * 5000);
        const teq = parseFloat(get(cTeq)) || null;
        const starRadius = parseFloat(get(cSrad)) || 1;
        const starTemp = parseFloat(get(cSteff)) || 5778;
        
        return {
          id: `koi-${i}`,
          kepid,
          name,
          host,
          orbitalPeriod: period,
          planetRadiusRe: rad,
          semiMajorAxis: sma,
          disp,
          transitDepthPpm: depth,
          equilibriumTemp: teq,
          starRadius,
          starTemp,
          phase0: Math.random() * Math.PI * 2,
          inclination: parseFloat(get(cInc)) || (Math.random() * 360),
        };
      }).filter(p => !isNaN(p.orbitalPeriod) && !isNaN(p.planetRadiusRe) && !isNaN(p.semiMajorAxis));
    }
    
    console.log("Parsed planets:", parsed.length);
    
    if (parsed.length > 0) {
      setAllPlanets(parsed);
      
      const uniqueKepids = [...new Set(parsed.map(p => p.kepid))].filter(Boolean).sort();
      console.log("Unique KepIDs:", uniqueKepids.length, uniqueKepids.slice(0, 5));
      setAvailableKepids(uniqueKepids);
      
      if (uniqueKepids.length > 0) {
        const firstKepid = uniqueKepids[0];
        setSelectedKepid(firstKepid);
        const filtered = parsed.filter(p => p.kepid === firstKepid);
        setPlanets(filtered);
        console.log("Set first system:", firstKepid, "with", filtered.length, "planets");
        setUploadStatus(`✓ Loaded ${parsed.length} planets from ${uniqueKepids.length} star systems`);
      } else {
        setPlanets(parsed);
        setUploadStatus(`✓ Loaded ${parsed.length} planets`);
      }
      
      setTimeout(() => setUploadStatus(""), 5000);
    } else {
      console.warn("No valid planets parsed");
      setUploadStatus("⚠ No valid planets found");
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  // Filter planets when kepid changes
  useEffect(() => {
    if (selectedKepid && allPlanets.length > 0) {
      const filtered = allPlanets.filter(p => p.kepid === selectedKepid);
      setPlanets(filtered);
    } else if (!selectedKepid && allPlanets.length > 0) {
      setPlanets(allPlanets);
    }
  }, [selectedKepid, allPlanets]);

  const handlePlanetClick = (planet) => {
    if (selectedPlanet?.id === planet.id) {
      setSelectedPlanet(null);
    } else {
      setSelectedPlanet(planet);
    }
  };

  // Handle manual CSV upload
  const onUpload = async (file) => {
    try {
      setUploadStatus("Loading...");
      const text = await file.text();
      await parseCSV(text, "manual");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("✗ Error loading file");
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  return (
    <div className="relative flex h-screen w-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100">
      <motion.aside
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="z-30 flex w-80 flex-col gap-4 border-r border-white/10 bg-black/40 p-4 backdrop-blur overflow-y-auto"
      >
        <div className="text-lg">
          exoplanet explorer
          {mission && <span className="text-sm opacity-75 ml-2">({mission.toUpperCase()})</span>}
        </div>
        <div className="text-xs opacity-75">drag to orbit. scroll to zoom. hover for details.</div>

        {isLoading && (
          <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
            <div className="text-sm">Loading data...</div>
          </div>
        )}

        {availableKepids.length > 0 && (
          <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
            <label className="text-sm opacity-75 block mb-2">
              Select Star System {mission === 'tess' ? '(TIC ID)' : '(KepID)'}
            </label>
            <select
              value={selectedKepid}
              onChange={(e) => setSelectedKepid(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-purple-500/50 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400"
            >
              <option value="">All Systems ({allPlanets.length} planets)</option>
              {availableKepids.map(kepid => {
                const count = allPlanets.filter(p => p.kepid === kepid).length;
                const prefix = mission === 'tess' ? 'TIC' : 'KIC';
                return (
                  <option key={kepid} value={kepid}>
                    {prefix} {kepid} ({count} planet{count > 1 ? 's' : ''})
                  </option>
                );
              })}
            </select>
            {selectedKepid && (
              <div className="mt-2 text-xs opacity-75">
                Showing {planets.length} planet{planets.length > 1 ? 's' : ''} from {mission === 'tess' ? 'TIC' : 'KIC'} {selectedKepid}
              </div>
            )}
          </div>
        )}

{selectedKepid && (
  <div className="mt-4 text-sm opacity-75">
    <div className="mb-2">Planets:</div>
    <div className="flex flex-col gap-1">
      {planets.map(planet => {
        const isSelected = selectedPlanet?.id === planet.id;
        return (
          <button
            key={planet.id}
            onClick={() => handlePlanetClick(planet)}
            className={`py-1 px-2 rounded border-2 transition-colors duration-200
              ${isSelected 
                ? 'bg-purple-600 text-white font-bold border-white' 
                : 'bg-transparent border-white hover:bg-purple-700 hover:border-purple-400'}
            `}
          >
            {planet.name}
          </button>
        );
      })}
    </div>
  </div>
)}


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
          <label className="text-sm opacity-75">Upload custom CSV</label>
          <input
            type="file"
            accept=".csv"
            className="mt-1 w-full text-xs file:mr-3 file:rounded-lg file:border file:border-white/20 file:bg-white/5 file:px-3 file:py-1 file:text-white file:cursor-pointer"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          />
          {uploadStatus && (
            <div className="mt-2 text-xs opacity-90 bg-white/10 rounded px-2 py-1">
              {uploadStatus}
            </div>
          )}
          <div className="mt-1 text-xs opacity-60">
            Kepler KOI format: kepid, kepoi_name, kepler_name, koi_period, koi_prad, koi_sma, koi_disposition, koi_depth
            <br />
            TESS TOI format: toi, tid, pl_orbper, pl_rade, pl_trandep, tfopwg_disp
          </div>
        </div>

        <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-relaxed">
          <div className="font-medium">How to use</div>
          <ul className="mt-1 list-disc pl-4 opacity-80">
            <li>select a mission to load default data</li>
            <li>or upload your own KOI CSV file</li>
            <li>select a star system (KepID) from dropdown</li>
            <li>hover a planet to see its details</li>
            <li>filter by class, radius, and period</li>
          </ul>
        </div>
      </motion.aside>

      <div className="relative flex-1">
        <Scene 
          planets={planets} 
          speedScale={speedScale} 
          sizeScale={sizeScale} 
          filters={filters} 
          setHoverPlanet={setHoverPlanet} 
          selectedPlanet={selectedPlanet} 
          setSelectedPlanet={setSelectedPlanet}
        />
        
        {selectedPlanet && (
          <Tooltip planet={selectedPlanet} screenPos={[350,10]} onClose={() => setSelectedPlanet(null)} />
        )}

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 130, damping: 16, delay: 0.2 }}
          className="pointer-events-none absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-2xl bg-black/40 px-4 py-2 text-sm text-white backdrop-blur"
        >
          {selectedKepid ? `Star System: ${mission === 'tess' ? 'TIC' : 'KIC'} ${selectedKepid}` : 'exoplanet explorer'}
        </motion.div>

<motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 130, damping: 16, delay: 0.3 }}
          className="pointer-events-auto absolute bottom-4 left-1/2 z-30 -translate-x-1/2 rounded-2xl border border-white/20 bg-black/60 px-6 py-3 text-xs text-white backdrop-blur-md shadow-2xl"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="h-4 w-4 rounded-full block" style={{ background: 'white', boxShadow: '0 0 8px rgba(255,255,255,0.6)' }}></span>
              </div>
              <span className="opacity-90 font-medium">Star</span>
            </div>
            <div className="h-4 w-px bg-white/20"></div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full block" style={{ background: DISP_COLORS.confirmed, boxShadow: `0 0 6px ${DISP_COLORS.confirmed}` }}></span>
              <span className="opacity-90">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full block" style={{ background: DISP_COLORS.candidate, boxShadow: `0 0 6px ${DISP_COLORS.candidate}` }}></span>
              <span className="opacity-90">Candidate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full block" style={{ background: DISP_COLORS.fp, boxShadow: `0 0 6px ${DISP_COLORS.fp}` }}></span>
              <span className="opacity-90">False positive</span>
            </div>
            <div className="h-4 w-px bg-white/20"></div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full block" style={{ background: '#ffd700', boxShadow: '0 0 8px rgba(255,215,0,0.8)' }}></span>
              <span className="opacity-90">Selected</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ExoplanetExplorer;