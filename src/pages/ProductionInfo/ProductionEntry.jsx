import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Plus, Trash2, Save, UserCheck, ChevronDown, X } from 'lucide-react';
import toast from 'react-hot-toast';

function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  required = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.id) === String(value));

  const filteredOptions = options.filter((opt) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const labelMatch = opt.label && String(opt.label).toLowerCase().includes(term);
    const subMatch = opt.sublabel && String(opt.sublabel).toLowerCase().includes(term);
    return labelMatch || subMatch;
  });

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-10'}`} ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 pr-8 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
          placeholder={placeholder}
          value={isOpen ? searchTerm : (selectedOption ? selectedOption.label : '')}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          required={required && !value}
        />
        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-400 transition-colors p-0.5 rounded-full cursor-pointer"
            title="রিসেট করুন"
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[9999] left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl backdrop-blur-xl py-1 divide-y divide-white/5">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = String(opt.id) === String(value);
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`px-3 py-2 text-xs cursor-pointer hover:bg-sky-500/20 hover:text-sky-200 transition-colors flex items-center justify-between ${isSelected ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-200'
                    }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.sublabel && (
                    <span className="text-[10px] text-slate-400 ml-2 shrink-0">{opt.sublabel}</span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-3 py-3 text-xs text-slate-500 text-center">
              কোনো ফলাফল পাওয়া যায়নি
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ProductionEntry({ token }) {
  const [sections, setSections] = useState([]);
  const [styles, setStyles] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [colors, setColors] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Form Fields
  const [sectionId, setSectionId] = useState('');
  const [styleId, setStyleId] = useState('');
  const [processId, setProcessId] = useState('');
  const [colorId, setColorId] = useState('');
  const [productionDate, setProductionDate] = useState(getTodayDateString());

  // Dynamic Card Items List
  const [cards, setCards] = useState([
    { id: Date.now(), card_no: '', employee_id: null, emp_name: '', quantity: '' }
  ]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSections();
    fetchStyles();
    fetchProcesses();
    fetchColors();
    fetchEmployees();
  }, []);

  const fetchSections = () => {
    fetch('/api/sections', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setSections(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching sections:', err));
  };

  const fetchStyles = () => {
    fetch('/api/styles', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStyles(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching styles:', err));
  };

  const fetchProcesses = () => {
    fetch('/api/processes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProcesses(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching processes:', err));
  };

  const fetchColors = () => {
    fetch('/api/colors', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setColors(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching colors:', err));
  };

  const fetchEmployees = () => {
    fetch('/api/employees', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setEmployees(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching employees:', err));
  };

  // Filter employees belonging to the selected section
  const getSectionEmployees = (secId = sectionId) => {
    if (!secId) return employees;
    return employees.filter(e => e.section_id === parseInt(secId));
  };

  // Section Selection Handler
  const handleSectionChange = (newSecId) => {
    setSectionId(newSecId);
    setProcessId('');
    setColorId('');

    if (newSecId) {
      const secEmps = employees.filter(e => e.section_id === parseInt(newSecId));
      setCards(prev => prev.map(c => {
        if (c.card_no) {
          const trimmedVal = c.card_no.trim().toLowerCase();
          const matched = secEmps.find(e => e.card_no.trim().toLowerCase() === trimmedVal || e.card_no.trim().toLowerCase().includes(trimmedVal));
          return {
            ...c,
            card_no: matched ? matched.card_no : c.card_no,
            employee_id: matched ? matched.id : null,
            emp_name: matched ? matched.name : ''
          };
        }
        return c;
      }));
    }
  };

  // Card Rows Management
  const handleAddCardRow = () => {
    setCards(prev => [
      ...prev,
      { id: Date.now(), card_no: '', employee_id: null, emp_name: '', quantity: '' }
    ]);
  };

  const handleRemoveCardRow = (id) => {
    if (cards.length === 1) {
      toast.error('কমপক্ষে ১ টি কার্ড রেকর্ড থাকা প্রয়োজন!');
      return;
    }
    setCards(prev => prev.filter(c => c.id !== id));
  };

  // Live Section-wise Card Search as User Types
  const handleCardNoChange = (id, cardNoVal) => {
    const availableEmployees = getSectionEmployees();
    setCards(prev => prev.map(c => {
      if (c.id === id) {
        const trimmedVal = cardNoVal.trim().toLowerCase();
        let matchedEmp = null;
        if (trimmedVal) {
          matchedEmp = availableEmployees.find(e => e.card_no.trim().toLowerCase() === trimmedVal) ||
            availableEmployees.find(e => e.card_no.trim().toLowerCase().includes(trimmedVal));
        }
        return {
          ...c,
          card_no: cardNoVal,
          employee_id: matchedEmp ? matchedEmp.id : null,
          emp_name: matchedEmp ? matchedEmp.name : ''
        };
      }
      return c;
    }));
  };

  // Section-wise Card Search on Blur & Auto-fill Full Card No into Input
  const handleCardNoBlur = (id, cardNoVal) => {
    const trimmedVal = cardNoVal.trim().toLowerCase();
    if (!trimmedVal) return;

    if (!sectionId) {
      toast.error('দয়া করে প্রথমে সেকশন নির্বাচন করুন!');
      return;
    }

    const selectedSec = sections.find(s => s.id === parseInt(sectionId));
    const secName = selectedSec ? selectedSec.name : '';
    const availableEmployees = getSectionEmployees();

    // Search exact match first, then partial match in this section
    let matchedEmp = availableEmployees.find(e => e.card_no.trim().toLowerCase() === trimmedVal);

    if (!matchedEmp) {
      matchedEmp = availableEmployees.find(e => e.card_no.trim().toLowerCase().includes(trimmedVal));
    }

    if (matchedEmp) {
      setCards(prev => prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            card_no: matchedEmp.card_no,
            employee_id: matchedEmp.id,
            emp_name: matchedEmp.name
          };
        }
        return c;
      }));
      toast.success(`"${secName}" সেকশনে ইমপ্লয়ী নিশ্চিত করা হয়েছে: ${matchedEmp.card_no} (${matchedEmp.name})`);
    } else {
      setCards(prev => prev.map(c => c.id === id ? { ...c, employee_id: null, emp_name: '' } : c));
      toast.error(`"${secName}" সেকশনে "${cardNoVal}" কার্ড নম্বরের কোনো একটিভ ইমপ্লয়ী পাওয়া যায়নি!`);
    }
  };

  const handleCardFieldChange = (id, field, value) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!sectionId || !styleId || !processId || !colorId || !productionDate) {
      toast.error('দয়া করে সেকশন, স্টাইল, প্রসেস, কালার ও প্রোডাকশন ডেট নির্বাচন করুন!');
      return;
    }

    const invalidCard = cards.find(c => c.card_no.trim() !== '' && !c.emp_name);
    if (invalidCard) {
      const selectedSec = sections.find(s => s.id === parseInt(sectionId));
      const secName = selectedSec ? selectedSec.name : '';
      toast.error(`"${secName}" সেকশনে কার্ড নম্বর (${invalidCard.card_no}) এর একটিভ ইমপ্লয়ী পাওয়া যায়নি!`);
      return;
    }

    const validCards = cards.filter(c => c.card_no.trim() !== '' && parseInt(c.quantity) > 0);
    if (validCards.length === 0) {
      toast.error('কমপক্ষে ১ টি বৈধ কার্ড নম্বর ও কোয়ান্টিটি ইনপুট দিন!');
      return;
    }

    setSaving(true);

    const availableEmployees = getSectionEmployees();
    const payload = {
      section_id: parseInt(sectionId),
      style_id: parseInt(styleId),
      process_id: parseInt(processId),
      color_id: parseInt(colorId),
      production_date: productionDate,
      items: validCards.map(c => {
        let empId = c.employee_id;
        if (!empId) {
          const trimmedVal = c.card_no.trim().toLowerCase();
          const found = availableEmployees.find(e => e.card_no.trim().toLowerCase() === trimmedVal) ||
            availableEmployees.find(e => e.card_no.trim().toLowerCase().includes(trimmedVal));
          if (found) empId = found.id;
        }
        return {
          employee_id: empId,
          card_no: empId ? String(empId) : c.card_no,
          quantity: parseInt(c.quantity)
        };
      })
    };

    fetch('/api/production', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to record production');
        return data;
      })
      .then((data) => {
        toast.success(data.message || 'সবগুলো কার্ডের প্রোডাকশন এন্ট্রি সফলভাবে ডাটাবেজে সংরক্ষণ করা হয়েছে!');
        setCards([{ id: Date.now(), card_no: '', employee_id: null, emp_name: '', quantity: '' }]);
        setSaving(false);
      })
      .catch(err => {
        toast.error(err.message);
        setSaving(false);
      });
  };

  // Options formatting for SearchableSelect Style
  const styleOptions = styles?.map((st) => ({
    id: st.id,
    label: st.style_no,
    sublabel: ''
  })) || [];

  // Section + Style wise process load
  const filteredProcesses = (sectionId && styleId)
    ? processes.filter(p => p.section_id === parseInt(sectionId) && p.style_id === parseInt(styleId))
    : [];

  // Process wise color load
  const filteredColors = (sectionId && styleId && processId)
    ? colors.filter(c =>
      c.section_id === parseInt(sectionId) &&
      c.style_id === parseInt(styleId) &&
      c.process_id === parseInt(processId)
    )
    : [];

  const totalQuantity = cards.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Header Card Selection Panel */}
        <div className="relative z-20 bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2 pb-3 border-b border-white/6">
            <Edit3 size={18} className="text-sky-400" />
            প্রোডাকশন ব্যাচ ও ক্যাটাগরি নির্বাচন
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">সেকশন (Section) *</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={sectionId}
                onChange={(e) => handleSectionChange(e.target.value)}
                required
              >
                <option value="">Select Section</option>
                {sections?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">স্টাইল নম্বর *</label>
              <SearchableSelect
                options={styleOptions}
                value={styleId}
                onChange={(selectedId) => {
                  setStyleId(selectedId);
                  setProcessId('');
                  setColorId('');
                }}
                placeholder="Select Style..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">প্রসেস *</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                value={processId}
                onChange={(e) => {
                  setProcessId(e.target.value);
                  setColorId('');
                }}
                required
                disabled={!sectionId || !styleId}
              >
                <option value="">
                  {!sectionId
                    ? "Select section first"
                    : !styleId
                      ? "Select style first"
                      : filteredProcesses.length === 0
                        ? "No processes found for this section & style"
                        : "Select Process"}
                </option>
                {filteredProcesses.map((p) => (
                  <option key={p.id} value={p.id}>{p.process_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">রং (Color) *</label>
              <select
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                value={colorId}
                onChange={(e) => setColorId(e.target.value)}
                required
                disabled={!sectionId || !styleId || !processId}
              >
                <option value="">
                  {!sectionId || !styleId
                    ? "Select section & style first"
                    : !processId
                      ? "Select process first"
                      : filteredColors.length === 0
                        ? "No colors found for this process"
                        : "Select Color"}
                </option>
                {filteredColors.map((c) => (
                  <option key={c.id} value={c.id}>{c.color_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">প্রোডাকশন ডেট *</label>
              <input
                type="date"
                className="w-full bg-[#0b0f19]/50 border border-white/6 rounded-lg py-2 px-3 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Dynamic Card Numbers, Employee Name & Quantity Panel */}
        <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/6">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">কার্ড নম্বর, ইমপ্লয়ীর নাম ও কোয়ান্টিটি লিস্ট</h3>
              <p className="text-xs text-slate-400 mt-0.5">নির্বাচিত সেকশন অনুযায়ী কার্ড নম্বর ফিল্টার করে ইমপ্লয়ীর নাম ফেচ করা হবে</p>
            </div>
            <button
              type="button"
              onClick={handleAddCardRow}
              className="bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold py-2 px-3.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} />
              <span>নতুন কার্ড সারির সারি যোগ করুন</span>
            </button>
          </div>

          <div className="space-y-3">
            {cards.map((item, index) => (
              <div key={item.id} className="flex flex-col md:flex-row items-center gap-3 bg-[#0b0f19]/40 border border-white/6 p-3 rounded-xl">
                <span className="text-xs font-bold text-slate-400 w-8 shrink-0">#{index + 1}</span>

                {/* Card No Input with Section-wise Search */}
                <div className="w-full md:flex-1 relative">
                  <input
                    type="text"
                    list={`employee-cards-${sectionId}`}
                    className="w-full bg-[#0b0f19]/60 border border-white/6 rounded-lg py-2 px-3 pr-16 text-slate-100 text-sm focus:outline-none focus:border-sky-500 transition-colors font-medium"
                    value={item.card_no}
                    onChange={(e) => handleCardNoChange(item.id, e.target.value)}
                    onBlur={(e) => handleCardNoBlur(item.id, e.target.value)}
                    placeholder={sectionId ? "কার্ড নম্বর লিখুন বা সিলেক্ট করুন" : "প্রথমে সেকশন সিলেক্ট করুন"}
                    required
                  />
                  {item.employee_id && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono pointer-events-none font-bold">
                      ID: {item.employee_id}
                    </span>
                  )}
                </div>

                {/* Employee Name (Auto Populated) */}
                <div className="w-full md:flex-1 relative">
                  <input
                    type="text"
                    readOnly
                    className={`w-full border rounded-lg py-2 px-3 text-sm focus:outline-none transition-colors ${item.emp_name
                      ? 'bg-sky-500/10 border-sky-500/30 text-sky-300 font-semibold'
                      : 'bg-[#0b0f19]/30 border-red-500/20 text-red-400 placeholder:text-slate-600'
                      }`}
                    value={item.emp_name}
                    placeholder="সেকশন ওয়াইজ ইমপ্লয়ীর নাম"
                  />
                  {item.emp_name && (
                    <UserCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-400" />
                  )}
                </div>

                {/* Quantity Input */}
                <div className="w-full md:flex-1">
                  <input
                    type="number"
                    disabled={!item.emp_name}
                    className={`w-full border rounded-lg py-2 px-3 text-sm focus:outline-none transition-colors ${item.emp_name
                      ? 'bg-[#0b0f19]/60 border-white/6 text-slate-100 focus:border-sky-500'
                      : 'bg-[#0b0f19]/20 border-white/5 text-slate-600 cursor-not-allowed opacity-50'
                      }`}
                    value={item.quantity}
                    onChange={(e) => handleCardFieldChange(item.id, 'quantity', e.target.value)}
                    placeholder={item.emp_name ? "কোয়ান্টিটি (pcs)" : "কার্ড নং না থাকায় নিষ্ক্রিয়"}
                    required
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleAddCardRow}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleAddCardRow();
                      }
                    }}
                    className="w-9 h-9 border border-sky-500/20 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 rounded-lg flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    title="নতুন কার্ড সারি যোগ করুন (মাউস ক্লিক, Enter অথবা Space চাপুন)"
                  >
                    <Plus size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveCardRow(item.id)}
                    className="w-9 h-9 border border-red-500/10 text-red-400 hover:bg-red-500/10 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                    title="এই সারির কার্ড মুছে ফেলুন"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <datalist id={`employee-cards-${sectionId}`}>
            {getSectionEmployees().map(emp => (
              <option key={emp.id} value={emp.card_no}>
                {emp.card_no} - {emp.name} ({emp.designation}) [ID: {emp.id}]
              </option>
            ))}
          </datalist>

          {/* Footer Actions & Total Calculation */}
          <div className="pt-4 border-t border-white/6 flex items-center justify-between">
            <div className="text-sm text-slate-300">
              মোট রেকর্ড: <strong className="text-sky-400">{cards.length}</strong> টি কার্ড |
              মোট কোয়ান্টিটি: <strong className="text-emerald-400">{totalQuantity.toLocaleString()}</strong> pcs
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg shadow-sky-500/10 transition-colors duration-200 cursor-pointer flex items-center gap-2 text-sm"
            >
              <Save size={18} />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'সবগুলো কার্ড একসাথে সংরক্ষণ করুন'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
