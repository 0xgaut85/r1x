'use client';

import React, { useMemo, useState } from 'react';

export type ParamLocation = 'body' | 'query' | 'header';

export interface FieldMeta {
  name: string;
  location: ParamLocation;
  required: boolean;
  description?: string;
  example?: string;
  options?: string[];
  defaultValue?: string;
}

export interface ParamWizardProps {
  title?: string;
  fields: FieldMeta[];
  initialValues?: Record<string, string>;
  onSubmit: (values: Record<string, string>) => void;
  onCancel: () => void;
}

export default function ParamWizard({ title, fields, initialValues, onSubmit, onCancel }: ParamWizardProps) {
  const sortedFields = useMemo(() => {
    // Required first, keep stable order body -> query -> header
    const locOrder: Record<ParamLocation, number> = { body: 0, query: 1, header: 2 };
    return [...fields].sort((a, b) => {
      if (a.required !== b.required) return a.required ? -1 : 1;
      const locCmp = locOrder[a.location] - locOrder[b.location];
      if (locCmp !== 0) return locCmp;
      return a.name.localeCompare(b.name);
    });
  }, [fields]);

  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    sortedFields.forEach((f) => {
      const preset = initialValues?.[f.name] ?? f.defaultValue ?? '';
      v[f.name] = String(preset);
    });
    return v;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const handleChange = (name: string, val: string) => {
    setValues((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    // Validate required
    const nextErrors: Record<string, string> = {};
    sortedFields.forEach((f) => {
      const val = values[f.name]?.trim();
      if (f.required && !val) {
        nextErrors[f.name] = 'Required';
      }
      if (f.options && f.options.length > 0 && val && !f.options.includes(val)) {
        // If enum provided, enforce inclusion
        nextErrors[f.name] = `Must be one of: ${f.options.slice(0, 10).join(', ')}${f.options.length > 10 ? ', ...' : ''}`;
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setBusy(true);
      await Promise.resolve(onSubmit(values));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-neutral-900/60 border border-neutral-800 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">{title ?? 'Service Parameters'}</h3>
        <button
          className="text-xs text-neutral-300 hover:text-white px-2 py-1 rounded border border-neutral-700"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </button>
      </div>

      <div className="space-y-3">
        {sortedFields.map((f) => (
          <div key={`${f.location}:${f.name}`} className="">
            <label className="block text-xs text-neutral-300 mb-1">
              {f.name}
              <span className="ml-2 text-[10px] text-neutral-400">[{f.location}{f.required ? ', required' : ''}]</span>
            </label>
            {f.options && f.options.length > 0 ? (
              <select
                className="w-full bg-neutral-800 text-neutral-100 text-sm rounded px-2 py-2 border border-neutral-700"
                value={values[f.name] ?? ''}
                onChange={(e) => handleChange(f.name, e.target.value)}
              >
                <option value="">Select…</option>
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                className="w-full bg-neutral-800 text-neutral-100 text-sm rounded px-2 py-2 border border-neutral-700"
                value={values[f.name] ?? ''}
                placeholder={f.example || f.description || ''}
                onChange={(e) => handleChange(f.name, e.target.value)}
              />
            )}
            {errors[f.name] && (
              <div className="mt-1 text-[11px] text-red-400">{errors[f.name]}</div>
            )}
            {(f.description || f.example) && (
              <div className="mt-1 text-[11px] text-neutral-400">
                {f.description && <span>{f.description} </span>}
                {f.example && <span>Example: {f.example}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <button
          className="px-3 py-2 rounded bg-blue-600 text-white text-sm disabled:opacity-50"
          onClick={handleSubmit}
          disabled={busy}
        >
          {busy ? 'Submitting…' : 'Continue'}
        </button>
      </div>
    </div>
  );
}


