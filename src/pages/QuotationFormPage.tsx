import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '@/store/AppContext';
import DocumentForm from '@/components/DocumentForm';
import DocumentPreview from '@/components/DocumentPreview';
import type { Quotation } from '@/types';

export default function QuotationFormPage() {
  const { id } = useParams();
  const { quotations } = useApp();
  const existing = id ? quotations.find(q => q.id === id) : undefined;
  const [previewDoc, setPreviewDoc] = useState<Quotation | null>(null);

  return (
    <div className="p-4 md:p-6">
      <DocumentForm docType="quotation" existing={existing} onPreview={(doc) => setPreviewDoc(doc as Quotation)} />
      {previewDoc && <DocumentPreview doc={previewDoc} docType="quotation" onClose={() => setPreviewDoc(null)} />}
    </div>
  );
}
