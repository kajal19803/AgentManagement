import { useEffect, useState } from "react";
import axios from "../axiosConfig";

export default function TasksOverviewPage() {
  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchTasks = async (page) => {
    try {
      const res = await axios.get(`/api/tasks?page=${page}&limit=8`);
      setTasks(res.data.tasks);
      setTotalTasks(res.data.totalTasks);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
    } catch (err) {
      console.error("Error loading tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks(currentPage);
  }, [currentPage]);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  return (
    <div className="px-6 py-10 pb-24 min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-black dark:to-gray-800 text-black dark:text-white relative">
      <h1 className="text-3xl text-teal-600 dark:text-teal-400 font-bold mb-6">
        Total Tasks: {totalTasks}
      </h1>

      {tasks.length === 0 ? (
        <p className="text-gray-500">No tasks found.</p>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {tasks.map((task, index) => {
              const isCompleted = task.status === "completed";

              return (
                <div
                  key={index}
                  className={`rounded-xl shadow border p-4 h-56 w-full flex flex-col justify-between ${
                    isCompleted
                      ? "bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-700"
                      : "bg-red-100 dark:bg-red-900 border-red-400 dark:border-red-700"
                  }`}
                >
                  <div>
                    <div className="text-teal-700 dark:text-teal-300 font-semibold text-lg mb-1">
                      {task.firstName || "No name"}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-400 mb-2">
                      Agent: {task.agentName || "N/A"}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-800 dark:text-gray-300">
                      {task.phone && (
                        <span>
                          📞 <strong>{task.phone}</strong>
                        </span>
                      )}
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
                    Assigned At:{" "}
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

          {/* Fixed Pagination Controls */}
          <div className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-black/60 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 py-3 flex justify-center items-center gap-4 text-black dark:text-white z-50">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-4 py-1 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white disabled:opacity-50"
            >
              ← Prev
            </button>
            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-4 py-1 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white disabled:opacity-50"
            >
              Next → 
            </button>
          </div>
        </>
      )}
    </div>
  );
}
