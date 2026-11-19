import { useState } from 'react';
import { appointmentsApi, customersApi, ordersApi } from '../services';
import { useData } from '../components/useData';
import { Button, Loading, PageHeader, inputCls } from '../components/ui.jsx';
import { iso, money, total } from '../lib/format';

export default function Relatorios() {
  const [orders] = useData(ordersApi.list);
  const [apps] = useData(appointmentsApi.list);
  const [customers] = useData(customersApi.list);
  const [dias, setDias] = useState(30);
  if (!orders || !apps || !customers) return <Loading />;

  const ini = new Date();
  ini.setDate(ini.getDate() - dias + 1);
  const de = iso(ini);
  const ate = iso();
  const vendas = orders.filter((o) => o.status !== 'cancelado' && o.date >= de && o.date <= ate);
  const faturamento = vendas.reduce((s, o) => s + total(o), 0);

  const porDia = {};
  for (let i = 0; i < dias; i++) {
    const d = new Date(ini);
    d.setDate(d.getDate() + i);
    porDia[iso(d)] = 0;
  }
  vendas.forEach((o) => (porDia[o.date] += total(o)));
  const serie = Object.entries(porDia);
  const max = Math.max(1, ...serie.map(([, v]) => v));

  const prod = {};
  vendas.forEach((o) => o.items.forEach((i) => {
    prod[i.name] = prod[i.name] || { qty: 0, valor: 0 };
    prod[i.name].qty += i.qty;
    prod[i.name].valor += i.qty * i.price;
  }));
  const top = Object.entries(prod).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);

  const consultas = apps.filter((a) => a.date >= de && a.date <= ate);
  const porStatus = ['agendada', 'confirmada', 'concluida', 'cancelada'].map((s) => [s, consultas.filter((a) => a.status === s).length]);
  const nomes = { agendada: 'Agendadas', confirmada: 'Confirmadas', concluida: 'Concluídas', cancelada: 'Canceladas' };

  const exportar = () => {
    const linhas = [['Pedido', 'Data', 'Cliente', 'Status', 'Total']].concat(
      vendas.map((o) => [o.id, o.date, customers.find((c) => c.id === o.customerId)?.name ?? '', o.status, total(o).toFixed(2)]),
    );
    const csv = linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `vendas_${de}_a_${ate}.csv`;
    a.click();
  };

  return (
    <>
      <PageHeader title="Relatórios">
        <select aria-label="Período" className={`${inputCls} w-44`} value={dias} onChange={(e) => setDias(Number(e.target.value))}>
          <option value={7}>Últimos 7 dias</option>
          <option value={30}>Últimos 30 dias</option>
          <option value={90}>Últimos 90 dias</option>
        </select>
        <Button variant="ghost" onClick={exportar}>Exportar vendas (CSV)</Button>
      </PageHeader>

      <dl className="mb-8 grid grid-cols-3 overflow-hidden rounded-lg border border-linha bg-white">
        {[['Faturamento', money(faturamento)], ['Pedidos', vendas.length], ['Ticket médio', money(vendas.length ? faturamento / vendas.length : 0)]].map(([k, v]) => (
          <div key={k} className="border-r border-linha p-4 last:border-r-0">
            <dt className="text-sm text-stone-600">{k}</dt>
            <dd className="mt-1 font-display text-xl font-bold sm:text-2xl">{v}</dd>
          </div>
        ))}
      </dl>

      <section className="mb-8">
        <h2 className="mb-2 font-display text-lg font-bold">Faturamento por dia</h2>
        <div className="rounded-lg border border-linha bg-white p-4">
          <div className="flex h-40 items-end gap-px" role="img" aria-label={`Faturamento diário, total de ${money(faturamento)} no período`}>
            {serie.map(([d, v]) => (
              <div key={d} title={`${d.split('-').reverse().join('/')}: ${money(v)}`} className="flex-1 rounded-t-sm bg-acetato" style={{ height: `${Math.max((v / max) * 100, v ? 3 : 0.5)}%`, opacity: v ? 1 : 0.2 }} />
            ))}
          </div>
          <p className="mt-2 text-xs text-stone-500">Passe o mouse (ou toque) em uma barra para ver o valor do dia.</p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 font-display text-lg font-bold">Produtos mais vendidos</h2>
          {top.length === 0 ? <p className="text-sm text-stone-500">Sem vendas no período.</p> : (
            <ol className="divide-y divide-linha rounded-lg border border-linha bg-white text-sm">
              {top.map(([n, p]) => (
                <li key={n} className="flex justify-between px-4 py-3"><span>{n}</span><span className="text-stone-600">{p.qty} un · {money(p.valor)}</span></li>
              ))}
            </ol>
          )}
        </section>
        <section>
          <h2 className="mb-2 font-display text-lg font-bold">Consultas no período</h2>
          <ul className="divide-y divide-linha rounded-lg border border-linha bg-white text-sm">
            {porStatus.map(([s, n]) => (
              <li key={s} className="flex justify-between px-4 py-3"><span>{nomes[s]}</span><b>{n}</b></li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
