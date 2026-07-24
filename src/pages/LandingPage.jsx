import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaChartLine, FaUsers, FaProjectDiagram, FaWallet,
  FaBell, FaFileExport, FaArrowRight, FaCheck,
  FaShieldAlt, FaChartBar, FaClipboardList, FaCalendarCheck, FaQrcode,
} from 'react-icons/fa';

const features = [
  {
    icon: FaChartLine,
    title: 'Real-Time Analytics',
    desc: 'Interactive daily, weekly, monthly, and yearly charts for income and expense trends with category breakdowns.',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: FaWallet,
    title: 'Budget Management',
    desc: 'Set category-wise budgets with alert thresholds. Track spending in real time with colour-coded progress bars.',
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    icon: FaProjectDiagram,
    title: 'Project Tracking',
    desc: 'Link transactions directly to projects. Monitor budget usage, spending progress, and project status.',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: FaUsers,
    title: 'Team Management',
    desc: 'Invite team members and assign roles. Each user sees and edits only what their role permits.',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    icon: FaBell,
    title: 'Real Email + In-App Alerts',
    desc: 'Budget overages, project milestones, and form submissions trigger both an in-app notification and a real email to the right people.',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    icon: FaFileExport,
    title: 'Excel Export & Import',
    desc: 'Export transactions to Excel for external reporting. Bulk-import data via CSV or Excel files.',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
  },
  {
    icon: FaClipboardList,
    title: 'HR Form Builder',
    desc: 'HR creates and edits custom forms anytime. Every employee can view and fill them, with submissions tracked in one place.',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: FaQrcode,
    title: 'QR Code Form Sharing',
    desc: 'Turn any form into a QR code. Anyone who scans it can open and fill the form instantly — no account or login required.',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
  {
    icon: FaCalendarCheck,
    title: 'Attendance Tracking',
    desc: 'HR uploads a spreadsheet and every employee gets a day-by-day monthly calendar — present, absent, half-day, or late, colour-coded automatically.',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    icon: FaShieldAlt,
    title: 'Multi-Tenant & Secure',
    desc: 'Each company\'s data is completely isolated. JWT authentication with role-based access control on every route.',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
  },
  {
    icon: FaChartBar,
    title: 'Receipt Uploads',
    desc: 'Attach screenshot receipts to any transaction. Files are stored securely in the cloud via Cloudinary.',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
];

const roles = [
  {
    name: 'Admin',
    badge: 'bg-red-100 text-red-700',
    tagline: 'Full company control',
    perms: [
      'Manage all team members',
      'View all financial data',
      'Create & delete projects',
      'Set budgets and alerts',
      'Export reports to Excel',
      'Access admin dashboard',
    ],
  },
  {
    name: 'Finance Manager',
    badge: 'bg-blue-100 text-blue-700',
    tagline: 'Financial oversight',
    perms: [
      'Create & edit transactions',
      'Set category budgets',
      'Generate financial reports',
      'Export data to Excel',
      'View all transactions',
      'Monitor budget alerts',
    ],
  },
  {
    name: 'Manager',
    badge: 'bg-purple-100 text-purple-700',
    tagline: 'Project & team oversight',
    perms: [
      'Create & manage projects',
      'View all transactions',
      'Monitor project budgets',
      'Update project status',
      'Weekly & monthly reports',
      'View team activity',
    ],
  },
  {
    name: 'HR',
    badge: 'bg-yellow-100 text-yellow-700',
    tagline: 'People & forms',
    perms: [
      'Build & edit custom forms',
      'Share forms via QR code',
      'Review form submissions',
      'Upload attendance sheets',
      'Access HR dashboard',
      'Read-only financial view',
    ],
  },
  {
    name: 'Employee',
    badge: 'bg-green-100 text-green-700',
    tagline: 'Personal finance view',
    perms: [
      'Log personal transactions',
      'View own transactions only',
      'Fill out company forms',
      'View monthly attendance calendar',
      'View project list',
      'Personal dashboard',
    ],
  },
  {
    name: 'Viewer',
    badge: 'bg-gray-100 text-gray-700',
    tagline: 'Read-only access',
    perms: [
      'View transactions',
      'Browse projects',
      'See budget overview',
      'Access reports',
      'View notifications',
      'No edit permissions',
    ],
  },
];

const steps = [
  {
    number: '01',
    title: 'Register Your Company',
    desc: 'Sign up with your mobile number and company name. You become the Admin automatically — no setup wizard needed.',
  },
  {
    number: '02',
    title: 'Invite Your Team',
    desc: 'Add employees, managers, HR, and finance staff. Each person gets the role that matches exactly what they need to do.',
  },
  {
    number: '03',
    title: 'Track & Analyse',
    desc: 'Log transactions, set budgets, create projects, and watch real-time charts as your company\'s finances unfold.',
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <FaChartLine className="text-white w-4 h-4" />
            </div>
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">FinanceFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center relative">
          {/* Background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600 opacity-10 rounded-full blur-3xl" />
          </div>

          <span className="relative inline-flex items-center gap-2 bg-blue-500/15 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-7 border border-blue-500/25">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Multi-Tenant Company Finance Platform
          </span>

          <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Take Full Control of
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 mt-2">
              Your Company Finances
            </span>
          </h1>

          <p className="relative text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Log transactions, track budgets, manage projects, and empower your entire team
            — all from one secure, role-based platform built for Indian businesses.
          </p>

          <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-xl shadow-blue-900/40"
            >
              Get Started Free <FaArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all border border-white/20 backdrop-blur-sm"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────── */}
      <section className="bg-blue-600 text-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '7', label: 'User Roles' },
              { value: '11+', label: 'Core Features' },
              { value: 'Real-Time', label: 'Analytics & Charts' },
              { value: '100%', label: 'Data Isolated Per Company' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-3xl md:text-4xl font-extrabold">{s.value}</p>
                <p className="text-blue-200 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Everything your team needs
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              A complete toolkit for tracking, analysing, and managing company finances — no spreadsheets required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className={`${f.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                  <f.icon className={`${f.color} w-5 h-5`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section id="how" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Up and running in 3 steps
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              From sign-up to full financial visibility in minutes, not hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-[calc(16.7%+2rem)] right-[calc(16.7%+2rem)] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />

            {steps.map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200 relative z-10">
                  <span className="text-white text-lg font-extrabold">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ──────────────────────────────────────────── */}
      <section id="roles" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Designed for every team member
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Six distinct roles ensure each person sees and does exactly what their job requires — nothing more, nothing less.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-900">{role.name}</h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${role.badge} whitespace-nowrap ml-2`}>
                    {role.tagline}
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {role.perms.map((p, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <FaCheck className="text-green-500 flex-shrink-0 w-3 h-3 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Usage Guide ────────────────────────────────────── */}
      <section id="guide" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              How to use FinanceFlow
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              A quick guide to the most important workflows in the platform.
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                title: 'Logging a Transaction',
                steps: [
                  'Navigate to Transactions in the sidebar.',
                  'Click "Add Transaction" and fill in the amount, type (income/expense), category, date, and an optional note.',
                  'Optionally attach a receipt screenshot and link the transaction to a project.',
                  'Click Submit — the transaction appears instantly and your budget and project stats update.',
                ],
              },
              {
                title: 'Setting Up a Budget',
                steps: [
                  'Go to Budget Tracker in the sidebar.',
                  'Click "Add Budget" and select a category (e.g. Food, Transport, Bills).',
                  'Enter the budget amount, month, year, and an alert threshold (default 80%).',
                  'The system will automatically warn you when spending nears or exceeds the threshold.',
                ],
              },
              {
                title: 'Managing Projects',
                steps: [
                  'Admins and Managers can create projects from the Projects page.',
                  'Set the project name, description, and total budget.',
                  'Team members link transactions to the project when logging expenses.',
                  'The project dashboard shows total spent, remaining budget, and percentage used in real time.',
                ],
              },
              {
                title: 'Inviting Team Members (Admin only)',
                steps: [
                  'Go to User Management from the sidebar.',
                  'Click "Add User" and enter the person\'s name, mobile number, and password.',
                  'Assign them a role: Admin, Finance Manager, Manager, HR, Employee, or Viewer.',
                  'They can log in immediately using their mobile number and password.',
                ],
              },
              {
                title: 'Sharing a Form via QR Code (HR only)',
                steps: [
                  'Build a form from Forms → Create Form, or open an existing one to edit it.',
                  'On the Forms list, click the QR icon on any form card.',
                  'Scan the generated QR code, or copy/download it to print or share however you like.',
                  'Anyone who scans it can fill and submit the form instantly — no login required — and HR is emailed the response right away.',
                ],
              },
              {
                title: 'Uploading & Viewing Attendance',
                steps: [
                  'HR uploads a daily attendance spreadsheet (Excel/CSV) from the Attendance page, along with each employee\'s working hours.',
                  'The system automatically works out present, absent, half-day, and late status per day.',
                  'Every employee sees their own month-by-month calendar, colour-coded per day, on their Attendance page.',
                  'Days before HR\'s first upload simply show as blank — no guessing, no false absences.',
                ],
              },
            ].map((section, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  {section.title}
                </h3>
                <ol className="space-y-2 ml-9">
                  {section.steps.map((s, j) => (
                    <li key={j} className="text-sm text-gray-600 list-decimal list-inside">
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to streamline your company finances?
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Register your company and invite your team today.
            No credit card required — just your mobile number.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-50 transition-all shadow-lg"
            >
              Get Started Now <FaArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-blue-500/30 hover:bg-blue-500/50 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all border border-white/20"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-white w-3.5 h-3.5" />
              </div>
              <span className="text-white font-bold text-lg">FinanceFlow</span>
            </div>

            <p className="text-sm text-center">
              © {new Date().getFullYear()} FinanceFlow. Company finance management made simple.
            </p>

            <div className="flex gap-6 text-sm">
              <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
