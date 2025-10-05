import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

const MISSION_FILES = {
  Kepler: "/data/koi.csv",  // kepid, koi_steff, koi_srad, koi_slogg
  TESS: "/data/toi.csv",    // tid/tic, st_teff, st_rad, st_logg
};

function ResultModal({ isOpen, onClose, result, planetName }) {
  if (!isOpen) return null;

  const confirmedProb = result?.probabilities?.["CONFIRMED"] || 0;
  const falsePositiveProb = result?.probabilities?.["FALSE POSITIVE"] || 0;
  const isConfirmed = result?.prediction === "CONFIRMED";

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4 bg-gradient-to-br from-slate-900 to-black rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-r from-purple-600/15 to-blue-600/15 px-6 py-4 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-300 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-xl">classification result</div>
          <div className="text-sm text-purple-300 mt-1">{planetName}</div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <div
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg ${
                isConfirmed
                  ? "bg-green-500/15 text-green-400 border border-green-500/40"
                  : "bg-red-500/15 text-red-400 border border-red-500/40"
              }`}
            >
              {isConfirmed ? "✓" : "✗"}
              <span>{result?.prediction}</span>
            </div>
          </div>

          <div className="space-y-4">
            <Bar label="confirmed" value={confirmedProb} />
            <Bar label="false positive" value={falsePositiveProb} tone="red" />
          </div>

          <div className="bg-purple-500/10 border border-white/10 rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-wider text-purple-300 mb-1">confidence level</div>
            <div className="text-lg text-white">
              {Math.max(confirmedProb, falsePositiveProb) > 0.9
                ? "very high"
                : Math.max(confirmedProb, falsePositiveProb) > 0.75
                ? "high"
                : Math.max(confirmedProb, falsePositiveProb) > 0.6
                ? "moderate"
                : "low"}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-900/60 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
          >
            close
          </button>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, value, tone = "green" }) {
  const toneClass = tone === "red" ? "from-red-500 to-red-400" : "from-green-500 to-green-400";
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className={tone === "red" ? "text-red-400" : "text-green-400"}>{label}</span>
        <span className="text-white">{(value * 100).toFixed(2)}%</span>
      </div>
      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          className={`h-full bg-gradient-to-r ${toneClass} rounded-full`}
        />
      </div>
    </div>
  );
}

const Analyze = () => {
  const [formData, setFormData] = useState({
    mission: "Kepler",

    // planet
    period_days: "",
    t0_bjd: "",
    duration_hours: "",
    depth_ppm: "",
    ror: "",
    radius_re: "",
    insolation_se: "",
    teq_k: "",

    // star
    st_id: "",
    st_name: "",
    st_teff_k: "",
    st_logg_cgs: "",
    st_rad_re: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [stars, setStars] = useState([]);
  const [starSearch, setStarSearch] = useState("");
  const [starMode, setStarMode] = useState("pick"); // pick | new
  const [loadingStars, setLoadingStars] = useState(false);
  const [starError, setStarError] = useState("");

  const GENERAL_MODEL = import.meta.env.VITE_GENERAL_MODEL || "http://localhost:8000/api/predict";

  // load stars when mission changes
  useEffect(() => {
    const run = async () => {
      setStars([]);
      setStarError("");
      setLoadingStars(true);
      try {
        const url = MISSION_FILES[formData.mission];
        if (!url) {
          setStarError(`no csv configured for ${formData.mission}`);
          return;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        const parsed = parseStarCSV(text, formData.mission);

        setStars(parsed);

        // reset star selection on mission change
        setFormData((d) => ({
          ...d,
          st_id: "",
          st_name: "",
          st_teff_k: "",
          st_logg_cgs: "",
          st_rad_re: "",
        }));
        setStarMode("pick");
      } catch (e) {
        setStarError(`failed to load star list: ${e.message}`);
      } finally {
        setLoadingStars(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.mission]);

  const filteredStars = useMemo(() => {
    const q = starSearch.trim().toLowerCase();
    if (!q) return stars;
    return stars.filter(
      (s) => s.label.toLowerCase().includes(q) || String(s.id).toLowerCase().includes(q)
    );
  }, [stars, starSearch]);

  const onPickStar = (idStr) => {
    if (idStr === "__new__") {
      setStarMode("new");
      return;
    }
    setStarMode("pick");
    const found = stars.find((s) => String(s.id) === String(idStr));
    if (found) {
      setFormData((d) => ({
        ...d,
        st_id: found.id,
        st_name: found.label,
        st_teff_k: safeNum(found.teff),
        st_logg_cgs: safeNum(found.logg),
        st_rad_re: safeNum(found.rad),
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((d) => ({ ...d, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const body = {
        mission: formData.mission,

        // planet
        period_days: parseFloat(formData.period_days),
        t0_bjd: parseFloat(formData.t0_bjd),
        duration_hours: parseFloat(formData.duration_hours),
        depth_ppm: parseFloat(formData.depth_ppm),
        ror: parseFloat(formData.ror),
        radius_re: parseFloat(formData.radius_re),
        insolation_se: parseFloat(formData.insolation_se),
        teq_k: parseFloat(formData.teq_k),

        // star
        star: {
          id: formData.st_id || null,
          name: formData.st_name || buildStarName(formData.mission, formData.st_id),
          st_teff_k: parseFloat(formData.st_teff_k),
          st_logg_cgs: parseFloat(formData.st_logg_cgs),
          st_rad_re: parseFloat(formData.st_rad_re),
        },
      };

      const response = await fetch(GENERAL_MODEL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`API ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setShowModal(true);
    } catch (error) {
      alert(`error analyzing planet: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-auto bg-gradient-to-b from-slate-900 to-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Analyze Exoplanet Data</h1>
      
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-xl shadow-lg space-y-4"
      >
        {/* Mission Dropdown */}
        <div className="flex flex-col">
          <label className="mb-1 font-semibold">Mission</label>
          <select
            name="mission"
            value={formData.mission}
            onChange={handleChange}
            className="p-2 rounded-md bg-gray-700 text-white"
          >
            <option value="Kepler">Kepler</option>
            <option value="TESS">TESS</option>
          </select>
        </div>

          {loadingStars && <div className="mt-2 text-xs opacity-80">loading star list…</div>}
          {starError && <div className="mt-2 text-xs text-red-400">{starError}</div>}

          {starMode === "pick" && (
            <div className="mt-4">
              <Field label="select star">
                {/* full-width select; tip is now a tiny caption under it */}
                <select
                  value={formData.st_id || ""}
                  onChange={(e) => onPickStar(e.target.value)}
                  className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/60"
                >
                  <option value="">select a star</option>
                  {filteredStars.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                  <option value="__new__">create new star…</option>
                </select>

                <p className="mt-1 text-[11px] leading-tight text-slate-400/75">
                  Pick from catalog to auto-fill stellar fields (you can still edit)
                </p>
              </Field>
            </div>
          )}
        </motion.div>

        {/* stellar parameters */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.05 }}
          className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-xl"
        >
          <SectionTitle>star parameters</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label={`${formData.mission === "TESS" ? "TIC" : "KIC"} id`}
              name="st_id"
              value={formData.st_id}
              onChange={handleChange}
            />
            <InputField
              label="star name"
              name="st_name"
              value={formData.st_name}
              onChange={handleChange}
              placeholder={buildStarName(formData.mission, formData.st_id)}
              type="text"
            />
            <InputField
              label="temperature Teff (K)"
              name="st_teff_k"
              value={formData.st_teff_k}
              onChange={handleChange}
              type="number"
              step="any"
            />
            <InputField
              label="surface gravity log g (cgs)"
              name="st_logg_cgs"
              value={formData.st_logg_cgs}
              onChange={handleChange}
              type="number"
              step="any"
            />
            <InputField
              label="radius (solar radii)"
              name="st_rad_re"
              value={formData.st_rad_re}
              onChange={handleChange}
              type="number"
              step="any"
            />
          </div>
        </motion.div>

        {/* planet parameters */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.1 }}
          className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-xl"
        >
          <SectionTitle>planet parameters</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="orbital period (days)"
              name="period_days"
              value={formData.period_days}
              onChange={handleChange}
            />
            <InputField label="transit time (BJD)" name="t0_bjd" value={formData.t0_bjd} onChange={handleChange} />
            <InputField
              label="transit duration (hours)"
              name="duration_hours"
              value={formData.duration_hours}
              onChange={handleChange}
            />
            <InputField label="transit depth (ppm)" name="depth_ppm" value={formData.depth_ppm} onChange={handleChange} />
            <InputField label="radius ratio Rp/Rs" name="ror" value={formData.ror} onChange={handleChange} />
            <InputField
              label="planet radius (Earth radii)"
              name="radius_re"
              value={formData.radius_re}
              onChange={handleChange}
            />
            <InputField
              label="insolation flux (Earth=1)"
              name="insolation_se"
              value={formData.insolation_se}
              onChange={handleChange}
            />
            <InputField label="equilibrium temperature (K)" name="teq_k" value={formData.teq_k} onChange={handleChange} />
          </div>
        </motion.div>

        {/* submit */}
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.15 }}
          className="mt-6 flex justify-center"
        >
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="rounded-2xl border border-white/15 bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-3 text-white text-lg shadow-xl hover:from-purple-500 hover:to-blue-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? "analyzing…" : "analyze"}
          </button>
        </motion.div>
      </div>

      <ResultModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        result={result}
        planetName="custom input planet"
      />
    </div>
    </div>
  );
};

// small atoms

function SectionTitle({ children }) {
  return <div className="text-[11px] uppercase tracking-[0.22em] text-slate-300 mb-4">{children}</div>;
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      {children}
    </div>
  );
}

const InputField = ({ label, name, value, onChange, type = "number", step = "any", placeholder = "" }) => (
  <div className="flex flex-col gap-1">
    <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
    <input
      type={type}
      step={type === "number" ? step : undefined}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/60 placeholder:text-slate-500"
    />
  </div>
);

// helpers

function safeNum(x) {
  if (x === null || x === undefined) return "";
  const n = Number(x);
  return Number.isFinite(n) ? String(n) : "";
}

function buildStarName(mission, id) {
  if (!id) return "";
  return `${mission === "TESS" ? "TIC" : "KIC"} ${id}`;
}

function parseStarCSV(text, mission) {
  const rows = text.split(/\r?\n/).filter(Boolean);
  const header = rows.shift()?.split(",").map((s) => s.trim()) || [];

  const idx = (name) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
  const get = (cells, i) => (i >= 0 ? (cells[i] ?? "").trim() : "");

  if (mission === "Kepler") {
    const cKepid = idx("kepid");
    const cTeff = idx("koi_steff");
    const cRad = idx("koi_srad");
    const cLogg = idx("koi_slogg");
    return rows
      .slice(0, 5000)
      .map((line) => {
        const cells = line.split(",");
        const id = get(cells, cKepid);
        if (!id) return null;
        return {
          id,
          label: `KIC ${id}`,
          teff: toNum(get(cells, cTeff)),
          rad: toNum(get(cells, cRad)),
          logg: toNum(get(cells, cLogg)),
        };
      })
      .filter(Boolean);
  }

  const cTid = idx("tid") >= 0 ? idx("tid") : idx("tic") >= 0 ? idx("tic") : -1;
  const cTeff = idx("st_teff");
  const cRad = idx("st_rad");
  const cLogg = idx("st_logg");
  return rows
    .slice(0, 5000)
    .map((line) => {
      const cells = line.split(",");
      const id = get(cells, cTid);
      if (!id) return null;
      return {
        id,
        label: `TIC ${id}`,
        teff: toNum(get(cells, cTeff)),
        rad: toNum(get(cells, cRad)),
        logg: toNum(get(cells, cLogg)),
      };
    })
    .filter(Boolean);
}

function toNum(s) {
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export default Analyze;
