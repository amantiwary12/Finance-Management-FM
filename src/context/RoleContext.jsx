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

  // Role check functions
  const isSuperAdmin = () => user?.role === "SuperAdmin";
  const isAdmin = () => user?.role === "Admin" || isSuperAdmin();
  const isManager = () => user?.role === "Manager" || user?.role === "FinanceManager";
  const isEmployee = () => user?.role === "Employee";
  const isViewer = () => user?.role === "Viewer";
  const isFinanceManager = () => user?.role === "FinanceManager";
  const isHR = () => user?.role === "HR";

  // Permission helpers
  const canViewAllData = isAdmin() || isManager() || isFinanceManager();
  const canEditData = isAdmin() || isFinanceManager();
  const canDeleteData = isAdmin();
  const canManageUsers = isAdmin();

  const value = useMemo(() => ({
    user,
    loading,
    userRole: user?.role || null,
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