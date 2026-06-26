import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { FaBuilding, FaUser, FaLock, FaBell, FaPalette, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, company } = useContext(AuthContext);
  const { userRole } = useRole();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // States
  const [name, setName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accentColor, setAccentColor] = useState('blue');
  const [systemNotifications, setSystemNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mock update for profile values
      setTimeout(() => {
        toast.success('Profile settings updated successfully!');
        setLoading(false);
      }, 800);
    } catch (error) {
      toast.error('Failed to update profile');
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      setTimeout(() => {
        toast.success('Password updated successfully!');
        setPassword('');
        setConfirmPassword('');
        setLoading(false);
      }, 800);
    } catch (error) {
      toast.error('Failed to update password');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-blue-100 mt-1">Configure your personal preferences, security, and company visual settings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaUser className="w-4 h-4" />
            My Profile
          </button>
          
          <button
            onClick={() => setActiveTab('company')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'company'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaBuilding className="w-4 h-4" />
            Company Info
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaLock className="w-4 h-4" />
            Security & Password
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'theme'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaPalette className="w-4 h-4" />
            Theme Preferences
          </button>
        </div>

        {/* Content Pane */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">My Account Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Mobile Number</label>
                    <input
                      type="text"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Account Role</label>
                    <input
                      type="text"
                      value={userRole || 'Employee'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow transition-all flex items-center gap-2"
                >
                  {loading ? <FaSpinner className="animate-spin w-4 h-4" /> : <FaCheckCircle className="w-4 h-4" />}
                  Save Profile Settings
                </button>
              </div>
            </form>
          )}

          {/* COMPANY TAB */}
          {activeTab === 'company' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Company Details</h3>
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl font-bold">
                    {company?.name ? company.name.charAt(0) : 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{company?.name || 'My Organization'}</h4>
                    <p className="text-sm text-gray-500">Corporate Finance Workspace</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase">Registration ID</span>
                    <span className="text-sm font-medium text-gray-700">{company?._id || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-400 uppercase">Member Count</span>
                    <span className="text-sm font-medium text-gray-700">Active Workspace</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-gray-700 text-sm">System Alerts Configuration</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemNotifications}
                      onChange={(e) => setSystemNotifications(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">Form Alert Notifications</span>
                      <span className="text-xs text-gray-500">Receive system toasts when a form response is submitted</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">Weekly Financial Reports</span>
                      <span className="text-xs text-gray-500">Send an aggregated expense statement every Monday morning</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Reset Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium shadow transition-all flex items-center gap-2"
                >
                  {loading ? <FaSpinner className="animate-spin w-4 h-4" /> : <FaCheckCircle className="w-4 h-4" />}
                  Change Password
                </button>
              </div>
            </form>
          )}

          {/* THEME TAB */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">Visual Styling</h3>
              <div>
                <span className="block text-sm font-medium text-gray-600 mb-3">Workspace Accent Accent Color</span>
                <div className="grid grid-cols-4 gap-3">
                  {['blue', 'indigo', 'purple', 'emerald'].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setAccentColor(color);
                        toast.success(`${color.charAt(0).toUpperCase() + color.slice(1)} accent set!`);
                      }}
                      className={`flex flex-col items-center p-3 border rounded-xl hover:bg-gray-50 transition-all ${
                        accentColor === color ? 'border-2 border-blue-600 bg-blue-50/50' : 'border-gray-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full shadow mb-2 bg-${
                        color === 'blue' ? 'blue-600' :
                        color === 'indigo' ? 'indigo-600' :
                        color === 'purple' ? 'purple-600' : 'emerald-600'
                      }`} />
                      <span className="text-xs font-semibold capitalize text-gray-700">{color}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3">
                <FaPalette className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Theme Styling Sync</p>
                  <p className="text-xs text-gray-500">Dashboard accents are fully optimized for seamless contrast and premium aesthetic display.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
