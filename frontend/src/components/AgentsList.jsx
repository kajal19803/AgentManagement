import { useNavigate } from "react-router-dom";

function AgentsList({
  agents = [],
  selectedAgents = [],
  toggleAgentSelection,
  confirmDeleteAgent,
  handleRestoreAgent,
}) {
  const navigate = useNavigate();

  const selectableIds = agents.filter(a => !a.deleted).map(a => a._id);
  const allSelected =
    selectableIds.length > 0 &&
    selectableIds.every(id => selectedAgents.includes(id));

  const handleSelectAll = () => {
    if (allSelected) {
      const unselected = selectedAgents.filter(id => !selectableIds.includes(id));
      toggleAgentSelection(null, unselected);
    } else {
      const combined = [...new Set([...selectedAgents, ...selectableIds])];
      toggleAgentSelection(null, combined);
    }
  };

  return (
    <div className="bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-gray-400 dark:border-gray-700 shadow-lg overflow-x-auto">
      <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-4">
        Agents
      </h3>

      <div className="flex items-center mb-3 gap-2">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={handleSelectAll}
        />
        <label className="text-sm text-gray-800 dark:text-gray-300">
          Select All (non-deleted)
        </label>
      </div>

      <table className="w-full text-left text-sm border border-gray-300 dark:border-gray-600">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          <tr>
            <th className="px-4 py-2">Select</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Mobile</th>
            <th className="px-4 py-2">Total Tasks</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agents.map(agent => (
            <tr key={agent._id} className={agent.deleted ? "opacity-50 line-through" : ""}>
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedAgents.includes(agent._id)}
                  onChange={() => toggleAgentSelection(agent._id)}
                  disabled={agent.deleted}
                />
              </td>
              <td className="px-4 py-2">{agent.name}</td>
              <td className="px-4 py-2">{agent.email}</td>
              <td className="px-4 py-2">{agent.mobile}</td>
              <td className="px-4 py-2">
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => navigate(`/agent/${agent._id}/tasks`)}
                >
                  {agent.totalTasks ?? 0}
                </button>
              </td>
              <td className="px-4 py-2">
                {agent.deleted ? (
                  <button
                    onClick={() => handleRestoreAgent(agent._id)}
                    className="text-green-500 hover:underline"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={() => confirmDeleteAgent(agent)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AgentsList;



