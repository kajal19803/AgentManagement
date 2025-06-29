import { useTheme } from '../context/ThemeContext';
// for dark light toggle
function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`text-sm px-3 py-1 rounded-md bg-teal-500 hover:bg-teal-600 text-white shadow-md ${className}`}
    >
      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}

export default ThemeToggle;
