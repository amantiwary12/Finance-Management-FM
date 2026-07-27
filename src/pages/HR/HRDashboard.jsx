import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFileAlt, FaClipboardList, FaPlus, FaEye,
  FaCheckCircle, FaClock, FaUsers, FaUserPlus, FaArrowRight,
} from 'react-icons/fa';
import formService from '../../services/formService';
import toast from 'react-hot-toast';
import { useSocketEvent } from '../../hooks/useSocketEvent';

const STATUS_STYLES = {
  pending:  "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  rejected: "bg-red-50 text-red-600 ring-1 ring-red-200",
};

const StatCard = ({ icon: Icon, label, value, accent, linkTo, linkLabel }) => (
  <div className={`bg-white rounded-xl border-l-4 ${accent} shadow-sm p-5`}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
    {linkTo && (
      <Link to={linkTo} className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
        {linkLabel} <FaArrowRight className="w-2.5 h-2.5" />
      </Link>
    )}
  </div>
);

const HRDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalForms: 0, pendingSubmissions: 0,
    approvedSubmissions: 0, totalSubmissions: 0,
  });

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [formsRes, subRes] = await Promise.all([
        formService.getAllForms(),
        formService.getAllSubmissions(),
      ]);
      const formsList = formsRes.data.forms || [];
      const subList   = subRes.data.submissions || [];
      setSubmissions(subList);
      setStats({
        totalForms:          formsList.length,
        pendingSubmissions:  subList.filter(s => s.status === 'pending').length,
        approvedSubmissions: subList.filter(s => s.status === 'approved').length,
        totalSubmissions:    subList.length,
      });
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Live updates — refresh when a form submission is created or reviewed.
  useSocketEvent('submission:created', fetchDashboardData);
  useSocketEvent('submission:updated', fetchDashboardData);

  const recent = submissions.slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-white rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-xl" />)}
        </div>
        <div className="h-48 bg-white rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-xl p-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">HR Dashboard</h1>
            <p className="text-blue-300 text-sm mt-1">Manage employee forms, applications, and submissions</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-lg px-4 py-2 self-start sm:self-auto">
            <FaUsers className="w-4 h-4" />
            <span className="text-sm font-medium">HR Portal</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FaFileAlt}       label="Total Forms"       value={stats.totalForms}           accent="border-blue-400"    linkTo="/forms"       linkLabel="View forms" />
        <StatCard icon={FaClock}         label="Pending Reviews"   value={stats.pendingSubmissions}   accent="border-amber-400"   linkTo="/submissions" linkLabel="Review now" />
        <StatCard icon={FaCheckCircle}   label="Approved"          value={stats.approvedSubmissions}  accent="border-emerald-400" />
        <StatCard icon={FaClipboardList} label="Total Submissions" value={stats.totalSubmissions}     accent="border-purple-400"  />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { gradient: "from-blue-500 to-blue-600",     Icon: FaPlus,     title: "Create New Form",      desc: "Design application forms, request forms, and surveys",                            to: "/forms/builder", btn: "Create Form",   clr: "text-blue-600"    },
          { gradient: "from-amber-500 to-orange-500",  Icon: FaEye,      title: "Review Submissions",   desc: `${stats.pendingSubmissions} pending submission${stats.pendingSubmissions !== 1 ? 's' : ''} waiting`, to: "/submissions",   btn: "Review Now",    clr: "text-orange-600"  },
          { gradient: "from-emerald-500 to-teal-500",  Icon: FaFileAlt,  title: "Manage Forms",         desc: `${stats.totalForms} active form${stats.totalForms !== 1 ? 's' : ''} available`, to: "/forms",         btn: "Manage Forms",  clr: "text-emerald-600" },
        ].map(({ gradient, Icon, title, desc, to, btn, clr }) => (
          <div key={to} className={`bg-gradient-to-br ${gradient} rounded-xl p-5 text-white flex flex-col`}>
            <Icon className="w-7 h-7 mb-3 opacity-90" />
            <h3 className="text-base font-bold mb-1">{title}</h3>
            <p className="text-white/70 text-sm mb-4 leading-relaxed flex-1">{desc}</p>
            <Link
              to={to}
              className={`inline-flex items-center gap-2 bg-white ${clr} self-start px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors`}
            >
              <Icon className="w-3.5 h-3.5" /> {btn}
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Submissions */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Recent Submissions</h2>
            <p className="text-xs text-slate-400 mt-0.5">Latest form submissions from employees</p>
          </div>
          <Link to="/submissions" className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
            View All <FaArrowRight className="w-2.5 h-2.5" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaClipboardList className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600">No submissions yet</p>
            <p className="text-xs text-slate-400 mt-1">When employees submit forms, they will appear here</p>
          </div>
        ) : (
          <>
            {/* Table — sm+ */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    {["Form", "Submitted By", "Date", "Status", "Action"].map(h => (
                      <th key={h} className="text-left py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recent.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 text-sm font-medium text-slate-800">{s.form?.title || 'Unknown Form'}</td>
                      <td className="py-3.5 px-5 text-sm text-slate-600">{s.submittedBy?.name || 'Unknown'}</td>
                      <td className="py-3.5 px-5 text-sm text-slate-400">{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[s.status] || STATUS_STYLES.pending}`}>
                          {s.status || 'pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <Link to="/submissions" className="text-sm text-blue-600 hover:text-blue-700 font-medium">Review</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards — mobile */}
            <ul className="sm:hidden divide-y divide-slate-50">
              {recent.map((s) => (
                <li key={s._id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{s.form?.title || 'Unknown Form'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.submittedBy?.name || 'Unknown'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(s.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[s.status] || STATUS_STYLES.pending}`}>
                      {s.status || 'pending'}
                    </span>
                  </div>
                  <Link to="/submissions" className="mt-2 text-xs text-blue-600 font-medium">Review →</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* HR Guide */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
          <FaUserPlus className="w-4 h-4 text-purple-600" /> HR Quick Guide
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: 1, c: "bg-blue-100 text-blue-700",    t: "Create Application Forms",  d: "Go to Forms → Create Form to design leave requests, expense claims, etc." },
            { n: 2, c: "bg-amber-100 text-amber-700",  t: "Review Submissions",         d: "Check pending submissions and approve/reject with feedback" },
            { n: 3, c: "bg-emerald-100 text-emerald-700", t: "Track History",           d: "View all submissions and approval history in one place" },
          ].map(({ n, c, t, d }) => (
            <div key={n} className="flex items-start gap-3">
              <div className={`w-7 h-7 ${c} rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold`}>{n}</div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{t}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
