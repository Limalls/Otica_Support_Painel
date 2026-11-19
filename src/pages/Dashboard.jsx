import { Link } from 'react-router-dom';
import { appointmentsApi, customersApi, optometristsApi, ordersApi, productsApi } from '../services';
import { useData } from '../components/useData';
import { Badge, Empty, Loading, PageHeader } from '../components/ui.jsx';
import { fmtDate, iso, money, stockOf, total } from '../lib/format';

export default function Dashboard() {
  const [orders] = useData(ordersApi.list);
  const [apps] = useData(appointmentsApi.list);
  const [products] = useData(productsApi.list);
  const [customers] = useData(customersApi.list);
  const [opts] = useData(optometristsApi.list);
  if (!orders || !apps || !products || !customers || !opts) return <Loading />;

  const hoje = iso();
  const mes = hoje.slice(0, 7);
  const faturamento = orders.filter((o) => o.status !== 'cancelado' && o.date.startsWith(mes)).reduce((s, o) => s + total(o), 0);
  const aTratar = orders.filter((o) => ['pendente', 'separando'].includes(o.status));
  const consultasHoje = apps.filter((a) => a.date === hoje && a.status !== 'cancelada').sort((a, b) => a.time.localeCompare(b.time));
  const baixo = products.filter((p) => p.active && stockOf(p) <= 3);
  const nomeCliente = (id) => customers.find((c) => c.id === id)?.name ?? '—';
  const nomeOpt = (id) => opts.find((o) => o.id === id)?.name ?? '—';

  const stats = [
    ['Faturamento do mês', money(faturamento)],
    ['Pedidos para tratar', aTratar.length],
    ['Consultas hoje', consultasHoje.length],
    ['Produtos com estoque baixo', baixo.length],
  ];

  return (
    <>
      <PageHeader title="Início">
        <span className="text-sm capitalize text-stone-600">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-2 overflow-hidden rounded-lg border border-linha bg-white lg:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="border-b border-r border-linha p-4 last:border-r-0 lg:border-b-0">
            <dt className="text-sm text-stone-600">{k}</dt>
            <dd className="mt-1 font-display text-2xl font-bold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold">Consultas de hoje</h2>
            <Link to="/consultas" className="text-sm text-acetato underline-offset-2 hover:underline">Ver agenda</Link>
          </div>
          {consultasHoje.length === 0 ? (
            <Empty>Nenhuma consulta marcada para hoje.</Empty>
          ) : (
            <ul className="divide-y divide-linha rounded-lg border border-linha bg-white">
              {consultasHoje.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span><b className="mr-3 tabular-nums">{a.time}</b>{a.customerName}<span className="text-stone-500"> · {nomeOpt(a.optometristId)}</span></span>
                  <Badge s={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold">Pedidos para tratar</h2>
            <Link to="/pedidos" className="text-sm text-acetato underline-offset-2 hover:underline">Ver pedidos</Link>
          </div>
          {aTratar.length === 0 ? (
            <Empty>Tudo em dia. Nenhum pedido aguardando.</Empty>
          ) : (
            <ul className="divide-y divide-linha rounded-lg border border-linha bg-white">
              {aTratar.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span><b className="mr-2">#{o.id}</b>{nomeCliente(o.customerId)}<span className="text-stone-500"> · {fmtDate(o.date)} · {money(total(o))}</span></span>
                  <Badge s={o.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {baixo.length > 0 && (
          <section className="lg:col-span-2">
            <h2 className="mb-2 font-display text-lg font-bold">Estoque baixo</h2>
            <ul className="divide-y divide-linha rounded-lg border border-linha bg-white">
              {baixo.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span>{p.name}<span className="text-stone-500"> · {p.brand}</span></span>
                  <Badge s="baixo">{stockOf(p)} em estoque</Badge>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
