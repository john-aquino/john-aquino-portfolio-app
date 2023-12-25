"use client";
import { FaMoon, FaSun } from 'react-icons/fa';

const ThemeToggle = ({ isDarkMode, toggleTheme }: { isDarkMode: boolean, toggleTheme: () => void }) => {
  return (
    <button onClick={toggleTheme} className="fixed top-5 right-5 p-2 bg-gray-200 text-xl rounded-full hover:bg-gray-300">
      {isDarkMode ? <FaSun className="text-slate-500" /> : <FaMoon className="text-slate-500" />}
    </button>
  );
};

export default ThemeToggle;
