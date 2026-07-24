import api from './api';

const attendanceService = {
  // POST /api/attendance/upload — HR/Admin uploads Google Sheet/Excel/CSV
  uploadAttendance: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/attendance/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response;
  },

  // GET /api/attendance/my?month=&year= — logged-in user's own attendance
  getMyAttendance: async (month, year) => {
    const response = await api.get('/attendance/my', { params: { month, year } });
    return response;
  },

  // GET /api/attendance/user/:userId?month=&year= — HR/Admin viewing one employee
  getUserAttendance: async (userId, month, year) => {
    const response = await api.get(`/attendance/user/${userId}`, { params: { month, year } });
    return response;
  },

  // PUT /api/attendance/user/:userId — HR/Admin manually sets/corrects one day
  setManualAttendance: async (userId, data) => {
    const response = await api.put(`/attendance/user/${userId}`, data);
    return response;
  },

  // DELETE /api/attendance/user/:userId?date= — HR/Admin clears a mismarked day
  deleteAttendance: async (userId, date) => {
    const response = await api.delete(`/attendance/user/${userId}`, { params: { date } });
    return response;
  },

  // GET /api/attendance/summary?month=&year= — HR/Admin company-wide summary
  getAttendanceSummary: async (month, year) => {
    const response = await api.get('/attendance/summary', { params: { month, year } });
    return response;
  },

  // GET /api/attendance/settings — HR/Admin
  getSettings: async () => {
    const response = await api.get('/attendance/settings');
    return response;
  },

  // PUT /api/attendance/settings — HR/Admin
  updateSettings: async (data) => {
    const response = await api.put('/attendance/settings', data);
    return response;
  },
};

export default attendanceService;
