import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Expense Tracker</h1>
      </div>
      
      <nav className="flex-1 mt-6">
        <NavLink to="/dashboard" className={({ isActive }) => `block px-6 py-3 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
          Dashboard
        </NavLink>
        <NavLink to="/projects" className={({ isActive }) => `block px-6 py-3 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
          Projects
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => `block px-6 py-3 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
          Transactions
        </NavLink>
        <NavLink to="/budget" className={({ isActive }) => `block px-6 py-3 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
          Budget
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => `block px-6 py-3 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`}>
          Notifications
        </NavLink>
      </nav>

      <button onClick={logout} className="px-6 py-3 text-left hover:bg-gray-800 mt-auto mb-6">
        Logout
      </button>
    </div>
  );
};

export default Sidebar;