import { useEffect, useState, useCallback } from 'react';
import axios from '../axiosConfig';

import AlertModal from '../components/AlertModal';
import ConfirmModal from '../components/ConfirmModal';
import Header from '../components/Header';
import AddAgentForm from '../components/AddAgentForm';
import UploadFile from '../components/UploadFile';
import AgentsList from '../components/AgentsList';
import PaginationControls from '../components/PaginationControls';
import DistributedLists from '../components/DistributedLists';
import DistributionHistory from '../components/DistributionHistory';
import ActiveList from '../components/ActiveList';
import LoginHistory from '../components/LoginHistory';

function Dashboard() {
  // Agent form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);

  // App data states
  const [agents, setAgents] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeTimestamp, setActiveTimestamp] = useState(null);

  // Modal/Alert states
  const [alert, setAlert] = useState({ show: false, message: '' });
  const [confirmModal, setConfirmModal] = useState({ show: false, agent: null });

  const limit = 5;
  const showAlert = (message) => setAlert({ show: true, message });

  // Fetch all agents
  const fetchAgents = useCallback(async () => {
    try {
      const res = await axios.get('/api/agents', {
        params: { page, limit, search, includeDeleted: showDeleted },
      });
      setAgents(res.data.agents);
      setTotal(res.data.total);
    } catch {
      showAlert('Failed to fetch agents.');
    }
  }, [page, search, showDeleted]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Add new agent
  const handleAddAgent = async () => {
    try {
      const [countryCode, mobileNumber] = mobile.split('-');
      await axios.post('/api/agents/create', { name, email, countryCode, mobile: mobileNumber, password });
      fetchAgents();
      setName(''); setEmail(''); setMobile(''); setPassword('');
      showAlert('Agent added successfully!');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to add agent');
    }
  };

  // Delete agent (with confirmation)
  const confirmDeleteAgent = (agent) => setConfirmModal({ show: true, agent });

  const handleDeleteAgent = async () => {
    try {
      await axios.delete(`/api/agents/${confirmModal.agent._id}`);
      fetchAgents();
      showAlert('Agent deleted successfully!');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to delete agent');
    } finally {
      setConfirmModal({ show: false, agent: null });
    }
  };

  // Restore soft-deleted agent
  const handleRestoreAgent = async (id) => {
    try {
      await axios.patch(`/api/agents/${id}/restore`);
      fetchAgents();
      showAlert('Agent restored successfully!');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Failed to restore agent');
    }
  };

  // Upload & distribute file
  const handleUpload = async () => {
    if (!selectedAgents.length) return showAlert('Select at least one agent to distribute work.');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('agents', JSON.stringify(selectedAgents));

    try {
      await axios.post('/api/upload', formData);
      showAlert('Upload & distribution successful!');
    } catch (err) {
      showAlert(err.response?.data?.message || 'Only upload in csv, xlsx, or xls format');
    }
  };

  // Agent selection toggle
  const toggleAgentSelection = (id, overrideList = null) => {
    if (overrideList) return setSelectedAgents(overrideList);
    setSelectedAgents((prev) => (prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]));
  };

  // Logout
  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      window.location.href = '/login';
    } catch {
      showAlert('Logout failed. Try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-200 dark:from-gray-900 dark:via-black dark:to-gray-800 text-black dark:text-white overflow-y-auto transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        <Header onLogout={handleLogout} />
        <AddAgentForm {...{ name, email, mobile, password, setName, setEmail, setMobile, setPassword, handleAddAgent }} />
        <UploadFile {...{ file, setFile, handleUpload }} />

        {/* Search + pagination + deleted toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search agents..."
            className="w-full sm:w-1/2 p-2 rounded bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-400 dark:border-gray-600"
          />
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="showDeleted"
              checked={showDeleted}
              onChange={(e) => setShowDeleted(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="showDeleted" className="text-sm text-gray-700 dark:text-gray-300">Show Deleted Agents</label>
          </div>
          <PaginationControls {...{ page, total, limit, onPrev: () => setPage(p => p - 1), onNext: () => setPage(p => p + 1) }} />
        </div>

        {/* Agent list & history/analytics */}
        <AgentsList {...{ agents, selectedAgents, toggleAgentSelection, confirmDeleteAgent, handleRestoreAgent }} />
        <LoginHistory />
        <DistributedLists />
        <DistributionHistory onSelectTimestamp={setActiveTimestamp} />
        <ActiveList timestamp={activeTimestamp} />
      </div>

      {/* Alert Modal */}
      {alert.show && <AlertModal message={alert.message} onClose={() => setAlert({ show: false, message: '' })} />}

      {/* Delete Confirm Modal */}
      {confirmModal.show && (
        <ConfirmModal
          message={`Are you sure you want to delete "${confirmModal.agent.name}"?`}
          onConfirm={handleDeleteAgent}
          onCancel={() => setConfirmModal({ show: false, agent: null })}
        />
      )}
    </div>
  );
}

export default Dashboard;



