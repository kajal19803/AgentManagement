import { useEffect, useState, useCallback } from 'react';
import axios from '../axiosConfig'; // Axios instance with base URL & cookies

const DistributionHistory = ({ onSelectTimestamp }) => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [minAgents, setMinAgents] = useState('');
  const [maxAgents, setMaxAgents] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  const fetchHistory = useCallback(async () => {  // Fetch historical distribution data with filters
    try {
      const params = {
        search,
        page,
        limit,
      };
      if (minAgents !== '') params.minAgents = Number(minAgents);
      if (maxAgents !== '') params.maxAgents = Number(maxAgents);

      const res = await axios.get(`/api/upload/history`, { params });
      setHistory(res.data.history);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch distribution history.');
    }
  }, [search, minAgents, maxAgents, page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-xl p-4 border border-gray-400 dark:border-gray-700 shadow-lg mt-6">
      <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-4">Distribution History</h3>
      <div className="flex flex-wrap gap-3 mb-4">
        <input placeholder="Search date" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="mb-4 p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-400 dark:border-gray-600 w-40" />
        <input placeholder="Min agents" type="number" value={minAgents} onChange={(e) => setMinAgents(e.target.value)} className="mb-4 p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-400 dark:border-gray-600 w-32" />
        <input placeholder="Max agents" type="number" value={maxAgents} onChange={(e) => setMaxAgents(e.target.value)} className="mb-4 p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-400 dark:border-gray-600 w-32" />
      </div>
      {/* Distribution history list */}
      <ul className="space-y-2">
        {history.map((h) => (
          <li key={h.uploadedAt}>
            <button
              onClick={() => onSelectTimestamp(h.uploadedAt)}
              className="text-teal-600 hover:underline"
            >
              📅 {new Date(h.uploadedAt).toLocaleString()} – {h.agentsCount} agents
            </button>
          </li>
        ))}
      </ul>
       {/* Pagination controls */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>⬅ Prev</button>
        <span>Page {page} of {Math.ceil(total / limit)}</span>
        <button onClick={() => setPage(p => (p * limit < total ? p + 1 : p))} disabled={page * limit >= total}>Next ➡</button>
      </div>
    </div>
  );
};

export default DistributionHistory;
