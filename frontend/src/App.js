import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
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

      {/* Protected dashboard route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Route for specific agent tasks */}
      <Route
        path="/agent/:id/tasks"
        element={
          <ProtectedRoute>
            <AgentTasksPage />
          </ProtectedRoute>
        }
      />

      {/* Route for overview of all tasks */}
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





