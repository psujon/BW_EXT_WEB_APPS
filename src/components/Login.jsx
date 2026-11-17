import React, { useState } from 'react';
import { User, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid username or password');
      }

      toast.success(`স্বাগতম, ${data.user.name}!`);
      onLoginSuccess(data.token, data.user, data.permissions);
    } catch (err) {
      toast.error(err.message || 'নেটওয়ার্ক কানেকশন সমস্যা। সার্ভার চালু আছে কি?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-screen bg-[radial-gradient(circle_at_10%_20%,#0d1730_0%,#080b15_90%)] relative overflow-hidden p-5">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(14,165,233,0.08)_0%,transparent_70%)] blur-[50px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(37,99,235,0.08)_0%,transparent_70%)] blur-[50px] pointer-events-none" />

      <div className="bg-[#131b2e]/75 backdrop-blur-md border border-white/6 w-full max-w-[440px] rounded-2xl p-10 shadow-2xl z-10 animate-[fadeIn_0.6s_ease-out_forwards]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 shadow-lg shadow-sky-500/20 text-white mb-4">
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-bold text-slate-100 font-display">বেস্ট উল সোয়েটার্স লিঃ (এক্সটেনশন এন্ড ওয়্যারহাউজ)</h2>
          <p className="text-slate-400 text-sm mt-1">লগইন করে সিস্টেমে প্রবেশ করুন</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">ইউজারনেম (Username)</label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ইউজারনেম লিখুন"
                required
                disabled={loading}
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">পাসওয়ার্ড (Password)</label>
            <div className="relative">
              <input
                type="password"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2.5 pl-10 pr-4 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড লিখুন"
                required
                disabled={loading}
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer text-center text-sm font-semibold flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            <span>{loading ? 'প্রবেশ করা হচ্ছে...' : 'লগইন করুন'}</span>
          </button>
        </form>

        {/* <div className="mt-8 p-3.5 bg-white/2 border border-white/6 rounded-lg text-slate-400 text-xs space-y-1">
          <strong>💡 ডেমো লগইন ক্রেডেনশিয়াল:</strong>
          <div>
            • এডমিন: <code>admin</code> / <code>admin123</code>
          </div>
          <div>
            • অপারেটর: <code>operator</code> / <code>operator123</code>
          </div>
        </div> */}
      </div>
    </div>
  );
}
