import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { CompanySettings } from '@/types';

const tabs = [
  { key: 'company', labelIt: 'Dati Azienda', labelAr: 'معلومات الشركة' },
  { key: 'bank', labelIt: 'Dati Bancari', labelAr: 'البيانات المصرفية' },
  { key: 'invoice', labelIt: 'Fatturazione', labelAr: 'إعدادات الفوترة' },
  { key: 'appearance', labelIt: 'Aspetto', labelAr: 'المظهر' },
];

export default function SettingsPage() {
  const { t, settings, updateSettings, language } = useApp();
  const [form, setForm] = useState<CompanySettings>({ ...settings });
  const [activeTab, setActiveTab] = useState('company');

  const set = (k: keyof CompanySettings, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('logo', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateSettings(form);
    toast.success(t('settingsSaved'));
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{t('settings')}</h1>

      <div className="flex gap-2 flex-wrap border-b border-border pb-0">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {language === 'ar' ? tab.labelAr : tab.labelIt}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4 max-w-2xl">
        {activeTab === 'company' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('logo')}</label>
              <div className="flex items-center gap-4">
                {form.logo && <img src={form.logo} alt="Logo" className="h-16 w-16 object-contain rounded border border-border" />}
                <label className="cursor-pointer text-sm text-primary hover:underline">
                  {t('uploadLogo')}
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>
            <Input placeholder="Nome Azienda / Ragione Sociale" value={form.name} onChange={e => set('name', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Partita IVA" value={form.piva} onChange={e => set('piva', e.target.value)} />
              <Input placeholder="Codice Fiscale" value={form.codiceFiscale} onChange={e => set('codiceFiscale', e.target.value)} />
            </div>
            <Input placeholder="Indirizzo" value={form.address} onChange={e => set('address', e.target.value)} />
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="CAP" value={form.cap} onChange={e => set('cap', e.target.value)} />
              <Input placeholder="Città" value={form.city} onChange={e => set('city', e.target.value)} />
              <Input placeholder="Provincia" value={form.province} onChange={e => set('province', e.target.value)} />
            </div>
            <Input placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Telefono" value={form.phone} onChange={e => set('phone', e.target.value)} />
              <Input placeholder="Sito Web" value={form.website} onChange={e => set('website', e.target.value)} />
            </div>
            <Input placeholder="PEC" value={form.pec} onChange={e => set('pec', e.target.value)} />
          </>
        )}

        {activeTab === 'bank' && (
          <>
            <Input placeholder="Nome Banca" value={form.bankName} onChange={e => set('bankName', e.target.value)} />
            <Input placeholder="IBAN" value={form.iban} onChange={e => set('iban', e.target.value)} />
            <Input placeholder="BIC/SWIFT" value={form.bic} onChange={e => set('bic', e.target.value)} />
            <Input placeholder="Intestatario Conto" value={form.accountHolder} onChange={e => set('accountHolder', e.target.value)} />
          </>
        )}

        {activeTab === 'invoice' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Prefisso Fatture</label>
                <Input value={form.invoicePrefix} onChange={e => set('invoicePrefix', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Prefisso Preventivi</label>
                <Input value={form.quotationPrefix} onChange={e => set('quotationPrefix', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">IVA Predefinita</label>
              <select value={form.defaultVat} onChange={e => set('defaultVat', Number(e.target.value))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value={0}>0%</option>
                <option value={4}>4%</option>
                <option value={10}>10%</option>
                <option value={22}>22%</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Condizioni di Pagamento Predefinite</label>
              <Input value={form.defaultPaymentTerms} onChange={e => set('defaultPaymentTerms', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Note Predefinite Fatture</label>
              <Textarea value={form.defaultInvoiceNotes} onChange={e => set('defaultInvoiceNotes', e.target.value)} rows={2} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Note Predefinite Preventivi</label>
              <Textarea value={form.defaultQuotationNotes} onChange={e => set('defaultQuotationNotes', e.target.value)} rows={2} />
            </div>
          </>
        )}

        {activeTab === 'appearance' && (
          <>
            <div>
              <label className="text-sm font-medium">{t('primaryColor')}</label>
              <div className="flex items-center gap-3 mt-1">
                <input type="color" value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                <Input value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)} className="w-32" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t('font')}</label>
              <select value={form.documentFont} onChange={e => set('documentFont', e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="sans">Modern Sans (Inter)</option>
                <option value="serif">Classic Serif (Source Serif 4)</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.showLogo} onChange={e => set('showLogo', e.target.checked)} className="rounded" />
                <span className="text-sm">{t('showLogo')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.showSignatureLine} onChange={e => set('showSignatureLine', e.target.checked)} className="rounded" />
                <span className="text-sm">{t('showSignature')}</span>
              </label>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-border">
          <Button onClick={handleSave}>{t('saveSettings')}</Button>
        </div>
      </div>
    </div>
  );
}
