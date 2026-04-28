// import React, { createContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';

// export const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const initAuth = async () => {
//       const token = localStorage.getItem('token');
//       const storedUser = localStorage.getItem('user');
      
//       console.log('Auth init - Token:', token ? 'Present' : 'Missing');
      
//       if (token && storedUser) {
//         try {
//           // Use stored user data immediately
//           setUser(JSON.parse(storedUser));
          
//           // Verify token with backend
//           const response = await fetch('http://localhost:8000/api/auth/me', {
//             headers: { 'Authorization': `Bearer ${token}` }
//           });
          
//           const data = await response.json();
          
//           if (data.success && data.user) {
//             console.log('Token verified, user:', data.user);
//             setUser(data.user);
//             localStorage.setItem('user', JSON.stringify(data.user));
//           } else {
//             console.log('Token invalid, clearing storage');
//             localStorage.removeItem('token');
//             localStorage.removeItem('user');
//             setUser(null);
//           }
//         } catch (error) {
//           console.error('Auth verification error:', error);
//           localStorage.removeItem('token');
//           localStorage.removeItem('user');
//           setUser(null);
//         }
//       }
//       setLoading(false);
//     };

//     initAuth();
//   }, []);

//   const login = async (mobileNumber, password) => {
//     try {
//       const response = await fetch('http://localhost:8000/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ mobileNumber, password }),
//       });

//       const data = await response.json();
//       console.log('Login response:', data);

//       if (data.token) {
//         // Store token
//         localStorage.setItem('token', data.token);
        
//         // Store user data (from login response)
//         if (data.user) {
//           localStorage.setItem('user', JSON.stringify(data.user));
//           setUser(data.user);
//         } else {
//           // If user not in login response, fetch from /me
//           const meResponse = await fetch('http://localhost:8000/api/auth/me', {
//             headers: { 'Authorization': `Bearer ${data.token}` }
//           });
//           const meData = await meResponse.json();
//           if (meData.success && meData.user) {
//             localStorage.setItem('user', JSON.stringify(meData.user));
//             setUser(meData.user);
//           }
//         }
        
//         toast.success('Login successful!');
//         navigate('/dashboard');
//         return true;
//       } else {
//         toast.error(data.message || 'Login failed');
//         return false;
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       toast.error('Login failed. Please try again.');
//       return false;
//     }
//   };

//   const register = async (userData) => {
//     try {
//       const response = await fetch('http://localhost:8000/api/auth/register', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(userData),
//       });

//       const data = await response.json();
//       console.log('Register response:', data);

//       if (data.token) {
//         localStorage.setItem('token', data.token);
        
//         if (data.user) {
//           localStorage.setItem('user', JSON.stringify(data.user));
//           setUser(data.user);
//         }
        
//         toast.success('Registration successful!');
//         navigate('/dashboard');
//         return true;
//       } else {
//         toast.error(data.message || 'Registration failed');
//         return false;
//       }
//     } catch (error) {
//       console.error('Register error:', error);
//       toast.error('Registration failed. Please try again.');
//       return false;
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     setUser(null);
//     navigate('/login');
//     toast.success('Logged out successfully');
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };





import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// ✅ Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('Auth init - Token:', token ? 'Present' : 'Missing');
      console.log('API URL:', API_URL);
      
      if (token && storedUser) {
        try {
          // Use stored user data immediately
          setUser(JSON.parse(storedUser));
          
          // Verify token with backend
          const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const data = await response.json();
          
          if (data.success && data.user) {
            console.log('Token verified, user:', data.user);
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          } else {
            console.log('Token invalid, clearing storage');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          console.error('Auth verification error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
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
        
        // Store user data (from login response)
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        } else {
          // If user not in login response, fetch from /me
          const meResponse = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${data.token}` }
          });
          const meData = await meResponse.json();
          if (meData.success && meData.user) {
            localStorage.setItem('user', JSON.stringify(meData.user));
            setUser(meData.user);
          }
        }
        
        toast.success('Login successful!');
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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('Register response:', data);

      if (data.token) {
        localStorage.setItem('token', data.token);
        
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        
        toast.success('Registration successful!');
        navigate('/dashboard');
        return true;
      } else {
        toast.error(data.message || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Registration failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
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
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};