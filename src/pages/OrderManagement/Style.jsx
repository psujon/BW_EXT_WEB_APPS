import React, { useState, useEffect } from 'react';
import { Tag, Edit, Trash2, XCircle, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Style({ token }) {
  const [styles, setStyles] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [styleNo, setStyleNo] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [status, setStatus] = useState('Active');

  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  // Table Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  useEffect(() => {
    fetchStyles();
    fetchBuyers();
  }, []);

  const fetchBuyers = () => {
    fetch('/api/buyers', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBuyers(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error('Error fetching buyers:', err));
  };

  const fetchStyles = (search = '') => {
    setLoading(true);
    let url = '/api/styles';
    if (search && search.trim() !== '') {
      url += `?search=${encodeURIComponent(search.trim())}`;
    }

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStyles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching styles:', err);
        setLoading(false);
      });
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    setActiveSearch(q);
    fetchStyles(q);
    if (q) {
      toast.success(`"${q}" এর ফলাফল সরাসরি ডাটাবেজ থেকে ফেচ করা হয়েছে!`);
    } else {
      toast.success('ডাটাবেজ থেকে সকল রেকর্ড লোড করা হয়েছে!');
    }
  };

  const handleResetSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    fetchStyles('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!styleNo || !buyerId) {
      const errMsg = 'অনুগ্রহ করে বায়ার এবং স্টাইল নম্বর উভয় ঘর পূরণ করুন!';
      setFormError(errMsg);
      toast.error(errMsg);
      return;
    }

    const sNo = styleNo.trim();
    const bId = parseInt(buyerId);

    // Front-end duplicate check
    const isDup = styles.some(item =>
      item.buyer_id === bId &&
      item.style_no &&
      item.style_no.trim().toLowerCase() === sNo.toLowerCase() &&
      (editingId === null || item.id !== editingId)
    );

    if (isDup) {
      const dupMsg = 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই বায়ারের জন্য এই স্টাইল নম্বরটি ইতোমধ্যে বিদ্যমান রয়েছে।';
      setFormError(dupMsg);
      toast.error(dupMsg);
      return;
    }

    const payload = {
      style_no: sNo,
      buyer_id: bId,
      status
    };

    try {
      if (editingId !== null) {
        const res = await fetch(`/api/styles/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update style');

        toast.success('স্টাইল তথ্য সফলভাবে আপডেট করা হয়েছে!');
        setEditingId(null);
      } else {
        const res = await fetch('/api/styles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to save style');

        toast.success('নতুন স্টাইল সফলভাবে যুক্ত করা হয়েছে!');
      }

      setStyleNo('');
      setBuyerId('');
      setStatus('Active');
      setFormError('');
      fetchStyles(activeSearch);
    } catch (err) {
      setFormError(err.message);
      toast.error(err.message);
    }
  };

  const handleEdit = (styleItem) => {
    setEditingId(styleItem.id);
    setFormError('');
    setStyleNo(styleItem.style_no || '');
    setBuyerId(styleItem.buyer_id || '');
    setStatus(styleItem.status || 'Active');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormError('');
    setStyleNo('');
    setBuyerId('');
    setStatus('Active');
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই স্টাইলটি ডিলিট করতে চান?')) {
      fetch(`/api/styles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete style');
          return data;
        })
        .then(() => {
          toast.success('স্টাইল রেকর্ড সফলভাবে ডিলিট করা হয়েছে!');
          fetchStyles(activeSearch);
          if (editingId === id) {
            handleCancelEdit();
          }
        })
        .catch(err => toast.error(err.message));
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Active
        </span>
      );
    }
    if (status === 'Closed') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          Closed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Style Entry Form */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <Tag size={18} className="text-sky-400" />
            {editingId !== null ? 'স্টাইল সংশোধন করুন' : 'নতুন স্টাইল যুক্ত করুন'}
          </h3>

          {formError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-rose-300 text-xs mb-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{formError}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">বায়ার *</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={buyerId}
                onChange={(e) => setBuyerId(e.target.value)}
                required
              >
                <option value="">Select Buyer</option>
                {buyers?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">স্টাইল কোড / নম্বর *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={styleNo}
                onChange={(e) => setStyleNo(e.target.value)}
                placeholder="ST-9902"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">স্ট্যাটাস</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm">
                {editingId !== null ? 'হালনাগাদ (Update)' : 'স্টাইল যুক্ত করুন'}
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

        {/* Style Table List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18223c]/75 backdrop-blur-md p-3.5 px-4 border border-white/6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-100 whitespace-nowrap">চলমান স্টাইল তালিকা</h3>
              <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full font-medium">
                {activeSearch ? `ডাটাবেজ ফলাফল: ${styles.length} টি` : `মোট রেকর্ড: ${styles.length} টি`}
              </span>
            </div>

            {/* Direct Database Search Option with Search Button */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <input
                  type="text"
                  className="w-full bg-[#0b0f19]/70 border border-white/10 rounded-xl py-1.5 pl-9 pr-8 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-500"
                  placeholder="স্টাইল নম্বর, বায়ার বা অবস্থা..."
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
            <div className="text-slate-400 p-4">লোড হচ্ছে...</div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto shadow-xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3 px-4 text-slate-300 font-semibold">ক্রমিক</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">স্টাইল নম্বর</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">বায়ার</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">অবস্থা</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {styles.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-slate-400 space-y-2">
                        <div>কোন স্টাইল রেকর্ড খুঁজে পাওয়া যায়নি</div>
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
                    styles.map((item, index) => (
                      <tr key={item.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4"><strong className="text-sky-400">{item.style_no}</strong></td>
                        <td className="py-3.5 px-4 text-slate-200">{item.buyer_name || '—'}</td>
                        <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
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
