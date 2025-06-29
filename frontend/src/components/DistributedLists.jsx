import { useEffect, useState, useCallback } from 'react';
import axios from '../axiosConfig'; // Axios instance with base URL & cookies
const DistributedLists = () => {
  const [lists, setLists] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;

  const fetchLists = useCallback(async () => {  // Fetch latest distributed lists
    try {
      const res = await axios.get('/api/upload/lists', {
        params: { search, page, limit }
      });
      setLists(res.data.lists || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch distributed lists:', err.response?.data?.message || err.message);
    }
  }, [search, page]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return (
    <div className="p-4 mt-6 bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-xl border border-gray-400 dark:border-gray-700 shadow-lg">
      <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-4">Latest Distributed Lists</h3>
      
      <input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search..."
        className="mb-4 p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-400 dark:border-gray-600"
      />
      
      <ul className="space-y-3 text-sm">
        {lists.map((item) => (
          <li key={item._id || Math.random()}>
            <strong className={`${item.agent?.deleted ? 'text-gray-400 line-through' : 'text-teal-700'}`}>
              {item.agent?.name || '(Deleted Agent)'}
            </strong>
            <ul className="ml-4 list-disc">
              {(item.list || []).map((i, idx) => (
                <li key={idx}>
                  {i.firstName} - {i.phone} - {i.notes}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {/* Pagination controls */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>⬅ Prev</button>
        <span>Page {page} of {Math.ceil(total / limit)}</span>
        <button onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))} disabled={page * limit >= total}>Next ➡</button>
      </div>
    </div>
  );
};

export default DistributedLists;

