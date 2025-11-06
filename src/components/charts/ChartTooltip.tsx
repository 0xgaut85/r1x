import React from 'react';
import { formatCurrencyCompact, formatCompactNumber, formatDateLabel } from './format';

type ValueFormatter = (value: number | string, name?: string) => string;
type LabelFormatter = (label: string) => string;

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: Array<any>;
  valueFormatter?: ValueFormatter;
  labelFormatter?: LabelFormatter;
}

export function ChartTooltip({ active, label, payload, valueFormatter, labelFormatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const defaultValueFormatter: ValueFormatter = (v) => formatCompactNumber(v);
  const defaultLabelFormatter: LabelFormatter = (l) => formatDateLabel(l);

  const vf = valueFormatter ?? defaultValueFormatter;
  const lf = labelFormatter ?? defaultLabelFormatter;

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '10px 12px',
        fontFamily: 'TWKEverettMono-Regular, monospace',
        fontSize: 12,
        color: '#111827',
      }}
    >
      {label && (
        <div style={{ fontWeight: 600, marginBottom: 6 }}>{lf(label)}</div>
      )}
      <div style={{ display: 'grid', gap: 4 }}>
        {payload.map((item: any) => (
          <div key={item.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 9999,
                backgroundColor: item.color || '#FF4D00',
                display: 'inline-block',
              }}
            />
            <span style={{ color: '#6b7280' }}>{item.name ?? item.dataKey}:</span>
            <span style={{ fontWeight: 600 }}>{vf(item.value, item.name)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const currencyValueFormatter = (value: number | string, currency: string = 'USDC') =>
  formatCurrencyCompact(value, currency);

export const numberValueFormatter = (value: number | string) =>
  formatCompactNumber(value);

export const dateLabelFormatter = (label: string) => formatDateLabel(label);

export default ChartTooltip;


