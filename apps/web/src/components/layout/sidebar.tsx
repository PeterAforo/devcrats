'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  Wallet,
  Receipt,
  Wrench,
  MessageSquareWarning,
  Bell,
  UserCog,
  DoorOpen,
  Zap,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  Plug,
  Shield,
  Home,
  CreditCard,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

type NavItem = { label: string; href: string; icon: any };

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Estates', href: '/dashboard/estates', icon: Building2 },
  { label: 'Tenants & Landlords', href: '/dashboard/persons', icon: Users },
  { label: 'Directory', href: '/dashboard/directory', icon: Users },
  { label: 'Approvals', href: '/dashboard/approvals', icon: FileText },
  { label: 'EMF', href: '/dashboard/emf', icon: Wallet },
  { label: 'Payments', href: '/dashboard/payments', icon: Receipt },
  { label: 'Receipts', href: '/dashboard/receipts', icon: CreditCard },
  { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { label: 'Complaints', href: '/dashboard/complaints', icon: MessageSquareWarning },
  { label: 'Staff & Vendors', href: '/dashboard/staff', icon: UserCog },
  { label: 'Visitors', href: '/dashboard/visitors', icon: DoorOpen },
  { label: 'Utilities', href: '/dashboard/utilities', icon: Zap },
  { label: 'Documents', href: '/dashboard/documents', icon: FileText },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Integrations', href: '/dashboard/integrations', icon: Plug },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const managerNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Estates', href: '/dashboard/estates', icon: Building2 },
  { label: 'Tenants & Landlords', href: '/dashboard/persons', icon: Users },
  { label: 'Directory', href: '/dashboard/directory', icon: Users },
  { label: 'Approvals', href: '/dashboard/approvals', icon: FileText },
  { label: 'EMF', href: '/dashboard/emf', icon: Wallet },
  { label: 'Payments', href: '/dashboard/payments', icon: Receipt },
  { label: 'Receipts', href: '/dashboard/receipts', icon: CreditCard },
  { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { label: 'Complaints', href: '/dashboard/complaints', icon: MessageSquareWarning },
  { label: 'Staff & Vendors', href: '/dashboard/staff', icon: UserCog },
  { label: 'Visitors', href: '/dashboard/visitors', icon: DoorOpen },
  { label: 'Utilities', href: '/dashboard/utilities', icon: Zap },
  { label: 'Documents', href: '/dashboard/documents', icon: FileText },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const landlordNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Properties', href: '/dashboard/my-properties', icon: Home },
  { label: 'Tenants', href: '/dashboard/persons', icon: Users },
  { label: 'Approvals', href: '/dashboard/approvals', icon: FileText },
  { label: 'Income & Payments', href: '/dashboard/payments', icon: CreditCard },
  { label: 'Receipts', href: '/dashboard/receipts', icon: Receipt },
  { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { label: 'Documents', href: '/dashboard/documents', icon: FileText },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const tenantNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Unit', href: '/dashboard/my-unit', icon: Home },
  { label: 'My Family', href: '/dashboard/my-family', icon: Users },
  { label: 'Payments', href: '/dashboard/payments', icon: Receipt },
  { label: 'Receipts', href: '/dashboard/receipts', icon: CreditCard },
  { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { label: 'Complaints', href: '/dashboard/complaints', icon: MessageSquareWarning },
  { label: 'Visitors', href: '/dashboard/visitors', icon: DoorOpen },
  { label: 'Documents', href: '/dashboard/documents', icon: FileText },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

function getNavForRole(role?: string): NavItem[] {
  switch (role) {
    case 'super_admin': return adminNav;
    case 'estate_manager': return managerNav;
    case 'landlord': return landlordNav;
    case 'tenant': return tenantNav;
    default: return tenantNav;
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const navItems = getNavForRole(user?.role);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-navy-500 text-white shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <ChevronLeft className="h-5 w-5" /> : <LayoutDashboard className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          'h-screen bg-navy-500 text-white transition-all duration-300 flex flex-col z-50',
          collapsed ? 'w-[68px]' : 'w-64',
          'fixed md:sticky top-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
      <div className="flex items-center gap-2 p-4 border-b border-navy-400">
        <div className="w-9 h-9 bg-gold rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-navy-900 font-heading font-bold text-sm">EQ</span>
        </div>
        {!collapsed && (
          <span className="font-heading font-bold text-lg truncate">EstateIQ</span>
        )}
      </div>

      {!collapsed && user && (
        <div className="px-4 py-3 border-b border-navy-400">
          <p className="text-xs text-navy-200 truncate">{user.firstName} {user.lastName}</p>
          <p className="text-[10px] text-navy-300 capitalize">{user.role?.replace('_', ' ')}</p>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gold/20 text-gold'
                  : 'text-navy-200 hover:bg-navy-400 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-navy-400 hidden md:block">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-navy-200 hover:text-white hover:bg-navy-400"
        >
          <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>
    </aside>
    </>
  );
}
