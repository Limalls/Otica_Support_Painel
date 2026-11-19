# Ótica Support — Painel do dono

Área restrita para o dono da ótica gerenciar **pedidos, produtos, consultas, clientes, optometristas e relatórios**.
Faz parte do sistema Ótica Support, junto com [Otica_Support_Back](https://github.com/Limalls/Otica_Support_Back) (API) e [Otica_Support_Front](https://github.com/Limalls/Otica_Support_Front) (site da loja).

## Tecnologias

React + Vite (JavaScript/JSX), React Router, Zustand, Axios e Tailwind CSS 4.

## Como rodar

```
cp .env.example .env
npm install
npm run dev
```

Abre em http://localhost:5174. Login de teste: `dono@oticasupport.com` / `123456`.

## Dados de teste (mock)

A API ainda não existe, então hoje tudo vem de `src/services/mock.js` (dados em memória, que voltam ao inicial ao recarregar).
Cada página só usa as funções exportadas por `src/services/index.js`
(`authApi`, `productsApi`, `ordersApi`, `customersApi`, `appointmentsApi`, `optometristsApi`).

### Trocando pela API real

1. Em `src/services/`, crie `real.js` com as mesmas funções, usando o cliente de `api.js` (já envia o JWT e trata 401).
2. Em `src/services/index.js`, troque `export * from './mock.js'` por `export * from './real.js'`.

Formatos esperados (para você desenhar os endpoints no Back):

- **Produto:** `{ id, name, brand, category, price, image, active, variants: [{ color, size, stock }] }`
- **Pedido:** `{ id, customerId, date, items: [{ productId, name, qty, price }], status, payment: { method, status }, shipping: { type: 'envio'|'retirada', tracking } }`
  - status: pendente · pago · separando · enviado · entregue · cancelado
- **Cliente:** `{ id, name, email, phone }`
- **Optometrista:** `{ id, name, days: [0..6], start, end, slot, lunchStart, lunchEnd }`
- **Consulta:** `{ id, customerName, phone, optometristId, date, time, status, origin }`
  - status: agendada · confirmada · concluida · cancelada
  - `slots(optometristId, date)` devolve os horários livres; o ideal é o Back calcular isso.
- **Login:** `POST` com e-mail e senha → `{ token, user }`

## Estrutura

```
src/
├── pages/        # Login, Dashboard, Pedidos, Produtos, Consultas, Clientes, Optometristas, Relatórios
├── components/   # ui.jsx (botões, tabela, modal...) e useData.js
├── services/     # api.js (axios), mock.js e index.js
├── store/        # auth (Zustand, guarda o token)
└── lib/          # formatadores
```
