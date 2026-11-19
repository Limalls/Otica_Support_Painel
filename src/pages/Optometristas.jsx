import { useState } from 'react';
import { optometristsApi } from '../services';
import { useData } from '../components/useData';
import { Button, Field, Loading, PageHeader, inputCls } from '../components/ui.jsx';
import { weekdays } from '../lib/format';

const novo = { name: 'Novo optometrista', days: [1, 2, 3, 4, 5], start: '08:00', end: '17:00', slot: 30, lunchStart: '12:00', lunchEnd: '13:00' };

function Card({ inicial, onSave, onRemove }) {
  const [f, setF] = useState(inicial);
  const set = (k, v) => setF({ ...f, [k]: v });
  const toggle = (d) => set('days', f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d].sort());
  return (
    <section className="space-y-4 rounded-lg border border-linha bg-white p-4">
      <Field label="Nome"><input className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
      <div>
        <p className="mb-1 text-sm font-medium">Dias de atendimento</p>
        <div className="flex flex-wrap gap-1.5">
          {weekdays.map((n, d) => (
            <button key={d} type="button" aria-pressed={f.days.includes(d)} onClick={() => toggle(d)}
              className={`rounded-md border px-2.5 py-1 text-sm ${f.days.includes(d) ? 'border-acetato bg-acetato text-white' : 'border-linha bg-white'}`}>{n}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Field label="Início"><input type="time" className={inputCls} value={f.start} onChange={(e) => set('start', e.target.value)} /></Field>
        <Field label="Fim"><input type="time" className={inputCls} value={f.end} onChange={(e) => set('end', e.target.value)} /></Field>
        <Field label="Duração (min)"><input type="number" min="10" step="5" className={inputCls} value={f.slot} onChange={(e) => set('slot', Number(e.target.value))} /></Field>
        <Field label="Almoço de"><input type="time" className={inputCls} value={f.lunchStart} onChange={(e) => set('lunchStart', e.target.value)} /></Field>
        <Field label="Almoço até"><input type="time" className={inputCls} value={f.lunchEnd} onChange={(e) => set('lunchEnd', e.target.value)} /></Field>
      </div>
      <div className="flex justify-between">
        <Button variant="danger" onClick={() => confirm(`Remover ${f.name}?`) && onRemove(f.id)}>Remover</Button>
        <Button onClick={() => onSave(f)}>Salvar horários</Button>
      </div>
    </section>
  );
}

export default function Optometristas() {
  const [opts, reload] = useData(optometristsApi.list);
  if (!opts) return <Loading />;
  const salvar = async (o) => { await optometristsApi.save(o); reload(); };
  const remover = async (id) => { await optometristsApi.remove(id); reload(); };
  return (
    <>
      <PageHeader title="Optometristas e horários">
        <Button onClick={() => salvar(novo)}>Adicionar optometrista</Button>
      </PageHeader>
      <p className="mb-4 max-w-prose text-sm text-stone-600">Os horários livres para agendamento (no site e no painel) são calculados a partir destes dias, janelas e duração.</p>
      <div className="grid gap-4 xl:grid-cols-2">
        {opts.map((o) => <Card key={o.id} inicial={o} onSave={salvar} onRemove={remover} />)}
      </div>
    </>
  );
}
