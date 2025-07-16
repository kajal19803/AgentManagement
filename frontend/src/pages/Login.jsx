import { useState, useEffect } from 'react';
import axios from '../axiosConfig'; // Custom axios instance
import { EyeIcon, EyeOffIcon } from '@heroicons/react/solid';
import AlertModal from '../components/AlertModal';
import { useTheme } from '../context/ThemeContext';

function Login({ onLogin }) {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '' });
  const [csrfToken, setCsrfToken] = useState('');
  const [cookiesEnabled, setCookiesEnabled] = useState(true);

  // Register admin states
  const [isRegister, setIsRegister] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+91');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Check if cookies are enabled
  useEffect(() => {
    document.cookie = "cookietest=1";
    if (document.cookie.indexOf("cookietest=") === -1) {
      setCookiesEnabled(false);
    } else {
      setCookiesEnabled(true);
    }
  }, []);

  // Fetch CSRF token on component mount
  useEffect(() => {
    axios.get('/api/auth/csrf-token', { withCredentials: true })
      .then(({ data }) => setCsrfToken(data.csrfToken))
      .catch(err => console.error('Failed to fetch CSRF token:', err.message));
  }, []);

  // Handle login form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        '/api/auth/login',
        { email, password },
        { headers: { 'X-CSRF-Token': csrfToken } }
      );
      if (onLogin) onLogin(res.data.user);
      localStorage.setItem("userRole", res.data.user.role);

      if (res.data.user.role === 'admin') {
        window.location.href = '/dashboard';
      } else if (res.data.user.role === 'agent') {
        window.location.href = '/agent-dashboard';
      } else {
        setAlert({ show: true, message: 'Unauthorized role' });
      }

    } catch (err) {
      setAlert({ show: true, message: err.response?.data?.message || 'Login failed' });
    }
  };

  // Handle register admin submit
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        '/api/auth/register-admin',
        { name: regName, email: regEmail, countryCode: regCountryCode, mobile: regMobile, password: regPassword },
        { headers: { 'X-CSRF-Token': csrfToken } }
      );
      setAlert({ show: true, message: 'New admin registered successfully' });
      setIsRegister(false);
    } catch (err) {
      setAlert({ show: true, message: err.response?.data?.message || 'Registration failed' });
    }
  };

  return (
    <div className={`min-h-screen fixed inset-0 w-full h-full transition-colors duration-300 flex items-center justify-center px-4 overflow-hidden
      ${theme === 'dark'
        ? 'bg-gradient-to-tr from-gray-900 via-black to-gray-800 text-white'
        : 'bg-gradient-to-tr from-gray-100 via-white to-gray-200 text-black'}`}>  

      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 text-sm px-4 py-1 rounded-lg text-gray-800 dark:text-white"
      >
        {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
      </button>

      {/* Background blur effects */}
      <div className="absolute w-[500px] h-[500px] bg-teal-500 rounded-full blur-3xl opacity-20 top-0 left-0 animate-pulse"></div>
      <div className="absolute w-[400px] h-[400px] bg-purple-600 rounded-full blur-3xl opacity-20 bottom-0 right-0 animate-ping"></div>

      {!cookiesEnabled && (
        <div className="fixed top-0 w-full bg-yellow-300 text-black text-center py-2 z-50">
          Cookies are disabled. Please enable cookies in your browser settings to use this site.
        </div>
      )}

      {/* Login or Register form */}
      {!isRegister ? (
        <form onSubmit={handleSubmit} className={`z-10 w-full max-w-sm backdrop-blur-lg p-8 rounded-xl space-y-6 border
          ${theme === 'dark' ? 'bg-black/40 border-gray-700' : 'bg-white/40 border-gray-300'}`}>
          <h2 className={`text-3xl font-bold text-center tracking-wide
            ${theme === 'dark' ? 'text-teal-200' : 'text-teal-700'}`}>
            CSTech Login
          </h2>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-100 dark:bg-gray-800"
          />

          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-2 pr-10 rounded-md border focus:outline-none focus:ring-2 focus:ring-teal-400 bg-gray-100 dark:bg-gray-800"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-2 top-2.5 text-teal-400 hover:text-teal-300"
            >
              {show ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-md transition"
          >
            Login
          </button>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className="text-sm text-teal-500 hover:underline"
            >
              Create New Admin
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleRegister} className={`z-10 w-full max-w-sm backdrop-blur-lg p-8 mt-4 rounded-xl space-y-4 border
          ${theme === 'dark' ? 'bg-black/40 border-gray-700' : 'bg-white/40 border-gray-300'}`}>
          <h3 className={`text-2xl font-bold text-center
            ${theme === 'dark' ? 'text-teal-200' : 'text-teal-700'}`}>
            Register New Admin
          </h3>
          <input
            type="text"
            value={regName}
            onChange={(e) => setRegName(e.target.value)}
            placeholder="Name"
            className="w-full px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-800"
          />
          <input
            type="email"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-800"
          />
          <input
            type="text"
            value={regCountryCode}
            onChange={(e) => setRegCountryCode(e.target.value)}
            placeholder="Country Code (e.g. +91)"
            className="w-full px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-800"
          />
          <input
            type="text"
            value={regMobile}
            onChange={(e) => setRegMobile(e.target.value)}
            placeholder="Mobile"
            className="w-full px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-800"
          />
          <input
            type="password"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-2 rounded-md border bg-gray-100 dark:bg-gray-800"
          />
          <button
            type="submit"
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-md transition"
          >
            Register Admin
          </button>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className="text-sm text-teal-500 hover:underline"
            >
              Back to Login
            </button>
          </div>
        </form>
      )}

      {/* Error alert modal */}
      {alert.show && (
        <AlertModal
          message={alert.message}
          onClose={() => setAlert({ show: false, message: '' })}
        />
      )}
    </div>
  );
}

export default Login;
