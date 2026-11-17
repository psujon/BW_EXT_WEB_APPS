import React, { useState, useEffect } from 'react';
import { Shield, LayoutGrid, Table } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserPermission({ token }) {
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  useEffect(() => {
    fetchUsersAndPermissions();
  }, [token]);

  const fetchUsersAndPermissions = () => {
    setLoading(true);
    const headers = { 'Authorization': `Bearer ${token}` };

    Promise.all([
      fetch('/api/users', { headers }).then(res => res.json()),
      fetch('/api/users/permissions', { headers }).then(res => res.json())
    ])
      .then(([usersData, permsData]) => {
        setUsers(Array.isArray(usersData) ? usersData : []);

        const permMap = {};
        if (Array.isArray(permsData)) {
          permsData.forEach(p => {
            permMap[`${p.user_id}-${p.menu_key}`] = !!p.can_view;
          });
        }
        setPermissions(permMap);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching users & permissions:', err);
        toast.error('অনুমতি সংক্রান্ত ডাটা লোড করতে ব্যর্থ হয়েছে');
        setLoading(false);
      });
  };

  const handleToggle = (userId, menuKey, currentVal, isOperator) => {
    const key = `${userId}-${menuKey}`;
    const newValue = !currentVal;

    // Optimistic UI update
    setPermissions(prev => ({
      ...prev,
      [key]: newValue
    }));

    const user = users.find(u => u.id === userId);
    const uName = user ? user.name : 'ইউজার';

    fetch(`/api/users/${userId}/permission`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ menu_key: menuKey, can_view: newValue })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update permission');
        return data;
      })
      .then(() => {
        if (newValue) {
          toast.success(`${uName} এর জন্য "${menuKey}" অনুমতি সক্রিয় করা হয়েছে!`);
        } else {
          toast.error(`${uName} এর জন্য "${menuKey}" অনুমতি নিষ্ক্রিয় করা হয়েছে!`);
        }
      })
      .catch(err => {
        // Revert on error
        setPermissions(prev => ({
          ...prev,
          [key]: currentVal
        }));
        toast.error(err.message);
      });
  };

  const menuList = [
    { key: 'dashboard', label: 'Dashboard Overview (ড্যাশবোর্ড)' },
    { key: 'buyer', label: 'Buyer (বায়ার)' },
    { key: 'style', label: 'Style (স্টাইল)' },
    { key: 'process', label: 'Process (প্রসেস)' },
    { key: 'color', label: 'Color (কালার)' },
    { key: 'piece_rate', label: 'Piece Rate (পিস রেট)' },
    { key: 'yarn_challan', label: 'Yarn Challan (ইয়ার্ন চালান)' },
    { key: 'buyer_order_info', label: 'Buyer Order Info (বায়ার অর্ডার ইনফো)' },
    { key: 'production_entry', label: 'Production Entry (প্রোডাকশন এন্ট্রি)' },
    { key: 'production_show', label: 'Production Show (প্রোডাকশন শো)' },
    { key: 'employee_info', label: 'Employee Info (ইমপ্লয়ী ইনফো)' },
    { key: 'pending_buyer_order', label: 'Pending Approval - Buyer Order (বায়ার অর্ডার পেন্ডিং)' },
    { key: 'pending_rewinding', label: 'Pending Approval - Re-Winding (রি-ওয়াইন্ডিং পেন্ডিং)' },
    { key: 'reports', label: 'Reports Panel - Employee List (রিপোর্টস - এমপ্লয়ী লিস্ট)' },
    { key: 'user', label: 'User Settings (ইউজার সেটিংস)' },
    { key: 'user_permission', label: 'Permissions (অনুমতি কনফিগার)' },
    { key: 'company_profile', label: 'Company Profile (কোম্পানী প্রোফাইল)' },
    { key: 'database_backup', label: 'Database Backup (ব্যাকআপ)' }
  ];

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Shield size={18} className="text-sky-400" />
          অপারেটর ও ইউজার পারমিশন কলাম ম্যাট্রিক্স
        </h3>

        {/* View Mode Toggle Switcher */}
        <div className="flex items-center gap-1 bg-[#131b2e] border border-white/6 rounded-lg p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Table size={14} />
            <span>কলাম ম্যাট্রিক্স ভিউ</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <LayoutGrid size={14} />
            <span>কার্ড গ্রিড ভিউ</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400">ইউজার তালিকা ও পারমিশন ডাটা লোড হচ্ছে...</div>
      ) : viewMode === 'table' ? (
        /* Multi-Column Permission Matrix Table */
        <div className="border border-white/6 rounded-2xl overflow-hidden bg-[#18223c]/75 backdrop-blur-md overflow-x-auto shadow-xl">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-[#131b2e] border-b border-white/6">
                <th className="py-4 px-4 text-slate-300 font-semibold w-12 text-center">#</th>
                <th className="py-4 px-4 text-slate-300 font-semibold min-w-[220px]">মেন্যু পেজের নাম</th>
                {users.map((u) => (
                  <th className="py-4 px-4 text-center border-l border-white/6 min-w-[170px]" key={u.id}>
                    <div className="flex flex-col items-center">
                      <span className="text-slate-100 font-bold text-sm">{u.name}</span>
                      <span className="text-sky-400 text-xs font-normal">@{u.username}</span>
                      <span className={`mt-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : u.role === 'operator'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}>
                        {u.role}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {menuList.map((menu, idx) => (
                <tr key={menu.key} className="hover:bg-white/2 transition-colors">
                  <td className="py-3 px-4 text-slate-500 text-xs text-center">{idx + 1}</td>
                  <td className="py-3 px-4 text-slate-200 font-medium text-xs">{menu.label}</td>
                  {users.map((u) => {
                    const isAdmin = u.role === 'admin';
                    const isOperator = u.role === 'operator';
                    const permKey = `${u.id}-${menu.key}`;
                    const isDefaultOperatorAllowed = isOperator && ['dashboard', 'production_entry', 'production_show', 'employee_info', 'yarn_challan', 'buyer_order_info', 'style', 'buyer'].includes(menu.key);
                    const isChecked = isAdmin || (permissions[permKey] !== undefined ? permissions[permKey] : isDefaultOperatorAllowed);

                    return (
                      <td className="py-3 px-4 text-center border-l border-white/6" key={u.id}>
                        <div
                          onClick={() => {
                            if (!isAdmin) handleToggle(u.id, menu.key, isChecked, isOperator);
                          }}
                          className={`w-10 h-5 mx-auto rounded-full transition-colors relative ${isAdmin
                              ? 'bg-emerald-500/50 cursor-not-allowed'
                              : isChecked
                                ? 'bg-sky-500 cursor-pointer'
                                : 'bg-slate-700 cursor-pointer'
                            }`}
                          title={isAdmin ? 'এডমিন সকল পেজে ফুল অ্যাক্সেস পাবেন' : (isChecked ? 'অনুমতি অন' : 'অনুমতি অফ')}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${isChecked ? 'translate-x-5' : 'translate-x-1'
                            }`} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            const isAdmin = user.role === 'admin';
            const isOperator = user.role === 'operator';

            return (
              <div className="bg-[#18223c]/75 backdrop-blur-md border border-white/6 rounded-2xl p-6 shadow-xl flex flex-col justify-between" key={user.id}>
                <div>
                  <div className="flex items-center justify-between border-b border-white/6 pb-4 mb-4">
                    <div>
                      <strong className="text-base text-slate-100">{user.name}</strong>
                      <div className="text-xs text-sky-400 font-medium mt-0.5">@{user.username}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${isAdmin
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : isOperator
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}>
                      {user.role}
                    </span>
                  </div>

                  <div className="space-y-1">
                    {menuList.map((menu) => {
                      const permKey = `${user.id}-${menu.key}`;
                      const isDefaultOperatorAllowed = isOperator && ['dashboard', 'production_entry', 'production_show', 'employee_info', 'yarn_challan', 'buyer_order_info', 'style', 'buyer'].includes(menu.key);
                      const isChecked = isAdmin || (permissions[permKey] !== undefined ? permissions[permKey] : isDefaultOperatorAllowed);

                      return (
                        <div className="flex items-center justify-between py-2 border-b border-white/[0.03]" key={menu.key}>
                          <span className="text-xs text-slate-300">{menu.label}</span>
                          <div
                            onClick={() => {
                              if (!isAdmin) handleToggle(user.id, menu.key, isChecked, isOperator);
                            }}
                            className={`w-10 h-5 rounded-full transition-colors relative shrink-0 ${isAdmin
                                ? 'bg-emerald-500/50 cursor-not-allowed'
                                : isChecked
                                  ? 'bg-sky-500 cursor-pointer'
                                  : 'bg-slate-700 cursor-pointer'
                              }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${isChecked ? 'translate-x-5' : 'translate-x-1'
                              }`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
