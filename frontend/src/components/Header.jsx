import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

function Header({ onLogout }) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const role = localStorage.getItem("userRole");
  const isAdmin = role === "admin";

  return (
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold tracking-wide text-teal-600 dark:text-teal-300">
        {isAdmin ? 'CSTech Admin Dashboard' : 'CSTech Agent Dashboard'}
      </h2>

      <div className="flex gap-3">
        <button
          onClick={toggleTheme}
          className="bg-gray-200 dark:bg-gray-700 text-sm px-4 py-1 rounded-lg text-gray-800 dark:text-white"
        >
          {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
        </button>

        {isAdmin && (
          <button
            onClick={() => navigate('/tasks')}
            className="bg-teal-500 hover:bg-teal-600 text-white text-sm px-4 py-1 rounded-lg transition"
          >
            All Tasks
          </button>
        )}

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

