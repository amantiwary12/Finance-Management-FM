import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers, FaBuilding, FaMoneyBillWave, FaChartLine,
  FaProjectDiagram, FaWallet, FaShoppingCart, FaUserPlus,
  FaSpinner, FaCalendarWeek, FaCalendarAlt, FaSync, FaDatabase,
  FaChartPie, FaArrowRight
} from 'react-icons/fa';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import transactionService from '../../services/transactions';
import projectService from '../../services/projects';
import userService from '../../services/userService';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalProjects: 0,
    totalIncome: 0, totalExpense: 0,
    balance: 0, activeProjects: 0
  });
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchedRef = useRef(false);
  const abortControllerRef = useRef(null);

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const fetchWeeklyChartData = useCallback(async () => {
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      const response = await transactionService.getDailyExpenses(startOfWeek.toISOString(), endOfWeek.toISOString());
      const dailyMap = {};
      days.forEach(day => { dailyMap[day] = 0; });
      if (response.data?.success && response.data.data) {
        response.data.data.forEach(item => {
          const date = new Date(item._id);
          const dayIndex = date.getDay();
          const mondayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
          dailyMap[days[mondayIndex]] = (dailyMap[days[mondayIndex]] || 0) + item.total;
        });
      }
      setWeeklyChartData(days.map(day => ({ day, amount: dailyMap[day] })));
    } catch {
      setWeeklyChartData(days.map(day => ({ day, amount: 0 })));
    }
  }, []);

  const fetchWeeklySummaryData = useCallback(async () => {
    try {
      const response = await transactionService.getWeeklySummary();
      if (response.data?.success) {
        setWeeklySummary({
          income: response.data.income || 0,
          expense: response.data.expense || 0,
          balance: response.data.balance || 0
        });
      }
    } catch {
      setWeeklySummary(null);
    }
  }, []);

  const fetchMonthlyData = useCallback(async () => {
    try {
      const currentDate = new Date();
      const monthsArray = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(currentDate.getMonth() - i);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const monthName = monthNames[date.getMonth()];
        try {
          const response = await transactionService.getMonthlySummary(month, year);
          monthsArray.push({
            name: `${monthName} ${year.toString().slice(-2)}`,
            month: monthName, year, monthNumber: month,
            income: response.data?.income || 0,
            expense: response.data?.expense || 0,
            balance: (response.data?.income || 0) - (response.data?.expense || 0)
          });
        } catch {
          monthsArray.push({ name: `${monthName} ${year.toString().slice(-2)}`, month: monthName, year, monthNumber: month, income: 0, expense: 0, balance: 0 });
        }
      }
      setMonthlyData(monthsArray);
    } catch {
      setMonthlyData([]);
    }
  }, []);

  const fetchCategoryData = useCallback(async () => {
    try {
      const response = await transactionService.getCategorySummary();
      if (response.data?.success && response.data.summary) {
        setCategoryData(response.data.summary.map(item => ({
          name: item._id, value: item.total,
          amount: formatCurrency(item.total), count: item.count
        })));
      } else {
        setCategoryData([]);
      }
    } catch {
      setCategoryData([]);
    }
  }, []);

  const fetchTransactionsData = useCallback(async () => {
    try {
      const recentResponse = await transactionService.getTransactions({ limit: 5 });
      setRecentTransactions(recentResponse.data?.transactions || []);
      const allResponse = await transactionService.getTransactions({ limit: 1000 });
      const transactions = allResponse.data?.transactions || [];
      let totalIncome = 0, totalExpense = 0;
      for (const t of transactions) {
        if (t.type === 'income') totalIncome += t.amount || 0;
        else if (t.type === 'expense') totalExpense += t.amount || 0;
      }
      return { totalIncome, totalExpense };
    } catch {
      return { totalIncome: 0, totalExpense: 0 };
    }
  }, []);

  const fetchAdminData = useCallback(async (isRefresh = false) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const [usersRes, projectsRes] = await Promise.all([
        userService.getAllUsers().catch(() => ({ data: { users: [] } })),
        projectService.getAllProjects().catch(() => ({ data: { projects: [] } }))
      ]);
      const users = usersRes?.data?.users || [];
      const projects = projectsRes?.data?.projects || [];
      const { totalIncome, totalExpense } = await fetchTransactionsData();
      setStats({
        totalUsers: users.length, totalProjects: projects.length,
        totalIncome, totalExpense, balance: totalIncome - totalExpense,
        activeProjects: projects.filter(p => p.status === 'active').length
      });
      await Promise.all([fetchWeeklyChartData(), fetchWeeklySummaryData(), fetchMonthlyData(), fetchCategoryData()]);
      setCompanyInfo(JSON.parse(localStorage.getItem('company') || '{}'));
    } catch {
      setError('Failed to load dashboard data. Please check your connection.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchTransactionsData, fetchWeeklyChartData, fetchWeeklySummaryData, fetchMonthlyData, fetchCategoryData]);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchAdminData();
    }
    return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
  }, [fetchAdminData]);

  const handleRefresh = () => fetchAdminData(true);

  const statCards = useMemo(() => [
    { title: 'Total Users',     value: stats.totalUsers,                  icon: FaUsers,          color: 'text-blue-600',   bg: 'bg-blue-50',   link: '/users' },
    { title: 'Total Projects',  value: stats.totalProjects,               icon: FaProjectDiagram, color: 'text-purple-600', bg: 'bg-purple-50', link: '/projects' },
    { title: 'Total Income',    value: formatCurrency(stats.totalIncome),  icon: FaWallet,         color: 'text-emerald-600',bg: 'bg-emerald-50' },
    { title: 'Total Expense',   value: formatCurrency(stats.totalExpense), icon: FaShoppingCart,   color: 'text-red-500',    bg: 'bg-red-50' },
    { title: 'Net Balance',     value: formatCurrency(stats.balance),      icon: FaChartLine,      color: stats.balance >= 0 ? 'text-emerald-600' : 'text-red-500', bg: stats.balance >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
    { title: 'Active Projects', value: stats.activeProjects,               icon: FaProjectDiagram, color: 'text-amber-600',  bg: 'bg-amber-50',  link: '/projects' },
  ], [stats]);

  const hasWeeklyData  = weeklyChartData.some(d => d.amount > 0);
  const hasMonthlyData = monthlyData.some(d => d.income > 0 || d.expense > 0);
  const hasCategoryData = categoryData.length > 0;

  const tooltipStyle = { borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontSize: '12px' };

  // ── Loading skeleton ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-24 bg-white rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-24 bg-white rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl" />)}
        </div>
        <div className="h-80 bg-white rounded-xl" />
        <div className="h-96 bg-white rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-72 bg-white rounded-xl" />
          <div className="h-72 bg-white rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-xl p-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-300 text-xs font-medium uppercase tracking-wider mb-1">Admin</p>
            <h1 className="text-xl sm:text-2xl font-bold">Company Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Financial overview for {companyInfo?.name || 'your company'}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg px-4 py-2 text-sm font-medium transition-all disabled:opacity-50"
            >
              <FaSync className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm">
              <FaBuilding className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[140px]">{companyInfo?.name || 'Your Company'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <FaDatabase className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">{error}</p>
              <p className="text-xs text-red-500 mt-0.5">Check if the backend is running at http://localhost:8000</p>
            </div>
          </div>
          <button onClick={handleRefresh} className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-medium transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md hover:border-slate-200 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">{card.title}</p>
            <p className={`text-lg font-bold mt-0.5 leading-tight ${card.color}`}>{card.value}</p>
            {card.link && (
              <Link to={card.link} className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline">
                Details <FaArrowRight className="w-2 h-2" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Weekly summary mini-cards */}
      {weeklySummary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaWallet className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Weekly Income</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(weeklySummary.income)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FaShoppingCart className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Weekly Expense</p>
              <p className="text-lg font-bold text-red-500">{formatCurrency(weeklySummary.expense)}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${weeklySummary.balance >= 0 ? 'bg-blue-50' : 'bg-amber-50'}`}>
              <FaChartLine className={`w-4 h-4 ${weeklySummary.balance >= 0 ? 'text-blue-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Weekly Balance</p>
              <p className={`text-lg font-bold ${weeklySummary.balance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>{formatCurrency(weeklySummary.balance)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Weekly bar chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <FaCalendarWeek className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Daily Expenses</h3>
              <p className="text-xs text-slate-400">This week (Mon – Sun)</p>
            </div>
          </div>
        </div>
        {hasWeeklyData ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyChartData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={tooltipStyle} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Daily Expense" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-14">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCalendarWeek className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600">No expense data for this week</p>
            <p className="text-xs text-slate-400 mt-1">Add expense transactions to see daily trends</p>
          </div>
        )}
      </div>

      {/* Monthly area chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
            <FaCalendarAlt className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Income vs Expense</h3>
            <p className="text-xs text-slate-400">Last 6 months</p>
          </div>
        </div>
        {hasMonthlyData ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ paddingTop: '16px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="income"  stroke="#10b981" strokeWidth={2} fill="url(#incomeGradient)"  name="Income"  dot={{ r: 3, fill: '#10b981' }} />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGradient)" name="Expense" dot={{ r: 3, fill: '#ef4444' }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-14">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaCalendarAlt className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-600">No monthly data available</p>
            <p className="text-xs text-slate-400 mt-1">Add transactions to see monthly trends</p>
          </div>
        )}
      </div>

      {/* Category pie + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category pie */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
              <FaChartPie className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Spending by Category</h3>
              <p className="text-xs text-slate-400">Expense breakdown</p>
            </div>
          </div>
          {hasCategoryData ? (
            <div className="flex flex-col gap-4">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryData} cx="50%" cy="50%"
                    innerRadius={60} outerRadius={95}
                    paddingAngle={3} dataKey="value"
                    label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={false}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs font-medium text-slate-700 truncate">{cat.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="text-xs font-bold text-slate-800">{cat.amount}</span>
                      <p className="text-[10px] text-slate-400">{cat.count} txns</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-14">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaShoppingCart className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-600">No expense data yet</p>
              <p className="text-xs text-slate-400 mt-1">Add expense transactions to see category breakdown</p>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Recent Transactions</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest company transactions</p>
            </div>
            <Link to="/transactions" className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
              View All <FaArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaMoneyBillWave className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-600">No transactions found</p>
                <p className="text-xs text-slate-400 mt-1">Add a transaction to get started</p>
              </div>
            ) : recentTransactions.map((tx) => (
              <div key={tx._id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'income' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <FaMoneyBillWave className={`w-3.5 h-3.5 ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{tx.receiver || tx.note || 'Transaction'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString('en-IN')}</span>
                      {tx.category && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{tx.category}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize mt-0.5">{tx.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/users',        icon: FaUserPlus,       label: 'Manage Users',    sub: 'Add or edit employees',    bg: 'bg-blue-50',    color: 'text-blue-600'    },
            { to: '/projects',     icon: FaProjectDiagram, label: 'Manage Projects', sub: 'Track project progress',   bg: 'bg-purple-50',  color: 'text-purple-600'  },
            { to: '/transactions', icon: FaMoneyBillWave,  label: 'Transactions',    sub: 'Add or view transactions', bg: 'bg-emerald-50', color: 'text-emerald-600' },
            { to: '/budget',       icon: FaChartLine,      label: 'Budget Overview', sub: 'Monitor category budgets', bg: 'bg-amber-50',   color: 'text-amber-600'   },
          ].map(({ to, icon: Icon, label, sub, bg, color }) => (
            <Link
              key={to} to={to}
              className="bg-white border border-slate-100 rounded-xl p-4 hover:border-slate-200 hover:shadow-sm transition-all"
            >
              <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
