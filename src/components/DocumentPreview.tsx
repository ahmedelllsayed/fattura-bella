import { useApp } from '@/store/AppContext';
import type { Invoice, Quotation, DocType } from '@/types';
import { formatEuro, formatDate, calcLineTotal, calcVat } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { X, Printer } from 'lucide-react';

interface Props {
  doc: Invoice | Quotation;
  docType: DocType;
  onClose: () => void;
}

export default function DocumentPreview({ doc, docType, onClose }: Props) {
  const { settings, getClient } = useApp();
  const client = getClient(doc.clientId);

  const handlePrint = () => window.print();

  const isInvoice = docType === 'invoice';
  const inv = doc as Invoice;
  const quot = doc as Quotation;
  const accentColor = settings.primaryColor || '#01696f';

  return (
    <div className="fixed inset-0 bg-foreground/50 z-[100] flex items-start justify-center overflow-auto py-8 print:p-0 print:bg-transparent">
      <div className="bg-card max-w-[210mm] w-full mx-4 rounded-lg shadow-2xl print:shadow-none print:mx-0 print:rounded-none">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-border print:hidden">
          <h2 className="font-semibold">{isInvoice ? 'Fattura' : 'Preventivo'} {doc.number}</h2>
          <div className="flex gap-2">
            <Button size="sm" onClick={handlePrint}><Printer className="w-4 h-4 mr-1" /> Stampa / PDF</Button>
            <Button size="sm" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* Print area */}
        <div className="print-area p-8 md:p-12 space-y-6 font-document-sans" style={{ color: '#1a1918' }}>
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              {settings.showLogo && settings.logo && (
                <img src={settings.logo} alt="Logo" className="h-16 mb-2 object-contain" />
              )}
              <div className="text-xl font-bold" style={{ color: accentColor }}>{settings.name}</div>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <div>{settings.address}, {settings.cap} {settings.city} ({settings.province})</div>
                <div>P.IVA: {settings.piva}</div>
                {settings.codiceFiscale && <div>C.F.: {settings.codiceFiscale}</div>}
                <div>{settings.email} | {settings.phone}</div>
                {settings.website && <div>{settings.website}</div>}
              </div>
            </div>
            <div className="text-end space-y-1">
              <div className="text-2xl font-bold uppercase" style={{ color: accentColor }}>
                {isInvoice ? 'FATTURA' : 'PREVENTIVO'}
              </div>
              <div className="text-sm space-y-0.5">
                <div><span className="text-muted-foreground">N°:</span> {doc.number}</div>
                <div><span className="text-muted-foreground">Data:</span> {formatDate(doc.date)}</div>
                {isInvoice && <div><span className="text-muted-foreground">Scadenza:</span> {formatDate(inv.dueDate)}</div>}
                {!isInvoice && <div><span className="text-muted-foreground">Validità:</span> {quot.validityDays} giorni</div>}
              </div>
            </div>
          </div>

          <hr style={{ borderColor: accentColor }} />

          {/* Client */}
          {client && (
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Spett.le:</div>
              <div className="font-semibold text-lg">{client.name}</div>
              <div className="text-sm text-muted-foreground">
                <div>{client.address}{client.city ? `, ${client.city}` : ''}{client.cap ? ` ${client.cap}` : ''}{client.province ? ` (${client.province})` : ''}</div>
                {client.piva && <div>P.IVA: {client.piva}</div>}
                {client.codiceFiscale && <div>C.F.: {client.codiceFiscale}</div>}
                {client.email && <div>{client.email}</div>}
              </div>
            </div>
          )}

          {/* Items Table */}
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ backgroundColor: accentColor, color: 'white' }}>
                <th className="text-start p-2.5 font-medium">Descrizione</th>
                <th className="text-center p-2.5 font-medium w-14">Qnt</th>
                <th className="text-center p-2.5 font-medium w-14">Unità</th>
                <th className="text-end p-2.5 font-medium w-24">Prezzo Unit.</th>
                <th className="text-center p-2.5 font-medium w-14">IVA</th>
                <th className="text-end p-2.5 font-medium w-24">Totale</th>
              </tr>
            </thead>
            <tbody>
              {doc.items.map((item, idx) => (
                item.type === 'section' ? (
                  <tr key={item.id} style={{ backgroundColor: `${accentColor}15` }}>
                    <td colSpan={6} className="p-2.5 font-bold uppercase text-sm">{item.description}</td>
                  </tr>
                ) : (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-muted/30' : ''}>
                    <td className="p-2.5">{item.description}</td>
                    <td className="p-2.5 text-center">{item.quantity}</td>
                    <td className="p-2.5 text-center">{item.unit}</td>
                    <td className="p-2.5 text-end">{formatEuro(item.unitPrice)}</td>
                    <td className="p-2.5 text-center">{item.vatRate}%</td>
                    <td className="p-2.5 text-end font-medium">{formatEuro(calcLineTotal(item.quantity, item.unitPrice))}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Imponibile</span>
                <span>{formatEuro(doc.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>IVA</span>
                <span>{formatEuro(doc.vatTotal)}</span>
              </div>
              {doc.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Sconto</span>
                  <span>-{doc.discountType === 'percent' ? `${doc.discount}%` : formatEuro(doc.discount)}</span>
                </div>
              )}
              <div className="border-t-2 pt-2 flex justify-between text-lg font-bold" style={{ borderColor: accentColor }}>
                <span>TOTALE</span>
                <span>{formatEuro(doc.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border pt-4 space-y-3 text-sm">
            {isInvoice && inv.paymentTerms && (
              <div><span className="font-medium">Condizioni di Pagamento:</span> {inv.paymentTerms}</div>
            )}
            {!isInvoice && quot.generalTerms && (
              <div><span className="font-medium">Condizioni Generali:</span> {quot.generalTerms}</div>
            )}
            {settings.iban && (
              <div className="space-y-0.5">
                <div className="font-medium">Dati Bancari:</div>
                <div>{settings.bankName} — IBAN: {settings.iban}</div>
                {settings.bic && <div>BIC/SWIFT: {settings.bic}</div>}
              </div>
            )}
            {doc.notes && <div><span className="font-medium">Note:</span> {doc.notes}</div>}

            {settings.showSignatureLine && (
              <div className="pt-8 flex justify-end">
                <div className="text-center">
                  <div className="w-48 border-b border-foreground mb-1"></div>
                  <div className="text-xs text-muted-foreground">Firma e Timbro</div>
                </div>
              </div>
            )}
            <div className="text-xs text-muted-foreground text-center pt-4">
              Documento generato da {settings.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
