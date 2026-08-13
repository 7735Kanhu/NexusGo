'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  PackageCheck,
  CalendarCheck,
  Banknote,
  HandCoins,
  Receipt,
  FileText,
  Calculator,
  Gauge,
  FolderLock,
  Award,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  Truck,
  TrendingUp,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: SidebarItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Delivery Boys', href: '/admin/delivery-boys', icon: Users },
  { name: 'Deliveries', href: '/admin/deliveries', icon: PackageCheck },
  { name: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
  { name: 'Payments', href: '/admin/payments', icon: Banknote },
  { name: 'Advances', href: '/admin/advances', icon: HandCoins },
  { name: 'Expenses', href: '/admin/expenses', icon: Receipt },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Profit Calculator', href: '/admin/profit-calculator', icon: Calculator },
  { name: 'Capacity Calculator', href: '/admin/capacity-calculator', icon: Gauge },
  { name: 'Documents', href: '/admin/documents', icon: FolderLock },
  { name: 'Incentives', href: '/admin/incentives', icon: Award },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-4 lg:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo & Brand */}
          <Link href="/admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">Nexus</span>
                <span className="font-extrabold text-xl tracking-tight text-emerald-600">Go</span>
              </div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
                Logistics Owner Portal
              </p>
            </div>
          </Link>
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Target: 330 Parcels/Day
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              AO
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-800 leading-tight">Admin / Owner</p>
              <p className="text-xs text-slate-500">admin@nexusgo.com</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
          <div className="p-4 space-y-1 overflow-y-auto flex-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Management Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-600 font-medium">
                <span>Model Rates:</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Company: <strong className="text-emerald-700">₹18</strong></span>
                <span>Driver: <strong className="text-slate-900">₹13</strong></span>
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold pt-0.5 border-t border-slate-100">
                Gross Margin: ₹5 / delivery
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl py-4 px-3 space-y-1 z-10 overflow-y-auto">
              <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900">NexusGo Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors ${
                      isActive
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
