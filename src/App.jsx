import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { RoleProvider } from "./context/RoleContext";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import NetworkStatus from "./components/NetworkStatus";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Notifications from "./pages/Notifications";
import ProjectDetails from "./pages/ProjectDetails";
import UserManagement from "./pages/UserManagement";
// import NotFound from "./pages/NotFound"; // Create this component

// Protected Route wrapper using AuthContext
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  const { isOnline, wasOffline } = useNetworkStatus();

  return (
    <>
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: { background: '#363636', color: '#fff' },
          success: { duration: 3000 },
          error: { duration: 5000 },
        }}
      />
      <NetworkStatus isOnline={isOnline} wasOffline={wasOffline} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budget" element={<Budget />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="users" element={<UserManagement />} />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <RoleProvider>
          <AppContent />
        </RoleProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;