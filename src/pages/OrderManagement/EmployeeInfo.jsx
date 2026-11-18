import React, { useState, useEffect } from 'react';
import { UserCheck, Edit, Trash2, XCircle, Plus, Calendar, Search, Save, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EmployeeInfo({ token }) {
  const [employees, setEmployees] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [cardNo, setCardNo] = useState('');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [joinDate, setJoinDate] = useState(getTodayDateString());
  const [sectionId, setSectionId] = useState('');

  const [editingId, setEditingId] = useState(null);

  // MSSQL External Search Modal States
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchCardNo, setSearchCardNo] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [savingExternal, setSavingExternal] = useState(false);

  // Table Search Filter State
  const [tableSearchQuery, setTableSearchQuery] = useState('');

  const filteredEmployees = employees.filter(emp => {
    if (!tableSearchQuery.trim()) return true;
    const q = tableSearchQuery.toLowerCase().trim();
    return (
      (emp.card_no && emp.card_no.toLowerCase().includes(q)) ||
      (emp.name && emp.name.toLowerCase().includes(q)) ||
      (emp.designation && emp.designation.toLowerCase().includes(q)) ||
      (emp.section_name && emp.section_name.toLowerCase().includes(q))
    );
  });

  const handleOpenSearchModal = () => {
    setSearchCardNo(cardNo || '');
    setSearchResult(null);
    setShowSearchModal(true);
  };

  const handleSearchExternal = async (e) => {
    if (e) e.preventDefault();
    if (!searchCardNo.trim()) {
      toast.error('দয়া করে কার্ড নম্বর লিখুন!');
      return;
    }
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch(`/api/employees/external-search?card_no=${encodeURIComponent(searchCardNo.trim())}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ডাটা পাওয়া যায়নি');
      setSearchResult(data.data);
      toast.success('এমপ্লয়ী ডাটা পাওয়া গিয়েছে!');
    } catch (err) {
      toast.error(err.message);
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  const handleSaveExternalDirect = async () => {
    if (!searchResult) return;
    setSavingExternal(true);
    try {
      const res = await fetch('/api/employees/save-external', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          card_no: searchResult.emp_id,
          name: searchResult.emp_name,
          designation: searchResult.designation_name,
          section_name: searchResult.section_name,
          section_code: searchResult.section_code,
          join_date: searchResult.join_date
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ডাটাবেজে সংরক্ষণ ব্যর্থ হয়েছে');

      toast.success(data.message || 'এমপ্লয়ী তথ্য সফলভাবে ডাটাবেজে সংরক্ষণ করা হয়েছে!');
      setShowSearchModal(false);
      setSearchResult(null);
      setSearchCardNo('');

      fetchEmployees();
      fetchSections();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingExternal(false);
    }
  };

  const handleAutoFillForm = async () => {
    if (!searchResult) return;
    setCardNo(searchResult.emp_id || '');
    setName(searchResult.emp_name || '');
    setDesignation(searchResult.designation_name || '');
    if (searchResult.join_date) {
      setJoinDate(searchResult.join_date);
    }

    if (searchResult.section_name) {
      const matchedSec = sections.find(s =>
        s.name.toLowerCase().trim() === searchResult.section_name.toLowerCase().trim() ||
        searchResult.section_name.toLowerCase().includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(searchResult.section_name.toLowerCase())
      );

      if (matchedSec) {
        setSectionId(matchedSec.id);
      } else {
        // Section not present in MySQL yet; auto-create it so the form submits smoothly
        try {
          const secRes = await fetch('/api/sections', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              name: searchResult.section_name,
              code: searchResult.section_code || 'AUTO',
              status: 'Active'
            })
          });
          const newSec = await secRes.json();
          if (secRes.ok && newSec.id) {
            setSections(prev => [newSec, ...prev]);
            setSectionId(newSec.id);
          }
        } catch (e) {
          console.error('Error auto-creating section:', e);
        }
      }
    }

    setShowSearchModal(false);
    toast.success('এমপ্লয়ী তথ্য ফর্মে ফিলাম করা হয়েছে!');
  };

  useEffect(() => {
    fetchEmployees();
    fetchSections();
  }, []);

  const fetchSections = () => {
    fetch('/api/sections', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSections(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching sections:', err));
  };

  const fetchEmployees = () => {
    setLoading(true);
    fetch('/api/employees', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setEmployees(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching employees:', err);
        toast.error('ইমপ্লয়ী তথ্য লোড করতে ব্যর্থ হয়েছে');
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cardNo || !name || !designation || !joinDate || !sectionId) {
      toast.error('দয়া করে কার্ড নং, নাম, পদবী, জয়েন ডেট ও সেকশন পূরণ করুন!');
      return;
    }

    const payload = {
      card_no: cardNo,
      name,
      designation,
      join_date: joinDate,
      section_id: parseInt(sectionId)
    };

    if (editingId !== null) {
      fetch(`/api/employees/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to update employee');
          return data;
        })
        .then(() => {
          toast.success('ইমপ্লয়ী তথ্য সফলভাবে হালনাগাদ করা হয়েছে!');
          setEditingId(null);
          resetForm();
          fetchEmployees();
        })
        .catch(err => toast.error(err.message));
    } else {
      fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to save employee');
          return data;
        })
        .then(() => {
          toast.success('নতুন একটিভ ইমপ্লয়ী সফলভাবে যুক্ত করা হয়েছে!');
          resetForm();
          fetchEmployees();
        })
        .catch(err => toast.error(err.message));
    }
  };

  const resetForm = () => {
    setCardNo('');
    setName('');
    setDesignation('');
    setJoinDate(getTodayDateString());
    setSectionId('');
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setCardNo(item.card_no || '');
    setName(item.name || '');
    setDesignation(item.designation || '');
    setSectionId(item.section_id || '');

    if (item.join_date) {
      const dbDate = new Date(item.join_date);
      const year = dbDate.getFullYear();
      const month = String(dbDate.getMonth() + 1).padStart(2, '0');
      const day = String(dbDate.getDate()).padStart(2, '0');
      setJoinDate(`${year}-${month}-${day}`);
    } else {
      setJoinDate(getTodayDateString());
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই ইমপ্লয়ী রেকর্ডটি ডিলিট করতে চান?')) {
      fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete employee');
          return data;
        })
        .then(() => {
          toast.success('ইমপ্লয়ী রেকর্ড সফলভাবে ডিলিট করা হয়েছে!');
          fetchEmployees();
          if (editingId === id) {
            handleCancelEdit();
          }
        })
        .catch(err => toast.error(err.message));
    }
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Form Panel */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <UserCheck size={18} className="text-sky-400" />
              {editingId !== null ? 'ইমপ্লয়ী তথ্য সংশোধন' : 'নতুন ইমপ্লয়ী যুক্ত করুন'}
            </h3>
            <button
              type="button"
              onClick={handleOpenSearchModal}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-1.5 px-3 rounded-xl shadow-md transition-all text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Search size={14} />
              <span>খুজুন</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">কার্ড নম্বর (Card No) *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={cardNo}
                onChange={(e) => setCardNo(e.target.value)}
                placeholder=""
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">কর্মকর্তা / কর্মচারীর নাম *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=""
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">পদবী (Designation) *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder=""
                required
              />
            </div>

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
              <label className="block text-sm font-medium text-slate-300 mb-1.5">জয়েনিং ডেট (Join Date) *</label>
              <input
                type="date"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm font-semibold">
                {editingId !== null ? 'হালনাগাদ (Update)' : 'ইমপ্লয়ী যুক্ত করুন'}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-white/5 border border-white/6 hover:bg-white/10 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 text-sm"
                >
                  <XCircle size={16} />
                  <span>বাতিল</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Active Employee Table List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18223c]/75 backdrop-blur-md p-3.5 px-4 border border-white/6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-100 whitespace-nowrap">একটিভ ইমপ্লয়ী তালিকা</h3>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                {tableSearchQuery ? `ফলাফল: ${filteredEmployees.length} জন` : `একটিভ স্টাফ: ${employees.length} জন`}
              </span>
            </div>

            {/* Real-time Employee Table Search Option */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                className="w-full bg-[#0b0f19]/70 border border-white/10 rounded-xl py-1.5 pl-9 pr-8 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-500"
                placeholder="কার্ড নং, নাম, পদবী বা সেকশন..."
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              {tableSearchQuery && (
                <button
                  type="button"
                  onClick={() => setTableSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-0.5 cursor-pointer"
                  title="সার্চ রিসিট করুন"
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
                    <th className="py-3 px-4 text-slate-300 font-semibold">কার্ড নং</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">নাম</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">পদবী</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">সেকশন</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">জয়েন ডেট</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-400 space-y-2">
                        <div>কোন ইমপ্লয়ী রেকর্ড খুঁজে পাওয়া যায়নি</div>
                        {tableSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setTableSearchQuery('')}
                            className="text-xs text-sky-400 hover:underline cursor-pointer font-medium"
                          >
                            সার্চ রিসেট করুন
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp, index) => (
                      <tr key={emp.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-100">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {emp.card_no}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-200">{emp.name}</td>
                        <td className="py-3.5 px-4 text-slate-300">{emp.designation}</td>
                        <td className="py-3.5 px-4 text-sky-400 font-medium">{emp.section_name || '—'}</td>
                        <td className="py-3.5 px-4 text-slate-400">
                          {emp.join_date ? new Date(emp.join_date).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(emp)}
                              className="inline-flex items-center justify-center w-8 h-8 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id)}
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

      {/* External MSSQL Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#18223c] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm">
                  🔍
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">এমএসএসকিউএল ডাটাবেজ সার্চ</h3>
                  <p className="text-[11px] text-slate-400">কার্ড নং দিয়ে অন্য ডাটাবেজে সার্চ করুন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSearchExternal} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">কার্ড নম্বর (Card No / emp_id)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-[#0b0f19]/70 border border-white/10 rounded-xl py-2 px-3.5 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-500"
                    placeholder="যেমন: A00036"
                    value={searchCardNo}
                    onChange={(e) => setSearchCardNo(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {searching ? 'খুজা হচ্ছে...' : 'খুজুন'}
                  </button>
                </div>
              </div>
            </form>

            {/* Search Result Card */}
            {searchResult && (
              <div className="bg-[#0b0f19]/60 border border-sky-500/30 rounded-xl p-4 space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-sky-400">এমপ্লয়ী তথ্য পাওয়া গিয়েছে</span>
                    {searchResult.already_saved ? (
                      <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-semibold">
                        ইতিমধ্যে ডাটাবেজে আছে
                      </span>
                    ) : (
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-semibold">
                        নতুন এমপ্লয়ী
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-md font-mono font-bold">
                    {searchResult.emp_id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/40 p-3 rounded-lg border border-white/5">
                  <div>
                    <span className="text-slate-400 block text-[11px]">নাম (Name):</span>
                    <span className="font-semibold text-slate-100">{searchResult.emp_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">পদবী (Designation):</span>
                    <span className="font-semibold text-slate-100">{searchResult.designation_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">সেকশন (Section):</span>
                    <span className="font-semibold text-emerald-400">{searchResult.section_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">জয়েন ডেট (Join Date):</span>
                    <span className="font-semibold text-slate-200">{searchResult.join_date || '—'}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveExternalDirect}
                    disabled={savingExternal}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-lg shadow-emerald-500/10 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Save size={15} />
                    <span>{savingExternal ? 'ডাটাবেজে সংরক্ষণ হচ্ছে...' : 'সরাসরি ডাটাবেজে সেভ করুন'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoFillForm}
                    disabled={savingExternal}
                    className="bg-white/10 hover:bg-white/15 text-slate-200 font-semibold py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1 border border-white/10"
                  >
                    <span>ফর্মে পূরণ করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
