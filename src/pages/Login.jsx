import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaChartLine, FaEye, FaEyeSlash, FaPhone, FaLock, FaCheck } from 'react-icons/fa';

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useContext(AuthContext);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await login(mobileNumber, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background glow */}
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
              Manage your company's<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                finances with clarity
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Sign in to access real-time insights, track expenses, and keep your team aligned.
            </p>
          </div>

          <ul className="space-y-3">
            {[
              'Real-time transaction tracking',
              'Role-based access for your entire team',
              'Automated budget alerts & reports',
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

        {/* Footer quote */}
        <div className="relative border-t border-white/10 pt-6">
          <p className="text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Create one free →
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right Panel (Form) ──────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12">
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
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1.5">Welcome back</h1>
            <p className="text-gray-500">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mobile Number */}
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Mobile Number
              </label>
              <div className="relative flex">
                <span className="flex items-center gap-1.5 pl-3.5 pr-2.5 border border-r-0 border-gray-200 rounded-l-xl bg-gray-100 text-gray-500 text-sm font-medium select-none">
                  <FaPhone className="w-4 h-4 text-gray-400" />
                  +91
                </span>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-3 pr-4 py-3 border border-gray-200 rounded-r-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50 focus:bg-white"
                  placeholder="9876543210"
                  autoComplete="username"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaLock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-gray-50 focus:bg-white"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
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
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center mt-7 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Create account
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

export default Login;
