import { useState } from 'react';
import { productsApi } from '../services';
import { useData } from '../components/useData';
import { Badge, Button, Field, Loading, Modal, PageHeader, Table, inputCls } from '../components/ui.jsx';
import { money, stockOf } from '../lib/format';

const vazio = { name: '', brand: '', category: '', price: '', image: '', active: true, variants: [{ color: '', size: '', stock: 0 }] };

function Form({ inicial, onSave, onClose }) {
  const [f, setF] = useState(inicial);
  const [erro, setErro] = useState('');
  const set = (k, v) => setF({ ...f, [k]: v });
  const setVar = (i, k, v) => set('variants', f.variants.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const salvar = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return setErro('Informe o nome do produto.');
    if (!(Number(f.price) > 0)) return setErro('Informe um preço maior que zero.');
    if (!f.variants.length) return setErro('Adicione ao menos uma variação.');
    await onSave({ ...f, price: Number(f.price), variants: f.variants.map((v) => ({ ...v, stock: Number(v.stock) })) });
  };

  return (
    <form onSubmit={salvar} className="space-y-4">
      <Field label="Nome"><input className={inputCls} value={f.name} onChange={(e) => set('name', e.target.value)} /></Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Marca"><input className={inputCls} value={f.brand} onChange={(e) => set('brand', e.target.value)} /></Field>
        <Field label="Categoria"><input className={inputCls} value={f.category} onChange={(e) => set('category', e.target.value)} /></Field>
        <Field label="Preço (R$)"><input type="number" step="0.01" min="0" className={inputCls} value={f.price} onChange={(e) => set('price', e.target.value)} /></Field>
      </div>
      <Field label="Imagem (endereço)"><input className={inputCls} value={f.image} onChange={(e) => set('image', e.target.value)} placeholder="https://" /></Field>

      <fieldset>
        <legend className="mb-1 text-sm font-medium">Variações e estoque</legend>
        <div className="space-y-2">
          {f.variants.map((v, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_5rem_auto] gap-2">
              <input aria-label="Cor" placeholder="Cor" className={inputCls} value={v.color} onChange={(e) => setVar(i, 'color', e.target.value)} />
              <input aria-label="Tamanho" placeholder="Tamanho" className={inputCls} value={v.size} onChange={(e) => setVar(i, 'size', e.target.value)} />
              <input aria-label="Estoque" type="number" min="0" className={inputCls} value={v.stock} onChange={(e) => setVar(i, 'stock', e.target.value)} />
              <Button type="button" variant="ghost" aria-label="Remover variação" onClick={() => set('variants', f.variants.filter((_, j) => j !== i))}>×</Button>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" className="mt-2" onClick={() => set('variants', [...f.variants, { color: '', size: '', stock: 0 }])}>Adicionar variação</Button>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={f.active} onChange={(e) => set('active', e.target.checked)} /> Visível na loja
      </label>
      {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit">Salvar produto</Button>
      </div>
    </form>
  );
}

export default function Produtos() {
  const [products, reload] = useData(productsApi.list);
  const [edit, setEdit] = useState(null);
  const [busca, setBusca] = useState('');
  if (!products) return <Loading />;

  const lista = products.filter((p) => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(busca.toLowerCase()));
  const salvar = async (p) => { await productsApi.save(p); setEdit(null); reload(); };
  const remover = async (p) => { if (confirm(`Excluir "${p.name}"?`)) { await productsApi.remove(p.id); setEdit(null); reload(); } };

  return (
    <>
      <PageHeader title="Produtos">
        <input aria-label="Buscar produto" placeholder="Buscar produto" className={`${inputCls} w-48`} value={busca} onChange={(e) => setBusca(e.target.value)} />
        <Button onClick={() => setEdit(vazio)}>Novo produto</Button>
      </PageHeader>
      <Table
        rows={lista}
        onRow={setEdit}
        empty="Nenhum produto encontrado. Clique em “Novo produto” para cadastrar."
        cols={[
          { h: 'Produto', c: (p) => <><b>{p.name}</b><div className="text-xs text-stone-500">{p.brand} · {p.category}</div></> },
          { h: 'Preço', c: (p) => money(p.price) },
          { h: 'Estoque', c: (p) => (stockOf(p) <= 3 ? <Badge s="baixo">{stockOf(p)}</Badge> : stockOf(p)) },
          { h: 'Loja', c: (p) => <Badge s={p.active ? 'ativo' : 'inativo'}>{p.active ? 'Visível' : 'Oculto'}</Badge> },
        ]}
      />
      {edit && (
        <Modal title={edit.id ? 'Editar produto' : 'Novo produto'} onClose={() => setEdit(null)}>
          <Form inicial={edit} onSave={salvar} onClose={() => setEdit(null)} />
          {edit.id && <Button variant="danger" className="mt-3" onClick={() => remover(edit)}>Excluir produto</Button>}
        </Modal>
      )}
    </>
  );
}
