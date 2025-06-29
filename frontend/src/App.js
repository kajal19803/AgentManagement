import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Redirect root URL to /login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public login route */}
      <Route path="/login" element={<Login />} />

      {/* Protected dashboard route - accessible only if authenticated */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;



