import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from '../axiosConfig';

function AgentTasksPage() {
  const { id } = useParams();
  const [tasksByDate, setTasksByDate] = useState({});
  const [agentName, setAgentName] = useState("");

  useEffect(() => {
    axios.get(`/api/agents/${id}/tasks`)
      .then((res) => {
        setAgentName(res.data.agentName);
        const grouped = {};

        // Group tasks by uploadedAt date with time
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

        // Sort by date descending
        const sorted = Object.fromEntries(
          Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]))
        );

        setTasksByDate(sorted);
      })
      .catch((err) => {
        console.error("Error fetching tasks:", err);
      });
  }, [id]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-6">
        Tasks assigned to: {agentName}
      </h2>

      {Object.keys(tasksByDate).length === 0 ? (
        <p className="text-gray-500">No tasks found for this agent.</p>
      ) : (
        Object.entries(tasksByDate).map(([date, tasks]) => (
          <div key={date} className="mb-6">
            <h3 className="text-lg font-semibold text-teal-600 dark:text-teal-400 mb-2">
              Assigned on: {date}
            </h3>
            <ul className="space-y-2">
              {tasks.map((task, idx) => (
                <li
                  key={idx}
                  className="bg-white/40 dark:bg-gray-900/40 border border-gray-300 dark:border-gray-700 p-4 rounded-lg shadow"
                >
                  <div className="font-semibold text-teal-800 dark:text-white text-lg">
                    {task.firstName || "No name"}
                  </div>
                  {task.phone && (
                    <div className="text-sm text-gray-800 dark:text-gray-300">
                      Phone: {task.phone}
                    </div>
                  )}
                  {task.notes && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Notes: {task.notes}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

export default AgentTasksPage;




