import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, Lock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChangePassword({ token, user }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      const msg = 'অনুগ্রহ করে বর্তমান পাসওয়ার্ড, নতুন পাসওয়ার্ড এবং নতুন পাসওয়ার্ড নিশ্চিতকরণ ঘর পূরণ করুন!';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword.length < 4) {
      const msg = 'নতুন পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে!';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    if (newPassword !== confirmPassword) {
      const msg = 'নতুন পাসওয়ার্ড এবং পাসওয়ার্ড নিশ্চিতকরণ ঘর দুটি মিলছে না!';
      setFormError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        throw new Error(data.message || 'পাসওয়ার্ড পরিবর্তন করতে ব্যর্থ হয়েছেন!');
      }

      toast.success(data.message || 'আপনার পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFormError('');
    } catch (err) {
      setLoading(false);
      setFormError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-blue-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <KeyRound size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">ইউজার পাসওয়ার্ড পরিবর্তন</h2>
            <p className="text-xs text-slate-400 mt-1">
              আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে নিয়মিত পাসওয়ার্ড আপডেট করুন।
            </p>
          </div>
        </div>

        {user && (
          <div className="bg-[#0b0f19]/70 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs border border-sky-500/30">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">{user.name || 'User'}</div>
              <div className="text-[10px] text-sky-400 font-medium">@{user.username || 'username'}</div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Change Password Form */}
        <div className="md:col-span-2 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-slate-100 mb-5 flex items-center gap-2 border-b border-white/6 pb-3">
            <Lock size={18} className="text-sky-400" />
            পাসওয়ার্ড পরিবর্তন করুন
          </h3>

          {formError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 flex items-start gap-2.5 text-rose-300 text-xs mb-5">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                বর্তমান পাসওয়ার্ড (Current Password) *
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className="w-full bg-[#0b0f19]/70 border border-white/10 rounded-xl py-2.5 pl-3.5 pr-10 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="বর্তমান পাসওয়ার্ড টাইপ করুন"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                নতুন পাসওয়ার্ড (New Password) *
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  className="w-full bg-[#0b0f19]/70 border border-white/10 rounded-xl py-2.5 pl-3.5 pr-10 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড টাইপ করুন"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm New Password) *
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="w-full bg-[#0b0f19]/70 border border-white/10 rounded-xl py-2.5 pl-3.5 pr-10 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড নিশ্চিত করুন"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {newPassword && confirmPassword && (
                <div className="mt-1.5 text-xs flex items-center gap-1.5">
                  {newPassword === confirmPassword ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} /> পাসওয়ার্ড দুটো মিলেছে
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertCircle size={13} /> পাসওয়ার্ড দুটো মেলেনি
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-sky-500/20 transition-all cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <KeyRound size={16} />
                <span>{loading ? 'আপডেট করা হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Security Info Card */}
        <div className="md:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-white/6 pb-3">
            <ShieldCheck size={18} className="text-emerald-400" />
            নিরাপত্তা টিপস
          </h4>

          <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5"></span>
              <span>পাসওয়ার্ডে বর্ণ (Letters), সংখ্যা (Numbers) এবং চিহ্ন ব্যবহার করুন।</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5"></span>
              <span>সহজে অনুমান করা যায় এমন পাসওয়ার্ড (যেমন: 123456 বা আপনার নাম) পরিহার করুন।</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5"></span>
              <span>আপনার পাসওয়ার্ড অন্য কারো সাথে শেয়ার করবেন না।</span>
            </li>
          </ul>

          <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-[11px] text-sky-300 leading-normal">
            💡 পাসওয়ার্ড সফলভাবে পরিবর্তনের পর আপনার পরবর্তী লগইনে নতুন পাসওয়ার্ডটি ব্যবহার করতে হবে।
          </div>
        </div>
      </div>
    </div>
  );
}
