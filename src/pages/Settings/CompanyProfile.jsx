import React, { useState, useEffect } from 'react';
import { Building2, Save, Image as ImageIcon, Globe, Mail, Phone, MapPin, FileText, Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompanyProfile({ token }) {
  const [companyName, setCompanyName] = useState('');
  const [tagline, setTagline] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [taxId, setTaxId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [processedBy, setProcessedBy] = useState(null);
  const [processedDate, setProcessedDate] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    setLoading(true);
    fetch('/api/company', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data) {
          setCompanyName(data.company_name || '');
          setTagline(data.tagline || '');
          setEmail(data.email || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          setWebsite(data.website || '');
          setTaxId(data.tax_id || '');
          setLogoUrl(data.logo_url || '');
          setProcessedBy(data.processed_by);
          setProcessedDate(data.processed_date);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching company profile:', err);
        toast.error('কোম্পানী তথ্য লোড করতে ব্যর্থ হয়েছে');
        setLoading(false);
      });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('ছবি ফাইলটির সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result); // Base64 String stored directly
      toast.success('লোগো ফাইল সিলেক্ট করা হয়েছে!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    toast.success('লোগো রিমুভ করা হয়েছে!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!companyName) {
      toast.error('কোম্পানীর নাম পূরণ করা বাধ্যতামূলক!');
      return;
    }

    setSaving(true);
    const payload = {
      company_name: companyName,
      tagline,
      email,
      phone,
      address,
      website,
      tax_id: taxId,
      logo_url: logoUrl
    };

    fetch('/api/company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to save profile');
        return data;
      })
      .then((savedData) => {
        toast.success('কোম্পানী প্রোফাইল ও লোগো ডাটাবেজে সংরক্ষণ করা হয়েছে!');
        setProcessedBy(savedData.processed_by);
        setProcessedDate(savedData.processed_date);
        setSaving(false);
      })
      .catch(err => {
        toast.error(err.message);
        setSaving(false);
      });
  };

  if (loading) {
    return <div className="text-slate-400 p-6">তথ্য লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Preview Card & Logo */}
        <div className="lg:col-span-1 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="text-center pb-6 border-b border-white/6">
            <div className="w-28 h-28 mx-auto mb-4 rounded-2xl bg-[#0b0f19]/80 border border-white/10 flex items-center justify-center overflow-hidden shadow-inner relative group p-2">
              {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <Building2 size={48} className="text-sky-400" />
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-100">{companyName || 'কোম্পানীর নাম'}</h3>
            <p className="text-xs text-slate-400 mt-1 italic">{tagline || 'Tagline / স্লোগান'}</p>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-center gap-2.5 text-slate-300">
              <Mail size={15} className="text-sky-400 shrink-0" />
              <span>{email || 'ইমেইল এড্রেস যুক্ত করুন'}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <Phone size={15} className="text-sky-400 shrink-0" />
              <span>{phone || 'ফোন নম্বর যুক্ত করুন'}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <Globe size={15} className="text-sky-400 shrink-0" />
              <span>{website || 'ওয়েবসাইট লিঙ্ক যুক্ত করুন'}</span>
            </div>

            <div className="flex items-start gap-2.5 text-slate-300">
              <MapPin size={15} className="text-sky-400 shrink-0 mt-0.5" />
              <span>{address || 'ঠিকানা যুক্ত করুন'}</span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <FileText size={15} className="text-sky-400 shrink-0" />
              <span>{taxId ? `TAX / BIN: ${taxId}` : 'Tax ID / BIN'}</span>
            </div>
          </div>

          {processedDate && (
            <div className="pt-4 border-t border-white/6 text-[11px] text-slate-400 flex items-center justify-between">
              <span>সর্বশেষ আপডেট:</span>
              <span className="text-sky-400 font-medium">{new Date(processedDate).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Right Side: Form Controls */}
        <div className="lg:col-span-2 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 pb-4 border-b border-white/6">
            <Building2 size={20} className="text-sky-400" />
            কোম্পানী তথ্য ও লোগো আপলোড ফর্ম
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Logo Direct File Upload Box */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">কোম্পানী লোগো (সরাসরি ইমেজ ফাইল আপলোড) *</label>
              <div className="border-2 border-dashed border-white/10 hover:border-sky-500/50 bg-[#0b0f19]/40 rounded-xl p-5 text-center transition-colors relative">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Upload size={22} />
                  </div>
                  <div className="text-sm font-medium text-slate-200">
                    কম্পিউটার থেকে লোগো ইমেজ সিলেক্ট করতে ক্লিক করুন
                  </div>
                  <div className="text-xs text-slate-400">
                    সমর্থিত ফরম্যাট: PNG, JPG, WEBP, SVG (সর্বোচ্চ: 5MB)। ফাইলটি সরাসরি ডাটাবেজে সংরক্ষিত হবে।
                  </div>
                </div>
              </div>

              {logoUrl && (
                <div className="flex items-center justify-between p-3 bg-white/3 border border-white/6 rounded-lg text-xs">
                  <div className="flex items-center gap-3">
                    <img src={logoUrl} alt="Selected Logo" className="w-10 h-10 object-contain rounded bg-[#0b0f19] p-1 border border-white/10" />
                    <span className="text-emerald-400 font-medium">✅ লোগো ফাইল ডাটাবেজে সেভ হতে প্রস্তুত</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                    title="লোগো মুছে ফেলুন"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">কোম্পানীর নাম *</label>
                <input
                  type="text"
                  className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2.5 px-3.5 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="উদা. BEST WOOL SWEATERS LTD."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">স্লোগান / ট্যাগলাইন</label>
                <input
                  type="text"
                  className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2.5 px-3.5 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Quality Knitwear Manufacturer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">অফিসিয়াল ইমেইল</label>
                <input
                  type="email"
                  className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2.5 px-3.5 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@bestwool.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">ফোন নম্বর</label>
                <input
                  type="text"
                  className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2.5 px-3.5 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 2 9881234"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">ওয়েবসাইট URL</label>
                <input
                  type="url"
                  className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2.5 px-3.5 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://bestwool.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Tax ID / BIN নম্বর</label>
                <input
                  type="text"
                  className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2.5 px-3.5 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="BIN-100293848123"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">প্রতিষ্ঠানের পূর্ণাঙ্গ ঠিকানা</label>
              <textarea
                rows="3"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg p-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors leading-relaxed"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Plot #12, Road #04, Sector #07, Uttara, Dhaka-1230, Bangladesh"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              <Save size={18} />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'প্রোফাইল ও লোগো ডাটাবেজে সংরক্ষণ করুন'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
