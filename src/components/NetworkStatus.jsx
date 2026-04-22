import React from 'react';
import { FaWifi, FaWifiSlash, FaSync } from 'react-icons/fa';

const NetworkStatus = ({ isOnline, wasOffline }) => {
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
        <FaWifiSlash className="w-4 h-4" />
        <span className="text-sm">No internet connection</span>
      </div>
    );
  }

  if (wasOffline) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
        <FaSync className="w-4 h-4 animate-spin" />
        <span className="text-sm">Connection restored</span>
      </div>
    );
  }

  return null;
};

export default NetworkStatus;