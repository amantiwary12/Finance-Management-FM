// src/components/Layout/Sidebar.jsx
import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useRole } from "../../context/RoleContext";
import {
  FaTachometerAlt, 
  FaProjectDiagram,
  FaMoneyBillWave,
  FaChartPie,
  FaBell,
  FaSignOutAlt,
  FaUserCircle,
  FaUsers,
  FaBuilding,
  FaFileAlt,
  FaClipboardList,
  FaCog
} from "react-icons/fa";

const Sidebar = () => {
  const { user, company, logout } = useContext(AuthContext);
  const { userRole, isAdmin, isHR, isManager, isFinanceManager, canManageUsers } = useRole();

  const menuItems = [
    { path: "/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
  ];

  // Projects - Visible to all except viewers
  if (userRole !== "Viewer") {
    menuItems.push({ path: "/projects", icon: FaProjectDiagram, label: "Projects" });
  }

  // Transactions - Visible to all except viewers
  if (userRole !== "Viewer") {
    menuItems.push({ path: "/transactions", icon: FaMoneyBillWave, label: "Transactions" });
  }

  // Budget - Only for Admin, Manager, FinanceManager
  if (isAdmin() || isManager() || isFinanceManager()) {
    menuItems.push({ path: "/budget", icon: FaChartPie, label: "Budget" });
  }

  // Notifications - For all users
  menuItems.push({ path: "/notifications", icon: FaBell, label: "Notifications" });

  // User Management - Admin only
  if (canManageUsers) {
    menuItems.push({ path: "/users", icon: FaUsers, label: "User Management" });
  }

  // Forms & Submissions - HR and Admin only
  if (isHR() || isAdmin()) {
    menuItems.push(
      { path: "/forms", icon: FaFileAlt, label: "Forms" },
      { path: "/submissions", icon: FaClipboardList, label: "Submissions" }
    );
  }

  // Settings - Admin only
  if (isAdmin()) {
    menuItems.push({ path: "/settings", icon: FaCog, label: "Settings" });
  }

  const getRoleBadgeColor = () => {
    switch(userRole) {
      case 'Admin': return 'bg-red-500';
      case 'HR': return 'bg-pink-500';
      case 'Manager': return 'bg-blue-500';
      case 'FinanceManager': return 'bg-purple-500';
      case 'Employee': return 'bg-green-500';
      case 'Viewer': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = () => {
    switch(userRole) {
      case 'Admin': return '👑';
      case 'HR': return '👥';
      case 'Manager': return '📊';
      case 'FinanceManager': return '💰';
      case 'Employee': return '👤';
      default: return '👤';
    }
  };

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
        {company && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <FaBuilding className="w-3 h-3" />
            <span className="truncate">{company.name}</span>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">Track your finances</p>
        {userRole && (
          <div className="flex items-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getRoleBadgeColor()}`}>
              <span>{getRoleIcon()}</span>
              <span>{userRole}</span>
            </span>
          </div>
        )}
      </div>

      <nav className="flex-1 mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
                isActive ? "bg-gray-700 text-white border-r-4 border-blue-500" : ""
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center mb-4 p-2 bg-gray-800 rounded-lg">
          <FaUserCircle className="w-8 h-8 text-gray-400 mr-3" />
          <div className="flex-1">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.mobileNumber}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
        >
          <FaSignOutAlt className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;