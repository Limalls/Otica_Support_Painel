export const iso = (d = new Date()) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
export const money = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const fmtDate = (s) => s.split('-').reverse().join('/');
export const total = (o) => o.items.reduce((s, i) => s + i.qty * i.price, 0);
export const stockOf = (p) => p.variants.reduce((s, v) => s + Number(v.stock), 0);
export const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
