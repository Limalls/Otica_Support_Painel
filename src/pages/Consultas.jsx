import { useState } from 'react';
import { appointmentsApi, customersApi, optometristsApi } from '../services';
import { useData } from '../components/useData';
import { Badge, Button, Field, Loading, Modal, PageHeader, Table, inputCls } from '../components/ui.jsx';
import { iso } from '../lib/format';

function Nova({ opts, customers, dataInicial, onSave, onClose }) {
  const [f, setF] = useState({ optometristId: opts[0]?.id ?? '', date: dataInicial, time: '', customerName: '', phone: '' });
  const [slots] = useData(() => appointmentsApi.slots(f.optometristId, f.date), [f.optometristId, f.date]);
  const set = (k, v) => setF({ ...f, [k]: v, ...(k !== 'time' && k !== 'customerName' && k !== 'phone' ? { time: '' } : {}) });

  const salvar = (e) => {
    e.preventDefault();
    onSave({ ...f, optometristId: Number(f.optometristId), status: 'confirmada', origin: 'manual' });
  };

  return (
    <form onSubmit={salvar} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Optometrista">
          <select className={inputCls} value={f.optometristId} onChange={(e) => set('optometristId', e.target.value)}>
            {opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </Field>
        <Field label="Data"><input type="date" required className={inputCls} value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
      </div>
      <Field label="Horário">
        <select required className={inputCls} value={f.time} onChange={(e) => set('time', e.target.value)}>
          <option value="">{slots && slots.length === 0 ? 'Sem horários livres neste dia' : 'Escolha um horário'}</option>
          {(slots || []).map((t) => <option key={t}>{t}</option>)}
        </select>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nome do cliente">
          <input required list="clientes" className={inputCls} value={f.customerName}
            onChange={(e) => {
              const c = customers.find((x) => x.name === e.target.value);
              setF({ ...f, customerName: e.target.value, phone: c ? c.phone : f.phone });
            }} />
          <datalist id="clientes">{customers.map((c) => <option key={c.id} value={c.name} />)}</datalist>
        </Field>
        <Field label="Telefone"><input required className={inputCls} value={f.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Marcar consulta</Button>
      </div>
    </form>
  );
}

export default function Consultas() {
  const [apps, reload] = useData(appointmentsApi.list);
  const [opts] = useData(optometristsApi.list);
  const [customers] = useData(customersApi.list);
  const [data, setData] = useState(iso());
  const [optId, setOptId] = useState('');
  const [nova, setNova] = useState(false);
  if (!apps || !opts || !customers) return <Loading />;

  const mover = (n) => { const d = new Date(data + 'T12:00:00'); d.setDate(d.getDate() + n); setData(iso(d)); };
  const lista = apps.filter((a) => a.date === data && (!optId || a.optometristId === Number(optId))).sort((a, b) => a.time.localeCompare(b.time));
  const nomeOpt = (id) => opts.find((o) => o.id === id)?.name ?? '—';
  const mudar = async (a, status) => { await appointmentsApi.save({ ...a, status }); reload(); };
  const criar = async (a) => { await appointmentsApi.save(a); setNova(false); reload(); };

  return (
    <>
      <PageHeader title="Consultas">
        <Button onClick={() => setNova(true)}>Marcar consulta</Button>
      </PageHeader>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="ghost" onClick={() => mover(-1)} aria-label="Dia anterior">‹</Button>
        <input type="date" aria-label="Data" className={`${inputCls} w-40`} value={data} onChange={(e) => setData(e.target.value)} />
        <Button variant="ghost" onClick={() => mover(1)} aria-label="Próximo dia">›</Button>
        <Button variant="ghost" onClick={() => setData(iso())}>Hoje</Button>
        <select aria-label="Optometrista" className={`${inputCls} w-52`} value={optId} onChange={(e) => setOptId(e.target.value)}>
          <option value="">Todos os optometristas</option>
          {opts.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>
      <Table
        rows={lista}
        empty="Nenhuma consulta neste dia."
        cols={[
          { h: 'Hora', c: (a) => <b className="tabular-nums">{a.time}</b> },
          { h: 'Cliente', c: (a) => <>{a.customerName}<div className="text-xs text-stone-500">{a.phone}</div></> },
          { h: 'Optometrista', c: (a) => nomeOpt(a.optometristId) },
          { h: 'Origem', c: (a) => (a.origin === 'manual' ? 'Marcada pelo dono' : 'Site') },
          { h: 'Status', c: (a) => <Badge s={a.status} /> },
          { h: 'Ações', c: (a) => (
            <div className="flex flex-wrap gap-1.5">
              {a.status === 'agendada' && <Button variant="ghost" onClick={() => mudar(a, 'confirmada')}>Confirmar</Button>}
              {['agendada', 'confirmada'].includes(a.status) && <Button variant="ghost" onClick={() => mudar(a, 'concluida')}>Concluir</Button>}
              {['agendada', 'confirmada'].includes(a.status) && <Button variant="danger" onClick={() => mudar(a, 'cancelada')}>Cancelar</Button>}
            </div>
          ) },
        ]}
      />
      {nova && (
        <Modal title="Marcar consulta" onClose={() => setNova(false)}>
          <Nova opts={opts} customers={customers} dataInicial={data} onSave={criar} onClose={() => setNova(false)} />
        </Modal>
      )}
    </>
  );
}
