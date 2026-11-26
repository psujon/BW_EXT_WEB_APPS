import React, { useState, useEffect, useRef } from 'react';
import { Truck, Edit, Trash2, XCircle, Search, ChevronDown, X, AlertCircle } from 'lucide-react';
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
          className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 pr-8 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
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

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function YarnChallan({ token }) {
  const [challans, setChallans] = useState([]);
  const [sections, setSections] = useState([]);
  const [styles, setStyles] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [sectionId, setSectionId] = useState('');
  const [styleId, setStyleId] = useState('');
  const [processId, setProcessId] = useState('');
  const [colorId, setColorId] = useState('');
  const [challanNo, setChallanNo] = useState('');
  const [gatePassNo, setGatePassNo] = useState('');
  const [challanDate, setChallanDate] = useState(getTodayDateString());
  const [quantity, setQuantity] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  useEffect(() => {
    fetchChallans();
    fetchSections();
    fetchStyles();
    fetchProcesses();
    fetchColors();
  }, []);

  const fetchSections = () => {
    fetch('/api/sections', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSections(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching sections:', err));
  };

  const fetchStyles = () => {
    fetch('/api/styles', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStyles(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching styles:', err));
  };

  const fetchProcesses = () => {
    fetch('/api/processes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProcesses(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching processes:', err));
  };

  const fetchColors = () => {
    fetch('/api/colors', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setColors(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching colors:', err));
  };

  const fetchChallans = (search = '') => {
    setLoading(true);
    let url = '/api/yarn-challans';
    if (search && search.trim() !== '') {
      url += `?search=${encodeURIComponent(search.trim())}`;
    }

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setChallans(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching challans:', err);
        setLoading(false);
      });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    setActiveSearch(q);
    fetchChallans(q);
    if (q) {
      toast.success(`"${q}" এর ফলাফল সরাসরি ডাটাবেজ থেকে ফেচ করা হয়েছে!`);
    } else {
      toast.success('ডাটাবেজ থেকে সকল রেকর্ড লোড করা হয়েছে!');
    }
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    fetchChallans('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!sectionId || !styleId || !processId || !colorId || !quantity) {
      const errMsg = 'দয়া করে সেকশন, স্টাইল, প্রসেস, কালার ও কোয়ানটিটি প্রদান করুন!';
      setFormError(errMsg);
      toast.error(errMsg);
      return;
    }

    const payload = {
      section_id: parseInt(sectionId),
      style_id: parseInt(styleId),
      process_id: parseInt(processId),
      color_id: parseInt(colorId),
      challan_no: challanNo ? challanNo.trim() : null,
      gate_pass_no: gatePassNo ? gatePassNo.trim() : null,
      challan_date: challanDate || null,
      quantity: parseInt(quantity)
    };

    if (editingId !== null) {
      fetch(`/api/yarn-challans/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || 'Failed to update yarn challan');
          }
          return data;
        })
        .then(() => {
          toast.success('চালান সফলভাবে হালনাগাদ করা হয়েছে!');
          setEditingId(null);
          resetForm();
          setFormError('');
          fetchChallans(activeSearch);
        })
        .catch(err => {
          setFormError(err.message);
          toast.error(err.message, { duration: 5000 });
        });
    } else {
      fetch('/api/yarn-challans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.message || 'Failed to save yarn challan');
          }
          return data;
        })
        .then(() => {
          toast.success('ইয়ার্ন চালান সফলভাবে সংরক্ষণ করা হয়েছে!');
          resetForm();
          setFormError('');
          fetchChallans(activeSearch);
        })
        .catch(err => {
          setFormError(err.message);
          toast.error(err.message, { duration: 5000 });
        });
    }
  };

  const resetForm = () => {
    setSectionId('');
    setStyleId('');
    setProcessId('');
    setColorId('');
    setChallanNo('');
    setGatePassNo('');
    setChallanDate(getTodayDateString());
    setQuantity('');
    setFormError('');
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormError('');
    setSectionId(item.section_id || '');
    setStyleId(item.style_id || '');
    setProcessId(item.process_id || '');
    setColorId(item.color_id || '');
    setChallanNo(item.challan_no || '');
    setGatePassNo(item.gate_pass_no || '');
    setQuantity(item.quantity ? item.quantity.toString() : '');

    if (item.challan_date) {
      const dbDate = new Date(item.challan_date);
      const year = dbDate.getFullYear();
      const month = String(dbDate.getMonth() + 1).padStart(2, '0');
      const day = String(dbDate.getDate()).padStart(2, '0');
      setChallanDate(`${year}-${month}-${day}`);
    } else {
      setChallanDate('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই চালানটি ডিলিট করতে চান?')) {
      fetch(`/api/yarn-challans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete challan');
          return data;
        })
        .then(() => {
          toast.success('চালান সফলভাবে ডিলিট করা হয়েছে!');
          fetchChallans(activeSearch);
          if (editingId === id) {
            handleCancelEdit();
          }
        })
        .catch(err => toast.error(err.message));
    }
  };

  // Options formatting for SearchableSelect
  const styleOptions = styles?.map((st) => ({
    id: st.id,
    label: st.style_no,
    sublabel: ''
  })) || [];

  // Section + Style wise process load
  const formFilteredProcesses = (sectionId && styleId)
    ? processes.filter(p => p.section_id === parseInt(sectionId) && p.style_id === parseInt(styleId))
    : [];

  // Process wise color load
  const formFilteredColors = (sectionId && styleId && processId)
    ? colors.filter(c =>
      c.section_id === parseInt(sectionId) &&
      c.style_id === parseInt(styleId) &&
      c.process_id === parseInt(processId)
    )
    : [];

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Panel */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <Truck size={18} className="text-sky-400" />
            {editingId !== null ? 'চালান সংশোধন করুন' : 'নতুন চালান এন্ট্রি'}
          </h3>

          {formError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-rose-300 text-xs mb-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">সেকশন (Section) *</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={sectionId}
                onChange={(e) => {
                  setSectionId(e.target.value);
                  setProcessId('');
                  setColorId('');
                }}
                required
              >
                <option value="">Select Section</option>
                {sections?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">স্টাইল নম্বর *</label>
              <SearchableSelect
                options={styleOptions}
                value={styleId}
                onChange={(selectedId) => {
                  setStyleId(selectedId);
                  setProcessId('');
                  setColorId('');
                }}
                placeholder="Select Style..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">প্রসেস *</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                value={processId}
                onChange={(e) => {
                  setProcessId(e.target.value);
                  setColorId('');
                }}
                required
                disabled={!sectionId || !styleId}
              >
                <option value="">
                  {!sectionId
                    ? "First select a section"
                    : !styleId
                      ? "First select a style"
                      : formFilteredProcesses.length === 0
                        ? "No processes found for this section & style"
                        : "Select Process"}
                </option>
                {formFilteredProcesses.map((p) => (
                  <option key={p.id} value={p.id}>{p.process_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">রং (Color) *</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                value={colorId}
                onChange={(e) => setColorId(e.target.value)}
                required
                disabled={!sectionId || !styleId || !processId}
              >
                <option value="">
                  {!sectionId || !styleId
                    ? "First select section & style"
                    : !processId
                      ? "First select a process"
                      : formFilteredColors.length === 0
                        ? "No colors found for this process"
                        : "Select Color"}
                </option>
                {formFilteredColors.map((c) => (
                  <option key={c.id} value={c.id}>{c.color_name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">চালান নং</label>
                <input
                  type="text"
                  className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={challanNo}
                  onChange={(e) => setChallanNo(e.target.value)}
                  placeholder="CH-88021 (ঐচ্ছিক)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">গেট পাস নং</label>
                <input
                  type="text"
                  className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={gatePassNo}
                  onChange={(e) => setGatePassNo(e.target.value)}
                  placeholder="GP-9903 (ঐচ্ছিক)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">চালান ডেট</label>
              <input
                type="date"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={challanDate}
                onChange={(e) => setChallanDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">কোয়ানটিটি *</label>
              <input
                type="number"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="5000"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm font-semibold">
                {editingId !== null ? 'হালনাগাদ (Update)' : 'চালান সংরক্ষণ করুন'}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-white/5 border border-white/6 hover:bg-white/10 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-sm"
                >
                  <XCircle size={16} />
                  <span>বাতিল</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18223c]/75 backdrop-blur-md p-3.5 px-4 border border-white/6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-100 whitespace-nowrap">ইয়ার্ন চালান তালিকা</h3>
              <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full font-medium">
                {activeSearch ? `ডাটাবেজ ফলাফল: ${challans.length} টি` : `মোট রেকর্ড: ${challans.length} টি`}
              </span>
            </div>

            {/* Direct Database Search Option with Search Button */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  className="w-full bg-[#0b0f19]/70 border border-white/10 rounded-xl py-1.5 pl-9 pr-8 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-500"
                  placeholder="চালান নং, গেট পাস, সেকশন, স্টাইল..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400 transition-colors p-0.5 cursor-pointer"
                    title="সার্চ রিসেট করুন"
                  >
                    <XCircle size={14} />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-sky-500 hover:bg-sky-400 text-white font-medium px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-md shadow-sky-500/20"
              >
                <Search size={14} />
                <span>সার্চ</span>
              </button>
            </form>
          </div>

          {loading ? (
            <div className="text-slate-400 p-4">ডাটাবেজ থেকে লোড হচ্ছে...</div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto shadow-xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3 px-4 text-slate-300 font-semibold">ক্রমিক</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">সেকশন</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">স্টাইল</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">প্রসেস</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">কালার</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">চালান নং</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">গেট পাস নং</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">চালান ডেট</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">কোয়ানটিটি</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {challans.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="text-center py-10 text-slate-400 space-y-2">
                        <div>কোন চালান রেকর্ড খুঁজে পাওয়া যায়নি</div>
                        {activeSearch && (
                          <button
                            type="button"
                            onClick={handleResetSearch}
                            className="text-xs text-sky-400 hover:underline cursor-pointer font-medium"
                          >
                            সার্চ রিসেট করুন
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    challans.map((item, index) => (
                      <tr key={item.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{item.section_name || '—'}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {item.style_no || '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">{item.process_name || '—'}</td>
                        <td className="py-3.5 px-4 text-sky-400 font-semibold">{item.color_name || '—'}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{item.challan_no}</td>
                        <td className="py-3.5 px-4 text-slate-300">{item.gate_pass_no}</td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {item.challan_date ? new Date(item.challan_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-400 font-bold">
                          {Number(item.quantity).toLocaleString()} pcs
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center justify-center w-8 h-8 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="inline-flex items-center justify-center w-8 h-8 border border-red-500/10 rounded-lg text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                              title="ডিলিট করুন"
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
      </div>
    </div>
  );
}
