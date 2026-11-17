import React, { useState, useEffect } from 'react';
import { Database, PlusCircle, RefreshCw, CheckCircle2, Download, Folder, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DatabaseBackup({ token }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);
  const [restoringFile, setRestoringFile] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const API_BASE = '/api/backup';

  useEffect(() => {
    setLoading(true);
    fetch(API_BASE, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setBackups(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching backup logs:', err);
        setLoading(false);
      });
  }, [token, refresh, API_BASE]);

  const handleTriggerBackup = () => {
    setBackingUp(true);
    fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create backup');
        return data;
      })
      .then(data => {
        toast.success(data.message || 'নতুন সম্পূর্ণ (Full DB) ব্যাকআপ তৈরি করা হয়েছে!');
        setBackingUp(false);
        setRefresh(!refresh);
      })
      .catch(err => {
        toast.error(err.message);
        setBackingUp(false);
      });
  };

  const handleDownload = (filename) => {
    fetch(`${API_BASE}/download/${filename}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('ফাইল ডাউনলোড করতে সমস্যা হয়েছে');
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast.success(`"${filename}" ডাউনলোড শুরু হয়েছে!`);
      })
      .catch(err => toast.error(err.message));
  };

  const handleRestore = (filename) => {
    if (!window.confirm(`আপনি কি নিশ্চিত যে "${filename}" ডাটাবেজে রিস্টোর করতে চান? বর্তমান ডাটা ওভাররাইট হতে পারে।`)) {
      return;
    }

    setRestoringFile(filename);
    fetch(`${API_BASE}/restore/${filename}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'রিস্টোর ব্যর্থ হয়েছে');
        return data;
      })
      .then(data => {
        toast.success(data.message || 'ডাটাবেজ সম্পূর্ণ রিস্টোর করা হয়েছে!');
        setRestoringFile(null);
        setRefresh(!refresh);
      })
      .catch(err => {
        toast.error(err.message);
        setRestoringFile(null);
      });
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm rounded-lg leading-relaxed flex flex-col gap-2">
        <div className="flex items-center gap-2 font-semibold">
          <Folder size={18} className="text-sky-400 shrink-0" />
          <span>ব্যাকআপ ফাইল ডিরেক্টরি লোকেশন: <code>f:\AAAA\BEST WOOL EXT WEB APPS\backups\</code></span>
        </div>
        <p className="text-xs text-slate-300">
          ব্যাকআপ নিলে সিস্টেমে সংরক্ষিত ডাটাবেজ (Database), সকল টেবিল স্ট্রাকচার (Table DDL) এবং টেবিলের ডাটা (Data Inserts) সহ ফুল <strong>.SQL</strong> ফাইল হিসেবে স্থায়ীভাবে সেভ হয়।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Trigger Card */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl w-full">
          <h3 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <Database size={18} className="text-sky-400" />
            ফুল ডাটাবেজ ব্যাকআপ (Total DB Backup)
          </h3>

          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            এই ব্যাকআপ বাটনটিতে ক্লিক করলে ডাটাবেজ, সমস্ত টেবিল স্কিমা (CREATE TABLE) ও টেবিলের যাবতীয় রেকর্ডসহ একটি সম্পূর্ণ রিস্টোরযোগ্য <code>.sql</code> ফাইল তৈরি হবে।
          </p>

          <button
            onClick={handleTriggerBackup}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-sm font-semibold flex items-center justify-center gap-2"
            disabled={backingUp}
          >
            {backingUp ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                <span>ফুল ব্যাকআপ তৈরি হচ্ছে...</span>
              </>
            ) : (
              <>
                <PlusCircle size={18} />
                <span>নতুন ফুল SQL ব্যাকআপ নিন</span>
              </>
            )}
          </button>
        </div>

        {/* History Table Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">ব্যাকআপ ইতিহাস ও রিস্টোর (History & Restore)</h3>
            <span className="text-xs text-slate-400">মোট ব্যাকআপ: {backups.length} টি</span>
          </div>

          {loading ? (
            <div className="text-slate-400">লোড হচ্ছে...</div>
          ) : (
            <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto shadow-xl">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-[#131b2e] border-b border-white/6">
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">ফাইল নাম</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">সময়</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">সাইজ</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold">অবস্থা</th>
                    <th className="py-3.5 px-4 text-slate-300 font-semibold text-center">একশন (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {backups.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-slate-500">
                        কোন ডাটাবেজ ব্যাকআপ ফাইল পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    backups.map((bk) => (
                      <tr key={bk.id} className="hover:bg-white/2 transition-colors">
                        <td className="py-3.5 px-4 text-sky-400 font-semibold break-all text-xs">
                          {bk.backup_name}
                        </td>
                        <td className="py-3.5 px-4 text-slate-200 text-xs">{new Date(bk.backup_date).toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-slate-300 text-xs font-medium">{bk.file_size}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1">
                            <CheckCircle2 size={12} />
                            {bk.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDownload(bk.backup_name)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-semibold transition-colors cursor-pointer"
                            title="কম্পিউটারে SQL ফাইলটি ডাউনলোড করুন"
                          >
                            <Download size={13} />
                            <span>ডাউনলোড</span>
                          </button>

                          <button
                            onClick={() => handleRestore(bk.backup_name)}
                            disabled={restoringFile === bk.backup_name}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            title="এই ফাইল থেকে ব্যাকআপ ডাটাবেজে রিস্টোর করুন"
                          >
                            {restoringFile === bk.backup_name ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : (
                              <RotateCcw size={13} />
                            )}
                            <span>রিস্টোর</span>
                          </button>
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
