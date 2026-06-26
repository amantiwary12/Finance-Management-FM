import React, { useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useRole } from "../../context/RoleContext";
import { FaBell, FaBars } from "react-icons/fa";

const PAGE_TITLES = {
  "/dashboard":     "Dashboard",
  "/projects":      "Projects",
  "/transactions":  "Transactions",
  "/budget":        "Budget",
  "/notifications": "Notifications",
  "/users":         "User Management",
  "/forms":         "Forms",
  "/settings":      "Settings",
  "/submissions":   "Submissions",
};

const ROLE_BADGE = {
  Admin:          "bg-red-50 text-red-600 ring-1 ring-red-200",
  HR:             "bg-pink-50 text-pink-600 ring-1 ring-pink-200",
  Manager:        "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  FinanceManager: "bg-purple-50 text-purple-600 ring-1 ring-purple-200",
  Employee:       "bg-green-50 text-green-600 ring-1 ring-green-200",
  Viewer:         "bg-slate-50 text-slate-600 ring-1 ring-slate-200",
};

const Header = ({ onMenuToggle }) => {
  const { user } = useContext(AuthContext);
  const { userRole } = useRole();
  const location = useLocation();

  const pageTitle = (() => {
    if (PAGE_TITLES[location.pathname]) return PAGE_TITLES[location.pathname];
    if (location.pathname.startsWith("/projects/")) return "Project Details";
    if (location.pathname.startsWith("/forms/")) return "Forms";
    return "Dashboard";
  })();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const badgeClass = ROLE_BADGE[userRole] || ROLE_BADGE.Viewer;

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
          aria-label="Open menu"
        >
          <FaBars className="w-4 h-4" />
        </button>
        <h1 className="text-sm font-semibold text-slate-800 tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          to="/notifications"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          title="Notifications"
        >
          <FaBell className="w-4 h-4" />
        </Link>

        <div className="w-px h-5 bg-slate-200 hidden sm:block" />

        <span className={`hidden sm:inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}>
          {userRole || "Employee"}
        </span>

        <span className="hidden md:block text-xs font-medium text-slate-600 max-w-[120px] truncate">
          {user?.name}
        </span>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Header;
