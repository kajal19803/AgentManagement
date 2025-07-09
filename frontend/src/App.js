import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AgentDashboard from './pages/AgentDashboard'; 
import ProtectedRoute from './components/ProtectedRoute';
import AgentTasksPage from './pages/AgentTasksPage';
import TasksOverviewPage from './pages/TasksOverviewPage';

function App() {
  return (
    <Routes>
      {/* Redirect root URL to /login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public login route */}
      <Route path="/login" element={<Login />} />

      {/* Protected admin dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/*  Protected agent dashboard */}
      <Route
        path="/agent-dashboard"
        element={
          <ProtectedRoute>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Specific agent task route (probably for admin view) */}
      <Route
        path="/agent/:id/tasks"
        element={
          <ProtectedRoute>
            <AgentTasksPage />
          </ProtectedRoute>
        }
      />

      {/* All tasks overview */}
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TasksOverviewPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
