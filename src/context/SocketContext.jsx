import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

// Socket.IO connects to the server root, not the REST "/api" prefix.
const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8001/api').replace(/\/api\/?$/, '');

export const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!user || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      return;
    }

    if (socketRef.current) return;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, [user]);

  // Disconnect when the app itself unmounts (e.g. hot reload teardown).
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
