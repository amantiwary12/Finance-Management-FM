import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ✅ Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null); // ✅ NEW - Store company info
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedCompany = localStorage.getItem('company'); // ✅ NEW
      
      console.log('Auth init - Token:', token ? 'Present' : 'Missing');
      console.log('API URL:', API_URL);
      
      if (token && storedUser) {
        try {
          // Use stored data immediately
          setUser(JSON.parse(storedUser));
          if (storedCompany) {
            setCompany(JSON.parse(storedCompany));
          }
          
          // Verify token with backend
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const data = await response.json();
          
          if (data.success && data.user) {
            console.log('Token verified, user:', data.user);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // ✅ Store company if returned
            if (data.company) {
              setCompany(data.company);
              localStorage.setItem('company', JSON.stringify(data.company));
            }
          } else {
            console.log('Token invalid, clearing storage');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('company');
            setUser(null);
            setCompany(null);
          }
        } catch (error) {
          console.error('Auth verification error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('company');
          setUser(null);
          setCompany(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (mobileNumber, password) => {
    try {
      console.log('Attempting login to:', `${API_URL}/auth/login`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (data.token) {
        // Store token
        localStorage.setItem('token', data.token);
        
        // Store user data
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        
        // ✅ Store company data
        if (data.company) {
          localStorage.setItem('company', JSON.stringify(data.company));
          setCompany(data.company);
        }
        
        toast.success(`Welcome ${data.user?.name || 'User'}!`);
        navigate('/dashboard');
        return true;
      } else {
        toast.error(data.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return false;
    }
  };

 const register = async (userData) => {
  try {
    console.log('📝 Registering with data:', {
      name: userData.name,
      mobileNumber: userData.mobileNumber,
      password: '***',
      companyName: userData.companyName
    });
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        mobileNumber: userData.mobileNumber,
        password: userData.password,
        companyName: userData.companyName  // ✅ MUST match exactly
      }),
    });

    const data = await response.json();
    console.log('📦 Register response:', data);

    if (data.token) {
      localStorage.setItem('token', data.token);
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
      }
      
      toast.success(`Welcome ${data.user?.name}! Your company has been created.`);
      navigate('/dashboard');
      return true;
    } else {
      toast.error(data.message || 'Registration failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Register error:', error);
    toast.error('Registration failed. Please try again.');
    return false;
  }
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('company'); // ✅ NEW
    setUser(null);
    setCompany(null);
    navigate('/login');
    toast.success('Logged out successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, company, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};