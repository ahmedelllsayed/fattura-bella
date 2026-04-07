import { useApp } from '@/store/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, FileCheck, Users, Settings, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { key: 'dashboard' as const, icon: LayoutDashboard, path: '/' },
  { key: 'invoices' as const, icon: FileText, path: '/invoices' },
  { key: 'quotations' as const, icon: FileCheck, path: '/quotations' },
  { key: 'clients' as const, icon: Users, path: '/clients' },
  { key: 'settings' as const, icon: Settings, path: '/settings' },
];

interface Props {
  open: boolean;
  collapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function AppSidebar({ open, collapsed, onClose, onToggleCollapse }: Props) {
  const { t, language } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-foreground/20 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed top-0 h-full bg-sidebar text-sidebar-foreground z-50 transition-all duration-300 flex flex-col print:hidden',
          collapsed ? 'w-16' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          language === 'ar' && 'right-0 lg:right-0 left-auto translate-x-full lg:translate-x-0',
          language === 'ar' && open && 'translate-x-0',
        )}
      >
        <div className={cn('h-16 flex items-center border-b border-sidebar-border px-4', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && (
            <span className="text-lg font-bold text-sidebar-primary-foreground truncate">
              🏗️ {t('invoices')}
            </span>
          )}
          <button onClick={onClose} className="lg:hidden text-sidebar-foreground hover:text-sidebar-primary-foreground">
            <X className="w-5 h-5" />
          </button>
          <button onClick={onToggleCollapse} className="hidden lg:block text-sidebar-muted hover:text-sidebar-foreground">
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => { navigate(item.path); onClose(); }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive(item.path)
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                collapsed && 'justify-center px-0',
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{t(item.key)}</span>}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
