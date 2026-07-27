import React, { useState, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaUser, FaMobileAlt, FaLock, FaBuilding, FaChartLine, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    password: '',
    companyName: ''  // ✅ MUST match exactly "companyName"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, user } = useContext(AuthContext);

  if (user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-slate-400">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      alert('Please enter your company name');
      return;
    }

    setIsLoading(true);
    await register(formData);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600 opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
            <FaChartLine className="text-white w-5 h-5" />
          </div>
          <span className="text-white text-xl font-extrabold tracking-tight">FinanceFlow</span>
        </div>

        {/* Main copy */}
        <div className="relative space-y-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-3">
              Set up your company<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                in under a minute
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Register your company and you become the Admin. Add your team, assign roles, and start tracking.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              'You become the Admin — full control from day one',
              'Invite unlimited team members with custom roles',
              'Company data is fully isolated and secure',
              'No credit card required',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0">
                  <FaCheck className="w-2.5 h-2.5 text-blue-400" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="relative border-t border-white/10 pt-6">
          <p className="text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right Panel (Form) ──────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <FaChartLine className="text-white w-4 h-4" />
            </div>
            <span className="text-gray-900 text-lg font-extrabold">FinanceFlow</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1.5">Create your account</h1>
            <p className="text-gray-500">Register your company and start managing finances</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaBuilding className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50 focus:bg-white"
                  placeholder="Acme Corp"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-1">Your team members will belong to this company</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaUser className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50 focus:bg-white"
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative flex">
                <span className="flex items-center gap-1.5 pl-3.5 pr-2.5 border border-r-0 border-gray-200 rounded-l-xl bg-gray-100 text-gray-500 text-sm font-medium select-none">
                  <FaMobileAlt className="w-4 h-4 text-gray-400" />
                  +91
                </span>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, mobileNumber: digits });
                  }}
                  className="w-full pl-3 pr-4 py-3 border border-gray-200 rounded-r-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50 focus:bg-white"
                  placeholder="9876543210"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-1">Used as your login identifier</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaLock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50 focus:bg-white"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-1">Minimum 6 characters</p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all text-sm shadow-md shadow-blue-600/25 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-7 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign in
            </Link>
          </p>

          <p className="text-center mt-4 text-sm text-gray-400">
            <Link to="/landing" className="hover:text-gray-600 transition-colors">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
