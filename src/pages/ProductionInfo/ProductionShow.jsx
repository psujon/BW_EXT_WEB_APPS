import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, BarChart2, Filter, Search, RotateCcw, Edit, Trash2, Check, XCircle, Calendar, ChevronDown, X } from 'lucide-react';
import toast from 'react-hot-toast';

function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.id) === String(value));

  const filteredOptions = options.filter((opt) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const labelMatch = opt.label && String(opt.label).toLowerCase().includes(term);
    const subMatch = opt.sublabel && String(opt.sublabel).toLowerCase().includes(term);
    return labelMatch || subMatch;
  });

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-10'}`} ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 pr-8 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
          placeholder={placeholder}
          value={isOpen ? searchTerm : (selectedOption ? selectedOption.label : '')}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          required={required && !value}
        />
        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400 transition-colors p-0.5 rounded-full cursor-pointer"
            title="রিসেট করুন"
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[9999] left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl py-1 divide-y divide-white/5">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = String(opt.id) === String(value);
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-sky-500/20 hover:text-sky-200 transition-colors flex items-center justify-between ${isSelected ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-200'
                    }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.sublabel && (
                    <span className="text-[10px] text-slate-400 ml-2 shrink-0">{opt.sublabel}</span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-3 py-3 text-xs text-slate-500 text-center">
              কোনো ফলাফল পাওয়া যায়নি
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper to format date in local DD/MM/YYYY format without UTC timezone shift
const formatDateLocal = (dateVal) => {
  if (!dateVal) return '—';
  if (typeof dateVal === 'string' && dateVal.includes('T')) {
    const datePart = dateVal.split('T')[0];
    const [year, month, day] = datePart.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ProductionShow({ token }) {
  const [productionList, setProductionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Dropdown Categories State
  const [sections, setSections] = useState([]);
  const [styles, setStyles] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [colors, setColors] = useState([]);

  // Filter Input States (Default Date set to Today)
  const [searchSection, setSearchSection] = useState('');
  const [searchStyle, setSearchStyle] = useState('');
  const [searchProcess, setSearchProcess] = useState('');
  const [searchColor, setSearchColor] = useState('');
  const [searchCardNo, setSearchCardNo] = useState('');
  const [fromDate, setFromDate] = useState(getTodayDateString());
  const [toDate, setToDate] = useState(getTodayDateString());

  // Editing Quantity State
  const [editingId, setEditingId] = useState(null);
  const [editQty, setEditQty] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchDropdownOptions();
  }, [token]);

  const fetchDropdownOptions = () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    Promise.all([
      fetch('/api/sections', { headers }).then(r => r.json()),
      fetch('/api/styles', { headers }).then(r => r.json()),
      fetch('/api/processes', { headers }).then(r => r.json()),
      fetch('/api/colors', { headers }).then(r => r.json())
    ])
      .then(([secData, stData, prData, colData]) => {
        setSections(Array.isArray(secData) ? secData : []);
        setStyles(Array.isArray(stData) ? stData : []);
        setProcesses(Array.isArray(prData) ? prData : []);
        setColors(Array.isArray(colData) ? colData : []);
      })
      .catch(err => console.error('Error fetching dropdown categories:', err));
  };

  // Fetch Production Records using applied filters on Search button click
  const fetchProductionList = (customFilters = null) => {
    setLoading(true);
    setHasSearched(true);

    const sec = customFilters ? customFilters.searchSection : searchSection;
    const st = customFilters ? customFilters.searchStyle : searchStyle;
    const pr = customFilters ? customFilters.searchProcess : searchProcess;
    const col = customFilters ? customFilters.searchColor : searchColor;
    const card = customFilters ? customFilters.searchCardNo : searchCardNo;
    const fromD = customFilters ? customFilters.fromDate : fromDate;
    const toD = customFilters ? customFilters.toDate : toDate;

    const params = new URLSearchParams();
    if (sec) params.append('section_name', sec);
    if (st) params.append('style_no', st);
    if (pr) params.append('process_name', pr);
    if (col) params.append('color_name', col);
    if (card) params.append('card_no', card);
    if (fromD) params.append('from_date', fromD);
    if (toD) params.append('to_date', toD);

    const url = `/api/production?${params.toString()}`;

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProductionList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching production logs:', err);
        toast.error('প্রোডাকশন ডাটা লোড করতে ব্যর্থ হয়েছে');
        setLoading(false);
      });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    fetchProductionList();
    toast.success('ফিল্টার অনুযায়ী নতুন ডাটা ফেচ করা হয়েছে!');
  };

  const handleResetFilters = () => {
    const today = getTodayDateString();
    setSearchSection('');
    setSearchStyle('');
    setSearchProcess('');
    setSearchColor('');
    setSearchCardNo('');
    setFromDate(today);
    setToDate(today);

    fetchProductionList({
      searchSection: '',
      searchStyle: '',
      searchProcess: '',
      searchColor: '',
      searchCardNo: '',
      fromDate: today,
      toDate: today
    });
    toast.success('আজকের তারিখের ফিল্টার রিসেট করা হয়েছে!');
  };

  // Start Editing Quantity
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditQty(item.quantity || item.qty || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQty('');
  };

  // Save Updated Quantity
  const handleSaveQuantity = (id) => {
    if (!editQty || isNaN(editQty) || parseFloat(editQty) < 0) {
      toast.error('সঠিক প্রোডাকশন কোয়ান্টিটি ইনপুট দিন!');
      return;
    }

    setSavingEdit(true);

    fetch(`/api/production/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity: parseFloat(editQty) })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update quantity');
        return data;
      })
      .then(() => {
        toast.success('প্রোডাকশন কোয়ান্টিটি সফলভাবে আপডেট করা হয়েছে!');
        setEditingId(null);
        setSavingEdit(false);
        fetchProductionList();
      })
      .catch(err => {
        toast.error(err.message);
        setSavingEdit(false);
      });
  };

  // Delete Record
  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই প্রোডাকশন রেকর্ডটি ডিলিট করতে চান?')) {
      fetch(`/api/production/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete production record');
          return data;
        })
        .then(() => {
          toast.success('প্রোডাকশন রেকর্ড সফলভাবে ডিলিট করা হয়েছে!');
          if (editingId === id) handleCancelEdit();
          fetchProductionList();
        })
        .catch(err => toast.error(err.message));
    }
  };

  const selectedSecObj = sections.find(s => s.name === searchSection);
  const selectedStObj = styles.find(s => s.style_no === searchStyle);
  const selectedPrObj = processes.find(p => p.process_name === searchProcess && (!selectedSecObj || p.section_id === selectedSecObj.id) && (!selectedStObj || p.style_id === selectedStObj.id));

  // Section + Style wise process filter
  const filteredProcesses = (searchSection && searchStyle && selectedSecObj && selectedStObj)
    ? processes.filter(p => p.section_id === selectedSecObj.id && p.style_id === selectedStObj.id)
    : [];

  // Process wise color filter
  const filteredColors = (searchSection && searchStyle && searchProcess && selectedSecObj && selectedStObj && selectedPrObj)
    ? colors.filter(c =>
      c.section_id === selectedSecObj.id &&
      c.style_id === selectedStObj.id &&
      c.process_id === selectedPrObj.id
    )
    : [];

  const styleOptions = styles?.map((st) => ({
    id: st.style_no,
    label: st.style_no,
    sublabel: ''
  })) || [];

  const totalQuantity = productionList.reduce((sum, item) => sum + (Number(item.quantity || item.qty) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <BarChart2 size={18} className="text-sky-400" />
          উৎপাদন বিবরণী রিপোর্ট ও ফিল্টার
        </h3>
        <button
          onClick={() => fetchProductionList()}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer text-xs font-semibold"
        >
          <RefreshCw size={14} />
          রিফ্রেশ ডাটা
        </button>
      </div>

      {/* Filter Search Form Panel */}
      <form onSubmit={handleSearchSubmit} className="relative z-20 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/6">
          <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
            <Filter size={16} className="text-sky-400" />
            <span>ফিল্টার ওয়াইজ সার্চ প্যানেল</span>
          </div>
          {(searchSection || searchStyle || searchProcess || searchColor || searchCardNo || fromDate || toDate) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw size={13} />
              <span>ফিল্টার রিসেট করুন</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Section Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">সেকশন (Section)</label>
            <select
              className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors"
              value={searchSection}
              onChange={(e) => {
                setSearchSection(e.target.value);
                setSearchProcess('');
                setSearchColor('');
              }}
            >
              <option value="">সকল সেকশন (All)</option>
              {sections.map(sec => (
                <option key={sec.id} value={sec.name}>{sec.name}</option>
              ))}
            </select>
          </div>

          {/* Style Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">স্টাইল নম্বর (Style)</label>
            <SearchableSelect
              options={styleOptions}
              value={searchStyle}
              onChange={(val) => {
                setSearchStyle(val);
                setSearchProcess('');
                setSearchColor('');
              }}
              placeholder="সকল স্টাইল (All)"
            />
          </div>

          {/* Process Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">প্রসেস (Process)</label>
            <select
              className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              value={searchProcess}
              onChange={(e) => {
                setSearchProcess(e.target.value);
                setSearchColor('');
              }}
              disabled={!searchSection || !searchStyle}
            >
              <option value="">
                {!searchSection
                  ? "প্রথমে সেকশন সিলেক্ট করুন"
                  : !searchStyle
                    ? "প্রথমে স্টাইল সিলেক্ট করুন"
                    : filteredProcesses.length === 0
                      ? "কোনো প্রসেস পাওয়া যায়নি"
                      : "সকল প্রসেস (All)"}
              </option>
              {filteredProcesses.map(pr => (
                <option key={pr.id} value={pr.process_name}>{pr.process_name}</option>
              ))}
            </select>
          </div>

          {/* Color Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">রং (Color)</label>
            <select
              className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              value={searchColor}
              onChange={(e) => setSearchColor(e.target.value)}
              disabled={!searchSection || !searchStyle || !searchProcess}
            >
              <option value="">
                {!searchSection || !searchStyle
                  ? "প্রথমে সেকশন ও স্টাইল সিলেক্ট করুন"
                  : !searchProcess
                    ? "প্রথমে প্রসেস সিলেক্ট করুন"
                    : filteredColors.length === 0
                      ? "কোনো কালার পাওয়া যায়নি"
                      : "সকল কালার (All)"}
              </option>
              {filteredColors.map(col => (
                <option key={col.id} value={col.color_name}>{col.color_name}</option>
              ))}
            </select>
          </div>

          {/* Card No Search Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">কার্ড নম্বর (Card No)</label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 pl-8 pr-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors"
                value={searchCardNo}
                onChange={(e) => setSearchCardNo(e.target.value)}
                placeholder="উদা. EMP-1001 বা 1001"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Date Range: From Date */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar size={13} className="text-sky-400" />
              <span>হইতে তারিখ (From Date)</span>
            </label>
            <input
              type="date"
              className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* Date Range: To Date */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <Calendar size={13} className="text-sky-400" />
              <span>পর্যন্ত তারিখ (To Date)</span>
            </label>
            <input
              type="date"
              className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Search Trigger Button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs"
            >
              <Search size={15} />
              <span>সার্চ করুন (Search)</span>
            </button>
          </div>
        </div>

        {/* Filter Summary Metrics */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-white/5">
          <div>
            প্রাপ্ত মোট রেকর্ড: <strong className="text-sky-400 font-bold">{productionList.length}</strong> টি
          </div>
          <div>
            মোট উৎপাদন পরিমাণ: <strong className="text-emerald-400 font-bold">{totalQuantity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} lbs</strong>
          </div>
        </div>
      </form>

      {/* Production Report Table */}
      {loading ? (
        <div className="text-slate-400">ডাটা লোড হচ্ছে...</div>
      ) : (
        <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto shadow-xl">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#131b2e] border-b border-white/6">
                <th className="py-3.5 px-4 text-slate-300 font-semibold">ক্রমিক</th>
                <th className="py-3.5 px-4 text-slate-300 font-semibold">কার্ড নম্বর</th>
                <th className="py-3.5 px-4 text-slate-300 font-semibold">সেকশন</th>
                <th className="py-3.5 px-4 text-slate-300 font-semibold">স্টাইল নম্বর</th>
                <th className="py-3.5 px-4 text-slate-300 font-semibold">প্রসেস</th>
                <th className="py-3.5 px-4 text-slate-300 font-semibold">কালার</th>
                <th className="py-3.5 px-4 text-slate-300 font-semibold">কোয়ান্টিটি</th>
                <th className="py-3.5 px-4 text-slate-300 font-semibold">প্রোডাকশন ডেট</th>
                <th className="py-3.5 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {productionList.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-slate-400">
                    {hasSearched
                      ? "ফিল্টার ও ডেট রেঞ্জ অনুযায়ী কোনো প্রোডাকশন রেকর্ড পাওয়া যায়নি"
                      : "উপরে ফিল্টার ও তারিখ সিলেক্ট করে 'সার্চ করুন' বাটনে ক্লিক দিয়ে রিপোর্ট দেখুন"}
                  </td>
                </tr>
              ) : (
                productionList.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span>{item.card_no || '—'}</span>
                        {item.employee_id && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono" title={`সংরক্ষিত আইডি: ${item.employee_id}`}>
                            ID: {item.employee_id}
                          </span>
                        )}
                      </div>
                      {item.employee_name && (
                        <div className="text-xs font-normal text-slate-400 mt-0.5">{item.employee_name}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">{item.section_name || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {item.style_no || item.style || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{item.process_name || '—'}</td>
                    <td className="py-3.5 px-4 text-sky-400 font-semibold">{item.color_name || '—'}</td>

                    {/* Editable Quantity Column */}
                    <td className="py-3.5 px-4">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            className="w-24 bg-[#0b0f19] border border-sky-500 rounded py-1 px-2 text-emerald-400 font-bold text-sm focus:outline-none"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveQuantity(item.id)}
                            disabled={savingEdit}
                            className="w-7 h-7 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded flex items-center justify-center transition-colors cursor-pointer"
                            title="সংরক্ষণ করুন"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="w-7 h-7 bg-white/5 text-slate-400 hover:bg-white/10 rounded flex items-center justify-center transition-colors cursor-pointer"
                            title="বাতিল"
                          >
                            <XCircle size={15} />
                          </button>
                        </div>
                      ) : (
                        <strong className="text-emerald-400 font-bold">
                          {Number(item.quantity || item.qty || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} lbs
                        </strong>
                      )}
                    </td>

                    {/* Formatted Production Date in Local Format */}
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {formatDateLocal(item.production_date || item.date)}
                    </td>

                    {/* Action Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {editingId !== item.id && (
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="inline-flex items-center justify-center w-8 h-8 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                            title="কোয়ান্টিটি সম্পাদনা করুন"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center justify-center w-8 h-8 border border-red-500/10 rounded-lg text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                          title="রেকর্ড ডিলিট করুন"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
