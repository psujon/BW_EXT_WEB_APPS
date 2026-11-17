import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, XCircle, Search, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Buyer({ token }) {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');

  // Table Search State
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuyers = buyers.filter(buyer => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (buyer.name && buyer.name.toLowerCase().includes(q)) ||
      (buyer.country && buyer.country.toLowerCase().includes(q)) ||
      (buyer.email && buyer.email.toLowerCase().includes(q)) ||
      (buyer.phone && buyer.phone.toLowerCase().includes(q))
    );
  });

  // Fetch buyers on mount
  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = () => {
    setLoading(true);
    fetch('/api/buyers', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBuyers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching buyers:', err);
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !country) {
      const errMsg = 'বায়ার নাম ও দেশের নাম পূরণ করা বাধ্যতামূলক!';
      setFormError(errMsg);
      toast.error(errMsg);
      return;
    }

    const trimmedName = name.trim();

    // Front-end duplicate check
    const isDup = buyers.some(buyer =>
      buyer.name &&
      buyer.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
      (editingId === null || buyer.id !== editingId)
    );

    if (isDup) {
      const dupMsg = 'ডুপ্লিকেট এন্ট্রি সম্ভব নয়! এই বায়ারের নামটি ইতোমধ্যে বিদ্যমান রয়েছে।';
      setFormError(dupMsg);
      toast.error(dupMsg);
      return;
    }

    const payload = { name: trimmedName, country, email, phone };

    if (editingId !== null) {
      // Update DB
      fetch(`/api/buyers/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to update buyer');
          return data;
        })
        .then(() => {
          toast.success('বায়ার তথ্য সফলভাবে হালনাগাদ করা হয়েছে!');
          setEditingId(null);
          resetForm();
          setFormError('');
          fetchBuyers();
        })
        .catch(err => {
          setFormError(err.message);
          toast.error(err.message);
        });
    } else {
      // Create DB
      fetch('/api/buyers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to save buyer');
          return data;
        })
        .then(() => {
          toast.success('নতুন বায়ার সফলভাবে যুক্ত করা হয়েছে!');
          resetForm();
          setFormError('');
          fetchBuyers();
        })
        .catch(err => {
          setFormError(err.message);
          toast.error(err.message);
        });
    }
  };

  const resetForm = () => {
    setName('');
    setCountry('');
    setEmail('');
    setPhone('');
  };

  const handleEdit = (buyer) => {
    setEditingId(buyer.id);
    setFormError('');
    setName(buyer.name);
    setCountry(buyer.country);
    setEmail(buyer.email || '');
    setPhone(buyer.phone || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormError('');
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই বায়ারটি ডিলিট করতে চান?')) {
      fetch(`/api/buyers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(async res => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to delete buyer');
          return data;
        })
        .then(() => {
          toast.success('বায়ার রেকর্ড সফলভাবে ডিলিট করা হয়েছে!');
          fetchBuyers();
          if (editingId === id) {
            handleCancelEdit();
          }
        })
        .catch(err => toast.error(err.message));
    }
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Card (Add/Edit) */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <UserPlus size={18} className="text-sky-400" />
            {editingId !== null ? 'বায়ার তথ্য সংশোধন' : 'নতুন বায়ার যুক্ত করুন'}
          </h3>

          {formError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-rose-300 text-xs mb-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{formError}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">বায়ার এর নাম *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="উদা. H&M"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">দেশ (Country) *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Sweden"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">ইমেইল এড্রেস</label>
              <input
                type="email"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hm@buyer.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">ফোন নম্বর</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+46 8 ..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm font-semibold">
                {editingId !== null ? 'হালনাগাদ (Update)' : 'সংরক্ষণ করুন'}
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

        {/* List Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#18223c]/75 backdrop-blur-md p-3.5 px-4 border border-white/6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-100 whitespace-nowrap">বায়ার তালিকা</h3>
              <span className="text-xs text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full font-medium">
                {searchQuery ? `ফলাফল: ${filteredBuyers.length} জন` : `মোট বায়ার: ${buyers.length} জন`}
              </span>
            </div>

            {/* Real-time Buyer Search Option */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                className="w-full bg-[#0b0f19]/70 border border-white/10 rounded-xl py-1.5 pl-9 pr-8 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-all placeholder:text-slate-500"
                placeholder="বায়ার নাম, দেশ, ইমেইল বা ফোন..."
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
                    <th className="py-3 px-4 text-slate-300 font-semibold">বায়ার নাম</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">দেশ</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">ইমেইল</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">ফোন নম্বর</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {filteredBuyers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-400 space-y-2">
                        <div>কোন বায়ার রেকর্ড খুঁজে পাওয়া যায়নি</div>
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
                    filteredBuyers.map((buyer, index) => (
                      <tr key={buyer.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4"><strong className="text-sky-400">{buyer.name}</strong></td>
                        <td className="py-3.5 px-4 text-slate-200">{buyer.country}</td>
                        <td className="py-3.5 px-4 text-slate-300">{buyer.email || '—'}</td>
                        <td className="py-3.5 px-4 text-slate-300">{buyer.phone || '—'}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(buyer)}
                              className="inline-flex items-center justify-center w-8 h-8 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(buyer.id)}
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
