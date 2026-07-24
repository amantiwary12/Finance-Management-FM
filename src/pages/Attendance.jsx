import React, { useState, useEffect, useCallback } from 'react';
import {
  FaChevronLeft, FaChevronRight, FaCalendarCheck, FaUpload, FaCog,
  FaCheckCircle, FaTimesCircle, FaClock, FaFileExcel, FaDownload,
  FaSpinner, FaEye, FaTimes, FaExclamationTriangle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useRole } from '../context/RoleContext';
import attendanceService from '../services/attendanceService';
import AttendanceCalendar from '../components/Attendance/AttendanceCalendar';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const countStatuses = (records) => {
  const counts = { Present: 0, Absent: 0, 'Half Day': 0, Late: 0 };
  records.forEach((r) => {
    counts[r.status] = (counts[r.status] || 0) + 1;
  });
  return counts;
};

const useMonthCursor = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  return { month, year, prevMonth, nextMonth };
};

const MonthNav = ({ month, year, onPrev, onNext }) => (
  <div className="flex items-center gap-3">
    <button onClick={onPrev} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
      <FaChevronLeft className="w-3.5 h-3.5" />
    </button>
    <span className="text-sm font-semibold text-gray-800 w-36 text-center">
      {MONTH_NAMES[month - 1]} {year}
    </span>
    <button onClick={onNext} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
      <FaChevronRight className="w-3.5 h-3.5" />
    </button>
  </div>
);

const StatChip = ({ icon: Icon, label, value, color, bg }) => (
  <div className="flex items-center gap-2.5 bg-white rounded-xl border border-gray-100 px-4 py-3">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
    </div>
    <div>
      <p className="text-lg font-bold text-gray-800 leading-none">{value}</p>
      <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const MyAttendance = () => {
  const { month, year, prevMonth, nextMonth } = useMonthCursor();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    attendanceService
      .getMyAttendance(month, year)
      .then((res) => {
        if (!cancelled) setRecords(res.data.records || []);
      })
      .catch((error) => {
        console.error('Failed to fetch attendance:', error);
        toast.error('Failed to load attendance');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month, year]);

  const counts = countStatuses(records);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">My Attendance</h2>
          <p className="text-sm text-gray-500">Day-wise attendance for the selected month</p>
        </div>
        <MonthNav month={month} year={year} onPrev={prevMonth} onNext={nextMonth} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip icon={FaCheckCircle} label="Present" value={counts.Present} color="text-emerald-600" bg="bg-emerald-50" />
        <StatChip icon={FaTimesCircle} label="Absent" value={counts.Absent} color="text-red-600" bg="bg-red-50" />
        <StatChip icon={FaExclamationTriangle} label="Half Day" value={counts['Half Day']} color="text-amber-600" bg="bg-amber-50" />
        <StatChip icon={FaClock} label="Late" value={counts.Late} color="text-orange-600" bg="bg-orange-50" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <AttendanceCalendar year={year} month={month} records={records} loading={loading} />
      </div>
    </div>
  );
};

const UploadCard = ({ onUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    if (!/\.(xlsx|xls|csv)$/i.test(selected.name)) {
      toast.error('Please upload an Excel (.xlsx, .xls) or CSV file');
      return;
    }
    setFile(selected);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await attendanceService.uploadAttendance(file);
      setResult(res.data);
      toast.success(res.data.message || 'Attendance imported');
      setFile(null);
      onUploaded?.();
    } catch (error) {
      console.error('Attendance upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to import attendance');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const sample = [
      ['Name', 'Mobile Number', 'Date', 'Status', 'Check In', 'Check Out'],
      ['employe1', '1234567890', '2026-07-01', 'Present', '09:20', '18:30'],
      ['employe1', '1234567890', '2026-07-02', '', '10:15', '18:30'],
      ['employe1', '1234567890', '2026-07-03', 'Absent', '', ''],
    ];
    const csvContent = sample.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Upload Attendance Sheet</h3>
          <p className="text-xs text-gray-500 mt-0.5">Export from Google Sheets as .xlsx/.csv, then upload here</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
        >
          <FaDownload className="w-3 h-3" />
          Sample Template
        </button>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          file ? 'border-emerald-400 bg-emerald-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        {!file ? (
          <>
            <FaFileExcel className="mx-auto h-9 w-9 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">Click to select a file</p>
            <p className="text-xs text-gray-400 mb-3">Excel (.xlsx, .xls) or CSV, up to 10MB</p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="attendance-file-upload"
            />
            <label
              htmlFor="attendance-file-upload"
              className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              Select File
            </label>
          </>
        ) : (
          <div>
            <FaCheckCircle className="mx-auto h-9 w-9 text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-gray-800">{file.name}</p>
            <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={() => setFile(null)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Change File
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {uploading && <FaSpinner className="animate-spin w-3.5 h-3.5" />}
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p className="font-semibold text-gray-700 mb-1">Columns supported</p>
        <p><span className="font-medium">Name</span> or <span className="font-medium">Mobile Number</span> (required to match the employee)</p>
        <p><span className="font-medium">Date</span> (required)</p>
        <p>Either a <span className="font-medium">Status</span> column (Present / Absent / Half Day / Late), or <span className="font-medium">Check In</span> / <span className="font-medium">Check Out</span> times — status is auto-calculated from your Attendance Settings below when Status isn't provided.</p>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm font-semibold text-blue-900">
            {result.inserted} added · {result.updated} updated · {result.skipped} skipped (of {result.totalRows} rows)
          </p>
          {result.skippedDetails?.length > 0 && (
            <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
              {result.skippedDetails.map((s, i) => (
                <p key={i} className="text-xs text-red-600">Row {s.row}: {s.reason}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SettingsCard = () => {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    attendanceService
      .getSettings()
      .then((res) => setSettings(res.data.settings))
      .catch((error) => console.error('Failed to load attendance settings:', error));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await attendanceService.updateSettings({
        workStartTime: settings.workStartTime,
        workEndTime: settings.workEndTime,
        lateGraceMinutes: settings.lateGraceMinutes,
        halfDayThresholdHours: settings.halfDayThresholdHours,
      });
      setSettings(res.data.settings);
      toast.success('Attendance settings saved');
    } catch (error) {
      console.error('Failed to save attendance settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="animate-pulse h-24 bg-gray-100 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-1">
        <FaCog className="w-3.5 h-3.5 text-gray-400" />
        <h3 className="text-sm font-bold text-gray-800">Attendance Settings</h3>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Used to auto-calculate Present / Late / Half Day when a sheet only has Check In / Check Out times
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Office Start Time</label>
          <input
            type="time"
            value={settings.workStartTime}
            onChange={(e) => setSettings({ ...settings, workStartTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Office End Time</label>
          <input
            type="time"
            value={settings.workEndTime}
            onChange={(e) => setSettings({ ...settings, workEndTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Late Grace (minutes)</label>
          <input
            type="number"
            min="0"
            value={settings.lateGraceMinutes}
            onChange={(e) => setSettings({ ...settings, lateGraceMinutes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-[10px] text-gray-400 mt-1">Check-in after Start Time + this = Late</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Half Day if worked under (hours)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={settings.halfDayThresholdHours}
            onChange={(e) => setSettings({ ...settings, halfDayThresholdHours: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
      >
        {saving && <FaSpinner className="animate-spin w-3.5 h-3.5" />}
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

const STATUS_OPTIONS = ['Present', 'Absent', 'Half Day', 'Late'];

const pad2 = (n) => n.toString().padStart(2, '0');

const DayEditor = ({ userId, year, month, day, existingRecord, onSaved, onCancel }) => {
  const [status, setStatus] = useState(existingRecord?.status || 'Present');
  const [checkIn, setCheckIn] = useState(existingRecord?.checkIn || '');
  const [checkOut, setCheckOut] = useState(existingRecord?.checkOut || '');
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const date = `${year}-${pad2(month)}-${pad2(day)}`;
      await attendanceService.setManualAttendance(userId, {
        date,
        status,
        checkIn: checkIn || null,
        checkOut: checkOut || null,
      });
      toast.success('Attendance updated');
      onSaved();
    } catch (error) {
      console.error('Failed to save attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      const date = `${year}-${pad2(month)}-${pad2(day)}`;
      await attendanceService.deleteAttendance(userId, date);
      toast.success('Attendance record cleared');
      onSaved();
    } catch (error) {
      console.error('Failed to clear attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to clear attendance');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
      <p className="text-sm font-semibold text-gray-800 mb-3">
        Edit {MONTH_NAMES[month - 1]} {day}, {year}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Check In (optional)</label>
          <input
            type="time"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Check Out (optional)</label>
          <input
            type="time"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={onCancel}
          disabled={saving || clearing}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-white"
        >
          Cancel
        </button>
        {existingRecord && (
          <button
            onClick={handleClear}
            disabled={saving || clearing}
            className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center gap-2"
          >
            {clearing && <FaSpinner className="animate-spin w-3.5 h-3.5" />}
            {clearing ? 'Clearing...' : 'Clear Record'}
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving || clearing}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <FaSpinner className="animate-spin w-3.5 h-3.5" />}
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};

const EmployeeCalendarModal = ({ userId, name, month, year, onClose }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDay, setEditingDay] = useState(null);

  const fetchRecords = useCallback(() => {
    setLoading(true);
    attendanceService
      .getUserAttendance(userId, month, year)
      .then((res) => setRecords(res.data.records || []))
      .catch((error) => {
        console.error('Failed to load employee attendance:', error);
        toast.error('Failed to load attendance');
      })
      .finally(() => setLoading(false));
  }, [userId, month, year]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const existingRecordForDay = (day) =>
    records.find((r) => new Date(r.date).getUTCDate() === day);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{name}'s Attendance</h2>
            <p className="text-sm text-gray-500">
              {MONTH_NAMES[month - 1]} {year} · Click a day to edit it
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <AttendanceCalendar
          year={year}
          month={month}
          records={records}
          loading={loading}
          onDayClick={(day) => setEditingDay(day)}
        />
        {editingDay && (
          <DayEditor
            userId={userId}
            year={year}
            month={month}
            day={editingDay}
            existingRecord={existingRecordForDay(editingDay)}
            onCancel={() => setEditingDay(null)}
            onSaved={() => {
              setEditingDay(null);
              fetchRecords();
            }}
          />
        )}
      </div>
    </div>
  );
};

const ManageAttendance = () => {
  const { month, year, prevMonth, nextMonth } = useMonthCursor();
  const [summary, setSummary] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [viewingEmployee, setViewingEmployee] = useState(null);

  const fetchSummary = useCallback(() => {
    setLoadingSummary(true);
    attendanceService
      .getAttendanceSummary(month, year)
      .then((res) => setSummary(res.data.summary || []))
      .catch((error) => console.error('Failed to load attendance summary:', error))
      .finally(() => setLoadingSummary(false));
  }, [month, year]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <UploadCard onUploaded={fetchSummary} />
        <SettingsCard />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 className="text-sm font-bold text-gray-800">Company Attendance Summary</h3>
          <MonthNav month={month} year={year} onPrev={prevMonth} onNext={nextMonth} />
        </div>

        {loadingSummary ? (
          <div className="animate-pulse h-40 bg-gray-100 rounded-lg" />
        ) : summary.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No employees found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 px-3 text-center">Present</th>
                  <th className="py-2 px-3 text-center">Absent</th>
                  <th className="py-2 px-3 text-center">Half Day</th>
                  <th className="py-2 px-3 text-center">Late</th>
                  <th className="py-2 pl-3 text-right">Calendar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {summary.map((row) => (
                  <tr key={row.user._id}>
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-gray-800">{row.user.name}</p>
                      <p className="text-xs text-gray-400">{row.user.mobileNumber} · {row.user.role}</p>
                    </td>
                    <td className="py-2.5 px-3 text-center text-emerald-600 font-semibold">{row.counts.Present}</td>
                    <td className="py-2.5 px-3 text-center text-red-600 font-semibold">{row.counts.Absent}</td>
                    <td className="py-2.5 px-3 text-center text-amber-600 font-semibold">{row.counts['Half Day']}</td>
                    <td className="py-2.5 px-3 text-center text-orange-600 font-semibold">{row.counts.Late}</td>
                    <td className="py-2.5 pl-3 text-right">
                      <button
                        onClick={() => setViewingEmployee(row.user)}
                        className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-xs font-medium"
                      >
                        <FaEye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewingEmployee && (
        <EmployeeCalendarModal
          userId={viewingEmployee._id}
          name={viewingEmployee.name}
          month={month}
          year={year}
          onClose={() => {
            setViewingEmployee(null);
            fetchSummary();
          }}
        />
      )}
    </div>
  );
};

const Attendance = () => {
  const { isHR, isAdmin, isSuperAdmin } = useRole();
  const canManage = isHR || isAdmin || isSuperAdmin;
  const [tab, setTab] = useState('mine');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center">
            <FaCalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Attendance</h1>
            <p className="text-blue-200 text-sm mt-0.5">
              {canManage ? 'Upload attendance sheets and track the whole team' : 'Your day-wise attendance record'}
            </p>
          </div>
        </div>
      </div>

      {canManage && (
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setTab('mine')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'mine' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            My Attendance
          </button>
          <button
            onClick={() => setTab('manage')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === 'manage' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaUpload className="w-3 h-3" />
            Manage Attendance
          </button>
        </div>
      )}

      {tab === 'mine' || !canManage ? <MyAttendance /> : <ManageAttendance />}
    </div>
  );
};

export default Attendance;
