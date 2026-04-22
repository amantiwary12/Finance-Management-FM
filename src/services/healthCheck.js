import api from './api';

let isServerDown = false;
let lastCheckTime = 0;

export const checkServerHealth = async () => {
  const now = Date.now();
  // Don't check more than once every 10 seconds
  if (now - lastCheckTime < 10000) {
    return !isServerDown;
  }
  
  lastCheckTime = now;
  
  try {
    await api.get('/budget/status', { timeout: 5000 });
    isServerDown = false;
    return true;
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      isServerDown = true;
    }
    return false;
  }
};

export const isServerAvailable = () => !isServerDown;