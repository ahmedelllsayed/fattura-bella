import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { useNavigate } from 'react-router-dom';
import { formatEuro, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, Edit, Copy, Trash2, ArrowRightLeft } from 'lucide-react';
import type { Quotation } from '@/types';
import DocumentPreview from '@/components/DocumentPreview';
import { toast } from 'sonner';

export default function QuotationsPage() {
  const { t, quotations, getClient, deleteQuotation, addQuotation, convertQuotationToInvoice } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [previewDoc, setPreviewDoc] = useState<Quotation | null>(null);

  const filtered = quotations.filter(q => {
    const client = getClient(q.clientId);
    const matchSearch = !search || q.number.toLowerCase().includes(search.toLowerCase()) || client?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || q.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDuplicate = (q: Quotation) => {
    const { id, number, createdAt, ...rest } = q;
    addQuotation({ ...rest, items: rest.items.map(i => ({ ...i, id: crypto.randomUUID() })) });
    toast.success(t('documentSaved'));
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      deleteQuotation(id);
      toast.success(t('documentDeleted'));
    }
  };

  const handleConvert = (id: string) => {
    convertQuotationToInvoice(id);
    toast.success(t('convertToInvoice') + ' ✓');
    navigate('/invoices');
  };

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{t('quotations')}</h1>
        <Button onClick={() => navigate('/quotations/new')}><Plus className="w-4 h-4" /> {t('newQuotation')}</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">{t('allStatuses')}</option>
          <option value="pending">{t('pending')}</option>
          <option value="accepted">{t('accepted')}</option>
          <option value="rejected">{t('rejected')}</option>
          <option value="expired">{t('expired')}</option>
          <option value="draft">{t('draft')}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">{t('noQuotations')}</p>
          <Button onClick={() => navigate('/quotations/new')}><Plus className="w-4 h-4" /> {t('createFirst')} {t('newQuotation')}</Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                  <th className="text-start p-3 font-medium">{t('quotationNumber')}</th>
                  <th className="text-start p-3 font-medium">{t('client')}</th>
                  <th className="text-start p-3 font-medium">{t('date')}</th>
                  <th className="text-start p-3 font-medium">{t('validity')}</th>
                  <th className="text-end p-3 font-medium">{t('total')}</th>
                  <th className="text-start p-3 font-medium">{t('status')}</th>
                  <th className="text-end p-3 font-medium">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(q => (
                  <tr key={q.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{q.number}</td>
                    <td className="p-3">{getClient(q.clientId)?.name || '-'}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(q.date)}</td>
                    <td className="p-3 text-muted-foreground">{q.validityDays} {t('days')}</td>
                    <td className="p-3 text-end font-medium">{formatEuro(q.total)}</td>
                    <td className="p-3"><StatusBadge status={q.status} /></td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setPreviewDoc(q)} className="p-1.5 rounded hover:bg-muted" title={t('preview')}><Eye className="w-4 h-4" /></button>
                        <button onClick={() => navigate(`/quotations/${q.id}/edit`)} className="p-1.5 rounded hover:bg-muted" title={t('edit')}><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleConvert(q.id)} className="p-1.5 rounded hover:bg-muted text-primary" title={t('convertToInvoice')}><ArrowRightLeft className="w-4 h-4" /></button>
                        <button onClick={() => handleDuplicate(q)} className="p-1.5 rounded hover:bg-muted" title={t('duplicate')}><Copy className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded hover:bg-muted text-destructive" title={t('delete')}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {previewDoc && <DocumentPreview doc={previewDoc} docType="quotation" onClose={() => setPreviewDoc(null)} />}
    </div>
  );
}
