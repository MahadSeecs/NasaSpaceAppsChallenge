import React, { createContext, useState, useContext } from "react";

const EarthMoodContext = createContext();

export const EarthMoodProvider = ({ children }) => {
  const [mood, setMood] = useState(0); // 0 = sad, 1 = neutral, 2 = happy

  const cheerUp = () => setMood((prev) => Math.min(prev + 1, 2));

  return (
    <EarthMoodContext.Provider value={{ mood, cheerUp }}>
      {children}
    </EarthMoodContext.Provider>
  );
};

export const useEarthMood = () => useContext(EarthMoodContext);
