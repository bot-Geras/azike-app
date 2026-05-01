// admin/app/dashboard/layout.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  HomeIcon,
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MegaphoneIcon,
  QrCodeIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Members', href: '/dashboard/members', icon: UsersIcon },
  { name: 'Events', href: '/dashboard/events', icon: CalendarIcon },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CurrencyDollarIcon },
  { name: 'Announcements', href: '/dashboard/announcements', icon: MegaphoneIcon },
  { name: 'Scanner', href: '/dashboard/scanner', icon: QrCodeIcon },
  { name: 'Reports', href: '/dashboard/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary transform transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent 
          navigation={navigation} 
          isActive={isActive} 
          onClose={() => setSidebarOpen(false)}
          session={session}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent 
          navigation={navigation} 
          isActive={isActive} 
          session={session}
        />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <span className="text-lg font-semibold text-gray-900">AZIKE Admin</span>
            <div className="w-6" /> {/* Spacer for alignment */}
          </div>
        </div>

        <main className="py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ 
  navigation, 
  isActive, 
  onClose,
  session 
}: { 
  navigation: any[]; 
  isActive: (href: string) => boolean;
  onClose?: () => void;
  session: any;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 bg-primary-dark">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
            <span className="text-primary text-sm font-bold">A</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">AZIKE</h1>
            <p className="text-white/60 text-xs">Admin Dashboard</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="text-white/70 hover:text-white lg:hidden"
            title="Close sidebar"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-primary-dark">
        <p className="text-white text-sm font-medium truncate">
          {session?.user?.name}
        </p>
        <p className="text-white/60 text-xs truncate">
          {session?.user?.email}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClose}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(item.href)
                ? 'bg-white text-primary'
                : 'text-white/80 hover:bg-primary-light hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-primary-dark">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center px-3 py-2 w-full rounded-lg text-sm font-medium text-white/80 hover:bg-red-500/20 hover:text-white transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
}