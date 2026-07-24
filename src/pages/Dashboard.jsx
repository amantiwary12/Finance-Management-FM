import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import transactionService from "../services/transactions";
import budgetService from "../services/budget";
import {
  FaArrowUp, FaArrowDown, FaWallet, FaProjectDiagram,
  FaMoneyBillWave, FaChartPie, FaBell, FaArrowRight,
} from "react-icons/fa";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 sm:p-5 flex items-center gap-4">
    <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      transactionService.getSummary(),
      transactionService.getTransactions({ limit: 5 }),
      budgetService.getBudgets(),
    ]).then(([s, t, b]) => {
      if (s.status === "fulfilled") setSummary(s.value.data?.data || s.value.data || {});
      if (t.status === "fulfilled") {
        const txData = t.value.data?.transactions || t.value.data?.data || t.value.data || [];
        setTransactions(Array.isArray(txData) ? txData : []);
      }
      if (b.status === "fulfilled") {
        const budgetData = b.value.data?.budgets || b.value.data?.data || b.value.data || [];
        setBudgets((Array.isArray(budgetData) ? budgetData : []).slice(0, 4));
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-white rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-white rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-white rounded-xl" />
          <div className="h-64 bg-white rounded-xl" />
        </div>
      </div>
    );
  }

  const txList = Array.isArray(transactions) ? transactions : [];
  const budgetList = Array.isArray(budgets) ? budgets : [];

  return (
    <div className="space-y-5">
      {/* Greeting banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-xl p-5 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="relative">
          <p className="text-blue-300 text-sm font-medium mb-1">
            {greeting()}, {user?.name?.split(" ")[0]}
          </p>
          <h2 className="text-xl sm:text-2xl font-bold">Here's your financial overview</h2>
          <p className="text-slate-400 text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={FaArrowUp}   label="Total Income"  value={fmt(summary.totalIncome)}  color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={FaArrowDown} label="Total Expense" value={fmt(summary.totalExpense)} color="text-red-500"     bg="bg-red-50"     />
        <StatCard icon={FaWallet}    label="Balance"       value={fmt(summary.balance)}       color="text-blue-600"   bg="bg-blue-50"    />
      </div>

      {/* Transactions + Budget grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">Recent Transactions</h3>
            <Link to="/transactions" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View all <FaArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          {txList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <FaMoneyBillWave className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-600">No transactions yet</p>
              <Link to="/transactions" className="mt-3 text-xs text-blue-600 font-semibold hover:underline">
                Add Transaction →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {txList.map((tx) => (
                <li key={tx._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.type === "income" ? "bg-emerald-50" : "bg-red-50"
                    }`}>
                      {tx.type === "income"
                        ? <FaArrowUp className="w-3 h-3 text-emerald-600" />
                        : <FaArrowDown className="w-3 h-3 text-red-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{tx.description || tx.title || "Transaction"}</p>
                      <p className="text-xs text-slate-400">{new Date(tx.date || tx.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ml-3 ${
                    tx.type === "income" ? "text-emerald-600" : "text-red-500"
                  }`}>
                    {tx.type === "income" ? "+" : "−"}{fmt(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm">Budget Overview</h3>
            <Link to="/budget" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              View all <FaArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          {budgetList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <FaChartPie className="w-5 h-5 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-600">No budgets set</p>
              <p className="text-xs text-slate-400 mt-1">Ask your manager to create budget plans</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {budgetList.map((b) => {
                const spent = b.spent || 0;
                const limit = b.amount || b.limit || 1;
                const pct = Math.min(Math.round((spent / limit) * 100), 100);
                const over = pct >= 100;
                const warn = pct >= 80;
                return (
                  <li key={b._id} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-slate-800 truncate">{b.name || b.category}</p>
                      <span className={`text-xs font-bold ml-2 ${over ? "text-red-600" : warn ? "text-amber-600" : "text-slate-500"}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${over ? "bg-red-500" : warn ? "bg-amber-400" : "bg-blue-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">{fmt(spent)} spent of {fmt(limit)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: "/transactions", icon: FaMoneyBillWave,  label: "Add Transaction",  bg: "bg-blue-50",    color: "text-blue-600"    },
            { to: "/budget",       icon: FaChartPie,        label: "View Budget",       bg: "bg-purple-50",  color: "text-purple-600"  },
            { to: "/projects",     icon: FaProjectDiagram,  label: "My Projects",       bg: "bg-emerald-50", color: "text-emerald-600" },
            { to: "/notifications",icon: FaBell,            label: "Notifications",     bg: "bg-amber-50",   color: "text-amber-600"   },
          ].map(({ to, icon: Icon, label, bg, color }) => (
            <Link
              key={to}
              to={to}
              className="bg-white border border-slate-100 rounded-xl p-4 flex flex-col items-center gap-2.5 hover:border-blue-200 hover:shadow-sm transition-all text-center"
            >
              <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="text-xs font-medium text-slate-600">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
