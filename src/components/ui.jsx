import { useEffect } from 'react';

export const inputCls =
  'w-full rounded-md border border-linha bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-acetato';

export function Button({ variant = 'primary', className = '', ...p }) {
  const v = {
    primary: 'bg-acetato text-white hover:bg-acetato-escuro',
    ghost: 'border border-linha bg-white hover:bg-fundo',
    danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
  }[variant];
  return (
    <button
      className={`rounded-md px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acetato disabled:opacity-50 ${v} ${className}`}
      {...p}
    />
  );
}

export function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">{label}</span>
      {children}
    </label>
  );
}

const tones = {
  pendente: 'bg-amber-100 text-amber-900',
  agendada: 'bg-amber-100 text-amber-900',
  pago: 'bg-emerald-100 text-emerald-900',
  entregue: 'bg-emerald-100 text-emerald-900',
  concluida: 'bg-emerald-100 text-emerald-900',
  ativo: 'bg-emerald-100 text-emerald-900',
  separando: 'bg-sky-100 text-sky-900',
  confirmada: 'bg-sky-100 text-sky-900',
  enviado: 'bg-indigo-100 text-indigo-900',
  cancelado: 'bg-red-100 text-red-800',
  cancelada: 'bg-red-100 text-red-800',
  reembolsado: 'bg-red-100 text-red-800',
  inativo: 'bg-stone-200 text-stone-700',
  baixo: 'bg-red-100 text-red-800',
};
const labels = { concluida: 'Concluída' };

export function Badge({ s, children }) {
  const text = children ?? labels[s] ?? s.charAt(0).toUpperCase() + s.slice(1);
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[s] || 'bg-stone-200'}`}>
      {text}
    </span>
  );
}

export function PageHeader({ title, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export const Loading = () => <p className="py-10 text-sm text-stone-500">Carregando…</p>;

export function Empty({ children }) {
  return <p className="py-10 text-center text-sm text-stone-500">{children}</p>;
}

export function Table({ cols, rows, onRow, empty = 'Nada por aqui ainda.' }) {
  if (!rows.length) return <Empty>{empty}</Empty>;
  return (
    <div className="overflow-x-auto rounded-lg border border-linha bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-linha bg-fundo text-stone-600">
          <tr>
            {cols.map((c) => (
              <th key={c.h} className="px-4 py-2.5 font-medium">{c.h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              onClick={onRow && (() => onRow(r))}
              className={`border-b border-linha last:border-0 ${onRow ? 'cursor-pointer hover:bg-fundo' : ''}`}
            >
              {cols.map((c) => (
                <td key={c.h} className="px-4 py-3 align-middle">{c.c(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-xl bg-white p-5 sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Fechar" className="rounded p-1 text-xl leading-none hover:bg-fundo">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
