import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-800">Welcome back, {user?.name}!</h2>
      </div>
    </header>
  );
};

export default Header;