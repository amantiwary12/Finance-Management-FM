import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export const RoleContext = createContext(null);

export const useRole = () => {
  const context = useContext(RoleContext);
  return context;
};

export const RoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/auth/me');
          setUser(response.data.user || response.data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const isAdmin = () => user?.role === 'Admin';
  const isManager = () => user?.role === 'Manager';
  const isEmployee = () => user?.role === 'Employee';

  return (
    <RoleContext.Provider value={{ user, loading, isAdmin, isManager, isEmployee }}>
      {children}
    </RoleContext.Provider>
  );
};