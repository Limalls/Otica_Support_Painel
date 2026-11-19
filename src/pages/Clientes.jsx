import { useState } from 'react';
import { appointmentsApi, customersApi, ordersApi } from '../services';
import { useData } from '../components/useData';
import { Badge, Button, Empty, Field, Loading, Modal, PageHeader, Table, inputCls } from '../components/ui.jsx';
import { fmtDate, money, total } from '../lib/format';

export default function Clientes() {
  const [customers, reload] = useData(customersApi.list);
  const [orders] = useData(ordersApi.list);
  const [apps] = useData(appointmentsApi.list);
  const [busca, setBusca] = useState('');
  const [sel, setSel] = useState(null);
  if (!customers || !orders || !apps) return <Loading />;

  const lista = customers.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(busca.toLowerCase()));
  const salvar = async (e) => { e.preventDefault(); await customersApi.save(sel); setSel(null); reload(); };
  const set = (k, v) => setSel({ ...sel, [k]: v });
  const pedidos = sel?.id ? orders.filter((o) => o.customerId === sel.id) : [];
  const consultas = sel?.id ? apps.filter((a) => a.customerName === sel.name) : [];

  return (
    <>
      <PageHeader title="Clientes">
        <input aria-label="Buscar cliente" placeholder="Buscar cliente" className={`${inputCls} w-48`} value={busca} onChange={(e) => setBusca(e.target.value)} />
        <Button onClick={() => setSel({ name: '', email: '', phone: '' })}>Novo cliente</Button>
      </PageHeader>
      <Table
        rows={lista}
        onRow={setSel}
        empty="Nenhum cliente encontrado."
        cols={[
          { h: 'Nome', c: (c) => <b>{c.name}</b> },
          { h: 'E-mail', c: (c) => c.email },
          { h: 'Telefone', c: (c) => c.phone },
          { h: 'Pedidos', c: (c) => orders.filter((o) => o.customerId === c.id).length },
        ]}
      />
      {sel && (
        <Modal title={sel.id ? sel.name : 'Novo cliente'} onClose={() => setSel(null)}>
          <form onSubmit={salvar} className="space-y-4">
            <Field label="Nome"><input required className={inputCls} value={sel.name} onChange={(e) => set('name', e.target.value)} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="E-mail"><input type="email" className={inputCls} value={sel.email} onChange={(e) => set('email', e.target.value)} /></Field>
              <Field label="Telefone"><input required className={inputCls} value={sel.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
            </div>
            {sel.id && (
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="mb-1 font-medium">Pedidos</h3>
                  {pedidos.length === 0 ? <Empty>Sem pedidos.</Empty> : pedidos.map((o) => (
                    <p key={o.id} className="flex justify-between border-b border-linha py-1.5">
                      <span>#{o.id} · {fmtDate(o.date)} · {money(total(o))}</span><Badge s={o.status} />
                    </p>
                  ))}
                </div>
                <div>
                  <h3 className="mb-1 font-medium">Consultas</h3>
                  {consultas.length === 0 ? <Empty>Sem consultas.</Empty> : consultas.map((a) => (
                    <p key={a.id} className="flex justify-between border-b border-linha py-1.5">
                      <span>{fmtDate(a.date)} às {a.time}</span><Badge s={a.status} />
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setSel(null)}>Cancelar</Button>
              <Button type="submit">Salvar cliente</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
