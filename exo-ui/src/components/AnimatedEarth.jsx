import React from "react";
import { motion } from "framer-motion";
import { useEarthMood } from "../context/EarthMoodContext";

const moods = ["😢", "🙂", "😄"];

const AnimatedEarth = ({ size = "medium" }) => {
  const { mood } = useEarthMood();

  const sizeClasses = {
    small: "text-4xl",
    medium: "text-8xl",
    large: "text-[10rem]",
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} text-white select-none`}
      animate={{
        rotate: [0, 360],
        scale: [1, 1.05, 1],
      }}
      transition={{
        rotate: { duration: 25, repeat: Infinity, ease: "linear" },
        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <motion.span
        animate={{
          filter:
            mood === 0
              ? "drop-shadow(0 0 8px #3b82f6)"
              : mood === 1
              ? "drop-shadow(0 0 15px #22c55e)"
              : "drop-shadow(0 0 25px #facc15)",
        }}
        transition={{ duration: 0.8 }}
      >
        {moods[mood]}
      </motion.span>
    </motion.div>
  );
};

export default AnimatedEarth;
