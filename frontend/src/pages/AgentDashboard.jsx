import { useEffect, useState, useCallback } from 'react';
import axios from '../axiosConfig';
import Header from '../components/Header';
import AlertModal from '../components/AlertModal';

function AgentDashboard() {
  const [tasks, setTasks] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const showAlert = (message) => setAlert({ show: true, message });

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(`/api/agents/tasks?page=${currentPage}&limit=8`);
      setTasks(res.data.tasks || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      showAlert('Failed to fetch your tasks');
    }
  }, [currentPage]);

  const handleStatusUpdate = async (taskIndex, newStatus) => {
    try {
      const updated = [...tasks];
      updated[taskIndex].status = newStatus;

      await axios.patch('/api/agents/tasks/update', {
        taskId: updated[taskIndex]._id,
        status: newStatus,
      });

      setTasks(updated);
      showAlert('Task status updated');
    } catch {
      showAlert('Failed to update task');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      window.location.href = '/login';
    } catch {
      showAlert('Logout failed. Try again.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-black dark:to-gray-800 text-black dark:text-white overflow-y-auto transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <Header onLogout={handleLogout} />
        <h2 className="text-2xl font-semibold mb-6">My Assigned Tasks</h2>

        {tasks.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No tasks assigned yet.</p>
        ) : (
          <>
            <div className="grid gap-4">
              {tasks.map((task, index) => (
                <div
                  key={task._id || index}
                  className="p-4 rounded shadow bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 space-y-2"
                >
                  <div className="space-y-1 text-sm text-gray-800 dark:text-gray-300">
                    <p><strong>Task {index + 1}</strong></p>
                    <p><strong>Name:</strong> {task.firstName || 'N/A'}</p>
                    <p><strong>Phone:</strong> {task.phone || 'N/A'}</p>
                    <p><strong>Notes:</strong> {task.notes || '—'}</p>
                    <p><strong>Assigned At:</strong> {new Date(task.uploadedAt).toLocaleString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm">
                      Status: <strong>{task.status}</strong>
                    </span>
                    <button
                      onClick={() =>
                        handleStatusUpdate(index, task.status === 'completed' ? 'assigned' : 'completed')
                      }
                     className={`px-4 py-1 rounded text-white text-sm ${
                     task.status === 'completed'
                          ? 'bg-red-600 hover:bg-red-700'   
                          : 'bg-green-600 hover:bg-green-700' 
                     }`}
                     >
                        Mark as {task.status === 'completed' ? 'Assigned' : 'Completed'}
                    </button>

                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-10 gap-4">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 text-black dark:text-white"
              >
                ⬅
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 text-black dark:text-white"
              >
                ➡
              </button>
            </div>
          </>
        )}
      </div>

      {alert.show && (
        <AlertModal message={alert.message} onClose={() => setAlert({ show: false, message: '' })} />
      )}
    </div>
  );
}

export default AgentDashboard;
