import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useRole } from "../../context/RoleContext";
import {
  FaTachometerAlt, FaProjectDiagram, FaMoneyBillWave,
  FaChartPie, FaBell, FaSignOutAlt, FaUsers, FaBuilding,
  FaFileAlt, FaChartLine, FaTimes, FaCalendarCheck,
} from "react-icons/fa";

const ROLE_BADGE = {
  Admin:          "bg-red-500/15 text-red-400 border border-red-500/25",
  HR:             "bg-pink-500/15 text-pink-400 border border-pink-500/25",
  Manager:        "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25",
  FinanceManager: "bg-purple-500/15 text-purple-400 border border-purple-500/25",
  Employee:       "bg-green-500/15 text-green-400 border border-green-500/25",
  Viewer:         "bg-slate-500/15 text-slate-400 border border-slate-500/25",
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, company, logout } = useContext(AuthContext);
  const { userRole, isAdmin, isManager, isFinanceManager, canManageUsers } = useRole();

  const menuItems = [
    { path: "/dashboard", icon: FaTachometerAlt, label: "Dashboard" },
  ];
  if (userRole !== "Viewer") {
    menuItems.push({ path: "/projects", icon: FaProjectDiagram, label: "Projects" });
    menuItems.push({ path: "/transactions", icon: FaMoneyBillWave, label: "Transactions" });
  }
  if (isAdmin || isManager || isFinanceManager) {
    menuItems.push({ path: "/budget", icon: FaChartPie, label: "Budget" });
  }
  menuItems.push({ path: "/attendance", icon: FaCalendarCheck, label: "Attendance" });
  menuItems.push({ path: "/notifications", icon: FaBell, label: "Notifications" });
  if (canManageUsers) {
    menuItems.push({ path: "/users", icon: FaUsers, label: "User Management" });
  }
  menuItems.push({ path: "/forms", icon: FaFileAlt, label: "Forms" });

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const badgeClass = ROLE_BADGE[userRole] || ROLE_BADGE.Viewer;

  const SidebarContent = () => (
    <aside className="w-60 bg-[#050806] flex flex-col h-full border-r border-emerald-400/10">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-emerald-400/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-400 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-900/40">
              <FaChartLine className="text-black w-4 h-4" />
            </div>
            <span className="text-white font-extrabold text-sm tracking-tight">
              Finance<span className="text-brand-300">Flow</span>
            </span>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-400/10 transition-all"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>
        </div>

        {company && (
          <div className="flex items-center gap-1.5 mb-2.5">
            <FaBuilding className="w-3 h-3 text-emerald-500/70 flex-shrink-0" />
            <span className="text-xs text-slate-400 font-medium truncate">{company.name}</span>
          </div>
        )}
        {userRole && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
            {userRole}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-emerald-500/70">Menu</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-900/40"
                  : "text-slate-400 hover:text-emerald-200 hover:bg-emerald-400/10"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-black" : "text-slate-500"}`} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 pt-2 border-t border-emerald-400/10 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#0a0f0c] border border-emerald-400/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate leading-none mb-0.5">{user?.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.mobileNumber}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <FaSignOutAlt className="w-4 h-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop — always visible */}
      <div className="hidden lg:flex h-screen flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile — overlay drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="relative flex h-full">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
