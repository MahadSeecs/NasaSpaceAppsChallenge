import React, { useState } from "react";
import StarfieldBackground from './StarfieldBackground';
import {useEarthMood} from '../context/EarthMoodContext'

const Analyze = () => {
  const [formData, setFormData] = useState({
    mission: "Kepler",
    period_days: "",
    t0_bjd: "",
    duration_hours: "",
    depth_ppm: "",
    ror: "",
    radius_re: "",
    insolation_se: "",
    teq_k: "",
    st_teff_k: "",
    st_logg_cgs: "",
    st_rad_re: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // Call your analyze function or API here
  };

  return (
    <div className="relative h-screen w-full overflow-auto bg-gradient-to-b from-slate-900 to-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Analyze Exoplanet Data</h1>
      {/* <Starfield/> */}
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

        {/* Other Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Orbital Period (days)" name="period_days" value={formData.period_days} onChange={handleChange} />
          <InputField label="Transit Time (BJD)" name="t0_bjd" value={formData.t0_bjd} onChange={handleChange} />
          <InputField label="Transit Duration (hours)" name="duration_hours" value={formData.duration_hours} onChange={handleChange} />
          <InputField label="Transit Depth (ppm)" name="depth_ppm" value={formData.depth_ppm} onChange={handleChange} />
          <InputField label="Planet/Star Radius Ratio" name="ror" value={formData.ror} onChange={handleChange} />
          <InputField label="Planet Radius (Earth radii)" name="radius_re" value={formData.radius_re} onChange={handleChange} />
          <InputField label="Insolation Flux (Earth=1)" name="insolation_se" value={formData.insolation_se} onChange={handleChange} />
          <InputField label="Equilibrium Temp (K)" name="teq_k" value={formData.teq_k} onChange={handleChange} />
          <InputField label="Star Temp (K)" name="st_teff_k" value={formData.st_teff_k} onChange={handleChange} />
          <InputField label="Star Surface Gravity" name="st_logg_cgs" value={formData.st_logg_cgs} onChange={handleChange} />
          <InputField label="Star Radius (Solar radii)" name="st_rad_re" value={formData.st_rad_re} onChange={handleChange} />
        </div>

        <button
          type="submit"
          className="mt-4 bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-xl font-bold text-xl transition-all"
        >
          Analyze
        </button>
      </form>
    </div>
  );
};

// Reusable input component
const InputField = ({ label, name, value, onChange }) => (
  <div className="flex flex-col">
    <label className="mb-1 font-semibold">{label}</label>
    <input
      type="number"
      step="any"
      name={name}
      value={value}
      onChange={onChange}
      className="p-2 rounded-md bg-gray-700 text-white"
    />
  </div>
);

export default Analyze;
