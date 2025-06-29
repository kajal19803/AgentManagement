import { useTheme } from '../context/ThemeContext';
//function for logout and dark light theme UI
function Header({ onLogout }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-3xl font-bold tracking-wide text-teal-600 dark:text-teal-300">CSTech Admin Dashboard</h2>
      <div className="flex gap-3">
        <button onClick={toggleTheme} className="bg-gray-200 dark:bg-gray-700 text-sm px-4 py-1 rounded-lg text-gray-800 dark:text-white">
          {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
        </button>
        <button onClick={onLogout} className="bg-transparent px-4 py-2 rounded-lg text-red-500 font-semibold">Logout</button>
      </div>
    </div>
  );
}

export default Header;