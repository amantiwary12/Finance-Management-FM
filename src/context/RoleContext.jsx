// src/context/RoleContext.js
import React, { createContext, useContext, useMemo } from "react";
import { AuthContext } from "./AuthContext";

export const RoleContext = createContext(null);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
};

export const RoleProvider = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  const userRole = user?.role || null;

  // Role check functions - ✅ FIXED for case sensitivity
  const isSuperAdmin = () => userRole === "SuperAdmin" || userRole === "superadmin";
  const isAdmin = () => userRole === "Admin" || userRole === "admin" || isSuperAdmin();
  const isManager = () => userRole === "Manager" || userRole === "manager";
  const isEmployee = () => userRole === "Employee" || userRole === "employee";
  const isViewer = () => userRole === "Viewer" || userRole === "viewer";
  const isFinanceManager = () => userRole === "FinanceManager" || userRole === "financemanager";
  const isHR = () => userRole === "HR" || userRole === "hr";

  // Permission helpers
  const canViewAllData = isAdmin() || isManager() || isFinanceManager();
  const canEditData = isAdmin() || isFinanceManager();
  const canDeleteData = isAdmin();
  const canManageUsers = isAdmin();

  const value = useMemo(() => ({
    user,
    loading,
    userRole,
    isSuperAdmin: isSuperAdmin(),
    isAdmin: isAdmin(),
    isManager: isManager(),
    isEmployee: isEmployee(),
    isViewer: isViewer(),
    isFinanceManager: isFinanceManager(),
    isHR: isHR(),
    canViewAllData,
    canEditData,
    canDeleteData,
    canManageUsers,
  }), [user, loading]);

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};