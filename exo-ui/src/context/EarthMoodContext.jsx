import React, { createContext, useContext, useState } from "react";

const EarthMoodContext = createContext();

export const EarthMoodProvider = ({ children }) => {
  const [progress, setProgress] = useState(0); // 0-100
  const [stage, setStage] = useState(0); // 0=sad, 1=neutral, 2=happy

  const cheerUp = (amount = 20) => { // default +20 each time
    setProgress(prev => {
      const next = Math.min(prev + amount, 100);

      // update stage
      if (next >= 100) setStage(2);
      else if (next >= 50) setStage(1);
      else setStage(0);

      return next;
    });
  };

  const resetMood = () => {
    setProgress(0);
    setStage(0);
  };

  return (
    <EarthMoodContext.Provider value={{ progress, stage, cheerUp, resetMood }}>
      {children}
    </EarthMoodContext.Provider>
  );
};

export const useEarthMood = () => useContext(EarthMoodContext);
