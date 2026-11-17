import React, { useState, useEffect } from 'react';
import { Layers, Edit, Trash2, XCircle } from 'lucide-react';

export default function Section({ token }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('Active');

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = () => {
    setLoading(true);
    fetch('/api/sections', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setSections(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching sections:', err);
        setLoading(false);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !code) return;

    const payload = { name, code, status };

    if (editingId !== null) {
      fetch(`/api/sections/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to update section');
          setEditingId(null);
          fetchSections();
        })
        .catch(err => alert(err.message));
    } else {
      fetch('/api/sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to save section');
          fetchSections();
        })
        .catch(err => alert(err.message));
    }

    setName('');
    setCode('');
    setStatus('Active');
  };

  const handleEdit = (sec) => {
    setEditingId(sec.id);
    setName(sec.name);
    setCode(sec.code);
    setStatus(sec.status || 'Active');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setStatus('Active');
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই সেকশনটি ডিলিট করতে চান?')) {
      fetch(`/api/sections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete section');
          fetchSections();
          if (editingId === id) {
            handleCancelEdit();
          }
        })
        .catch(err => alert(err.message));
    }
  };

  const getStatusBadge = (status) => {
    return status === 'Active' ? (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
        Closed
      </span>
    );
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Card */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <Layers size={18} className="text-sky-400" />
            {editingId !== null ? 'সেকশন সংশোধন করুন' : 'নতুন সেকশন যুক্ত করুন'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">সেকশন এর নাম *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Knitting / Dyeing"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">সেকশন কোড *</label>
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="KN-01"
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
              <button type="submit" className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm font-semibold">
                {editingId !== null ? 'হালনাগাদ (Update)' : 'সেকশন যুক্ত করুন'}
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">সেকশন তালিকা</h3>
            <span className="text-xs text-slate-400">মোট সেকশন: {sections.length} টি</span>
          </div>

          {loading ? (
            <div className="text-slate-400">লোড হচ্ছে...</div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3 px-4 text-slate-300 font-semibold">ক্রমিক</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">কোড</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">সেকশন এর নাম</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold">অবস্থা</th>
                    <th className="py-3 px-4 text-slate-300 font-semibold text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {sections.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-500">
                        কোন সেকশন রেকর্ড পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    sections.map((sec, index) => (
                      <tr key={sec.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">{index + 1}</td>
                        <td className="py-3.5 px-4 text-slate-200"><strong>{sec.code}</strong></td>
                        <td className="py-3.5 px-4"><strong className="text-sky-400">{sec.name}</strong></td>
                        <td className="py-3.5 px-4">{getStatusBadge(sec.status)}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(sec)}
                              className="inline-flex items-center justify-center w-8 h-8 border border-white/6 rounded-lg text-slate-300 hover:bg-white/5 transition-colors cursor-pointer"
                              title="সম্পাদনা করুন"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(sec.id)}
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
