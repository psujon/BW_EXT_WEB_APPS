import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, Layers, UserCheck, Bookmark, ListChecks, DollarSign, Truck, ShoppingBag,
  Gauge, Edit3, Eye, Settings, Users, Lock, Database, ChevronDown, Palette, Building2, ChevronLeft, Clock, RefreshCw, FileText, BarChart2, KeyRound
} from 'lucide-react';

export default function Sidebar({ permissions, user, sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  // Accordion open/close states
  const [openMenus, setOpenMenus] = useState({
    orderManagement: false,
    productionInfo: false,
    pendingApproval: false,
    reports: false,
    settings: false
  });

  // Automatically keep accordions open if one of their sub-links is active
  useEffect(() => {
    const path = location.pathname;
    if (['/dashboard/buyer', '/dashboard/style', '/dashboard/process', '/dashboard/color', '/dashboard/piece-rate', '/dashboard/buyer-order-info', '/dashboard/yarn-challan'].some(p => path.startsWith(p))) {
      setOpenMenus(prev => ({ ...prev, orderManagement: true }));
    }
    if (['/dashboard/production-entry', '/dashboard/production-show'].some(p => path.startsWith(p))) {
      setOpenMenus(prev => ({ ...prev, productionInfo: true }));
    }
    if (['/dashboard/pending-buyer-order', '/dashboard/pending-rewinding'].some(p => path.startsWith(p))) {
      setOpenMenus(prev => ({ ...prev, pendingApproval: true }));
    }
    if (['/dashboard/reports'].some(p => path.startsWith(p))) {
      setOpenMenus(prev => ({ ...prev, reports: true }));
    }
    if (['/dashboard/user', '/dashboard/user-permission', '/dashboard/section', '/dashboard/company-profile'].some(p => path.startsWith(p))) {
      setOpenMenus(prev => ({ ...prev, settings: true }));
    }
  }, [location.pathname]);

  const toggleMenu = (menuKey) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const hasPermission = (key) => {
    if (user?.role === 'admin') return true;
    return permissions ? !!permissions[key] : true;
  };

  // Helper to check if any child link inside accordion group is active
  const isGroupActive = (paths) => {
    return paths.includes(location.pathname);
  };

  const getMenuItemClass = (isActive) => 
    `flex items-center gap-3 py-3 px-4 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all text-sm font-medium ${
      isActive ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/10' : ''
    }`;

  const getGroupHeaderClass = (isActive) => 
    `flex items-center justify-between py-3 px-4 rounded-xl text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all text-sm font-medium cursor-pointer ${
      isActive ? 'text-sky-400 font-semibold bg-white/2' : ''
    }`;

  return (
    <aside className={`w-[280px] bg-[#131b2e] border-r border-white/6 flex flex-col h-screen fixed left-0 top-0 transition-transform duration-300 z-40 ${
      sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
    }`}>
      {/* Header */}
      <div className="h-[70px] border-b border-white/6 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/10">
            <Layers size={18} />
          </div>
          <span className="font-sans font-bold text-slate-100 tracking-wide text-sm">BEST WOOL APP</span>
        </div>
        {setSidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 rounded-lg border border-white/6 text-slate-400 hover:text-slate-100 hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
            title="সাইডবার লুকান (Hide Sidebar)"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Navigation Menus */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin">
        {/* Overview link */}
        {hasPermission('dashboard') && (
          <NavLink 
            to="/dashboard" 
            end
            className={({ isActive }) => getMenuItemClass(isActive)}
          >
            <Home size={18} />
            <span>ড্যাশবোর্ড ওভারভিউ</span>
          </NavLink>
        )}

        {/* --- 1. Order Management Accordion --- */}
        {(hasPermission('buyer') || hasPermission('style') || hasPermission('process') || hasPermission('color') || 
          hasPermission('piece_rate') || hasPermission('buyer_order_info') || hasPermission('yarn_challan')) && (
          <div className="space-y-1">
            <div 
              className={getGroupHeaderClass(isGroupActive([
                '/dashboard/buyer', '/dashboard/style', '/dashboard/process', '/dashboard/color', 
                '/dashboard/piece-rate', '/dashboard/buyer-order-info', '/dashboard/yarn-challan'
              ]))}
              onClick={() => toggleMenu('orderManagement')}
            >
              <span className="flex items-center gap-3">
                <Layers size={18} />
                <span>অর্ডার ম্যানেজমেন্ট</span>
              </span>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-300 ${openMenus.orderManagement ? 'rotate-180' : ''}`} 
              />
            </div>
            
            <div className={`pl-4 space-y-1 overflow-hidden transition-all duration-300 ${
              openMenus.orderManagement ? 'max-h-[500px] py-1.5' : 'max-h-0'
            }`}>
              {hasPermission('buyer') && (
                <NavLink to="/dashboard/buyer" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <UserCheck size={16} />
                  <span>বায়ার (Buyer)</span>
                </NavLink>
              )}
              {hasPermission('style') && (
                <NavLink to="/dashboard/style" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <Bookmark size={16} />
                  <span>স্টাইল (Style)</span>
                </NavLink>
              )}
              {hasPermission('process') && (
                <NavLink to="/dashboard/process" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <ListChecks size={16} />
                  <span>প্রসেস (Process)</span>
                </NavLink>
              )}
              {hasPermission('color') && (
                <NavLink to="/dashboard/color" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <Palette size={16} />
                  <span>কালার (Color)</span>
                </NavLink>
              )}
              {hasPermission('piece_rate') && (
                <NavLink to="/dashboard/piece-rate" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <DollarSign size={16} />
                  <span>পিস রেট (Piece Rate)</span>
                </NavLink>
              )}
              {hasPermission('buyer_order_info') && (
                <NavLink to="/dashboard/buyer-order-info" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <ShoppingBag size={16} />
                  <span>বায়ার অর্ডার ইনফো</span>
                </NavLink>
              )}
              {hasPermission('yarn_challan') && (
                <NavLink to="/dashboard/yarn-challan" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <Truck size={16} />
                  <span>ইয়ার্ন চালান</span>
                </NavLink>
              )}
            </div>
          </div>
        )}

        {/* --- 2. Production Info Accordion --- */}
        {(hasPermission('production_entry') || hasPermission('production_show')) && (
          <div className="space-y-1">
            <div 
              className={getGroupHeaderClass(isGroupActive([
                '/dashboard/production-entry', '/dashboard/production-show'
              ]))}
              onClick={() => toggleMenu('productionInfo')}
            >
              <span className="flex items-center gap-3">
                <Gauge size={18} />
                <span>প্রোডাকশন ইনফো</span>
              </span>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-300 ${openMenus.productionInfo ? 'rotate-180' : ''}`} 
              />
            </div>

            <div className={`pl-4 space-y-1 overflow-hidden transition-all duration-300 ${
              openMenus.productionInfo ? 'max-h-96 py-1.5' : 'max-h-0'
            }`}>
              {hasPermission('production_entry') && (
                <NavLink to="/dashboard/production-entry" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <Edit3 size={16} />
                  <span>প্রোডাকশন এন্ট্রি</span>
                </NavLink>
              )}
              {hasPermission('production_show') && (
                <NavLink to="/dashboard/production-show" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <Eye size={16} />
                  <span>প্রোডাকশন শো</span>
                </NavLink>
              )}
            </div>
          </div>
        )}

        {/* --- Employee Info Top Level Main Menu --- */}
        {hasPermission('employee_info') && (
          <NavLink 
            to="/dashboard/employee-info" 
            className={({ isActive }) => getMenuItemClass(isActive)}
          >
            <UserCheck size={18} />
            <span>ইমপ্লয়ী ইনফো</span>
          </NavLink>
        )}

        {/* --- Pending Approval Accordion --- */}
        {(hasPermission('pending_buyer_order') || hasPermission('pending_rewinding') || user?.role === 'admin') && (
          <div className="space-y-1">
            <div 
              className={getGroupHeaderClass(isGroupActive([
                '/dashboard/pending-buyer-order', '/dashboard/pending-rewinding'
              ]))}
              onClick={() => toggleMenu('pendingApproval')}
            >
              <span className="flex items-center gap-3">
                <Clock size={18} className="text-amber-400" />
                <span>পেন্ডিং অ্যাপ্রুভাল</span>
              </span>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-300 ${openMenus.pendingApproval ? 'rotate-180' : ''}`} 
              />
            </div>

            <div className={`pl-4 space-y-1 overflow-hidden transition-all duration-300 ${
              openMenus.pendingApproval ? 'max-h-96 py-1.5' : 'max-h-0'
            }`}>
              {(hasPermission('pending_buyer_order') || user?.role === 'admin') && (
                <NavLink to="/dashboard/pending-buyer-order" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <ShoppingBag size={16} />
                  <span>বায়ার অর্ডার</span>
                </NavLink>
              )}
              {(hasPermission('pending_rewinding') || user?.role === 'admin') && (
                <NavLink to="/dashboard/pending-rewinding" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <RefreshCw size={16} />
                  <span>রি-ওয়াইন্ডিং</span>
                </NavLink>
              )}
            </div>
          </div>
        )}

        {/* --- Reports Direct Top Level Main Menu --- */}
        {(hasPermission('reports') || user?.role === 'admin' || user?.role === 'operator') && (
          <NavLink 
            to="/dashboard/reports" 
            className={({ isActive }) => getMenuItemClass(isActive)}
          >
            <BarChart2 size={18} />
            <span>রিপোর্টস (Reports)</span>
          </NavLink>
        )}

        {/* --- 3. Settings Accordion --- */}
        {(hasPermission('user') || hasPermission('user_permission')) && (
          <div className="space-y-1">
            <div 
              className={getGroupHeaderClass(isGroupActive([
                '/dashboard/user', '/dashboard/user-permission', '/dashboard/change-password', '/dashboard/section', '/dashboard/company-profile'
              ]))}
              onClick={() => toggleMenu('settings')}
            >
              <span className="flex items-center gap-3">
                <Settings size={18} />
                <span>সেটিংস</span>
              </span>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-300 ${openMenus.settings ? 'rotate-180' : ''}`} 
              />
            </div>

            <div className={`pl-4 space-y-1 overflow-hidden transition-all duration-300 ${
              openMenus.settings ? 'max-h-96 py-1.5' : 'max-h-0'
            }`}>
              {hasPermission('user') && (
                <NavLink to="/dashboard/user" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <Users size={16} />
                  <span>ইউজার (Users)</span>
                </NavLink>
              )}
              {hasPermission('user_permission') && (
                <NavLink to="/dashboard/user-permission" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <Lock size={16} />
                  <span>ইউজার পারমিশন</span>
                </NavLink>
              )}
              <NavLink to="/dashboard/change-password" className={({ isActive }) => getMenuItemClass(isActive)}>
                <KeyRound size={16} />
                <span>পাসওয়ার্ড পরিবর্তন</span>
              </NavLink>
              {hasPermission('section') && (
                <NavLink to="/dashboard/section" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <Layers size={16} />
                  <span>সেকশন (Section)</span>
                </NavLink>
              )}
              {hasPermission('company_profile') && (
                <NavLink to="/dashboard/company-profile" className={({ isActive }) => getMenuItemClass(isActive)}>
                  <Building2 size={16} />
                  <span>কোম্পানী প্রোফাইল</span>
                </NavLink>
              )}
            </div>
          </div>
        )}

        {/* --- 4. Database Backup --- */}
        {hasPermission('database_backup') && (
          <NavLink to="/dashboard/database-backup" className={({ isActive }) => getMenuItemClass(isActive)}>
            <Database size={18} />
            <span>ডাটাবেজ ব্যাকআপ</span>
          </NavLink>
        )}
      </div>

      {/* Footer / Profile */}
      <div className="p-6 border-t border-white/6 shrink-0 bg-[#0d1322]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold shadow-md">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="flex flex-col">
            <div className="text-slate-200 text-sm font-semibold">{user?.name || 'ব্যবহারকারী'}</div>
            <div className="text-slate-500 text-xs mt-0.5 uppercase tracking-wider">{user?.role || 'User'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
