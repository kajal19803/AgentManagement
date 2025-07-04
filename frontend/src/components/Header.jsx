import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

// Header with logout, dark/light theme toggle, and All Tasks button
function Header({ onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold tracking-wide text-teal-600 dark:text-teal-300">
        CSTech Admin Dashboard
      </h2>

      <div className="flex gap-3">
        {/* Toggle Theme */}
        <button
          onClick={toggleTheme}
          className="bg-gray-200 dark:bg-gray-700 text-sm px-4 py-1 rounded-lg text-gray-800 dark:text-white"
        >
          {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
        </button>

        {/* All Tasks Overview */}
        <button
          onClick={() => navigate('/tasks')}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-1 rounded-lg transition"
        >
          All Tasks
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="bg-transparent px-4 py-2 rounded-lg text-red-500 font-semibold hover:text-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Header;
