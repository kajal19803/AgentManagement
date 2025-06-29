import { useEffect, useState } from 'react';
import axios from '../axiosConfig';

const LoginHistory = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Fetch login analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/auth/login-analytics');
      setData(res.data);
      setError('');
    } catch {
      setError('Failed to fetch login analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Handle clear login history
  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear login history?')) return;
    try {
      setClearing(true);
      await axios.delete('/api/auth/login-history');
      await fetchAnalytics();
    } catch {
      setError('Failed to clear login history');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-xl p-4 border border-gray-400 dark:border-gray-700 shadow-lg mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400">Login History</h3>
        <button
          onClick={handleClearHistory}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          disabled={clearing}
        >
          {clearing ? 'Clearing...' : 'Clear History'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-2">{error}</p>}
      {loading && <p className="text-gray-500">Loading...</p>}

      {data && (
        <>
          {/* Summary */}
          <p className="mb-2">🔢 <strong>Total Logins:</strong> {data.totalLogins}</p>
          <p className="mb-4">🕒 <strong>Last Login:</strong> {data.lastLogin ? new Date(data.lastLogin.timestamp).toLocaleString() : '—'} {data.lastLogin?.location && `(${data.lastLogin.location})`}</p>

          {/* Daily counts */}
          <h4 className="text-teal-500 font-medium mb-2">📊 Daily Login Count</h4>
          <ul className="space-y-1 text-sm list-disc ml-5 mb-6">
            {Object.entries(data.dailyLogins).map(([date, count]) => (
              <li key={date}>{date} – {count} login{count > 1 ? 's' : ''}</li>
            ))}
          </ul>

          {/* Recent login table */}
          <h4 className="text-teal-500 font-medium mb-2">📋 Last 5 Login Details</h4>
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
  );
};

export default LoginHistory;




