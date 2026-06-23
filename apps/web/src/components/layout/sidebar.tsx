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
  ChevronDown,
  Plug,
  Shield,
  Home,
  CreditCard,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

type NavItem = { label: string; href: string; icon: any };
type NavGroup = { category: string; items: NavItem[] };

const adminNav: NavGroup[] = [
  { category: 'Main', items: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ]},
  { category: 'Property', items: [
    { label: 'Estates', href: '/dashboard/estates', icon: Building2 },
    { label: 'Tenants & Landlords', href: '/dashboard/persons', icon: Users },
    { label: 'Directory', href: '/dashboard/directory', icon: Users },
    { label: 'Approvals', href: '/dashboard/approvals', icon: FileText },
  ]},
  { category: 'Finance', items: [
    { label: 'EMF', href: '/dashboard/emf', icon: Wallet },
    { label: 'Payments', href: '/dashboard/payments', icon: Receipt },
    { label: 'Receipts', href: '/dashboard/receipts', icon: CreditCard },
  ]},
  { category: 'Operations', items: [
    { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
    { label: 'Complaints', href: '/dashboard/complaints', icon: MessageSquareWarning },
    { label: 'Staff & Vendors', href: '/dashboard/staff', icon: UserCog },
    { label: 'Visitors', href: '/dashboard/visitors', icon: DoorOpen },
    { label: 'Gate Access', href: '/dashboard/gate-access', icon: Shield },
    { label: 'Utilities', href: '/dashboard/utilities', icon: Zap },
  ]},
  { category: 'System', items: [
    { label: 'Documents', href: '/dashboard/documents', icon: FileText },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { label: 'Integrations', href: '/dashboard/integrations', icon: Plug },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]},
];

const managerNav: NavGroup[] = [
  { category: 'Main', items: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ]},
  { category: 'Property', items: [
    { label: 'Estates', href: '/dashboard/estates', icon: Building2 },
    { label: 'Tenants & Landlords', href: '/dashboard/persons', icon: Users },
    { label: 'Directory', href: '/dashboard/directory', icon: Users },
    { label: 'Approvals', href: '/dashboard/approvals', icon: FileText },
  ]},
  { category: 'Finance', items: [
    { label: 'EMF', href: '/dashboard/emf', icon: Wallet },
    { label: 'Payments', href: '/dashboard/payments', icon: Receipt },
    { label: 'Receipts', href: '/dashboard/receipts', icon: CreditCard },
  ]},
  { category: 'Operations', items: [
    { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
    { label: 'Complaints', href: '/dashboard/complaints', icon: MessageSquareWarning },
    { label: 'Staff & Vendors', href: '/dashboard/staff', icon: UserCog },
    { label: 'Visitors', href: '/dashboard/visitors', icon: DoorOpen },
    { label: 'Gate Access', href: '/dashboard/gate-access', icon: Shield },
    { label: 'Utilities', href: '/dashboard/utilities', icon: Zap },
  ]},
  { category: 'System', items: [
    { label: 'Documents', href: '/dashboard/documents', icon: FileText },
    { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]},
];

const landlordNav: NavGroup[] = [
  { category: 'Main', items: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Properties', href: '/dashboard/my-properties', icon: Home },
  ]},
  { category: 'People', items: [
    { label: 'Tenants', href: '/dashboard/persons', icon: Users },
    { label: 'Approvals', href: '/dashboard/approvals', icon: FileText },
  ]},
  { category: 'Finance', items: [
    { label: 'Income & Payments', href: '/dashboard/payments', icon: CreditCard },
    { label: 'Receipts', href: '/dashboard/receipts', icon: Receipt },
  ]},
  { category: 'System', items: [
    { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
    { label: 'Documents', href: '/dashboard/documents', icon: FileText },
    { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]},
];

const tenantNav: NavGroup[] = [
  { category: 'Main', items: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Unit', href: '/dashboard/my-unit', icon: Home },
    { label: 'My Family', href: '/dashboard/my-family', icon: Users },
  ]},
  { category: 'Finance', items: [
    { label: 'Payments', href: '/dashboard/payments', icon: Receipt },
    { label: 'Receipts', href: '/dashboard/receipts', icon: CreditCard },
  ]},
  { category: 'Services', items: [
    { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
    { label: 'Complaints', href: '/dashboard/complaints', icon: MessageSquareWarning },
    { label: 'Visitors', href: '/dashboard/visitors', icon: DoorOpen },
  ]},
  { category: 'System', items: [
    { label: 'Documents', href: '/dashboard/documents', icon: FileText },
    { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]},
];

function getNavForRole(role?: string): NavGroup[] {
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
  const navGroups = getNavForRole(user?.role);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navGroups.forEach((group) => {
      initial[group.category] = true;
    });
    return initial;
  });

  const toggleGroup = (category: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [category]: !prev[category] }));
  };

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

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {navGroups.map((group) => {
          const isGroupCollapsed = collapsedGroups[group.category];
          const hasActiveItem = group.items.some(
            (item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          );

          return (
            <div key={group.category}>
              {!collapsed && (
                <button
                  onClick={() => toggleGroup(group.category)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded',
                    hasActiveItem ? 'text-gold' : 'text-navy-300 hover:text-navy-100'
                  )}
                >
                  <span>{group.category}</span>
                  <ChevronDown className={cn('h-3 w-3 transition-transform', isGroupCollapsed && '-rotate-90')} />
                </button>
              )}

              {!isGroupCollapsed && group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-gold/20 text-gold'
                        : 'text-navy-200 hover:bg-navy-400 hover:text-white'
                    )}
                  >
                    <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
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
