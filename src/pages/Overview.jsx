import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  CheckCircle,
  Database,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Search,
  Layers,
  Loader2
} from 'lucide-react';

const barColors = ['bg-sky-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];

export default function Overview({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monthly Style Production Summary States
  const today = new Date();
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [styleSearch, setStyleSearch] = useState('');

  // 1. Fetch High-Level Dashboard Stats (Cards, 6-Month Chart, Recent Activities)
  useEffect(() => {
    fetch('/api/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setLoading(false);
      });
  }, [token]);

  // 2. Fetch Selected Month's Style Production Summary
  const fetchMonthlySummary = (monthKey) => {
    setLoadingSummary(true);
    fetch(`/api/stats/monthly-style-summary?month=${monthKey}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMonthlySummary(data);
        setLoadingSummary(false);
      })
      .catch(err => {
        console.error('Error fetching monthly summary:', err);
        setLoadingSummary(false);
      });
  };

  useEffect(() => {
    fetchMonthlySummary(selectedMonth);
  }, [selectedMonth, token]);

  if (loading) {
    return <div className="text-slate-400 flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> ড্যাশবোর্ড লোড হচ্ছে...</div>;
  }

  const cards = stats?.cards || [
    { title: 'TOTAL BUYERS', value: '0', change: 'নিবন্ধিত বায়ার', trend: 'up' },
    { title: 'ACTIVE STYLES', value: '0', change: 'চলতি স্টাইল', trend: 'up' },
    { title: 'TODAY PRODUCTION', value: '0 pcs', change: 'আজকের মোট উৎপাদন', trend: 'stable' },
    { title: 'ACTIVE EMPLOYEES', value: '0 জন', change: 'কারখানার স্টাফ', trend: 'up' }
  ];

  const productionOverview = stats?.productionOverview || [];
  const topBuyers = stats?.topBuyers || [];

  // Calculate total production across the 6 months
  const total6MonthQty = productionOverview.reduce((sum, item) => sum + (Number(item.totalQty) || 0), 0);

  // Dynamic max value calculation for chart scaling based on month total
  let maxVal = 100;
  productionOverview.forEach(item => {
    const qty = Number(item.totalQty) || 0;
    maxVal = Math.max(maxVal, qty);
  });
  maxVal = Math.ceil(maxVal * 1.25);

  const recentActivities = stats?.recentActivities || [];

  // Monthly navigation handlers
  const availableMonths = monthlySummary?.availableMonths || [];
  const currentIdx = availableMonths.findIndex(m => m.value === selectedMonth);

  const handlePrevMonth = () => {
    if (currentIdx !== -1 && currentIdx < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[currentIdx + 1].value);
    } else {
      const [y, m] = selectedMonth.split('-').map(Number);
      const prevDate = new Date(y, m - 2, 1);
      const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      setSelectedMonth(prevKey);
    }
  };

  const handleNextMonth = () => {
    if (currentIdx > 0) {
      setSelectedMonth(availableMonths[currentIdx - 1].value);
    } else {
      const [y, m] = selectedMonth.split('-').map(Number);
      const nextDate = new Date(y, m, 1);
      const nextKey = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
      setSelectedMonth(nextKey);
    }
  };

  const isNextDisabled = currentIdx === 0;

  // Filter styles by search term
  const filteredStyles = (monthlySummary?.styles || []).filter(s => {
    if (!styleSearch.trim()) return true;
    const q = styleSearch.toLowerCase().trim();
    return (
      s.style_no.toLowerCase().includes(q) ||
      (s.buyer_name && s.buyer_name.toLowerCase().includes(q)) ||
      (s.sections && s.sections.toLowerCase().includes(q))
    );
  });

  const topStyle = (monthlySummary?.styles || [])[0] || null;

  const getIcon = (title) => {
    switch (title) {
      case 'TOTAL BUYERS': return <Users size={22} />;
      case 'ACTIVE STYLES': return <FileText size={22} />;
      case 'TODAY PRODUCTION': return <CheckCircle size={22} />;
      case 'ACTIVE EMPLOYEES': return <Users size={22} />;
      default: return <Database size={22} />;
    }
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp size={16} className="text-emerald-400 mr-1 inline" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-rose-400 mr-1 inline" />;
    return <Minus size={16} className="text-slate-500 mr-1 inline" />;
  };

  const getCardColorClass = (trend) => {
    if (trend === 'up') return 'text-emerald-400';
    if (trend === 'down') return 'text-rose-400';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-8">
      {/* 1. Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-5 flex items-center justify-between shadow-xl" key={idx}>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
              <span className="text-2xl font-bold text-slate-100 mt-2 block font-display">{card.value}</span>
              <span className={`text-xs font-medium mt-1 ${getCardColorClass(card.trend)}`}>
                <span className="inline-flex items-center">
                  {getTrendIcon(card.trend)}
                  {card.change}
                </span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shadow-md">
              {getIcon(card.title)}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Dynamic Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic Production Chart for Last 6 Months */}
        <div className="lg:col-span-2 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <span className="text-lg font-semibold text-slate-100 block">প্রোডাকশন ওভারভিউ (গত ৬ মাস)</span>
              <span className="text-xs text-slate-400">মাসভিত্তিক মোট উৎপাদন পরিমাণ ও বায়ার ভিত্তিক পরিসংখ্যান (lbs)</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-semibold shrink-0">
              <span>৬ মাসের মোট:</span>
              <strong className="text-emerald-400 text-sm font-bold font-display">{total6MonthQty.toLocaleString()} lbs</strong>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 border-b border-white/10 pb-4 mb-4 mt-4 px-2">
            {productionOverview.map((item, index) => {
              const qty = Number(item.totalQty) || 0;
              const barHeight = Math.min(Math.max((qty / maxVal) * 100, qty > 0 ? 10 : 4), 100);

              return (
                <div className="flex-1 flex flex-col items-center h-full justify-end group relative" key={index}>
                  {/* Quantity Badge Above Each Bar */}
                  <div className={`text-[11px] font-semibold mb-2 px-2 py-0.5 rounded-md transition-all whitespace-nowrap shadow-sm ${qty > 0
                    ? 'text-sky-200 bg-sky-500/20 border border-sky-400/30 font-bold'
                    : 'text-slate-500 bg-white/5 border border-white/5'
                    }`}>
                    {qty > 0 ? `${qty.toLocaleString()} lbs` : '0 lbs'}
                  </div>

                  {/* Bar container */}
                  <div className="w-full flex items-end justify-center h-48 relative">
                    {/* Background column guideline */}
                    <div className="absolute inset-y-0 w-8 md:w-12 bg-white/[0.02] rounded-t-lg pointer-events-none" />

                    {/* Main Bar */}
                    <div
                      className={`w-8 md:w-12 rounded-t-lg transition-all duration-500 relative cursor-pointer group-hover:brightness-110 shadow-lg ${qty > 0
                        ? 'bg-gradient-to-t from-sky-600 via-sky-500 to-cyan-400 shadow-sky-500/25'
                        : 'bg-white/10'
                        }`}
                      style={{ height: `${barHeight}%` }}
                    >
                      {/* Top cap shine */}
                      {qty > 0 && (
                        <div className="w-full h-1 bg-white/40 rounded-t-lg" />
                      )}
                    </div>

                    {/* Detailed Hover Tooltip */}
                    <div className="absolute bottom-full mb-8 hidden group-hover:flex flex-col items-center z-50 pointer-events-none">
                      <div className="bg-[#0b1329] border border-sky-500/30 text-white text-xs rounded-xl py-2 px-3 shadow-2xl backdrop-blur-xl whitespace-nowrap">
                        <p className="font-bold text-sky-300 mb-0.5">{item.month} উৎপাদন পরিসংখ্যান</p>
                        <p className="text-slate-200">মোট উৎপাদন: <strong className="text-emerald-400">{qty.toLocaleString()} lbs</strong></p>
                        {topBuyers.map(bName => {
                          const bQty = Number(item[bName]) || 0;
                          return bQty > 0 ? (
                            <p key={bName} className="text-[10px] text-slate-400 mt-0.5">
                              {bName}: {bQty.toLocaleString()} lbs
                            </p>
                          ) : null;
                        })}
                      </div>
                      <div className="w-2 h-2 bg-[#0b1329] border-r border-b border-sky-500/30 transform rotate-45 -mt-1" />
                    </div>
                  </div>

                  {/* Month Label */}
                  <span className="text-xs text-slate-300 mt-2.5 font-semibold tracking-wide">{item.month}</span>
                </div>
              );
            })}
          </div>

          {/* Dynamic Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" />
              <span>মাসভিত্তিক মোট উৎপাদন</span>
            </div>
            {topBuyers.map((bName, bIdx) => (
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium" key={bName}>
                <span className={`w-2.5 h-2.5 rounded-full ${barColors[bIdx % barColors.length]}`} />
                <span>{bName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Recent Activities */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-slate-100">সাম্প্রতিক কার্যক্রম</span>
          </div>
          <div className="space-y-4 mt-6">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">কোন সাম্প্রতিক কার্যক্রম পাওয়া যায়নি</p>
            ) : (
              recentActivities.map((act) => (
                <div className="flex items-start gap-3" key={act.id}>
                  <span className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0 shadow-md shadow-sky-500/30" />
                  <div className="flex flex-col">
                    <p className="text-xs text-slate-200 leading-normal">
                      <strong className="text-sky-400">{act.user}: </strong>
                      {act.action}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Monthly Style Production Summary Board (New Section) */}
      <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl space-y-6">
        {/* Board Header with Month Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  মাসিক স্টাইল প্রোডাকশন সামারী বোর্ড
                  <span className="text-xs font-semibold text-sky-300 bg-sky-500/15 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
                    {monthlySummary?.monthLabelBn || monthlySummary?.monthLabel || selectedMonth}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  নির্বাচিত মাসের প্রোডাকশন টেবিল থেকে সংকলিত স্টাইলভিত্তিক উৎপাদন পরিসংখ্যান
                </p>
              </div>
            </div>
          </div>

          {/* Month Navigation & Search Controls */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Previous Month */}
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="পূর্ববর্তী মাস দেখুন"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Month Picker Dropdown */}
            <div className="relative min-w-[200px]">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-[#0b0f19]/80 border border-white/10 rounded-xl py-2 pl-9 pr-8 text-xs font-semibold text-slate-200 focus:outline-none focus:border-sky-500 transition-all cursor-pointer"
              >
                {availableMonths.map((m) => (
                  <option key={m.value} value={m.value} className="bg-[#0f172a] text-slate-200">
                    {m.labelBn} {m.isCurrent ? '(চলতি মাস)' : ''} {m.hasData ? '●' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Next Month */}
            <button
              onClick={handleNextMonth}
              disabled={isNextDisabled}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              title="পরবর্তী মাস দেখুন"
            >
              <ChevronRight size={16} />
            </button>

            {/* Quick Reset to Current Month */}
            {selectedMonth !== currentMonthKey && (
              <button
                onClick={() => setSelectedMonth(currentMonthKey)}
                className="text-xs px-2.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/20 font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                চলতি মাসে ফিরুন
              </button>
            )}

            {/* Search Style inside Table */}
            <div className="relative w-full sm:w-44">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="স্টাইল খুঁজুন..."
                value={styleSearch}
                onChange={(e) => setStyleSearch(e.target.value)}
                className="w-full bg-[#0b0f19]/70 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Selected Month Key Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0b1329]/60 border border-white/5 rounded-xl p-3.5 flex flex-col shadow-inner">
            <span className="text-[11px] font-medium text-slate-400">ওই মাসের মোট উৎপাদন</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 font-display">
              {(monthlySummary?.totalQuantity || 0).toLocaleString()} <span className="text-xs text-emerald-500/70 font-sans">lbs</span>
            </span>
          </div>
          <div className="bg-[#0b1329]/60 border border-white/5 rounded-xl p-3.5 flex flex-col shadow-inner">
            <span className="text-[11px] font-medium text-slate-400">প্রোডাকশনে থাকা স্টাইল</span>
            <span className="text-xl font-bold text-sky-400 mt-1 font-display">
              {monthlySummary?.totalStyles || 0} <span className="text-xs text-sky-500/70 font-sans">টি স্টাইল</span>
            </span>
          </div>
          <div className="bg-[#0b1329]/60 border border-white/5 rounded-xl p-3.5 flex flex-col shadow-inner">
            <span className="text-[11px] font-medium text-slate-400">মোট এন্ট্রি সংখ্যা</span>
            <span className="text-xl font-bold text-violet-400 mt-1 font-display">
              {monthlySummary?.totalEntries || 0} <span className="text-xs text-violet-500/70 font-sans">টি ব্যাচ</span>
            </span>
          </div>
          <div className="bg-[#0b1329]/60 border border-white/5 rounded-xl p-3.5 flex flex-col shadow-inner">
            <span className="text-[11px] font-medium text-slate-400">সর্বোচ্চ উৎপাদিত স্টাইল</span>
            <span className="text-sm font-bold text-amber-300 mt-1.5 truncate">
              {topStyle ? `${topStyle.style_no} (${topStyle.total_quantity.toLocaleString()} lbs)` : '—'}
            </span>
          </div>
        </div>

        {/* Style Summary Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10 shadow-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b1329]/90 text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">স্টাইল নম্বর</th>
                <th className="py-3 px-4">বায়ার</th>
                <th className="py-3 px-4">সেকশন</th>
                <th className="py-3 px-4 text-right">মোট উৎপাদন (lbs)</th>
                <th className="py-3 px-4 text-right">অবদান (% Share)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200">
              {loadingSummary ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <Loader2 className="animate-spin inline-block mr-2" size={18} />
                    {selectedMonth} মাসের স্টাইল সামারী লোড হচ্ছে...
                  </td>
                </tr>
              ) : filteredStyles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Calendar size={36} className="mb-2 text-slate-600" />
                      <p className="text-sm font-semibold text-slate-300">
                        {styleSearch
                          ? `"${styleSearch}" দিয়ে কোনো স্টাইল মেলেনি`
                          : `নির্বাচিত মাসে (${monthlySummary?.monthLabelBn || selectedMonth}) কোনো প্রোডাকশন রেকর্ড পাওয়া যায়নি`}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        ফিল্টার থেকে অন্য কোনো মাস নির্বাচন করে দেখুন
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStyles.map((style, idx) => (
                  <tr key={style.style_id} className="hover:bg-sky-500/5 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-500 font-mono text-[11px]">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-100">
                      <span className="px-2.5 py-1 rounded-md bg-sky-500/10 border border-sky-500/20 text-sky-300 font-mono text-xs">
                        {style.style_no}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{style.buyer_name}</td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-[220px] truncate" title={style.sections}>
                      {style.sections}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-emerald-400 font-display text-sm">
                        {style.total_quantity.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-500 ml-1">lbs</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-semibold text-sky-400 text-[11px] min-w-[36px]">
                          {style.percentage}%
                        </span>
                        <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full"
                            style={{ width: `${Math.min(style.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredStyles.length > 0 && (
              <tfoot className="bg-[#0b1329]/95 border-t border-white/10 font-bold text-slate-200">
                <tr>
                  <td colSpan="4" className="py-3 px-4 text-right text-xs uppercase tracking-wider text-slate-400">
                    সর্বমোট ({filteredStyles.length} টি স্টাইল):
                  </td>
                  <td className="py-3 px-4 text-right font-display text-emerald-400 text-sm font-bold">
                    {filteredStyles.reduce((sum, s) => sum + s.total_quantity, 0).toLocaleString()} lbs
                  </td>
                  <td className="py-3 px-4 text-right text-sky-400 font-bold">
                    100%
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
