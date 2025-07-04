import { useEffect, useState } from "react";
import axios from "../axiosConfig";

export default function TasksOverviewPage() {
  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);

  useEffect(() => {
    axios.get("/api/tasks")
      .then(res => {
        setTotalTasks(res.data.totalTasks);
        setTasks(res.data.tasks);
      })
      .catch(err => console.error("Error loading tasks:", err));
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        All Tasks Overview (Total: {totalTasks})
      </h1>
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-2">Agent</th>
            <th className="px-4 py-2">First Name</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">Notes</th>
            <th className="px-4 py-2">Assigned At</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t, i) => (
            <tr key={i} className="border-b dark:border-gray-700">
              <td className="px-4 py-2">{t.agentName}</td>
              <td className="px-4 py-2">{t.firstName}</td>
              <td className="px-4 py-2">{t.phone}</td>
              <td className="px-4 py-2">{t.notes}</td>
              <td className="px-4 py-2">
                {new Date(t.uploadedAt).toLocaleString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                  hour: "2-digit", minute: "2-digit"
                })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
