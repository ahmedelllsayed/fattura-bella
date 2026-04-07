import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/store/AppContext';
import { useNavigate } from 'react-router-dom';
import type { LineItem, Invoice, Quotation, DocType, UnitType, InvoiceStatus, QuotationStatus } from '@/types';
import { generateId, calcLineTotal, calcVat, formatEuro } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Layers } from 'lucide-react';
import { toast } from 'sonner';

const unitOptions: UnitType[] = ['m²', 'ml', 'ora', 'pz', 'corpo', 'kg', 'lt'];
const vatOptions = [0, 4, 10, 22];
const paymentOptions = ['Pagamento a 30 giorni', 'Pagamento a 60 giorni', 'Pagamento immediato'];

interface Props {
  docType: DocType;
  existing?: Invoice | Quotation;
  onPreview?: (doc: Invoice | Quotation) => void;
}

function emptyItem(): LineItem {
  return { id: generateId(), type: 'item', description: '', quantity: 1, unit: 'pz', unitPrice: 0, vatRate: 22, total: 0 };
}

function emptySection(): LineItem {
  return { id: generateId(), type: 'section', description: '', quantity: 0, unit: 'corpo', unitPrice: 0, vatRate: 22, total: 0 };
}

export default function DocumentForm({ docType, existing, onPreview }: Props) {
  const { t, clients, settings, addInvoice, updateInvoice, addQuotation, updateQuotation, addClient } = useApp();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const due30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const [clientId, setClientId] = useState(existing?.clientId || '');
  const [date, setDate] = useState(existing?.date || today);
  const [dueDate, setDueDate] = useState(docType === 'invoice' ? ((existing as Invoice)?.dueDate || due30) : '');
  const [validityDays, setValidityDays] = useState(docType === 'quotation' ? ((existing as Quotation)?.validityDays || 30) : 30);
  const [status, setStatus] = useState<string>(existing?.status || (docType === 'invoice' ? 'unpaid' : 'pending'));
  const [items, setItems] = useState<LineItem[]>(existing?.items?.length ? existing.items : [emptyItem()]);
  const [discount, setDiscount] = useState(existing?.discount || 0);
  const [discountType, setDiscountType] = useState<'amount' | 'percent'>(existing?.discountType || 'amount');
  const [notes, setNotes] = useState(existing?.notes || (docType === 'invoice' ? settings.defaultInvoiceNotes : settings.defaultQuotationNotes));
  const [paymentTerms, setPaymentTerms] = useState(docType === 'invoice' ? ((existing as Invoice)?.paymentTerms || settings.defaultPaymentTerms) : '');
  const [generalTerms, setGeneralTerms] = useState(docType === 'quotation' ? ((existing as Quotation)?.generalTerms || settings.defaultQuotationNotes) : '');

  // Quick add client
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');

  const updateItem = (idx: number, partial: Partial<LineItem>) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, ...partial };
      if (updated.type === 'item') {
        updated.total = calcLineTotal(updated.quantity, updated.unitPrice);
      }
      return updated;
    }));
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const { subtotal, vatTotal, totalAmount } = useMemo(() => {
    const sub = items.filter(i => i.type === 'item').reduce((s, i) => s + calcLineTotal(i.quantity, i.unitPrice), 0);
    const vat = items.filter(i => i.type === 'item').reduce((s, i) => s + calcVat(calcLineTotal(i.quantity, i.unitPrice), i.vatRate), 0);
    let disc = discountType === 'percent' ? sub * discount / 100 : discount;
    const total = Math.round((sub + vat - disc) * 100) / 100;
    return { subtotal: Math.round(sub * 100) / 100, vatTotal: Math.round(vat * 100) / 100, totalAmount: total };
  }, [items, discount, discountType]);

  const handleSave = (preview = false) => {
    if (!clientId) { toast.error('Seleziona un cliente'); return; }
    if (items.filter(i => i.type === 'item').length === 0) { toast.error('Aggiungi almeno una voce'); return; }

    const computedItems = items.map(i => i.type === 'item' ? { ...i, total: calcLineTotal(i.quantity, i.unitPrice) } : i);

    if (docType === 'invoice') {
      const invData = {
        date, dueDate, clientId, items: computedItems, status: status as InvoiceStatus,
        subtotal, vatTotal, discount, discountType, total: totalAmount, notes, paymentTerms,
      };
      let doc: Invoice;
      if (existing) {
        doc = { ...(existing as Invoice), ...invData };
        updateInvoice(doc);
      } else {
        doc = addInvoice(invData);
      }
      toast.success(t('documentSaved'));
      if (preview && onPreview) onPreview(doc);
      else navigate('/invoices');
    } else {
      const qData = {
        date, validityDays, clientId, items: computedItems, status: status as QuotationStatus,
        subtotal, vatTotal, discount, discountType, total: totalAmount, notes, generalTerms,
      };
      let doc: Quotation;
      if (existing) {
        doc = { ...(existing as Quotation), ...qData };
        updateQuotation(doc);
      } else {
        doc = addQuotation(qData);
      }
      toast.success(t('documentSaved'));
      if (preview && onPreview) onPreview(doc);
      else navigate('/quotations');
    }
  };

  const handleQuickAddClient = () => {
    if (!newClientName.trim()) return;
    const c = addClient({ name: newClientName.trim(), type: 'private', address: '', city: '', cap: '', province: '', email: '', phone: '' });
    setClientId(c.id);
    setNewClientName('');
    setShowNewClient(false);
  };

  const invStatuses: InvoiceStatus[] = ['unpaid', 'paid', 'overdue', 'draft'];
  const qStatuses: QuotationStatus[] = ['pending', 'accepted', 'rejected', 'expired', 'draft'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Doc info */}
        <div className="space-y-4 bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-lg">{docType === 'invoice' ? 'Fattura' : 'Preventivo'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">{t('date')}</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            {docType === 'invoice' ? (
              <div>
                <label className="text-sm text-muted-foreground">{t('dueDate')}</label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            ) : (
              <div>
                <label className="text-sm text-muted-foreground">{t('validity')}</label>
                <div className="flex gap-2">
                  <Input type="number" value={validityDays} onChange={e => setValidityDays(Number(e.target.value))} className="w-20" />
                  <span className="self-center text-sm text-muted-foreground">{t('days')}</span>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="text-sm text-muted-foreground">{t('status')}</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {(docType === 'invoice' ? invStatuses : qStatuses).map(s => (
                <option key={s} value={s}>{t(s as any)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Client */}
        <div className="space-y-4 bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-lg">{t('client')}</h3>
          <select
            value={clientId}
            onChange={e => setClientId(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{t('selectClient')}</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {!showNewClient && (
            <button onClick={() => setShowNewClient(true)} className="text-sm text-primary hover:underline">
              + {t('newClient')}
            </button>
          )}
          {showNewClient && (
            <div className="flex gap-2">
              <Input placeholder={t('name')} value={newClientName} onChange={e => setNewClientName(e.target.value)} />
              <Button size="sm" onClick={handleQuickAddClient}>{t('save')}</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNewClient(false)}>{t('cancel')}</Button>
            </div>
          )}
          {clientId && (() => {
            const c = clients.find(x => x.id === clientId);
            if (!c) return null;
            return (
              <div className="text-sm text-muted-foreground space-y-0.5">
                <div>{c.address}{c.city ? `, ${c.city}` : ''}{c.cap ? ` ${c.cap}` : ''}{c.province ? ` (${c.province})` : ''}</div>
                {c.piva && <div>P.IVA: {c.piva}</div>}
                {c.email && <div>{c.email}</div>}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <h3 className="font-semibold text-lg">Voci</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-start p-2 w-8">#</th>
                <th className="text-start p-2">{t('description')}</th>
                <th className="text-start p-2 w-20">{t('quantity')}</th>
                <th className="text-start p-2 w-20">{t('unit')}</th>
                <th className="text-start p-2 w-28">{t('unitPrice')}</th>
                <th className="text-start p-2 w-20">{t('vat')}</th>
                <th className="text-end p-2 w-28">{t('total')}</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className={item.type === 'section' ? 'bg-muted/50' : 'border-b border-border'}>
                  <td className="p-2 text-muted-foreground">{item.type === 'section' ? '§' : idx + 1}</td>
                  <td className="p-2" colSpan={item.type === 'section' ? 6 : 1}>
                    <Input
                      value={item.description}
                      onChange={e => updateItem(idx, { description: e.target.value })}
                      placeholder={item.type === 'section' ? 'Titolo sezione (es. OPERE MURARIE)' : 'Descrizione voce'}
                      className={item.type === 'section' ? 'font-bold uppercase' : ''}
                    />
                  </td>
                  {item.type === 'item' && (
                    <>
                      <td className="p-2">
                        <Input type="number" min="0" step="0.01" value={item.quantity} onChange={e => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })} />
                      </td>
                      <td className="p-2">
                        <select value={item.unit} onChange={e => updateItem(idx, { unit: e.target.value as UnitType })} className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm">
                          {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="p-2">
                        <Input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })} />
                      </td>
                      <td className="p-2">
                        <select value={item.vatRate} onChange={e => updateItem(idx, { vatRate: Number(e.target.value) })} className="w-full h-10 rounded-md border border-input bg-background px-2 text-sm">
                          {vatOptions.map(v => <option key={v} value={v}>{v}%</option>)}
                        </select>
                      </td>
                      <td className="p-2 text-end font-medium">{formatEuro(calcLineTotal(item.quantity, item.unitPrice))}</td>
                    </>
                  )}
                  <td className="p-2">
                    <button onClick={() => removeItem(idx)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setItems(prev => [...prev, emptyItem()])}>
            <Plus className="w-4 h-4" /> {t('addItem')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setItems(prev => [...prev, emptySection()])}>
            <Layers className="w-4 h-4" /> {t('addSection')}
          </Button>
        </div>
      </div>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="bg-card border border-border rounded-lg p-5 space-y-3 w-full max-w-sm">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('subtotal')}</span>
            <span>{formatEuro(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IVA</span>
            <span>{formatEuro(vatTotal)}</span>
          </div>
          <div className="flex justify-between text-sm items-center gap-2">
            <span className="text-muted-foreground">{t('discount')}</span>
            <div className="flex items-center gap-1">
              <Input type="number" min="0" step="0.01" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="w-24" />
              <select value={discountType} onChange={e => setDiscountType(e.target.value as any)} className="h-10 rounded-md border border-input bg-background px-2 text-sm">
                <option value="amount">€</option>
                <option value="percent">%</option>
              </select>
            </div>
          </div>
          <div className="border-t border-border pt-3 flex justify-between text-lg font-bold">
            <span>{t('total')}</span>
            <span>{formatEuro(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">{docType === 'invoice' ? t('paymentTerms') : 'Condizioni Generali'}</label>
          {docType === 'invoice' ? (
            <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              {paymentOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          ) : (
            <Textarea value={generalTerms} onChange={e => setGeneralTerms(e.target.value)} rows={3} />
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('notes')}</label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-end border-t border-border pt-4">
        <Button variant="outline" onClick={() => navigate(docType === 'invoice' ? '/invoices' : '/quotations')}>
          {t('cancel')}
        </Button>
        <Button variant="secondary" onClick={() => handleSave(false)}>{t('saveDraft')}</Button>
        <Button onClick={() => handleSave(true)}>{t('savePreview')}</Button>
      </div>
    </div>
  );
}
