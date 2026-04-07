import { useState } from 'react';
import { useApp } from '@/store/AppContext';
import { useNavigate } from 'react-router-dom';
import { formatEuro } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Edit, Trash2, User, Building2, X } from 'lucide-react';
import type { Client, ClientType } from '@/types';
import { toast } from 'sonner';

function ClientModal({ client, onSave, onClose }: { client?: Client; onSave: (c: Omit<Client, 'id'> & { id?: string }) => void; onClose: () => void }) {
  const { t } = useApp();
  const [form, setForm] = useState({
    name: client?.name || '', type: (client?.type || 'private') as ClientType,
    address: client?.address || '', city: client?.city || '', cap: client?.cap || '',
    province: client?.province || '', piva: client?.piva || '', codiceFiscale: client?.codiceFiscale || '',
    email: client?.email || '', phone: client?.phone || '', notes: client?.notes || '',
    sdi: client?.sdi || '', pec: client?.pec || '',
  });
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 bg-foreground/30 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{client ? t('edit') : t('newClient')}</h2>
          <button onClick={onClose}><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3">
          <Input placeholder="Nome / Ragione Sociale" value={form.name} onChange={e => set('name', e.target.value)} />
          <div className="flex gap-2">
            <button onClick={() => set('type', 'private')} className={`flex-1 py-2 rounded-md border text-sm font-medium ${form.type === 'private' ? 'bg-primary text-primary-foreground' : 'border-input'}`}>
              <User className="w-4 h-4 inline mr-1" />{t('private')}
            </button>
            <button onClick={() => set('type', 'company')} className={`flex-1 py-2 rounded-md border text-sm font-medium ${form.type === 'company' ? 'bg-primary text-primary-foreground' : 'border-input'}`}>
              <Building2 className="w-4 h-4 inline mr-1" />{t('company')}
            </button>
          </div>
          <Input placeholder="Indirizzo" value={form.address} onChange={e => set('address', e.target.value)} />
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="Città" value={form.city} onChange={e => set('city', e.target.value)} />
            <Input placeholder="CAP" value={form.cap} onChange={e => set('cap', e.target.value)} />
            <Input placeholder="Provincia" value={form.province} onChange={e => set('province', e.target.value)} />
          </div>
          {form.type === 'company' && <Input placeholder="P.IVA" value={form.piva} onChange={e => set('piva', e.target.value)} />}
          <Input placeholder="Codice Fiscale" value={form.codiceFiscale} onChange={e => set('codiceFiscale', e.target.value)} />
          <Input placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} />
          <Input placeholder="Telefono" value={form.phone} onChange={e => set('phone', e.target.value)} />
          <Input placeholder="Codice SDI" value={form.sdi} onChange={e => set('sdi', e.target.value)} />
          <Input placeholder="PEC" value={form.pec} onChange={e => set('pec', e.target.value)} />
          <Textarea placeholder="Note interne" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={() => {
            if (!form.name.trim()) return toast.error('Nome richiesto');
            onSave({ ...form, id: client?.id });
          }}>{t('save')}</Button>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const { t, clients, invoices, quotations, addClient, updateClient, deleteClient } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [editClient, setEditClient] = useState<Client | undefined>();
  const [showModal, setShowModal] = useState(false);

  const filtered = clients.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const getClientTotal = (cId: string) => invoices.filter(i => i.clientId === cId).reduce((s, i) => s + i.total, 0);
  const getClientDocCount = (cId: string) => invoices.filter(i => i.clientId === cId).length + quotations.filter(q => q.clientId === cId).length;

  const handleSave = (data: Omit<Client, 'id'> & { id?: string }) => {
    if (data.id) {
      updateClient(data as Client);
    } else {
      const { id, ...rest } = data;
      addClient(rest);
    }
    toast.success(t('clientSaved'));
    setShowModal(false);
    setEditClient(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      deleteClient(id);
      toast.success(t('clientDeleted'));
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{t('clients')}</h1>
        <Button onClick={() => { setEditClient(undefined); setShowModal(true); }}><Plus className="w-4 h-4" /> {t('newClient')}</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">{t('noClients')}</p>
          <Button onClick={() => setShowModal(true)}><Plus className="w-4 h-4" /> {t('createFirst')} {t('newClient')}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-lg p-5 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {c.type === 'company' ? <Building2 className="w-4 h-4 text-primary" /> : <User className="w-4 h-4 text-muted-foreground" />}
                    {c.name}
                  </div>
                  <div className="text-sm text-muted-foreground">{c.city}{c.province ? ` (${c.province})` : ''}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditClient(c); setShowModal(true); }} className="p-1.5 rounded hover:bg-muted"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-muted text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {c.piva && <div className="text-xs text-muted-foreground">P.IVA: {c.piva}</div>}
              <div className="flex justify-between text-sm border-t border-border pt-2">
                <span className="text-muted-foreground">{getClientDocCount(c.id)} {t('recentDocuments').toLowerCase()}</span>
                <span className="font-medium">{formatEuro(getClientTotal(c.id))}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <ClientModal client={editClient} onSave={handleSave} onClose={() => { setShowModal(false); setEditClient(undefined); }} />}
    </div>
  );
}
