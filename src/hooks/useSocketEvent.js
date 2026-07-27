import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

// Subscribes to a live server event for as long as the calling component
// is mounted. Pass a stable handler (useCallback) if it does expensive work.
export const useSocketEvent = (event, handler) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket || !event || !handler) return;
    socket.on(event, handler);
    return () => socket.off(event, handler);
  }, [socket, event, handler]);
};
