import { useEffect, useState, useCallback } from 'react';
import axios from '../axiosConfig'; // Using custom config

const ActiveList = ({ timestamp }) => {
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  const fetchList = useCallback(async () => {    // Fetch list based on timestamp, search, and pagination
    if (!timestamp) return;
    try {
      const res = await axios.get(`/api/upload/history/${timestamp}`, {
        params: { search, page, limit }
      });
      setEntries(res.data.list);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch historical list.', err);
    }
  }, [timestamp, search, page]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  if (!timestamp) return null;

  return (
    <div className="p-4 bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-xl border border-gray-400 dark:border-gray-700 shadow-lg mt-6">
      <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-4">List on Selected Date</h3>
      <input
        placeholder="Search agent..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="mb-4 p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-400 dark:border-gray-600"
      />
      <ul className="space-y-2 text-sm">
        {entries.map((entry) => (
          <li key={entry._id}>
            <strong className={`${entry.agent?.deleted ? 'text-gray-400 line-through' : 'text-teal-700'}`}>
              {entry.agent?.name || '(Deleted Agent)'}
            </strong>
            <ul className="list-disc ml-4">
              {entry.list?.map((i, idx) => (
                <li key={idx}>{i.firstName} - {i.phone} - {i.notes}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between items-center text-sm">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>⬅ Prev</button>
        <span>Page {page} of {Math.ceil(total / limit)}</span>
        <button onClick={() => setPage(p => (p * limit < total ? p + 1 : p))} disabled={page * limit >= total}>Next ➡</button>
      </div>
    </div>
  );
};

export default ActiveList;



