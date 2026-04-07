import { useApp } from '@/store/AppContext';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Globe, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: Props) {
  const { language, setLanguage, theme, setTheme, t, settings } = useApp();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 print:hidden shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-foreground">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          {settings.logo && (
            <img src={settings.logo} alt="Logo" className="h-8 w-8 object-contain rounded" />
          )}
          <span className="font-semibold text-foreground hidden sm:block">{settings.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/invoices/new')}
          className="hidden sm:inline-flex"
        >
          <Plus className="w-4 h-4" />
          {t('newInvoice')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/quotations/new')}
          className="hidden sm:inline-flex"
        >
          <Plus className="w-4 h-4" />
          {t('newQuotation')}
        </Button>

        <button
          onClick={() => setLanguage(language === 'ar' ? 'it' : 'ar')}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium border border-border hover:bg-muted transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          {language === 'ar' ? 'IT' : 'AR'}
        </button>

        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="p-2 rounded-md hover:bg-muted transition-colors"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
