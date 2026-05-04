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

  // Role check functions - memoized to prevent unnecessary re-renders
  const isAdmin = () => user?.role === "Admin" || user?.role === "SuperAdmin";
  const isManager = () => user?.role === "Manager" || user?.role === "FinanceManager";
  const isEmployee = () => user?.role === "Employee";
  const isViewer = () => user?.role === "Viewer";
  const isFinanceManager = () => user?.role === "FinanceManager";

  // Get all roles as array
  const getUserRoles = () => {
    const roles = [];
    if (isAdmin()) roles.push('Admin');
    if (isManager()) roles.push('Manager');
    if (isEmployee()) roles.push('Employee');
    if (isViewer()) roles.push('Viewer');
    if (isFinanceManager()) roles.push('FinanceManager');
    return roles;
  };

  // Memoized value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    loading,
    userRole: user?.role || null,
    isAdmin: isAdmin(),
    isManager: isManager(),
    isEmployee: isEmployee(),
    isViewer: isViewer(),
    isFinanceManager: isFinanceManager(),
    getUserRoles: getUserRoles(),
    canViewAllData: isAdmin() || isManager() || isFinanceManager(),
    canEditData: isAdmin() || isFinanceManager(),
    canDeleteData: isAdmin(),
    canManageUsers: isAdmin(),
  }), [user, loading]);

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};