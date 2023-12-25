"use client";

import { useEffect, useState } from 'react';
import LeftColumn from "../components/LeftColumn";
import RightColumn from "../components/RightColumn";
import ThemeToggle from "../components/ThemeToggle";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [lightBgStyle, setLightBgStyle] = useState({ opacity: 1, transition: 'opacity 0.3s ease-in-out' });
  const [darkBgStyle, setDarkBgStyle] = useState({ opacity: 0, transition: 'opacity 0.3s ease-in-out' });

  useEffect(() => {
    if (isDarkMode) {
      setLightBgStyle({ ...lightBgStyle, opacity: 0 });
      setTimeout(() => setDarkBgStyle({ ...darkBgStyle, opacity: 1 }), 150); // Start halfway through the light mode transition
    } else {
      setDarkBgStyle({ ...darkBgStyle, opacity: 0 });
      setTimeout(() => setLightBgStyle({ ...lightBgStyle, opacity: 1 }), 150); // Start halfway through the dark mode transition
    }

    // Toggle the dark-mode class after a delay to sync with the opacity transition
    setTimeout(() => {
      document.body.classList.toggle('dark-mode', isDarkMode);
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, 300);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <>
      <div className="bg-light-mode" style={lightBgStyle}></div>
      <div className="bg-dark-mode" style={darkBgStyle}></div>
      <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div className="container mx-auto ps-16 pt-16 h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
          <LeftColumn/>
          <RightColumn />
        </div>
      </div>
    </>
  );
}
