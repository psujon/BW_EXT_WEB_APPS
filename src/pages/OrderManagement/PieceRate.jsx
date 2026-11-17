import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Edit, Trash2, XCircle, Search, AlertCircle, ChevronDown, X } from 'lucide-react';
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

export default function PieceRate({ token }) {
  const [rates, setRates] = useState([]);
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
  const [rate, setRate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(getTodayDateString());

  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  // Table Search State
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRates = rates.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (item.section_name && item.section_name.toLowerCase().includes(q)) ||
      (item.style_no && item.style_no.toLowerCase().includes(q)) ||
      (item.process_name && item.process_name.toLowerCase().includes(q)) ||
      (item.color_name && item.color_name.toLowerCase().includes(q)) ||
      (item.rate && item.rate.toString().includes(q))
    );
  });

  useEffect(() => {
    fetchRates();
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

  const fetchRates = () => {
    setLoading(true);
    fetch('/api/piece-rates', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching rates:', err);
        setLoading(false);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!sectionId || !styleId || !processId || !colorId || !rate || !effectiveDate) {
      const errMsg = 'অনুগ্রহ করে সকল বাধ্যতাবোধক ঘর (Required fields) পূরণ করুন!';
      setFormError(errMsg);
      toast.error(errMsg);
      return;
    }

    const sId = parseInt(sectionId);
    const stId = parseInt(styleId);
    const pId = parseInt(processId);
    const cId = parseInt(colorId);

    // Front-end duplicate check
    const isDup = rates.some(item =>
      item.section_id === sId &&
      item.style_id === stId &&
      item.process_id === pId &&
      item.color_id === cId &&
      (editingId === null || item.id !== editingId)
    );

    if (isDup) {
      const dupMsg = 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই সেকশন, স্টাইল, প্রসেস এবং কালারের জন্য ইতোমধ্যে একটি পিস রেট এন্ট্রি বিদ্যমান রয়েছে।';
      setFormError(dupMsg);
      toast.error(dupMsg);
      return;
    }

    const payload = {
      section_id: sId,
      style_id: stId,
      process_id: pId,
      color_id: cId,
      rate: parseFloat(rate),
      effective_date: effectiveDate
    };

    try {
      if (editingId !== null) {
        const res = await fetch(`/api/piece-rates/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update piece rate');

        toast.success('পিস রেট সফলভাবে আপডেট করা হয়েছে!');
        setEditingId(null);
      } else {
        const res = await fetch('/api/piece-rates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to save piece rate');

        toast.success('নতুন পিস রেট সফলভাবে যুক্ত করা হয়েছে!');
      }

      setSectionId('');
      setStyleId('');
      setProcessId('');
      setColorId('');
      setRate('');
      setEffectiveDate(getTodayDateString());
      setFormError('');
      fetchRates();
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormError('');
    setSectionId(item.section_id || '');
    setStyleId(item.style_id || '');
    setProcessId(item.process_id || '');
    setColorId(item.color_id || '');
    setRate(item.rate ? item.rate.toString() : '');

    if (item.effective_date) {
      const dbDate = new Date(item.effective_date);
      const year = dbDate.getFullYear();
      const month = String(dbDate.getMonth() + 1).padStart(2, '0');
      const day = String(dbDate.getDate()).padStart(2, '0');
      setEffectiveDate(`${year}-${month}-${day}`);
    } else {
      setEffectiveDate(getTodayDateString());
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormError('');
    setSectionId('');
    setStyleId('');
    setProcessId('');
    setColorId('');
    setRate('');
    setEffectiveDate(getTodayDateString());
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই রেটটি ডিলিট করতে চান?')) {
      fetch(`/api/piece-rates/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete rate');
          return data;
        })
        .then(() => {
          toast.success('পিস রেট সফলভাবে ডিলিট করা হয়েছে!');
          fetchRates();
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
    sublabel: st.buyer_name ? `(${st.buyer_name})` : ''
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
        {/* Piece Rate Entry Form */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <DollarSign size={18} className="text-sky-400" />
            {editingId !== null ? 'পিস রেট সংশোধন করুন' : 'পিস রেট সেট করুন'}
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

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">রেট (টাকা / পিস) *</label>
              <input
                type="number"
                step="0.01"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="45.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">কার্যকর তারিখ (Effective Date) *</label>
              <input
                type="date"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm">
                {editingId !== null ? 'হালনাগাদ (Update)' : 'রেট সংরক্ষণ করুন'}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-white/5 border border-white/6 hover:bg-white/10 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-sm"
                >
                  <XCircle size={16} />
                  <span>বাতিল</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Piece Rate Table List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18223c]/75 backdrop-blur-md p-3.5 px-4 border border-white/6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-100 whitespace-nowrap">পিস রেট তালিকা</h3>
              <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full font-medium">
                {searchQuery ? `ফলাফল: ${filteredRates.length} টি` : `মোট সেটআপ: ${rates.length} টি`}
              </span>
            </div>

            {/* Real-time Piece Rate Search Option */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                className="w-full bg-[#0b0f19]/70 border border-white/10 rounded-xl py-1.5 pl-9 pr-8 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-500"
                placeholder="সেকশন, স্টাইল, প্রসেস, কালার বা রেট..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-0.5 cursor-pointer"
                  title="সার্চ রিসেট করুন"
                >
                  <XCircle size={14} />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-slate-400 p-4">লোড হচ্ছে...</div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto shadow-xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3 px-4 text-slate-300 font-semibold">ক্রমিক</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">সেকশন</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">স্টাইল নম্বর</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">প্রসেস</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">রং (Color)</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">রেট</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">কার্যকর তারিখ</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {filteredRates.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-slate-400 space-y-2">
                        <div>কোন পিস রেট রেকর্ড খুঁজে পাওয়া যায়নি</div>
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="text-xs text-sky-400 hover:underline cursor-pointer font-medium"
                          >
                            সার্চ রিসেট করুন
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredRates.map((item, index) => (
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
                        <td className="py-3.5 px-4 text-emerald-400 font-bold">{Number(item.rate).toFixed(2)} BDT</td>
                        <td className="py-3.5 px-4 text-slate-450">{item.effective_date ? new Date(item.effective_date).toLocaleDateString() : '—'}</td>
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
