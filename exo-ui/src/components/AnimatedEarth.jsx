import React from "react";
import { motion } from "framer-motion";
import { useEarthMood } from "../context/EarthMoodContext";

const emojis = ["😢", "🙂", "😄"]; // sad → neutral → happy

const AnimatedEarth = ({ size = "small" }) => {
  const { progress, stage } = useEarthMood();

  const sizeClasses = {
    tiny: "text-2xl",
    small: "text-3xl",
    medium: "text-6xl",
    large: "text-9xl",
  };

  return (
    <div className={`flex items-center gap-3 ${sizeClasses[size]}`}>
      {/* Earth emoji */}
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {emojis[stage]}
      </motion.div>

      {/* Mood Progress Bar */}
      <div className="w-24 h-3 bg-gray-600 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-green-400 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
};

export default AnimatedEarth;
