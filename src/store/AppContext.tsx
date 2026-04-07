import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Client, Invoice, Quotation, CompanySettings, Language, Theme } from '@/types';
import { generateId, generateDocNumber } from '@/lib/format';
import { translations, type TranslationKey } from '@/i18n/translations';
import { supabase } from '@/integrations/supabase/client';

const defaultSettings: CompanySettings = {
  logo: '', name: 'Italia Costruzioni S.r.l.', piva: 'IT12345678901',
  codiceFiscale: '12345678901', address: 'Via Roma 42', cap: '20121',
  city: 'Milano', province: 'MI', country: 'Italia',
  email: 'info@italiacostruzioni.it', phone: '+39 02 1234567',
  website: 'www.italiacostruzioni.it', pec: 'pec@italiacostruzioni.it',
  bankName: 'Banca Intesa Sanpaolo', iban: 'IT60 X054 2811 1010 0000 0123 456',
  bic: 'BCITITMM', accountHolder: 'Italia Costruzioni S.r.l.',
  invoicePrefix: 'FAT', invoiceStartNumber: 1,
  quotationPrefix: 'PREV', quotationStartNumber: 1,
  defaultVat: 22, defaultPaymentTerms: 'Pagamento a 30 giorni',
  defaultInvoiceNotes: '', defaultQuotationNotes: 'I prezzi indicati sono comprensivi di materiali e manodopera.',
  primaryColor: '#01696f', documentFont: 'serif', showLogo: true, showSignatureLine: true,
};

interface AppState {
  language: Language; theme: Theme; clients: Client[]; invoices: Invoice[];
  quotations: Quotation[]; settings: CompanySettings; loading: boolean;
  setLanguage: (l: Language) => void; setTheme: (t: Theme) => void;
  t: (key: TranslationKey) => string;
  addClient: (c: Omit<Client, 'id'>) => Client;
  updateClient: (c: Client) => void; deleteClient: (id: string) => void;
  addInvoice: (i: Omit<Invoice, 'id' | 'number' | 'createdAt'>) => Invoice;
  updateInvoice: (i: Invoice) => void; deleteInvoice: (id: string) => void;
  addQuotation: (q: Omit<Quotation, 'id' | 'number' | 'createdAt'>) => Quotation;
  updateQuotation: (q: Quotation) => void; deleteQuotation: (id: string) => void;
  updateSettings: (s: CompanySettings) => void;
  getClient: (id: string) => Client | undefined;
  convertQuotationToInvoice: (qId: string) => Invoice;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('it');
  const [theme, setThemeState] = useState<Theme>('light');
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsRes, invoicesRes, quotationsRes, settingsRes] = await Promise.all([
          supabase.from('clients').select('*').order('created_at', { ascending: false }),
          supabase.from('invoices').select('*').order('created_at', { ascending: false }),
          supabase.from('quotations').select('*').order('created_at', { ascending: false }),
          supabase.from('company_settings').select('*').limit(1).single(),
        ]);
        if (clientsRes.data && clientsRes.data.length > 0) setClients(clientsRes.data);
        if (invoicesRes.data && invoicesRes.data.length > 0) {
          setInvoices(invoicesRes.data.map((inv: any) => ({
            ...inv, items: typeof inv.items === 'string' ? JSON.parse(inv.items) : inv.items ?? [],
          })));
        }
        if (quotationsRes.data && quotationsRes.data.length > 0) {
          setQuotations(quotationsRes.data.map((q: any) => ({
            ...q, items: typeof q.items === 'string' ? JSON.parse(q.items) : q.items ?? [],
          })));
        }
        if (settingsRes.data) setSettings(settingsRes.data);
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle('dark', t === 'dark');
  }, []);

  const t = useCallback((key: TranslationKey): string => translations[language][key] || key, [language]);
  const getClient = useCallback((id: string) => clients.find(c => c.id === id), [clients]);

  const addClient = useCallback((c: Omit<Client, 'id'>): Client => {
    const newClient = { ...c, id: generateId() };
    setClients(prev => [...prev, newClient]);
    supabase.from('clients').insert(newClient).then(({ error }) => { if (error) console.error('addClient:', error); });
    return newClient;
  }, []);

  const updateClient = useCallback((c: Client) => {
    setClients(prev => prev.map(x => x.id === c.id ? c : x));
    supabase.from('clients').update(c).eq('id', c.id).then(({ error }) => { if (error) console.error('updateClient:', error); });
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(x => x.id !== id));
    supabase.from('clients').delete().eq('id', id).then(({ error }) => { if (error) console.error('deleteClient:', error); });
  }, []);

  const addInvoice = useCallback((i: Omit<Invoice, 'id' | 'number' | 'createdAt'>): Invoice => {
    const number = generateDocNumber(settings.invoicePrefix, invoices.map(x => x.number));
    const newInv: Invoice = { ...i, id: generateId(), number, createdAt: new Date().toISOString() };
    setInvoices(prev => [...prev, newInv]);
    supabase.from('invoices').insert({ ...newInv, items: JSON.stringify(newInv.items) }).then(({ error }) => { if (error) console.error('addInvoice:', error); });
    return newInv;
  }, [settings.invoicePrefix, invoices]);

  const updateInvoice = useCallback((i: Invoice) => {
    setInvoices(prev => prev.map(x => x.id === i.id ? i : x));
    supabase.from('invoices').update({ ...i, items: JSON.stringify(i.items) }).eq('id', i.id).then(({ error }) => { if (error) console.error('updateInvoice:', error); });
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(x => x.id !== id));
    supabase.from('invoices').delete().eq('id', id).then(({ error }) => { if (error) console.error('deleteInvoice:', error); });
  }, []);

  const addQuotation = useCallback((q: Omit<Quotation, 'id' | 'number' | 'createdAt'>): Quotation => {
    const number = generateDocNumber(settings.quotationPrefix, quotations.map(x => x.number));
    const newQ: Quotation = { ...q, id: generateId(), number, createdAt: new Date().toISOString() };
    setQuotations(prev => [...prev, newQ]);
    supabase.from('quotations').insert({ ...newQ, items: JSON.stringify(newQ.items) }).then(({ error }) => { if (error) console.error('addQuotation:', error); });
    return newQ;
  }, [settings.quotationPrefix, quotations]);

  const updateQuotation = useCallback((q: Quotation) => {
    setQuotations(prev => prev.map(x => x.id === q.id ? q : x));
    supabase.from('quotations').update({ ...q, items: JSON.stringify(q.items) }).eq('id', q.id).then(({ error }) => { if (error) console.error('updateQuotation:', error); });
  }, []);

  const deleteQuotation = useCallback((id: string) => {
    setQuotations(prev => prev.filter(x => x.id !== id));
    supabase.from('quotations').delete().eq('id', id).then(({ error }) => { if (error) console.error('deleteQuotation:', error); });
  }, []);

  const updateSettings = useCallback((s: CompanySettings) => {
    setSettings(s);
    supabase.from('company_settings').upsert({ ...s, id: 1 }, { onConflict: 'id' }).then(({ error }) => { if (error) console.error('updateSettings:', error); });
  }, []);

  const convertQuotationToInvoice = useCallback((qId: string): Invoice => {
    const q = quotations.find(x => x.id === qId)!;
    const number = generateDocNumber(settings.invoicePrefix, invoices.map(x => x.number));
    const today = new Date();
    const newInv: Invoice = {
      id: generateId(), number,
      date: today.toISOString().split('T')[0],
      dueDate: new Date(today.getTime() + 30 * 86400000).toISOString().split('T')[0],
      clientId: q.clientId, items: q.items.map(item => ({ ...item, id: generateId() })),
      status: 'unpaid', subtotal: q.subtotal, vatTotal: q.vatTotal,
      discount: q.discount, discountType: q.discountType, total: q.total,
      notes: q.notes, paymentTerms: settings.defaultPaymentTerms, createdAt: today.toISOString(),
    };
    setInvoices(prev => [...prev, newInv]);
    setQuotations(prev => prev.map(x => x.id === qId ? { ...x, status: 'accepted' as const } : x));
    supabase.from('invoices').insert({ ...newInv, items: JSON.stringify(newInv.items) }).then(({ error }) => { if (error) console.error('convertInvoice:', error); });
    supabase.from('quotations').update({ status: 'accepted' }).eq('id', qId).then(({ error }) => { if (error) console.error('convertQuotation:', error); });
    return newInv;
  }, [quotations, invoices, settings]);

  return (
    <AppContext.Provider value={{
      language, theme, clients, invoices, quotations, settings, loading,
      setLanguage, setTheme, t, getClient,
      addClient, updateClient, deleteClient,
      addInvoice, updateInvoice, deleteInvoice,
      addQuotation, updateQuotation, deleteQuotation,
      updateSettings, convertQuotationToInvoice,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
