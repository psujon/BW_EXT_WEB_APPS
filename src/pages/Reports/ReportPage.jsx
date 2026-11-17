import React, { useState, useEffect, useRef } from 'react';
import { FileText, Filter, Users, ShoppingBag, Gauge, ExternalLink, DollarSign, RotateCcw, ChevronDown, X, BarChart3, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

// Type & Select (Searchable Combobox) for Card No
function SearchableCardSelect({ employees, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedEmp = employees.find(e => e.card_no === value);

  const filteredEmployees = employees.filter(emp => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (emp.card_no && emp.card_no.toLowerCase().includes(term)) ||
      (emp.name && emp.name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="relative z-50" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full bg-[#0b0f19]/60 border border-white/10 rounded-xl py-2.5 pl-3 pr-8 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors"
          placeholder="কার্ড নং সিলেক্ট করুন..."
          value={isOpen ? searchTerm : (selectedEmp ? `${selectedEmp.card_no} - ${selectedEmp.name}` : (value === 'All' ? '-- সকল কার্ড নং --' : value))}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
        />
        {value !== 'All' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('All');
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute right-2 top-2.5 text-slate-400 hover:text-rose-400 p-0.5 rounded-full"
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} className="absolute right-2.5 top-3 text-slate-400 pointer-events-none" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl py-1 divide-y divide-white/5">
          <div
            onClick={() => {
              onChange('All');
              setIsOpen(false);
              setSearchTerm('');
            }}
            className={`px-3 py-2 text-xs cursor-pointer hover:bg-sky-500/20 hover:text-sky-300 transition-colors ${value === 'All' ? 'bg-sky-500/10 text-sky-400 font-bold' : 'text-slate-400'}`}
          >
            -- সকল কার্ড নং --
          </div>
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map(emp => (
              <div
                key={emp.id}
                onClick={() => {
                  onChange(emp.card_no);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className={`px-3 py-2 text-xs cursor-pointer hover:bg-sky-500/20 hover:text-sky-200 transition-colors flex items-center justify-between ${value === emp.card_no ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-200'}`}
              >
                <span><strong className="text-sky-400">{emp.card_no}</strong> - {emp.name}</span>
                <span className="text-[10px] text-slate-400">{emp.designation}</span>
              </div>
            ))
          ) : (
            <div className="px-3 py-3 text-xs text-slate-500 text-center">
              কোনো কার্ড নং পাওয়া যায়নি
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReportPage({ token }) {
  const [sections, setSections] = useState([]);
  const [employees, setEmployees] = useState([]);

  const getFirstDayOfCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Global Filter States (Default: Start Date = 1st of running month, End Date = today)
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedCardNo, setSelectedCardNo] = useState('All');
  const [startDate, setStartDate] = useState(getFirstDayOfCurrentMonth);
  const [endDate, setEndDate] = useState(getTodayDate);

  useEffect(() => {
    fetchOptions();
  }, [token]);

  const fetchOptions = () => {
    const headers = { 'Authorization': `Bearer ${token}` };

    // Fetch Sections
    fetch('/api/sections', { headers })
      .then(res => res.json())
      .then(data => setSections(Array.isArray(data) ? data : []))
      .catch(console.error);

    // Fetch Active Employees for Card No dropdown
    fetch('/api/employees', { headers })
      .then(res => res.json())
      .then(data => setEmployees(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const handleResetFilters = () => {
    setSelectedSection('All');
    setSelectedCardNo('All');
    setStartDate(getFirstDayOfCurrentMonth());
    setEndDate(getTodayDate());
    toast.success('সকল ফিল্টার রিসেট করা হয়েছে!');
  };

  // Helper to build query parameters
  const buildQueryParams = () => {
    const queryParams = new URLSearchParams();
    queryParams.append('token', token);
    if (selectedSection !== 'All') queryParams.append('section_id', selectedSection);
    if (selectedCardNo !== 'All') queryParams.append('search', selectedCardNo);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    return queryParams.toString();
  };

  // 1. Employee List PDF (Image-1) - Returns all employees if no parameters, or filters by section / join_date
  const handleOpenEmployeePdf = () => {
    const params = new URLSearchParams();
    params.append('token', token);

    if (selectedSection !== 'All') {
      params.append('section_id', selectedSection);
    }
    if (selectedCardNo !== 'All') {
      params.append('search', selectedCardNo);
    }

    const pdfUrl = `/api/reports/pdf/employee?${params.toString()}`;
    const pdfWin = window.open(pdfUrl, '_blank');
    if (!pdfWin) toast.error('পপ-আপ উইন্ডো ব্লক করা আছে! দয়া করে ব্রাউজারে পপ-আপ অনুমতি দিন।');
    else toast.success('এমপ্লয়ী লিস্ট PDF রিপোর্ট অন্য ট্যাবে চালু করা হয়েছে!');
  };

  // 2. Monthly Worker Production Sheet PDF (Image-2)
  const handleOpenMonthlyProductionPdf = () => {
    if (selectedSection === 'All') {
      toast.error('দয়া করে সেকশন সিলেক্ট করুন!');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('দয়া করে তারিখ (হতে) এবং তারিখ (পর্যন্ত) সিলেক্ট করুন!');
      return;
    }
    const pdfUrl = `/api/reports/pdf/monthly-production?${buildQueryParams()}`;
    const pdfWin = window.open(pdfUrl, '_blank');
    if (!pdfWin) toast.error('পপ-আপ উইন্ডো ব্লক করা আছে! দয়া করে ব্রাউজারে পপ-আপ অনুমতি দিন।');
    else toast.success('মান্থলি প্রোডাকশন রিপোর্ট অন্য ট্যাবে চালু করা হয়েছে!');
  };

  // 3. Monthly Wages Sheet PDF (Image-3)
  const handleOpenMonthlyWagesPdf = () => {
    if (selectedSection === 'All') {
      toast.error('দয়া করে সেকশন সিলেক্ট করুন!');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('দয়া করে তারিখ (হতে) এবং তারিখ (পর্যন্ত) সিলেক্ট করুন!');
      return;
    }
    const pdfUrl = `/api/reports/pdf/monthly-wages?${buildQueryParams()}`;
    const pdfWin = window.open(pdfUrl, '_blank');
    if (!pdfWin) toast.error('পপ-আপ উইন্ডো ব্লক করা আছে! দয়া করে ব্রাউজারে পপ-আপ অনুমতি দিন।');
    else toast.success('মান্থলি ওয়েজেস রিপোর্ট অন্য ট্যাবে চালু করা হয়েছে!');
  };

  // 4. Monthly Production Statement PDF (Image-4)
  const handleOpenMonthlyProductionStatementPdf = () => {
    if (selectedSection === 'All') {
      toast.error('দয়া করে সেকশন সিলেক্ট করুন!');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('দয়া করে তারিখ (হতে) এবং তারিখ (পর্যন্ত) সিলেক্ট করুন!');
      return;
    }
    const pdfUrl = `/api/reports/pdf/monthly-production-statement?${buildQueryParams()}`;
    const pdfWin = window.open(pdfUrl, '_blank');
    if (!pdfWin) toast.error('পপ-আপ উইন্ডো ব্লক করা আছে! দয়া করে ব্রাউজারে পপ-আপ অনুমতি দিন।');
    else toast.success('মান্থলি প্রোডাকশন সামারী রিপোর্ট অন্য ট্যাবে চালু করা হয়েছে!');
  };

  // 5. Monthly Rate Sheet PDF (NEW - Style, Process, Color Grouped Single Rate View)
  const handleOpenMonthlyRateSheetPdf = () => {
    if (selectedSection === 'All') {
      toast.error('দয়া করে সেকশন সিলেক্ট করুন!');
      return;
    }
    const pdfUrl = `/api/reports/pdf/monthly-rate-sheet?${buildQueryParams()}`;
    const pdfWin = window.open(pdfUrl, '_blank');
    if (!pdfWin) toast.error('পপ-আপ উইন্ডো ব্লক করা আছে! দয়া করে ব্রাউজারে পপ-আপ অনুমতি দিন।');
    else toast.success('মান্থলি রেট শীট PDF অন্য ট্যাবে চালু করা হয়েছে!');
  };

  // 6. Buyer Order PDF
  const handleOpenBuyerOrderPdf = () => {
    const pdfUrl = `/api/reports/pdf/employee?${buildQueryParams()}`;
    const pdfWin = window.open(pdfUrl, '_blank');
    if (!pdfWin) toast.error('পপ-আপ উইন্ডো ব্লক করা আছে! দয়া করে ব্রাউজারে পপ-আপ অনুমতি দিন।');
    else toast.success('বায়ার অর্ডার PDF রিপোর্ট অন্য ট্যাবে চালু করা হয়েছে!');
  };

  return (
    <div className="space-y-6">
      
      <div className="relative z-40 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/6 pb-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-sky-400" />
            <span className="text-sm font-semibold text-slate-200">গ্লোবাল রিপোর্ট ফিল্টার (Global Report Filters)</span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>ফিল্টার রিসেট</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* 1. Section Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">সেকশন (Section)</label>
            <select
              className="w-full bg-[#0b0f19]/60 border border-white/10 rounded-xl py-2.5 px-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="All">-- সকল সেকশন --</option>
              {sections.map(sec => (
                <option key={sec.id} value={sec.id}>{sec.name} ({sec.code})</option>
              ))}
            </select>
          </div>

          {/* 2. Card No Filter with Type & Select (Searchable Autocomplete) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">কার্ড নম্বর (Card No)</label>
            <SearchableCardSelect
              employees={employees}
              value={selectedCardNo}
              onChange={setSelectedCardNo}
            />
          </div>

          {/* 3. Date Range: From */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">তারিখ (হতে)</label>
            <input
              type="date"
              className="w-full bg-[#0b0f19]/60 border border-white/10 rounded-xl py-2.5 px-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* 4. Date Range: To */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">তারিখ (পর্যন্ত)</label>
            <input
              type="date"
              className="w-full bg-[#0b0f19]/60 border border-white/10 rounded-xl py-2.5 px-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 transition-colors"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Report Generator Buttons Grid Section */}
      <div className="relative z-10 space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-sky-400" />
          <h3 className="text-base font-bold text-slate-100">রিপোর্ট জেনারেটর অপশন (Report Actions Grid)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Employee List Report (Image-1) */}
          <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 hover:border-sky-500/30 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Users size={22} />
              </div>
              <h4 className="text-base font-bold text-slate-100">এমপ্লয়ী লিস্ট রিপোর্ট</h4>
            </div>

            <button
              onClick={handleOpenEmployeePdf}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-sky-500/10 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              <ExternalLink size={15} />
              <span>এমপ্লয়ী লিস্ট PDF</span>
            </button>
          </div>

          {/* Card 2: Monthly Worker Production Sheet (Image-2) */}
          <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 hover:border-emerald-500/30 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Gauge size={22} />
              </div>
              <h4 className="text-base font-bold text-slate-100">মান্থলি ওয়ার্কার প্রোডাকশন রিপোর্ট</h4>
            </div>

            <button
              onClick={handleOpenMonthlyProductionPdf}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/10 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              <Gauge size={15} />
              <span>মান্থলি প্রোডাকশন PDF</span>
            </button>
          </div>

          {/* Card 3: Monthly Wages Sheet (Image-3) */}
          <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 hover:border-amber-500/30 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <DollarSign size={22} />
              </div>
              <h4 className="text-base font-bold text-slate-100">মান্থলি ওয়েজেস রিপোর্ট</h4>
            </div>

            <button
              onClick={handleOpenMonthlyWagesPdf}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              <DollarSign size={15} />
              <span>মান্থলি ওয়েজেস PDF</span>
            </button>
          </div>

          {/* Card 4: Monthly Production Statement (Image-4) */}
          <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 hover:border-cyan-500/30 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <BarChart3 size={22} />
              </div>
              <h4 className="text-base font-bold text-slate-100">মান্থলি প্রোডাকশন সামারী</h4>
            </div>

            <button
              onClick={handleOpenMonthlyProductionStatementPdf}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-cyan-500/10 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              <BarChart3 size={15} />
              <span>মান্থলি প্রোডাকশন সামারী PDF</span>
            </button>
          </div>

          {/* Card 5: Monthly Rate Sheet (NEW) */}
          <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 hover:border-rose-500/30 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Tag size={22} />
              </div>
              <h4 className="text-base font-bold text-slate-100">মান্থলি রেট শীট</h4>
            </div>

            <button
              onClick={handleOpenMonthlyRateSheetPdf}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-rose-500/10 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              <Tag size={15} />
              <span>মান্থলি রেট শীট PDF</span>
            </button>
          </div>

          {/* Card 6: Buyer Order Report */}
          <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 hover:border-purple-500/30 rounded-2xl p-5 shadow-xl transition-all flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <ShoppingBag size={22} />
              </div>
              <h4 className="text-base font-bold text-slate-100">বায়ার অর্ডার রিপোর্ট</h4>
            </div>

            <button
              onClick={handleOpenBuyerOrderPdf}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-purple-500/10 transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
            >
              <ShoppingBag size={15} />
              <span>বায়ার অর্ডার PDF</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
