import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Client, Invoice, Quotation, CompanySettings, Language, Theme, LineItem } from '@/types';
import { generateId, generateDocNumber } from '@/lib/format';
import { translations, type TranslationKey } from '@/i18n/translations';

const threeMonthsAgo = new Date();
threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);

const demoClients: Client[] = [
  { id: 'c1', name: 'Marco Bianchi', type: 'private', address: 'Via Garibaldi 15', city: 'Roma', cap: '00100', province: 'RM', email: 'marco.b@email.it', phone: '+39 06 1234567', notes: '' },
  { id: 'c2', name: 'Costruzioni Rossi S.p.A.', type: 'company', address: 'Via Milano 88', city: 'Torino', cap: '10100', province: 'TO', piva: 'IT98765432100', email: 'info@rossi.it', phone: '+39 011 9876543', notes: '' },
  { id: 'c3', name: 'Elena Ferrari', type: 'private', address: 'Corso Vittorio 33', city: 'Napoli', cap: '80100', province: 'NA', email: 'elena.f@email.it', phone: '+39 081 5554321', notes: '' },
];

const demoInvoices: Invoice[] = [
  {
    id: 'inv1', number: 'FAT-2025-001', date: threeMonthsAgo.toISOString().split('T')[0],
    dueDate: new Date(threeMonthsAgo.getTime() + 30 * 86400000).toISOString().split('T')[0],
    clientId: 'c1', status: 'paid', subtotal: 2868.85, vatTotal: 631.15, discount: 0, discountType: 'amount', total: 3500,
    notes: '', paymentTerms: 'Pagamento a 30 giorni', createdAt: threeMonthsAgo.toISOString(),
    items: [
      { id: 'li1', type: 'section', description: 'OPERE MURARIE', quantity: 0, unit: 'corpo', unitPrice: 0, vatRate: 22, total: 0 },
      { id: 'li2', type: 'item', description: 'Demolizione e ricostruzione parete divisoria', quantity: 12, unit: 'm²', unitPrice: 85, vatRate: 22, total: 1020 },
      { id: 'li3', type: 'item', description: 'Intonacatura e rasatura', quantity: 24, unit: 'm²', unitPrice: 45, vatRate: 22, total: 1080 },
      { id: 'li4', type: 'section', description: 'FINITURE', quantity: 0, unit: 'corpo', unitPrice: 0, vatRate: 22, total: 0 },
      { id: 'li5', type: 'item', description: 'Tinteggiatura pareti con idropittura lavabile', quantity: 45, unit: 'm²', unitPrice: 17.0856, vatRate: 22, total: 768.85 },
    ],
  },
  {
    id: 'inv2', number: 'FAT-2025-002', date: lastMonth.toISOString().split('T')[0],
    dueDate: new Date(lastMonth.getTime() + 30 * 86400000).toISOString().split('T')[0],
    clientId: 'c2', status: 'unpaid', subtotal: 10450.82, vatTotal: 2299.18, discount: 0, discountType: 'amount', total: 12750,
    notes: 'Lavori di ristrutturazione uffici piano terra', paymentTerms: 'Pagamento a 60 giorni', createdAt: lastMonth.toISOString(),
    items: [
      { id: 'li6', type: 'item', description: 'Rifacimento pavimentazione in gres porcellanato', quantity: 120, unit: 'm²', unitPrice: 65, vatRate: 22, total: 7800 },
      { id: 'li7', type: 'item', description: 'Installazione controsoffitto in cartongesso', quantity: 80, unit: 'm²', unitPrice: 33.1352, vatRate: 22, total: 2650.82 },
    ],
  },
];

const demoQuotations: Quotation[] = [
  {
    id: 'q1', number: 'PREV-2025-001', date: new Date().toISOString().split('T')[0],
    validityDays: 30, clientId: 'c3', status: 'pending',
    subtotal: 6721.31, vatTotal: 1478.69, discount: 0, discountType: 'amount', total: 8200,
    notes: '', generalTerms: 'I prezzi indicati sono comprensivi di materiali e manodopera.', createdAt: new Date().toISOString(),
    items: [
      { id: 'li8', type: 'section', description: 'RISTRUTTURAZIONE BAGNO', quantity: 0, unit: 'corpo', unitPrice: 0, vatRate: 22, total: 0 },
      { id: 'li9', type: 'item', description: 'Demolizione rivestimenti e pavimenti esistenti', quantity: 1, unit: 'corpo', unitPrice: 1200, vatRate: 22, total: 1200 },
      { id: 'li10', type: 'item', description: 'Impermeabilizzazione', quantity: 8, unit: 'm²', unitPrice: 55, vatRate: 22, total: 440 },
      { id: 'li11', type: 'item', description: 'Posa piastrelle pavimento e pareti', quantity: 35, unit: 'm²', unitPrice: 75, vatRate: 22, total: 2625 },
      { id: 'li12', type: 'item', description: 'Installazione sanitari completi', quantity: 1, unit: 'corpo', unitPrice: 2456.31, vatRate: 22, total: 2456.31 },
    ],
  },
];

const defaultSettings: CompanySettings = {
  logo: '',
  name: 'Italia Costruzioni S.r.l.',
  piva: 'IT12345678901',
  codiceFiscale: '12345678901',
  address: 'Via Roma 42',
  cap: '20121',
  city: 'Milano',
  province: 'MI',
  country: 'Italia',
  email: 'info@italiacostruzioni.it',
  phone: '+39 02 1234567',
  website: 'www.italiacostruzioni.it',
  pec: 'pec@italiacostruzioni.it',
  bankName: 'Banca Intesa Sanpaolo',
  iban: 'IT60 X054 2811 1010 0000 0123 456',
  bic: 'BCITITMM',
  accountHolder: 'Italia Costruzioni S.r.l.',
  invoicePrefix: 'FAT',
  invoiceStartNumber: 1,
  quotationPrefix: 'PREV',
  quotationStartNumber: 1,
  defaultVat: 22,
  defaultPaymentTerms: 'Pagamento a 30 giorni',
  defaultInvoiceNotes: '',
  defaultQuotationNotes: 'I prezzi indicati sono comprensivi di materiali e manodopera.',
  primaryColor: '#01696f',
  documentFont: 'serif',
  showLogo: true,
  showSignatureLine: true,
};

interface AppState {
  language: Language;
  theme: Theme;
  clients: Client[];
  invoices: Invoice[];
  quotations: Quotation[];
  settings: CompanySettings;
  setLanguage: (l: Language) => void;
  setTheme: (t: Theme) => void;
  t: (key: TranslationKey) => string;
  addClient: (c: Omit<Client, 'id'>) => Client;
  updateClient: (c: Client) => void;
  deleteClient: (id: string) => void;
  addInvoice: (i: Omit<Invoice, 'id' | 'number' | 'createdAt'>) => Invoice;
  updateInvoice: (i: Invoice) => void;
  deleteInvoice: (id: string) => void;
  addQuotation: (q: Omit<Quotation, 'id' | 'number' | 'createdAt'>) => Quotation;
  updateQuotation: (q: Quotation) => void;
  deleteQuotation: (id: string) => void;
  updateSettings: (s: CompanySettings) => void;
  getClient: (id: string) => Client | undefined;
  convertQuotationToInvoice: (qId: string) => Invoice;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('it');
  const [theme, setThemeState] = useState<Theme>('light');
  const [clients, setClients] = useState<Client[]>(demoClients);
  const [invoices, setInvoices] = useState<Invoice[]>(demoInvoices);
  const [quotations, setQuotations] = useState<Quotation[]>(demoQuotations);
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    document.documentElement.classList.toggle('dark', t === 'dark');
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || key;
  }, [language]);

  const getClient = useCallback((id: string) => clients.find(c => c.id === id), [clients]);

  const addClient = useCallback((c: Omit<Client, 'id'>): Client => {
    const newClient = { ...c, id: generateId() };
    setClients(prev => [...prev, newClient]);
    return newClient;
  }, []);

  const updateClient = useCallback((c: Client) => {
    setClients(prev => prev.map(x => x.id === c.id ? c : x));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(x => x.id !== id));
  }, []);

  const addInvoice = useCallback((i: Omit<Invoice, 'id' | 'number' | 'createdAt'>): Invoice => {
    const number = generateDocNumber(settings.invoicePrefix, invoices.map(x => x.number));
    const newInv: Invoice = { ...i, id: generateId(), number, createdAt: new Date().toISOString() };
    setInvoices(prev => [...prev, newInv]);
    return newInv;
  }, [settings.invoicePrefix, invoices]);

  const updateInvoice = useCallback((i: Invoice) => {
    setInvoices(prev => prev.map(x => x.id === i.id ? i : x));
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(x => x.id !== id));
  }, []);

  const addQuotation = useCallback((q: Omit<Quotation, 'id' | 'number' | 'createdAt'>): Quotation => {
    const number = generateDocNumber(settings.quotationPrefix, quotations.map(x => x.number));
    const newQ: Quotation = { ...q, id: generateId(), number, createdAt: new Date().toISOString() };
    setQuotations(prev => [...prev, newQ]);
    return newQ;
  }, [settings.quotationPrefix, quotations]);

  const updateQuotation = useCallback((q: Quotation) => {
    setQuotations(prev => prev.map(x => x.id === q.id ? q : x));
  }, []);

  const deleteQuotation = useCallback((id: string) => {
    setQuotations(prev => prev.filter(x => x.id !== id));
  }, []);

  const updateSettings = useCallback((s: CompanySettings) => {
    setSettings(s);
  }, []);

  const convertQuotationToInvoice = useCallback((qId: string): Invoice => {
    const q = quotations.find(x => x.id === qId)!;
    const number = generateDocNumber(settings.invoicePrefix, invoices.map(x => x.number));
    const today = new Date();
    const due = new Date(today.getTime() + 30 * 86400000);
    const newInv: Invoice = {
      id: generateId(),
      number,
      date: today.toISOString().split('T')[0],
      dueDate: due.toISOString().split('T')[0],
      clientId: q.clientId,
      items: q.items.map(item => ({ ...item, id: generateId() })),
      status: 'unpaid',
      subtotal: q.subtotal,
      vatTotal: q.vatTotal,
      discount: q.discount,
      discountType: q.discountType,
      total: q.total,
      notes: q.notes,
      paymentTerms: settings.defaultPaymentTerms,
      createdAt: new Date().toISOString(),
    };
    setInvoices(prev => [...prev, newInv]);
    setQuotations(prev => prev.map(x => x.id === qId ? { ...x, status: 'accepted' as const } : x));
    return newInv;
  }, [quotations, invoices, settings]);

  return (
    <AppContext.Provider value={{
      language, theme, clients, invoices, quotations, settings,
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
