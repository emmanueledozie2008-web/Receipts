import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../Hooks/UseTheme';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleDark } = useTheme();
  return (
    <button
      onClick={toggleDark}
      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
    </button>
  );
};

export default ThemeToggle;