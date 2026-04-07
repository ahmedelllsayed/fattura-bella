import { useApp } from '@/store/AppContext';
import type { InvoiceStatus, QuotationStatus } from '@/types';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  paid: 'bg-success/15 text-success',
  unpaid: 'bg-warning/15 text-warning',
  overdue: 'bg-overdue/15 text-overdue',
  draft: 'bg-draft/15 text-draft',
  pending: 'bg-warning/15 text-warning',
  accepted: 'bg-success/15 text-success',
  rejected: 'bg-overdue/15 text-overdue',
  expired: 'bg-overdue/15 text-overdue',
};

export function StatusBadge({ status }: { status: InvoiceStatus | QuotationStatus }) {
  const { t } = useApp();
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', statusStyles[status])}>
      {t(status as any)}
    </span>
  );
}
