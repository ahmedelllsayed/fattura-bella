export type Language = 'ar' | 'it';
export type Theme = 'light' | 'dark';

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'draft';
export type QuotationStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'draft';
export type ClientType = 'private' | 'company';
export type DocType = 'invoice' | 'quotation';
export type UnitType = 'm²' | 'ml' | 'ora' | 'pz' | 'corpo' | 'kg' | 'lt';

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  address: string;
  city: string;
  cap: string;
  province: string;
  piva?: string;
  codiceFiscale?: string;
  email: string;
  phone: string;
  notes?: string;
  sdi?: string;
  pec?: string;
}

export interface LineItem {
  id: string;
  type: 'item' | 'section';
  description: string;
  quantity: number;
  unit: UnitType;
  unitPrice: number;
  vatRate: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  clientId: string;
  items: LineItem[];
  status: InvoiceStatus;
  subtotal: number;
  vatTotal: number;
  discount: number;
  discountType: 'amount' | 'percent';
  total: number;
  notes: string;
  paymentTerms: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  number: string;
  date: string;
  validityDays: number;
  clientId: string;
  items: LineItem[];
  status: QuotationStatus;
  subtotal: number;
  vatTotal: number;
  discount: number;
  discountType: 'amount' | 'percent';
  total: number;
  notes: string;
  generalTerms: string;
  createdAt: string;
}

export interface CompanySettings {
  logo: string;
  name: string;
  piva: string;
  codiceFiscale: string;
  address: string;
  cap: string;
  city: string;
  province: string;
  country: string;
  email: string;
  phone: string;
  website: string;
  pec: string;
  bankName: string;
  iban: string;
  bic: string;
  accountHolder: string;
  invoicePrefix: string;
  invoiceStartNumber: number;
  quotationPrefix: string;
  quotationStartNumber: number;
  defaultVat: number;
  defaultPaymentTerms: string;
  defaultInvoiceNotes: string;
  defaultQuotationNotes: string;
  primaryColor: string;
  documentFont: 'sans' | 'serif' | 'minimal';
  showLogo: boolean;
  showSignatureLine: boolean;
}
