import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { useNavigate } from 'react-router-dom';
import { formatEuro, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Eye, Edit, Copy, Trash2, Printer } from 'lucide-react';
import type { Invoice } from '@/types';
import DocumentPreview from '@/components/DocumentPreview';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const { t, invoices, getClient, deleteInvoice, addInvoice } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [previewDoc, setPreviewDoc] = useState<Invoice | null>(null);

  const filtered = invoices.filter(inv => {
    const client = getClient(inv.clientId);
    const matchSearch = !search || inv.number.toLowerCase().includes(search.toLowerCase()) || client?.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || inv.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleDuplicate = (inv: Invoice) => {
    const { id, number, createdAt, ...rest } = inv;
    addInvoice({ ...rest, items: rest.items.map(i => ({ ...i, id: crypto.randomUUID() })) });
    toast.success(t('documentSaved'));
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      deleteInvoice(id);
      toast.success(t('documentDeleted'));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{t('invoices')}</h1>
        <Button onClick={() => navigate('/invoices/new')}><Plus className="w-4 h-4" /> {t('newInvoice')}</Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">{t('allStatuses')}</option>
          <option value="paid">{t('paid')}</option>
          <option value="unpaid">{t('unpaid')}</option>
          <option value="overdue">{t('overdue')}</option>
          <option value="draft">{t('draft')}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">{t('noInvoices')}</p>
          <Button onClick={() => navigate('/invoices/new')}><Plus className="w-4 h-4" /> {t('createFirst')} {t('newInvoice')}</Button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-muted-foreground">
                  <th className="text-start p-3 font-medium">{t('invoiceNumber')}</th>
                  <th className="text-start p-3 font-medium">{t('client')}</th>
                  <th className="text-start p-3 font-medium">{t('date')}</th>
                  <th className="text-start p-3 font-medium">{t('dueDate')}</th>
                  <th className="text-end p-3 font-medium">{t('total')}</th>
                  <th className="text-start p-3 font-medium">{t('status')}</th>
                  <th className="text-end p-3 font-medium">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => (
                  <tr key={inv.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-xs">{inv.number}</td>
                    <td className="p-3">{getClient(inv.clientId)?.name || '-'}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(inv.date)}</td>
                    <td className="p-3 text-muted-foreground">{formatDate(inv.dueDate)}</td>
                    <td className="p-3 text-end font-medium">{formatEuro(inv.total)}</td>
                    <td className="p-3"><StatusBadge status={inv.status} /></td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setPreviewDoc(inv)} className="p-1.5 rounded hover:bg-muted" title={t('preview')}><Eye className="w-4 h-4" /></button>
                        <button onClick={() => navigate(`/invoices/${inv.id}/edit`)} className="p-1.5 rounded hover:bg-muted" title={t('edit')}><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDuplicate(inv)} className="p-1.5 rounded hover:bg-muted" title={t('duplicate')}><Copy className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded hover:bg-muted text-destructive" title={t('delete')}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {previewDoc && <DocumentPreview doc={previewDoc} docType="invoice" onClose={() => setPreviewDoc(null)} />}
    </div>
  );
}
