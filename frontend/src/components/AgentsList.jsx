function AgentsList({ agents, selectedAgents, toggleAgentSelection, confirmDeleteAgent, handleRestoreAgent }) {
  // Get all selectable agent IDs (not deleted)
  const selectableIds = agents.filter(a => !a.deleted).map(a => a._id);

  // Check if all selectable agents are selected
  const allSelected = selectableIds.length > 0 && selectableIds.every(id => selectedAgents.includes(id));

  // Handler for "Select All" checkbox
  const handleSelectAll = () => {
    if (allSelected) {
      // Unselect all
      const unselected = selectedAgents.filter(id => !selectableIds.includes(id));
      // Keep only already selected deleted ones (if any)
      toggleAgentSelection(null, unselected);
    } else {
      // Add all non-deleted agent IDs to selection
      const combined = [...new Set([...selectedAgents, ...selectableIds])];
      toggleAgentSelection(null, combined);
    }
  };

  return (
    <div className="bg-white/30 dark:bg-black/30 backdrop-blur-lg rounded-xl p-6 border border-gray-400 dark:border-gray-700 shadow-lg">
      <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400 mb-4">Agents</h3>

       {/* Select All checkbox */}
      <div className="flex items-center mb-3 gap-2">
        <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
        <label className="text-sm text-gray-800 dark:text-gray-300">Select All (non-deleted)</label>
      </div>

      <ul className="space-y-2 text-gray-800 dark:text-gray-300">
        {agents.map((a) => (
          <li key={a._id} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedAgents.includes(a._id)}
                onChange={() => toggleAgentSelection(a._id)}
                disabled={a.deleted}
              />
              <span className={`font-medium ${a.deleted ? 'text-gray-400 line-through' : 'text-black dark:text-white'}`}>
                {a.name} ({a.email})
              </span>
            </div>
            {a.deleted ? (
              <button
                onClick={() => handleRestoreAgent(a._id)}
                className="text-sm text-green-500 hover:text-green-700 border border-green-400 px-3 py-1 rounded ml-2"
              >
                Restore
              </button>
            ) : (
              <button
                onClick={() => confirmDeleteAgent(a)}
                className="text-sm text-red-500 hover:text-red-700 border border-red-400 px-3 py-1 rounded"
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AgentsList;
