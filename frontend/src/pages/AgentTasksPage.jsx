import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from '../axiosConfig';

function AgentTasksPage() {
  const { id } = useParams();
  const [tasksByDate, setTasksByDate] = useState({});
  const [agentName, setAgentName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(`/api/agents/${id}/tasks?page=${currentPage}&limit=8`);
      setAgentName(res.data.agentName);

      const grouped = {};
      res.data.tasks.forEach((task) => {
        const date = new Date(task.uploadedAt).toLocaleString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(task);
      });

      const sorted = Object.fromEntries(
        Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]))
      );

      setTasksByDate(sorted);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  }, [id, currentPage]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <div className="px-6 py-10 max-w-8xl mx-auto bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-black dark:to-gray-800 text-black dark:text-white min-h-screen">
      <h2 className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-8">
        Tasks assigned to: {agentName}
      </h2>

      {Object.keys(tasksByDate).length === 0 ? (
        <p className="text-gray-500">No tasks found for this agent.</p>
      ) : (
        Object.entries(tasksByDate).map(([date, tasks]) => (
          <div key={date} className="mb-10">
            <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-4">
              Assigned on: {date}
            </h3>

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {tasks.map((task, idx) => {
                const isCompleted = task.status === "completed";

                return (
                  <div
                    key={idx}
                    className={`rounded-xl shadow border p-4 h-56 w-full flex flex-col justify-between ${
                      isCompleted
                        ? "bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-700"
                        : "bg-red-100 dark:bg-red-900 border-red-400 dark:border-red-700"
                    }`}
                  >
                    <div>
                      <div className="text-teal-800 dark:text-white font-semibold text-lg mb-1">
                        {task.firstName || "No name"}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-800 dark:text-gray-300 mt-1">
                        {task.phone && <span>📞 <strong>{task.phone}</strong></span>}
                        {task.notes && <span>📝 {task.notes}</span>}
                        {task.status && (
                          <span
                            className={`capitalize font-medium ${
                              isCompleted
                                ? "text-green-700 dark:text-green-300"
                                : "text-red-700 dark:text-red-300"
                            }`}
                          >
                            Status: {task.status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Uploaded At:{" "}
                      {new Date(task.uploadedAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center mt-10 gap-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 text-black dark:text-white"
        >
          ⬅
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 text-black dark:text-white"
        >
          ➡
        </button>
      </div>
    </div>
  );
}

export default AgentTasksPage;
