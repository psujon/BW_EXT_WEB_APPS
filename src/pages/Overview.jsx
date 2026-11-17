import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Database, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const barColors = ['bg-sky-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];

export default function Overview({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="text-slate-400">ড্যাশবোর্ড লোড হচ্ছে...</div>;
  }

  const cards = stats?.cards || [
    { title: 'TOTAL BUYERS', value: '0', change: 'নিবন্ধিত বায়ার', trend: 'up' },
    { title: 'ACTIVE STYLES', value: '0', change: 'চলতি স্টাইল', trend: 'up' },
    { title: 'TODAY PRODUCTION', value: '0 pcs', change: 'আজকের মোট উৎপাদন', trend: 'stable' },
    { title: 'ACTIVE EMPLOYEES', value: '0 জন', change: 'কারখানার স্টাফ', trend: 'up' }
  ];

  const productionOverview = stats?.productionOverview || [];
  const topBuyers = stats?.topBuyers || [];

  // Dynamic max value calculation for chart scaling
  let maxVal = 100;
  productionOverview.forEach(item => {
    topBuyers.forEach(bName => {
      maxVal = Math.max(maxVal, item[bName] || 0);
    });
  });
  maxVal = Math.ceil(maxVal * 1.25);

  const recentActivities = stats?.recentActivities || [];

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
      {/* Dynamic Summary Cards */}
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

      {/* Dynamic Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic Production Chart strictly using Database Buyers */}
        <div className="lg:col-span-2 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-slate-100">প্রোডাকশন ওভারভিউ (চলতি বছর)</span>
            <span className="text-[11px] text-slate-400">ডাটাবেজ বায়ার ভিত্তিক প্রোডাকশন রেট (pcs)</span>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 border-b border-white/6 pb-4 mb-4 mt-6">
            {productionOverview.map((item, index) => (
              <div className="flex-1 flex flex-col items-center h-full" key={index}>
                <div className="flex items-end justify-center gap-1 w-full h-full relative">
                  {topBuyers.map((bName, bIdx) => {
                    const val = item[bName] || 0;
                    const barHeight = Math.min(Math.max((val / maxVal) * 100, val > 0 ? 8 : 4), 100);
                    const colorClass = barColors[bIdx % barColors.length];

                    return (
                      <div 
                        key={bName}
                        className={`w-2.5 md:w-3.5 rounded-t transition-all duration-300 hover:opacity-85 shadow-md ${
                          val > 0 ? colorClass : 'bg-white/10'
                        }`}
                        style={{ height: `${barHeight}%` }} 
                        title={`${bName}: ${val.toLocaleString()} pcs`}
                      />
                    );
                  })}
                </div>
                <span className="text-[10px] text-slate-400 mt-2 font-medium">{item.month}</span>
              </div>
            ))}
          </div>

          {/* Dynamic Chart Legend based strictly on Database Buyers */}
          <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
            {topBuyers.length === 0 ? (
              <span className="text-xs text-slate-500">কোন বায়ার তথ্য পাওয়া যায়নি</span>
            ) : (
              topBuyers.map((bName, bIdx) => (
                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium" key={bName}>
                  <span className={`w-2.5 h-2.5 rounded-full ${barColors[bIdx % barColors.length]}`} />
                  <span>{bName}</span>
                </div>
              ))
            )}
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
    </div>
  );
}
