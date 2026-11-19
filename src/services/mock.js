import { iso } from '../lib/format';

const day = (n) => {
  const x = new Date();
  x.setDate(x.getDate() + n);
  return iso(x);
};
let seq = 1000;
const nextId = () => ++seq;

const db = {
  products: [
    { id: 1, name: 'Aviador Clássico', brand: 'Sol & Aço', category: 'Metal', price: 289.9, image: '', active: true,
      variants: [{ color: 'Dourado', size: 'M', stock: 6 }, { color: 'Prata', size: 'M', stock: 2 }] },
    { id: 2, name: 'Wayfarer Acetato', brand: 'Costa', category: 'Acetato', price: 349, image: '', active: true,
      variants: [{ color: 'Preto', size: 'M', stock: 10 }, { color: 'Tartaruga', size: 'L', stock: 4 }] },
    { id: 3, name: 'Redondo Fino', brand: 'Costa', category: 'Metal', price: 259, image: '', active: true,
      variants: [{ color: 'Grafite', size: 'S', stock: 1 }] },
    { id: 4, name: 'Esportivo Vento', brand: 'Prisma', category: 'Esporte', price: 399.9, image: '', active: false,
      variants: [{ color: 'Azul', size: 'L', stock: 0 }] },
  ],
  customers: [
    { id: 1, name: 'Marina Alves', email: 'marina@email.com', phone: '(84) 99911-2233' },
    { id: 2, name: 'Carlos Souza', email: 'carlos@email.com', phone: '(84) 98822-3344' },
    { id: 3, name: 'Beatriz Lima', email: 'bia@email.com', phone: '(84) 99700-1122' },
  ],
  optometrists: [
    { id: 1, name: 'Dra. Helena Prado', days: [1, 2, 3, 4, 5], start: '08:00', end: '17:00', slot: 30, lunchStart: '12:00', lunchEnd: '13:00' },
    { id: 2, name: 'Dr. Rafael Nunes', days: [2, 4, 6], start: '09:00', end: '15:00', slot: 40, lunchStart: '', lunchEnd: '' },
  ],
  orders: [
    { id: 2001, customerId: 1, date: day(-1), items: [{ productId: 1, name: 'Aviador Clássico', qty: 1, price: 289.9 }],
      status: 'pendente', payment: { method: 'Pix', status: 'pendente' }, shipping: { type: 'envio', tracking: '' } },
    { id: 2002, customerId: 2, date: day(-2), items: [{ productId: 2, name: 'Wayfarer Acetato', qty: 2, price: 349 }],
      status: 'separando', payment: { method: 'Cartão', status: 'pago' }, shipping: { type: 'retirada', tracking: '' } },
    { id: 2003, customerId: 3, date: day(-6), items: [{ productId: 3, name: 'Redondo Fino', qty: 1, price: 259 }],
      status: 'enviado', payment: { method: 'Pix', status: 'pago' }, shipping: { type: 'envio', tracking: 'BR123456789XX' } },
    { id: 2004, customerId: 1, date: day(-15), items: [{ productId: 2, name: 'Wayfarer Acetato', qty: 1, price: 349 }],
      status: 'entregue', payment: { method: 'Cartão', status: 'pago' }, shipping: { type: 'envio', tracking: 'BR987654321XX' } },
    { id: 2005, customerId: 2, date: day(-25), items: [{ productId: 1, name: 'Aviador Clássico', qty: 1, price: 289.9 }],
      status: 'cancelado', payment: { method: 'Pix', status: 'reembolsado' }, shipping: { type: 'envio', tracking: '' } },
  ],
  appointments: [
    { id: 3001, customerName: 'Marina Alves', phone: '(84) 99911-2233', optometristId: 1, date: day(0), time: '09:00', status: 'confirmada', origin: 'site' },
    { id: 3002, customerName: 'Carlos Souza', phone: '(84) 98822-3344', optometristId: 1, date: day(0), time: '10:30', status: 'agendada', origin: 'site' },
    { id: 3003, customerName: 'Beatriz Lima', phone: '(84) 99700-1122', optometristId: 2, date: day(1), time: '09:00', status: 'agendada', origin: 'manual' },
  ],
};

const wait = (v) => new Promise((r) => setTimeout(() => r(structuredClone(v)), 120));

const crud = (key) => ({
  list: () => wait(db[key]),
  save: (item) => {
    if (item.id) db[key] = db[key].map((x) => (x.id === item.id ? item : x));
    else {
      item = { ...item, id: nextId() };
      db[key] = [...db[key], item];
    }
    return wait(item);
  },
  remove: (id) => {
    db[key] = db[key].filter((x) => x.id !== id);
    return wait(true);
  },
});

export const authApi = {
  login: async (email, password) => {
    if (email === 'dono@oticasupport.com' && password === '123456')
      return { token: 'mock-token', user: { name: 'Dono', email } };
    throw new Error('E-mail ou senha incorretos.');
  },
};
export const productsApi = crud('products');
export const customersApi = crud('customers');
export const optometristsApi = crud('optometrists');
export const ordersApi = crud('orders');

const toMin = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const toHM = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export const appointmentsApi = {
  ...crud('appointments'),
  slots: (optometristId, date) => {
    const o = db.optometrists.find((x) => x.id === Number(optometristId));
    if (!o || !date || !o.days.includes(new Date(date + 'T12:00:00').getDay())) return wait([]);
    const taken = db.appointments
      .filter((a) => a.optometristId === o.id && a.date === date && a.status !== 'cancelada')
      .map((a) => a.time);
    const out = [];
    for (let m = toMin(o.start); m + o.slot <= toMin(o.end); m += o.slot) {
      const lunch = o.lunchStart && m < toMin(o.lunchEnd) && m + o.slot > toMin(o.lunchStart);
      if (!lunch && !taken.includes(toHM(m))) out.push(toHM(m));
    }
    return wait(out);
  },
};
