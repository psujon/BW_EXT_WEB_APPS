import React, { useState, useEffect, useRef } from 'react';
import { GitBranch, Edit, Trash2, XCircle, Search, ChevronDown, X, AlertCircle } from 'lucide-react';
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

export default function Process({ token }) {
  const [processes, setProcesses] = useState([]);
  const [sections, setSections] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [sectionId, setSectionId] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [styleId, setStyleId] = useState('');
  const [processName, setProcessName] = useState('');
  const [type, setType] = useState('complete');
  const [status, setStatus] = useState('Active');

  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  useEffect(() => {
    fetchProcesses();
    fetchSections();
    fetchBuyers();
    fetchStyles();
  }, []);

  const fetchSections = () => {
    fetch('/api/sections', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSections(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching sections:', err));
  };

  const fetchBuyers = () => {
    fetch('/api/buyers', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBuyers(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching buyers:', err));
  };

  const fetchStyles = () => {
    fetch('/api/styles', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStyles(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching styles:', err));
  };

  const fetchProcesses = (search = '') => {
    setLoading(true);
    let url = '/api/processes';
    if (search && search.trim() !== '') {
      url += `?search=${encodeURIComponent(search.trim())}`;
    } else {
      url += '?limit=50';
    }

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProcesses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching processes:', err);
        setLoading(false);
      });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    setActiveSearch(q);
    fetchProcesses(q);
    if (q) {
      toast.success(`"${q}" এর ফলাফল সরাসরি ডাটাবেজ থেকে ফেচ করা হয়েছে!`);
    } else {
      toast.success('ডাটাবেজ থেকে সর্বশেষ ৫০ টি রেকর্ড লোড করা হয়েছে!');
    }
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    fetchProcesses('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!sectionId || !buyerId || !styleId || !processName || !type) {
      const errMsg = 'অনুগ্রহ করে সকল বাধ্যতাবোধক ঘর (Required fields) পূরণ করুন!';
      setFormError(errMsg);
      toast.error(errMsg);
      return;
    }

    const sId = parseInt(sectionId);
    const bId = parseInt(buyerId);
    const stId = parseInt(styleId);
    const pName = processName.trim();

    const payload = {
      section_id: sId,
      buyer_id: bId,
      style_id: stId,
      process_name: pName,
      type,
      status
    };

    try {
      if (editingId !== null) {
        const res = await fetch(`/api/processes/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update process');

        toast.success('প্রসেস সফলভাবে আপডেট করা হয়েছে!');
        setEditingId(null);
      } else {
        const res = await fetch('/api/processes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to save process');

        toast.success('নতুন প্রসেস সফলভাবে যুক্ত করা হয়েছে!');
      }

      setSectionId('');
      setBuyerId('');
      setStyleId('');
      setProcessName('');
      setType('complete');
      setStatus('Active');
      setFormError('');
      fetchProcesses(activeSearch);
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message);
    }
  };

  const handleEdit = (proc) => {
    setEditingId(proc.id);
    setFormError('');
    setSectionId(proc.section_id || '');
    setBuyerId(proc.buyer_id || '');
    setStyleId(proc.style_id || '');
    setProcessName(proc.process_name || '');
    setType(proc.type || 'complete');
    setStatus(proc.status || 'Active');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormError('');
    setSectionId('');
    setBuyerId('');
    setStyleId('');
    setProcessName('');
    setType('complete');
    setStatus('Active');
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই প্রসেসটি ডিলিট করতে চান?')) {
      fetch(`/api/processes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete process');
          return data;
        })
        .then(() => {
          toast.success('প্রসেস রেকর্ড সফলভাবে ডিলিট করা হয়েছে!');
          fetchProcesses(activeSearch);
          if (editingId === id) {
            handleCancelEdit();
          }
        })
        .catch(err => toast.error(err.message));
    }
  };

  const getTypeBadge = (typeVal) => {
    return typeVal === 'complete' ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Complete
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        Incomplete
      </span>
    );
  };

  const getStatusBadge = (statusVal) => {
    return statusVal === 'Active' ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        Inactive
      </span>
    );
  };

  const styleOptions = styles?.map((st) => ({
    id: st.id,
    label: st.style_no,
    sublabel: st.buyer_name ? `(${st.buyer_name})` : ''
  })) || [];

  const buyerOptions = buyers?.map((b) => ({
    id: b.id,
    label: b.name
  })) || [];

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Panel */}
        <div className="relative z-20 lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <GitBranch size={18} className="text-sky-400" />
            {editingId !== null ? 'প্রসেস সংশোধন করুন' : 'নতুন প্রসেস যুক্ত করুন'}
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
                onChange={(e) => setSectionId(e.target.value)}
                required
              >
                <option value="">Select Section</option>
                {sections?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">বায়ার *</label>
              <SearchableSelect
                options={buyerOptions}
                value={buyerId}
                onChange={(selectedId) => setBuyerId(selectedId)}
                placeholder="Select Buyer..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">স্টাইল নম্বর *</label>
              <SearchableSelect
                options={styleOptions}
                value={styleId}
                onChange={(selectedId) => setStyleId(selectedId)}
                placeholder="Select Style..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">প্রসেস এর নাম *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={processName}
                onChange={(e) => setProcessName(e.target.value)}
                placeholder="Knitting / Link / Washing"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">টাইপ (Type) *</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="complete">Complete</option>
                <option value="incomplete">Incomplete</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">স্ট্যাটাস</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm">
                {editingId !== null ? 'হালনাগাদ (Update)' : 'প্রসেস যুক্ত করুন'}
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

        {/* Process list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18223c]/75 backdrop-blur-md p-3.5 px-4 border border-white/6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-100 whitespace-nowrap">প্রসেস তালিকা</h3>
              <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full font-medium">
                {activeSearch ? `ডাটাবেজ ফলাফল: ${processes.length} টি` : `সর্বশেষ ৫০ টি রেকর্ড`}
              </span>
            </div>

            {/* Direct Database Search Option with Search Button */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  className="w-full bg-[#0b0f19]/70 border border-white/10 rounded-xl py-1.5 pl-9 pr-8 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-500"
                  placeholder="প্রসেস, সেকশন, বায়ার, স্টাইল বা টাইপ..."
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
                    <th className="py-3 px-4 text-slate-300 font-semibold">বায়ার</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">স্টাইল নম্বর</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">প্রসেস নাম</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">টাইপ</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">অবস্থা</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {processes.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-slate-400 space-y-2">
                        <div>কোন প্রসেস রেকর্ড খুঁজে পাওয়া যায়নি</div>
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
                    processes.map((proc, index) => (
                      <tr key={proc.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{proc.section_name || '—'}</td>
                        <td className="py-3.5 px-4 text-slate-300">{proc.buyer_name || '—'}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {proc.style_no || '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4"><strong className="text-sky-400">{proc.process_name}</strong></td>
                        <td className="py-3.5 px-4">{getTypeBadge(proc.type)}</td>
                        <td className="py-3.5 px-4">{getStatusBadge(proc.status)}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(proc)}
                              className="inline-flex items-center justify-center w-8 h-8 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(proc.id)}
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
