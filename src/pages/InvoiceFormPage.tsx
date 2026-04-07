import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import DocumentForm from '@/components/DocumentForm';
import DocumentPreview from '@/components/DocumentPreview';
import type { Invoice } from '@/types';

export default function InvoiceFormPage() {
  const { id } = useParams();
  const { invoices } = useApp();
  const existing = id ? invoices.find(i => i.id === id) : undefined;
  const [previewDoc, setPreviewDoc] = useState<Invoice | null>(null);

  return (
    <div className="p-4 md:p-6">
      <DocumentForm docType="invoice" existing={existing} onPreview={(doc) => setPreviewDoc(doc as Invoice)} />
      {previewDoc && <DocumentPreview doc={previewDoc} docType="invoice" onClose={() => setPreviewDoc(null)} />}
    </div>
  );
}
