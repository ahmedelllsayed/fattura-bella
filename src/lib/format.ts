export function formatEuro(amount: number): string {
  return '€ ' + amount.toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function generateDocNumber(prefix: string, existing: string[]): string {
  const year = new Date().getFullYear();
  const yearPrefix = `${prefix}-${year}-`;
  const existingNums = existing
    .filter(n => n.startsWith(yearPrefix))
    .map(n => parseInt(n.replace(yearPrefix, ''), 10))
    .filter(n => !isNaN(n));
  const next = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
  return `${yearPrefix}${String(next).padStart(3, '0')}`;
}

export function calcLineTotal(qty: number, price: number): number {
  return Math.round(qty * price * 100) / 100;
}

export function calcVat(amount: number, rate: number): number {
  return Math.round(amount * rate / 100 * 100) / 100;
}
