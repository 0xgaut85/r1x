export function formatCompactNumber(value: number | string, fractionDigits: number = 1): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (!isFinite(num)) return '-';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: fractionDigits,
  }).format(num);
}

export function formatCurrencyCompact(value: number | string, currency: string = 'USDC', fractionDigits: number = 1): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (!isFinite(num)) return '-';
  return `${formatCompactNumber(num, fractionDigits)} ${currency}`;
}

export function formatPercent(value: number | string, fractionDigits: number = 0): string {
  const num = typeof value === 'string' ? Number(value) : value;
  if (!isFinite(num)) return '-';
  return `${num.toFixed(fractionDigits)}%`;
}

export function formatDateLabel(label: string): string {
  const d = new Date(label);
  if (isNaN(d.getTime())) return label;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTimeLabel(label: string): string {
  const d = new Date(label);
  if (isNaN(d.getTime())) return label;
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
}

export function noop<T>(value: T): T {
  return value;
}


