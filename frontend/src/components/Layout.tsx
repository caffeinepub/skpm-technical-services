import { Link, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard, Briefcase, Users, FileText, Calendar,
  Package, Wrench, BarChart3, LogOut, Menu, X, ChevronRight, Bell
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jobs', label: 'Jobs', icon: Briefcase },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/invoices', label: 'Invoices', icon: FileText },
  { path: '/schedule', label: 'Schedule', icon: Calendar },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/technicians', label: 'Technicians', icon: Wrench },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { clear, identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b" style={{ borderColor: 'oklch(0.30 0.06 240)' }}>
        <img
          src="/assets/generated/skpm-logo.dim_200x60.png"
          alt="SKPM Technical Services"
          className="h-9 object-contain"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              isActive(path)
                ? 'text-white'
                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
            )}
            style={isActive(path) ? { background: 'oklch(0.75 0.16 65)', color: 'oklch(0.15 0.04 240)' } : {}}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
            {isActive(path) && <ChevronRight className="w-3 h-3 ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'oklch(0.30 0.06 240)' }}>
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-2" style={{ background: 'oklch(0.28 0.07 240)' }}>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs font-semibold" style={{ background: 'oklch(0.75 0.16 65)', color: 'oklch(0.15 0.04 240)' }}>
              {userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {userProfile?.name ?? 'User'}
            </p>
            <p className="text-xs truncate" style={{ color: 'oklch(0.65 0.03 240)' }}>
              {userProfile?.role ?? identity?.getPrincipal().toString().slice(0, 12) + '...'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors"
          style={{ color: 'oklch(0.65 0.03 240)' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = 'white';
            (e.currentTarget as HTMLElement).style.background = 'oklch(0.30 0.07 240)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'oklch(0.65 0.03 240)';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0"
        style={{ background: 'oklch(0.22 0.06 240)' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col z-10" style={{ background: 'oklch(0.22 0.06 240)' }}>
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 h-14 border-b bg-card shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-sm font-semibold text-foreground">
                {navItems.find(n => isActive(n.path))?.label ?? 'SKPM'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
            </Button>
            <Avatar className="w-8 h-8 cursor-pointer">
              <AvatarFallback className="text-xs font-semibold" style={{ background: 'oklch(0.75 0.16 65)', color: 'oklch(0.15 0.04 240)' }}>
                {userProfile?.name ? userProfile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
