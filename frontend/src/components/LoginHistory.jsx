import { useEffect, useState } from 'react';
import axios from '../axiosConfig';
import ConfirmModal from '../components/ConfirmModal';

const LoginHistory = () => {
  // State to store analytics data from the server
  const [data, setData] = useState(null);

  // State to handle errors in fetching or deleting data
  const [error, setError] = useState('');

  // State to manage loading indicator while fetching data
  const [loading, setLoading] = useState(false);

  // State to manage UI while clearing login history
  const [clearing, setClearing] = useState(false);

  // CSRF token required for protected requests like delete
  const [csrfToken, setCsrfToken] = useState('');

  // Boolean to show or hide confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);

  // Function to fetch login analytics data from the server
  const fetchAnalytics = async () => {
    try {
      setLoading(true); // show loader
      const res = await axios.get('/api/auth/login-analytics'); // fetch analytics
      setData(res.data); // update state with data
      setError(''); // clear previous error if any
    } catch {
      setError('Failed to fetch login analytics'); // set error message
    } finally {
      setLoading(false); // stop loader
    }
  };

  // Runs when component is mounted
  useEffect(() => {
    // Fetch login analytics
    fetchAnalytics();

    // Fetch CSRF token from server
    axios.get('/api/auth/csrf-token')
      .then(res => setCsrfToken(res.data.csrfToken))
      .catch(() => setError('Failed to fetch CSRF token'));
  }, []);

  // Function to handle login history clear action after confirmation
  const handleConfirmedClear = async () => {
    try {
      setClearing(true); // disable button and show loading text
      setShowConfirm(false); // close the modal

      // Make DELETE request to clear history
      await axios.delete('/api/auth/login-history', {
        headers: {
          'X-CSRF-Token': csrfToken // pass CSRF token for protection
        }
      });

      // Refetch updated analytics after deletion
      await fetchAnalytics();
    } catch {
      setError('Failed to clear login history');
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      {/* Main card wrapper for login history */}
      <div className="bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-xl p-4 border border-gray-400 dark:border-gray-700 shadow-lg mt-6">
        <div className="flex items-center justify-between mb-4">
          {/* Section title */}
          <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400">Login History</h3>

          {/* Clear history button */}
          <button
            onClick={() => setShowConfirm(true)} // show modal on click
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            disabled={clearing} // disable button when request in progress
          >
            {clearing ? 'Clearing...' : 'Clear History'}
          </button>
        </div>

        {/* Display error message if any */}
        {error && <p className="text-red-500 mb-2">{error}</p>}

        {/* Show loading text when data is being fetched */}
        {loading && <p className="text-gray-500">Loading...</p>}

        {/* Render analytics data if available */}
        {data && (
          <>
            {/* Total logins and last login summary */}
            <p className="mb-2"><strong>Total Logins:</strong> {data.totalLogins}</p>
            <p className="mb-4">
              <strong>Last Login:</strong> {data.lastLogin ? new Date(data.lastLogin.timestamp).toLocaleString() : '—'}
              {data.lastLogin?.location && ` (${data.lastLogin.location})`}
            </p>

            {/* Daily login statistics */}
            <h4 className="text-teal-500 font-medium mb-2">Daily Login Count</h4>
            <ul className="space-y-1 text-sm list-disc ml-5 mb-6">
              {Object.entries(data.dailyLogins).map(([date, count]) => (
                <li key={date}>{date} – {count} login{count > 1 ? 's' : ''}</li>
              ))}
            </ul>

            {/* Table of recent login entries */}
            <h4 className="text-teal-500 font-medium mb-2">Last 5 Login Details</h4>
            {data.recentLogins?.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border border-gray-400 dark:border-gray-600 rounded-md">
                  <thead className="bg-gray-200 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">IP</th>
                      <th className="px-3 py-2 text-left">Location</th>
                      <th className="px-3 py-2 text-left">User Agent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentLogins.map((entry, idx) => (
                      <tr key={idx} className="border-t border-gray-300 dark:border-gray-600">
                        <td className="px-3 py-2">{new Date(entry.timestamp).toLocaleString()}</td>
                        <td className="px-3 py-2">{entry.ip}</td>
                        <td className="px-3 py-2">{entry.location || 'Unknown'}</td>
                        <td className="px-3 py-2 break-words">{entry.userAgent}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No login entries found.</p>
            )}
          </>
        )}
      </div>

      {/* Conditionally render ConfirmModal when showConfirm is true */}
      {showConfirm && (
        <ConfirmModal
          message="Are you sure you want to clear login history? This action cannot be undone."
          onCancel={() => setShowConfirm(false)} // close modal on cancel
          onConfirm={handleConfirmedClear} // execute delete on confirm
        />
      )}
    </>
  );
};

export default LoginHistory;

