import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import notificationService from '../../services/notifications';
import { useSocketEvent } from '../../hooks/useSocketEvent';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getNotifications();
      const unread = response.data.notifications?.filter(n => !n.isRead).length || 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications count');
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Live updates replace the old 30s poll — a new/read/deleted notification
  // updates the badge instantly instead of waiting for the next interval tick.
  useSocketEvent('notification:new', fetchUnreadCount);
  useSocketEvent('notification:updated', fetchUnreadCount);
  useSocketEvent('notification:deleted', fetchUnreadCount);

  return (
    <Link to="/notifications" className="relative">
      <FaBell className="w-5 h-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;