import { useApp } from '@/store/AppContext';
import { useNavigate } from 'react-router-dom';
import { FileText, FileCheck, Users, TrendingUp } from 'lucide-react';
import { formatEuro, formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/StatusBadge';

export default function DashboardPage() {
  const { t, invoices, quotations, clients, getClient } = useApp();
  const navigate = useNavigate();

  const totalInvValue = invoices.reduce((s, i) => s + i.total, 0);
  const totalQValue = quotations.reduce((s, q) => s + q.total, 0);
  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const unpaidCount = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').length;
  const pendingQCount = quotations.filter(q => q.status === 'pending').length;

  const stats = [
    { label: t('totalInvoices'), value: invoices.length, subValue: formatEuro(totalInvValue), icon: FileText, color: 'text-primary' },
    { label: t('totalQuotations'), value: quotations.length, subValue: formatEuro(totalQValue), icon: FileCheck, color: 'text-primary' },
    { label: t('paidCount'), value: paidCount, subValue: `${unpaidCount} ${t('unpaidCount')}`, icon: TrendingUp, color: 'text-success' },
    { label: t('pendingCount'), value: pendingQCount, subValue: `${clients.length} ${t('clients')}`, icon: Users, color: 'text-warning' },
  ];

  const recentInvoices = [...invoices].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const recentQuotations = [...quotations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{t('dashboard')}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-3xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.subValue}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">{t('invoices')}</h2>
            <button onClick={() => navigate('/invoices')} className="text-sm text-primary hover:underline">{t('view')}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-start p-3 font-medium">#</th>
                  <th className="text-start p-3 font-medium">{t('client')}</th>
                  <th className="text-start p-3 font-medium">{t('total')}</th>
                  <th className="text-start p-3 font-medium">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map(inv => (
                  <tr key={inv.id} className="border-b border-border hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/invoices/${inv.id}`)}>
                    <td className="p-3 font-mono text-xs">{inv.number}</td>
                    <td className="p-3">{getClient(inv.clientId)?.name || '-'}</td>
                    <td className="p-3 font-medium">{formatEuro(inv.total)}</td>
                    <td className="p-3"><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
                {recentInvoices.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">{t('noInvoices')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">{t('quotations')}</h2>
            <button onClick={() => navigate('/quotations')} className="text-sm text-primary hover:underline">{t('view')}</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-start p-3 font-medium">#</th>
                  <th className="text-start p-3 font-medium">{t('client')}</th>
                  <th className="text-start p-3 font-medium">{t('total')}</th>
                  <th className="text-start p-3 font-medium">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotations.map(q => (
                  <tr key={q.id} className="border-b border-border hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/quotations/${q.id}`)}>
                    <td className="p-3 font-mono text-xs">{q.number}</td>
                    <td className="p-3">{getClient(q.clientId)?.name || '-'}</td>
                    <td className="p-3 font-medium">{formatEuro(q.total)}</td>
                    <td className="p-3"><StatusBadge status={q.status} /></td>
                  </tr>
                ))}
                {recentQuotations.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">{t('noQuotations')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
