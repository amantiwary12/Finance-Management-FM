import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { FaBuilding } from 'react-icons/fa';

const Header = () => {
  const { user, company } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Welcome back, {user?.name}!</h2>
            {company && (
              <div className="flex items-center gap-1 mt-1">
                <FaBuilding className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-500">{company.name}</p>
              </div>
            )}
          </div>
          <div className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-600">
            {user?.role || 'Employee'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;