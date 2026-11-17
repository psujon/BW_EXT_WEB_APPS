import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PendingBuyerOrder({ token }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const fetchRequests = () => {
    setLoading(true);
    fetch('/api/approvals/order-increase/pending', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const pendingOnly = Array.isArray(data) ? data.filter(item => item.status === 'Pending') : [];
        setRequests(pendingOnly);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching pending order increases:', err);
        setLoading(false);
      });
  };

  const handleApprove = (id) => {
    if (!window.confirm('আপনি কি এই বায়ার অর্ডার বৃদ্ধির আবেদনটি অনুমোদন করতে চান?')) return;

    fetch(`/api/approvals/order-increase/${id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to approve');
        return data;
      })
      .then(data => {
        toast.success(data.message || 'অর্ডার বৃদ্ধি সফলভাবে অনুমোদিত হয়েছে!');
        fetchRequests();
      })
      .catch(err => toast.error(err.message));
  };

  const handleReject = (id) => {
    if (!window.confirm('আপনি কি এই বায়ার অর্ডার বৃদ্ধির আবেদনটি বাতিল করতে চান?')) return;

    fetch(`/api/approvals/order-increase/${id}/reject`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to reject');
        return data;
      })
      .then(data => {
        toast.success(data.message || 'আবেদন বাতিল করা হয়েছে!');
        fetchRequests();
      })
      .catch(err => toast.error(err.message));
  };

  return (
    <div className="space-y-6">
      <div className="p-2 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm rounded-lg leading-relaxed flex items-center justify-between">
        <button
          onClick={fetchRequests}
          className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
        >
          রিফ্রেশ করুন
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <ShoppingBag size={18} className="text-sky-400" />
            পেন্ডিং বায়ার অর্ডার বৃদ্ধি আবেদন তালিকা
          </h3>
          <span className="text-xs text-slate-400">মোট রেকর্ড: {requests.length} টি</span>
        </div>

        {loading ? (
          <div className="text-slate-400">ডাটা লোড হচ্ছে...</div>
        ) : (
          <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto shadow-xl">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#131b2e] border-b border-white/6">
                  <th className="py-3.5 px-4 text-slate-300 font-semibold">আইডি</th>
                  <th className="py-3.5 px-4 text-slate-300 font-semibold">সেকশন ও বায়ার</th>
                  <th className="py-3.5 px-4 text-slate-300 font-semibold">স্টাইল নম্বর</th>
                  <th className="py-3.5 px-4 text-slate-300 font-semibold">প্রসেস ও কালার</th>
                  <th className="py-3.5 px-4 text-slate-300 font-semibold">বর্তমান মূল Qty</th>
                  <th className="py-3.5 px-4 text-sky-400 font-semibold">আবেদনকৃত বৃদ্ধি Qty</th>
                  <th className="py-3.5 px-4 text-slate-300 font-semibold">স্ট্যাটাস</th>
                  <th className="py-3.5 px-4 text-slate-300 font-semibold text-center">অ্যাকশন (Approve / Reject)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-slate-500">
                      কোন পেন্ডিং বায়ার অর্ডার বৃদ্ধি আবেদন পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  requests.map((item) => {
                    const bo = item.buyerOrder || {};
                    const isPending = item.status === 'Pending';

                    return (
                      <tr key={item.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">#{item.id}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200">{bo.buyer?.name || '—'}</span>
                            <span className="text-xs text-slate-400">{bo.section?.name || '—'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {bo.style?.style_no || '—'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <div className="flex flex-col">
                            <span>{bo.process?.process_name || '—'}</span>
                            <span className="text-sky-400 text-xs font-semibold">{bo.color?.color_name || '—'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-200 font-bold">
                          {Number(bo.order_quantity || 0).toLocaleString()} pcs
                        </td>
                        <td className="py-3.5 px-4 text-sky-400 font-extrabold text-base">
                          +{Number(item.increase_quantity).toLocaleString()} pcs
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${item.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            item.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                            {item.status === 'Pending' && <Clock size={12} />}
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isPending ? (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleApprove(item.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-colors cursor-pointer"
                              >
                                <CheckCircle size={14} />
                                <span>অনুমোদন</span>
                              </button>
                              <button
                                onClick={() => handleReject(item.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs transition-colors cursor-pointer"
                              >
                                <XCircle size={14} />
                                <span>বাতিল</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">সম্পন্ন হয়েছে</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
