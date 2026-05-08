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
} from "react-icons/fa";

const Sidebar = () => {
  const { user, company, logout } = useContext(AuthContext);
  const { canManageUsers, userRole, isHR, isAdmin } = useRole();

  const menuItems = [
    { path: "/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
    { path: "/projects", icon: FaProjectDiagram, label: "Projects" },
    { path: "/transactions", icon: FaMoneyBillWave, label: "Transactions" },
    { path: "/budget", icon: FaChartPie, label: "Budget" },
    { path: "/notifications", icon: FaBell, label: "Notifications" },
  ];

  // Add User Management menu only for users who can manage users (Admin)
  if (canManageUsers) {
    menuItems.push({ path: "/users", icon: FaUsers, label: "User Management" });
  }

  // Add HR/Form Management menu for HR, Admin, and FinanceManager
  if (isHR() || isAdmin()) {
    menuItems.push(
      { path: "/forms", icon: FaFileAlt, label: "Forms" },
      { path: "/submissions", icon: FaClipboardList, label: "Submissions" }
    );
  }

  const isActive = (path) => window.location.pathname === path;

  // Get role badge color
  const getRoleBadgeColor = () => {
    switch(userRole) {
      case 'Admin': return 'bg-red-500';
      case 'Manager': return 'bg-blue-500';
      case 'FinanceManager': return 'bg-purple-500';
      case 'HR': return 'bg-pink-500';
      case 'Employee': return 'bg-green-500';
      case 'Viewer': return 'bg-gray-500';
      default: return 'bg-gray-500';
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
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${getRoleBadgeColor()}`}>
            {userRole}
          </span>
        )}
      </div>

      <nav className="flex-1 mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors ${
              isActive(item.path)
                ? "bg-gray-700 text-white border-r-4 border-blue-500"
                : ""
            }`}
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
            <p className="text-sm font-medium">{user?.name}</p>
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