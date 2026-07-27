// App.js - Update the DashboardRouter
import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { RoleProvider, useRole } from "./context/RoleContext";
import { SocketProvider } from "./context/SocketContext";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import NetworkStatus from "./components/NetworkStatus";
import Layout from "./components/Layout/Layout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import HRDashboard from "./pages/HR/HRDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Projects from "./pages/Projects";
import Transactions from "./pages/Transactions";
import Budget from "./pages/Budget";
import Notifications from "./pages/Notifications";
import ProjectDetails from "./pages/ProjectDetails";
import UserManagement from "./pages/UserManagement";
import FormBuilder from "./pages/HR/FormBuilder";
import FormList from "./pages/HR/FormList";
import DynamicForm from "./pages/HR/DynamicForm";
import Submissions from "./pages/HR/Submissions";
import EmployeeForms from "./pages/Employee/EmployeeForms";
import Settings from "./pages/Settings";
import Attendance from "./pages/Attendance";
import PublicFormFill from "./pages/Public/PublicFormFill";

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");

  if (!token || !user) {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

// ✅ FIXED: Role-based Forms Router
const FormsRouter = () => {
  const { userRole } = useRole();
  
  if (userRole === 'HR' || userRole === 'hr' || userRole === 'Hr') {
    return <FormList />;
  }
  
  return <EmployeeForms />;
};

// ✅ FIXED: Role-based Dashboard Router
const DashboardRouter = () => {
  const { userRole } = useRole();
  
  console.log('DashboardRouter - Current user role:', userRole);
  
  // Check for Admin role (case insensitive)
  if (userRole === 'Admin' || userRole === 'admin' || userRole === 'ADMIN') {
    console.log('Rendering Admin Dashboard');
    return <AdminDashboard />;
  }
  
  // Check for HR role (case insensitive)
  if (userRole === 'HR' || userRole === 'hr' || userRole === 'Hr') {
    console.log('Rendering HR Dashboard');
    return <HRDashboard />;
  }
  
  // Default to Employee Dashboard
  console.log('Rendering Employee Dashboard');
  return <Dashboard />;
};

function AppContent() {
  const { isOnline, wasOffline } = useNetworkStatus();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#363636", color: "#fff" },
          success: { duration: 3000 },
          error: { duration: 5000 },
        }}
      />
      <NetworkStatus isOnline={isOnline} wasOffline={wasOffline} />
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/f/:token" element={<PublicFormFill />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={<DashboardRouter />} />
          <Route path="projects" element={<Projects />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budget" element={<Budget />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="projects/:id" element={<ProjectDetails />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="forms" element={<FormsRouter />} />
          <Route path="forms/builder" element={<FormBuilder />} />
          <Route path="forms/builder/:id" element={<FormBuilder />} />
          <Route path="forms/fill/:id" element={<DynamicForm />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <RoleProvider>
            <AppContent />
          </RoleProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;



