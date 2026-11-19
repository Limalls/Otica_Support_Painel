import { useState } from 'react';
import { customersApi, ordersApi } from '../services';
import { useData } from '../components/useData';
import { Badge, Button, Field, Loading, Modal, PageHeader, Table, inputCls } from '../components/ui.jsx';
import { fmtDate, money, total } from '../lib/format';

const STATUS = ['pendente', 'pago', 'separando', 'enviado', 'entregue', 'cancelado'];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function Detalhe({ pedido, cliente, onSave, onClose }) {
  const [status, setStatus] = useState(pedido.status);
  const [tracking, setTracking] = useState(pedido.shipping.tracking);
  return (
    <div className="space-y-4 text-sm">
      <p><b>{cliente?.name}</b><br /><span className="text-stone-600">{cliente?.email} · {cliente?.phone}</span></p>
      <ul className="divide-y divide-linha rounded-md border border-linha">
        {pedido.items.map((i, k) => (
          <li key={k} className="flex justify-between px-3 py-2"><span>{i.qty}× {i.name}</span><span>{money(i.qty * i.price)}</span></li>
        ))}
        <li className="flex justify-between px-3 py-2 font-semibold"><span>Total</span><span>{money(total(pedido))}</span></li>
      </ul>
      <p>Pagamento: {pedido.payment.method} <Badge s={pedido.payment.status} /></p>
      <p>Entrega: {pedido.shipping.type === 'envio' ? 'Envio pelos Correios/transportadora' : 'Retirada na loja'}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Status do pedido">
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS.map((s) => <option key={s} value={s}>{cap(s)}</option>)}
          </select>
        </Field>
        {pedido.shipping.type === 'envio' && (
          <Field label="Código de rastreio">
            <input className={inputCls} value={tracking} onChange={(e) => setTracking(e.target.value)} />
          </Field>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Fechar</Button>
        <Button onClick={() => onSave({ ...pedido, status, shipping: { ...pedido.shipping, tracking } })}>Salvar alterações</Button>
      </div>
    </div>
  );
}

export default function Pedidos() {
  const [orders, reload] = useData(ordersApi.list);
  const [customers] = useData(customersApi.list);
  const [filtro, setFiltro] = useState('todos');
  const [sel, setSel] = useState(null);
  if (!orders || !customers) return <Loading />;

  const cli = (id) => customers.find((c) => c.id === id);
  const lista = orders.filter((o) => filtro === 'todos' || o.status === filtro).sort((a, b) => b.date.localeCompare(a.date));
  const salvar = async (o) => { await ordersApi.save(o); setSel(null); reload(); };

  return (
    <>
      <PageHeader title="Pedidos" />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por status">
        {['todos', ...STATUS].map((s) => (
          <button
            key={s}
            onClick={() => setFiltro(s)}
            aria-pressed={filtro === s}
            className={`rounded-full border px-3 py-1 text-sm ${filtro === s ? 'border-acetato bg-acetato text-white' : 'border-linha bg-white hover:bg-fundo'}`}
          >
            {cap(s)}
          </button>
        ))}
      </div>
      <Table
        rows={lista}
        onRow={setSel}
        empty="Nenhum pedido com esse status."
        cols={[
          { h: 'Pedido', c: (o) => <b>#{o.id}</b> },
          { h: 'Cliente', c: (o) => cli(o.customerId)?.name ?? '—' },
          { h: 'Data', c: (o) => fmtDate(o.date) },
          { h: 'Total', c: (o) => money(total(o)) },
          { h: 'Pagamento', c: (o) => <Badge s={o.payment.status} /> },
          { h: 'Status', c: (o) => <Badge s={o.status} /> },
        ]}
      />
      {sel && (
        <Modal title={`Pedido #${sel.id}`} onClose={() => setSel(null)}>
          <Detalhe pedido={sel} cliente={cli(sel.customerId)} onSave={salvar} onClose={() => setSel(null)} />
        </Modal>
      )}
    </>
  );
}
