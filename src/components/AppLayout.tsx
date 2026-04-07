import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { AppSidebar } from '@/components/AppSidebar';
import { TopBar } from '@/components/TopBar';
import { cn } from '@/lib/utils';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn('min-h-screen flex', language === 'ar' && 'flex-row-reverse')} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <AppSidebar
        open={sidebarOpen}
        collapsed={collapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
      <div className={cn('flex-1 flex flex-col min-h-screen transition-all duration-300',
        language === 'ar'
          ? (collapsed ? 'lg:mr-16' : 'lg:mr-64')
          : (collapsed ? 'lg:ml-16' : 'lg:ml-64')
      )}>
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
