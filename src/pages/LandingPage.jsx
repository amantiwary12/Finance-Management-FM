import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowRight, FaCheck, FaChartLine, FaRupeeSign, FaWallet,
  FaProjectDiagram, FaUsers, FaBell, FaFileExport, FaClipboardList,
  FaCalendarCheck, FaQrcode, FaShieldAlt, FaChartBar, FaBolt, FaCoins,
} from 'react-icons/fa';

/* ─────────────────────────────────────────────────────────────
   Custom animations (scoped to this page)
───────────────────────────────────────────────────────────── */
const styles = `
  @keyframes ff-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes ff-bar { from { transform: scaleY(0.08); } to { transform: scaleY(1); } }
  @keyframes ff-draw { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
  @keyframes ff-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
  @keyframes ff-rise { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes ff-spin { to { transform: rotate(360deg); } }
  @keyframes ff-drift { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -24px); } }
  .ff-marquee { animation: ff-marquee 32s linear infinite; }
  .ff-bar { transform-origin: bottom; animation: ff-bar 1.1s cubic-bezier(0.34, 1.3, 0.5, 1) forwards; }
  .ff-draw { stroke-dasharray: 600; animation: ff-draw 2.4s ease-out forwards; }
  .ff-blink { animation: ff-blink 1.4s ease-in-out infinite; }
  .ff-rise { animation: ff-rise 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; opacity: 0; }
  .ff-spin { animation: ff-spin 14s linear infinite; }
  .ff-drift { animation: ff-drift 12s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .ff-marquee, .ff-bar, .ff-draw, .ff-blink, .ff-rise, .ff-spin, .ff-drift { animation: none; opacity: 1; }
  }
`;

/* ─────────────────────────────────────────────────────────────
   Scroll-reveal wrapper
───────────────────────────────────────────────────────────── */
const Reveal = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Animated count-up number
───────────────────────────────────────────────────────────── */
const CountUp = ({ value, suffix = '', decimals = 0 }) => {
  const ref = useRef(null);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.disconnect();
          const start = performance.now();
          const duration = 1700;
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(
              (value * eased).toLocaleString('en-IN', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              }),
            );
            if (p < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, decimals]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────────────── */
const ticker = [
  'PAYROLL CLEARED ₹4,82,000',
  'GST FILED — SEPT',
  'CLIENT PAYMENT IN ₹2,15,000',
  'BUDGET ALERT: MARKETING 86%',
  'OFFICE RENT ₹85,000',
  'INVOICE #214 SETTLED',
  'PROJECT : FLAGSHIP — 72% USED',
  'PETTY CASH ₹6,400',
  'SALARY RUN SCHEDULED',
  'TAX DEDUCTED ₹1,03,450',
];

const features = [
  { icon: FaChartLine, title: 'Real-Time Analytics', desc: 'Daily, weekly, monthly and yearly charts for income and expense trends — with category-level breakdowns.', accent: 'text-amber-600 border-amber-500/50 bg-amber-500/10' },
  { icon: FaWallet, title: 'Budget Management', desc: 'Category-wise budgets with alert thresholds. Track spending live with colour-coded progress bars.', accent: 'text-emerald-600 border-emerald-500/50 bg-emerald-500/10' },
  { icon: FaProjectDiagram, title: 'Project Tracking', desc: 'Link every transaction to a project. Monitor budget usage, spend progress and status in real time.', accent: 'text-violet-600 border-violet-500/50 bg-violet-500/10' },
  { icon: FaUsers, title: 'Team Management', desc: 'Invite team members, assign roles, and let each person see and edit only what their role permits.', accent: 'text-orange-600 border-orange-500/50 bg-orange-500/10' },
  { icon: FaBell, title: 'Email + In-App Alerts', desc: 'Budget overages, project milestones and form submissions fire an in-app alert and a real email to the right people.', accent: 'text-rose-600 border-rose-500/50 bg-rose-500/10' },
  { icon: FaFileExport, title: 'Excel Export & Import', desc: 'Export transactions to Excel for external reporting. Bulk-import data via CSV or Excel files.', accent: 'text-teal-600 border-teal-500/50 bg-teal-500/10' },
  { icon: FaClipboardList, title: 'HR Form Builder', desc: 'HR builds and edits custom forms anytime. Every employee fills them and submissions live in one place.', accent: 'text-indigo-600 border-indigo-500/50 bg-indigo-500/10' },
  { icon: FaQrcode, title: 'QR Code Form Sharing', desc: 'Turn any form into a QR code. Anyone who scans it fills and submits instantly — no login required.', accent: 'text-fuchsia-600 border-fuchsia-500/50 bg-fuchsia-500/10' },
  { icon: FaCalendarCheck, title: 'Attendance Tracking', desc: 'HR uploads a spreadsheet and every employee gets a day-by-day calendar — present, absent, half-day or late.', accent: 'text-amber-600 border-amber-500/50 bg-amber-500/10' },
  { icon: FaShieldAlt, title: 'Multi-Tenant & Secure', desc: 'Each company\u2019s data is completely isolated. JWT auth with role-based access control on every route.', accent: 'text-slate-700 border-slate-400/60 bg-slate-500/10' },
  { icon: FaChartBar, title: 'Receipt Uploads', desc: 'Attach screenshot receipts to any transaction. Files are stored securely in the cloud via Cloudinary.', accent: 'text-pink-600 border-pink-500/50 bg-pink-500/10' },
];

const roles = [
  {
    name: 'Admin',
    tagline: 'Full company control',
    badge: 'bg-red-500/10 text-red-700 border border-red-300',
    bar: 'from-red-500 to-rose-500',
    perms: ['Manage all team members', 'View all financial data', 'Create & delete projects', 'Set budgets and alerts', 'Export reports to Excel', 'Access admin dashboard'],
  },
  {
    name: 'Finance Manager',
    tagline: 'Financial oversight',
    badge: 'bg-sky-500/10 text-sky-700 border border-sky-300',
    bar: 'from-sky-500 to-cyan-500',
    perms: ['Create & edit transactions', 'Set category budgets', 'Generate financial reports', 'Export data to Excel', 'View all transactions', 'Monitor budget alerts'],
  },
  {
    name: 'Manager',
    tagline: 'Project & team oversight',
    badge: 'bg-violet-500/10 text-violet-700 border border-violet-300',
    bar: 'from-violet-500 to-purple-500',
    perms: ['Create & manage projects', 'View all transactions', 'Monitor project budgets', 'Update project status', 'Weekly & monthly reports', 'View team activity'],
  },
  {
    name: 'HR',
    tagline: 'People & forms',
    badge: 'bg-amber-500/10 text-amber-700 border border-amber-300',
    bar: 'from-amber-500 to-yellow-500',
    perms: ['Build & edit custom forms', 'Share forms via QR code', 'Review form submissions', 'Upload attendance sheets', 'Access HR dashboard', 'Read-only financial view'],
  },
  {
    name: 'Employee',
    tagline: 'Personal finance view',
    badge: 'bg-emerald-500/10 text-emerald-700 border border-emerald-300',
    bar: 'from-emerald-500 to-green-500',
    perms: ['Log personal transactions', 'View own transactions only', 'Fill out company forms', 'View monthly attendance calendar', 'View project list', 'Personal dashboard'],
  },
  {
    name: 'Viewer',
    tagline: 'Read-only access',
    badge: 'bg-slate-500/10 text-slate-700 border border-slate-300',
    bar: 'from-slate-400 to-slate-500',
    perms: ['View transactions', 'Browse projects', 'See budget overview', 'Access reports', 'View notifications', 'No edit permissions'],
  },
];

const steps = [
  { number: '01', title: 'Register Your Company', desc: 'Sign up with your mobile number and company name. You become the Admin automatically — no setup wizard.' },
  { number: '02', title: 'Invite Your Team', desc: 'Add employees, managers, HR and finance staff. Everyone gets exactly the role they need.' },
  { number: '03', title: 'Track & Analyse', desc: 'Log transactions, set budgets, create projects and watch real-time charts as your finances unfold.' },
];

const guide = [
  { title: 'Logging a Transaction', steps: ['Go to Transactions in the sidebar.', 'Click "Add Transaction" — amount, type, category, date, optional note.', 'Attach a receipt screenshot and link to a project.', 'Submit — it appears instantly and budgets / project stats update.'] },
  { title: 'Setting Up a Budget', steps: ['Open Budget Tracker in the sidebar.', 'Click "Add Budget" and pick a category.', 'Enter amount, month, year and an alert threshold (default 80%).', 'Get warned automatically as spending nears the limit.'] },
  { title: 'Managing Projects', steps: ['Admins & Managers create projects from the Projects page.', 'Set name, description and total budget.', 'Team members link transactions to the project.', 'Dashboard shows spent, remaining and % used in real time.'] },
  { title: 'Inviting Team Members', steps: ['Go to User Management from the sidebar.', 'Click "Add User" — name, mobile number, password.', 'Assign a role: Admin, Finance, Manager, HR, Employee or Viewer.', 'They log in instantly with mobile number + password.'] },
  { title: 'Sharing a Form via QR', steps: ['Build a form from Forms → Create Form, or edit an existing one.', 'Click the QR icon on any form card.', 'Scan, copy or download the generated QR code.', 'Anyone who scans can fill it — no login — and HR gets an email.'] },
  { title: 'Uploading Attendance', steps: ['HR uploads a daily attendance spreadsheet (Excel/CSV).', 'The system works out present, absent, half-day and late.', 'Every employee sees their own colour-coded monthly calendar.', 'Days before first upload show blank — no false absences.'] },
];

/* ─────────────────────────────────────────────────────────────
   Little building blocks
───────────────────────────────────────────────────────────── */
const LedgerRow = ({ label, amount, sign, delay }) => (
  <div className="flex items-center justify-between gap-3 py-1.5 border-b border-slate-200 text-xs" style={{ animationDelay: `${delay}ms` }}>
    <span className="text-slate-500 truncate">{label}</span>
    <span className={`font-mono font-semibold flex-shrink-0 ${sign === '+' ? 'text-emerald-600' : 'text-rose-600'}`}>
      {sign}₹{amount}
    </span>
  </div>
);

const Stamp = ({ children, className = '' }) => (
  <span
    className={`inline-block -rotate-6 border-2 border-dashed px-3 py-1 font-mono text-[11px] uppercase tracking-widest ${className}`}
  >
    {children}
  </span>
);

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-slate-800 overflow-x-hidden">
      <style>{styles}</style>

      {/* ── Ticker tape (top) ─────────────────────────────── */}
      <div className="bg-brand-400 text-black overflow-hidden border-b-2 border-black">
        <div className="ff-marquee flex whitespace-nowrap w-max">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center">
              {ticker.map((t, i) => (
                <span key={i} className="flex items-center font-mono text-[11px] font-bold tracking-wider px-4 py-1.5">
                  {t}
                  <FaBolt className="w-3 h-3 ml-6 text-black/60" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Navbar ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-brand-400/25 bg-[#f7f5f0]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/landing" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-brand-400 text-black rounded-lg flex items-center justify-center font-black text-lg shadow-[3px_3px_0_#d9770655] group-hover:rotate-6 transition-transform">
              ₹
            </div>
            <div className="leading-none">
              <span className="block font-display text-xl font-bold text-slate-900 tracking-tight">FinanceFlow</span>
              <span className="block font-mono text-[9px] tracking-[0.35em] text-brand-600/90 uppercase">Company Ledger</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-brand-700 transition-colors">Modules</a>
            <a href="#how" className="hover:text-brand-700 transition-colors">How it works</a>
            <a href="#roles" className="hover:text-brand-700 transition-colors">Roles</a>
            <a href="#guide" className="hover:text-brand-700 transition-colors">Guide</a>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="text-slate-700 hover:text-brand-700 text-sm font-medium transition-colors">
              Sign In
            </Link>
            <Link
              to="/login"
              className="bg-brand-400 hover:bg-brand-300 text-black text-sm font-bold px-5 py-2.5 rounded-lg shadow-[3px_3px_0_#d9770644] hover:shadow-[1px_1px_0_#d9770644] hover:-translate-y-0.5 transition-all"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fffaf0] to-[#f7f5f0]">
        {/* background */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.5]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(217,119,6,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(217,119,6,0.06) 1px, transparent 1px)',
              backgroundSize: '46px 46px',
            }}
          />
          <div className="absolute -top-32 -right-24 w-[500px] h-[500px] rounded-full blur-3xl bg-brand-300/30" />
          <div className="absolute bottom-0 -left-32 w-[480px] h-[480px] rounded-full blur-3xl bg-amber-200/40" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-brand-400/[0.08] font-black text-[28rem] leading-none select-none hidden lg:block ff-spin">
            ₹
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-10 items-center">
            {/* copy */}
            <div>
              <div className="ff-rise inline-flex items-center gap-2.5 border border-brand-500/40 bg-brand-500/10 px-4 py-1.5 rounded-full mb-8">
                <span className="w-2 h-2 rounded-full bg-brand-500 ff-blink" />
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-700">
                  Built for Indian businesses
                </span>
              </div>

              <h1 className="ff-rise font-display font-bold leading-[0.95] tracking-tight" style={{ animationDelay: '80ms' }}>
                <span className="block text-5xl sm:text-6xl xl:text-7xl text-slate-900">MASTER</span>
                <span className="block text-5xl sm:text-6xl xl:text-7xl mt-1 bg-gradient-to-r from-amber-600 via-brand-500 to-amber-600 bg-clip-text text-transparent">
                  YOUR MONEY
                </span>
                <span
                  className="block text-5xl sm:text-6xl xl:text-7xl mt-1 text-transparent"
                  style={{ WebkitTextStroke: '1.5px #1e293b' }}
                >
                  LIKE A PRO
                </span>
              </h1>

              <p className="ff-rise mt-8 text-slate-600 text-lg max-w-lg leading-relaxed" style={{ animationDelay: '160ms' }}>
                Ledger, budgets, projects, HR forms and attendance — live in one secure app.
                Made for companies that run on WhatsApp, Excel and gut feel.
              </p>

              <div className="ff-rise mt-9 flex flex-col sm:flex-row gap-4" style={{ animationDelay: '240ms' }}>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2.5 bg-brand-400 hover:bg-brand-300 text-black font-bold px-8 py-4 rounded-xl text-lg shadow-[5px_5px_0_#d9770644] hover:shadow-[2px_2px_0_#d9770644] hover:-translate-y-0.5 transition-all"
                >
                  Start Free — 30 seconds <FaArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-brand-500 text-slate-800 font-semibold px-8 py-4 rounded-xl text-lg transition-all"
                >
                  See the Ledger <FaCoins className="w-4 h-4 text-brand-600" />
                </a>
              </div>

              <p className="ff-rise mt-5 font-mono text-xs text-slate-500" style={{ animationDelay: '320ms' }}>
                NO CREDIT CARD · NO SETUP WIZARD · JUST YOUR MOBILE NUMBER
              </p>

              {/* mini trust strip */}
              <div className="ff-rise mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-mono uppercase tracking-wider text-slate-500" style={{ animationDelay: '400ms' }}>
                <span>✓ Multi-tenant secure</span>
                <span>✓ Real email alerts</span>
                <span>✓ 6 user roles</span>
              </div>
            </div>

            {/* terminal mockup */}
            <div className="relative">
              <div className="ff-drift absolute -top-10 -right-6 w-24 h-24 rounded-full bg-brand-400/20 blur-2xl" />
              <div className="relative ff-rise" style={{ animationDelay: '200ms' }}>
                <div className="absolute -inset-1 bg-gradient-to-br from-brand-400/60 via-transparent to-transparent rounded-3xl blur-lg opacity-70" />
                <div className="relative bg-white border border-brand-400/30 rounded-3xl shadow-2xl shadow-amber-900/15 overflow-hidden">
                  {/* terminal header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-400" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase">FinanceFlow // Live Ledger</span>
                    <span className="font-mono text-[10px] text-emerald-600 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ff-blink" /> LIVE
                    </span>
                  </div>

                  <div className="p-5">
                    {/* sparkline */}
                    <div className="mb-5">
                      <div className="flex items-end justify-between mb-1">
                        <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Net balance</span>
                        <span className="font-mono text-xl font-bold text-amber-600">₹8,42,110.50</span>
                      </div>
                      <svg viewBox="0 0 320 60" className="w-full h-16" preserveAspectRatio="none">
                        <path
                          d="M0,50 L30,44 L55,48 L80,38 L105,42 L130,30 L155,34 L180,22 L205,28 L230,16 L255,20 L280,10 L305,14 L320,6"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          className="ff-draw"
                          strokeLinecap="round"
                        />
                        <path
                          d="M0,50 L30,44 L55,48 L80,38 L105,42 L130,30 L155,34 L180,22 L205,28 L230,16 L255,20 L280,10 L305,14 L320,6 L320,60 L0,60 Z"
                          fill="url(#ffArea)"
                          opacity="0.2"
                        />
                        <defs>
                          <linearGradient id="ffArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* bar chart */}
                    <div className="flex items-end gap-2 h-24 mb-5">
                      {[42, 66, 38, 84, 55, 92, 48, 74, 60, 88, 70, 96].map((h, i) => (
                        <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-400 to-amber-500 ff-bar" style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }} />
                      ))}
                    </div>

                    {/* ledger rows */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between px-1 pb-1 font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400">
                        <span>Last entries</span><span>Status</span>
                      </div>
                      <LedgerRow label="Client payment — M/s Sharma & Co" amount="2,15,000" sign="+" delay={300} />
                      <LedgerRow label="Office rent — Sector 62, Noida" amount="85,000" sign="-" delay={500} />
                      <LedgerRow label="Payroll run — 14 employees" amount="4,82,000" sign="-" delay={700} />
                      <LedgerRow label="GST refund credited" amount="31,240" sign="+" delay={900} />
                    </div>
                  </div>
                </div>

                {/* floating stickers */}
                <div className="absolute -bottom-5 -left-4 sm:-left-8 bg-brand-400 text-black font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-2 rounded-md shadow-lg rotate-[-6deg]">
                  Budget alert @ 86%
                </div>
                <div className="absolute -top-5 -right-2 sm:-right-6 bg-emerald-500 text-white font-mono text-[10px] font-bold tracking-widest uppercase px-3 py-2 rounded-md shadow-lg rotate-[6deg]">
                  Invoice #214 settled
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker band ───────────────────────────────────── */}
      <section className="border-y-2 border-black bg-gradient-to-r from-amber-500 via-brand-400 to-amber-500 text-black overflow-hidden py-3">
        <div className="ff-marquee flex whitespace-nowrap w-max">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center">
              {['REAL-TIME ANALYTICS', 'BUDGET ALERTS', 'PROJECT LEDGERS', 'HR FORM BUILDER', 'QR FORM SHARING', 'ATTENDANCE TRACKING', 'EXCEL EXPORT', 'ROLE-BASED ACCESS'].map((t, i) => (
                <span key={i} className="flex items-center font-display font-bold uppercase tracking-wider text-sm px-5">
                  {t}
                  <FaRupeeSign className="w-3.5 h-3.5 ml-5 text-black/60" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats band ────────────────────────────────────── */}
      <section className="py-16 md:py-20 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 7, suffix: '', label: 'User roles', sub: 'from Admin to Viewer' },
              { value: 11, suffix: '+', label: 'Core modules', sub: 'one login, everything' },
              { value: 24, suffix: '×7', label: 'Live tracking', sub: 'charts update instantly' },
              { value: 100, suffix: '%', label: 'Data isolation', sub: 'per company, guaranteed' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 100} className="text-center">
                <p className="font-display text-5xl md:text-6xl font-bold text-amber-600">
                  <CountUp value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-slate-700">{s.label}</p>
                <p className="mt-1 text-xs text-slate-500">{s.sub}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="relative py-24 md:py-28">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-amber-400/[0.04] to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <Stamp className="text-amber-700 border-amber-600/50 mb-5">The toolkit</Stamp>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              EVERYTHING YOUR TEAM NEEDS.
              <span className="block mt-2 text-amber-600">NOTHING THEY DON'T.</span>
            </h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto mt-5">
              A complete toolkit for tracking, analysing and managing company finances — no spreadsheets required.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <Reveal key={i} delay={(i % 3) * 90}>
                <div className={`group relative h-full rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/70 hover:shadow-[0_16px_48px_rgba(180,83,9,0.12)]`}>
                  <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${f.accent}`}>
                      <f.icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-[11px] text-slate-400 group-hover:text-amber-600 transition-colors">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                  <div className="absolute bottom-0 left-0 h-1 w-0 bg-amber-500 group-hover:w-full transition-all duration-500" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section id="how" className="py-24 md:py-28 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-20">
            <Stamp className="text-amber-700 border-amber-600/50 mb-5">Zero friction</Stamp>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              UP AND RUNNING IN <span className="text-amber-600">3 STEPS.</span>
            </h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto mt-5">
              From sign-up to full financial visibility in minutes, not hours.
            </p>
          </Reveal>

          <div className="relative grid md:grid-cols-3 gap-12 md:gap-8">
            <div className="hidden md:block absolute top-10 left-[18%] right-[18%] h-0.5 bg-gradient-to-r from-amber-400/10 via-amber-500/50 to-amber-400/10" />
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 150} className="relative text-center">
                <div className="relative z-10 mx-auto w-20 h-20 rounded-2xl bg-white border-2 border-amber-500/60 flex items-center justify-center shadow-[6px_6px_0_rgba(217,119,6,0.25)] mb-6 rotate-[-3deg] hover:rotate-0 transition-transform">
                  <span className="font-display text-2xl font-black text-amber-600">{step.number}</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                {i < steps.length - 1 && (
                  <FaArrowRight className="hidden md:block absolute top-8 -right-7 text-amber-500/50 w-5 h-5" />
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles ──────────────────────────────────────────── */}
      <section id="roles" className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute -top-20 right-0 text-amber-600/[0.05] font-black text-[16rem] leading-none select-none">R</div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <Stamp className="text-amber-700 border-amber-600/50 mb-5">Six seats, one table</Stamp>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              BUILT FOR <span className="text-amber-600">EVERY</span> TEAM MEMBER.
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto mt-5">
              Six distinct roles ensure each person sees and does exactly what their job requires — nothing more, nothing less.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {roles.map((role, i) => (
              <Reveal key={i} delay={(i % 3) * 90}>
                <div className="group relative h-full rounded-2xl border-2 border-slate-200 bg-white p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-lg">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${role.bar} opacity-80 group-hover:opacity-100 transition-opacity`} />
                  <div className="flex items-start justify-between mb-6">
                    <h3 className="font-display text-2xl font-bold text-slate-900">{role.name}</h3>
                    <span className={`text-[10px] font-semibold px-3 py-1 rounded-full whitespace-nowrap ${role.badge}`}>
                      {role.tagline}
                    </span>
                  </div>
                  <ul className="space-y-2.5">
                    {role.perms && role.perms.map((p, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <FaCheck className="text-amber-600 flex-shrink-0 w-3 h-3 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Usage guide ────────────────────────────────────── */}
      <section id="guide" className="py-24 md:py-28 bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-16">
            <Stamp className="text-amber-700 border-amber-600/50 mb-5">Read me</Stamp>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              THE <span className="text-amber-600">WALKTHROUGH.</span>
            </h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto mt-5">
              The most important workflows in the platform, explained in plain language.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-5">
            {guide.map((section, i) => (
              <Reveal key={i} delay={(i % 2) * 100}>
                <div className="h-full rounded-2xl border-2 border-slate-200 bg-white p-6 hover:border-amber-500/60 transition-colors">
                  <h3 className="flex items-center gap-3 font-display text-lg font-bold text-slate-900 mb-5">
                    <span className="font-mono text-xs text-black bg-brand-400 font-bold w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-[2px_2px_0_#d9770644]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {section.title}
                  </h3>
                  <ol className="space-y-2.5">
                    {section.steps.map((s, j) => (
                      <li key={j} className="flex gap-2.5 text-sm text-slate-600 leading-relaxed">
                        <span className="font-mono text-[10px] text-amber-600/80 pt-1 flex-shrink-0">{j + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="relative py-28 md:py-36 overflow-hidden bg-gradient-to-br from-brand-400 via-amber-400 to-amber-500">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:
            'radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }} />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <Reveal>
            <h2 className="font-display text-4xl md:text-7xl font-bold leading-[1.02] tracking-tight text-slate-900">
              MONEY TALKS.
              <span className="block text-black mt-2">
                GIVE IT A LEDGER.
              </span>
            </h2>
            <p className="text-slate-800/90 text-lg md:text-xl max-w-2xl mx-auto mt-7 font-medium">
              Register your company and invite your team today. No credit card — just your mobile number.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-9 py-4 rounded-xl text-lg shadow-[5px_5px_0_rgba(0,0,0,0.25)] hover:shadow-[2px_2px_0_rgba(0,0,0,0.25)] hover:-translate-y-0.5 transition-all"
              >
                Get Started Now <FaArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2.5 border-2 border-slate-900/70 hover:border-slate-900 text-slate-900 font-semibold px-9 py-4 rounded-xl text-lg transition-all"
              >
                Create Account
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Stamp className="text-slate-800 border-slate-800/60 rotate-[-4deg]">No credit card</Stamp>
              <Stamp className="text-emerald-800 border-emerald-800/60 rotate-[3deg]">Mobile number only</Stamp>
              <Stamp className="text-slate-900 border-slate-900/60 rotate-[-2deg]">Setup in 30 sec</Stamp>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 bg-[#f7f5f0] pt-16 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-400 text-black rounded-lg flex items-center justify-center font-black text-xl">₹</div>
              <div className="leading-none">
                <span className="block font-display text-xl font-bold text-slate-900">FinanceFlow</span>
                <span className="block font-mono text-[9px] tracking-[0.35em] text-brand-600/90 uppercase">Company Ledger</span>
              </div>
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500 text-center">
              Made for Indian businesses · GST to payroll
            </p>
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} FinanceFlow. Company finance management made simple.
            </p>
            <div className="flex gap-8 text-sm">
              <Link to="/login" className="text-slate-600 hover:text-amber-700 transition-colors">Sign In</Link>
              <Link to="/register" className="text-slate-600 hover:text-amber-700 transition-colors">Register</Link>
              <a href="#features" className="text-slate-600 hover:text-amber-700 transition-colors">Modules</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
