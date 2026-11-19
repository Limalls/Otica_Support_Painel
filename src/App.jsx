import { useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './store/auth';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Pedidos from './pages/Pedidos.jsx';
import Produtos from './pages/Produtos.jsx';
import Consultas from './pages/Consultas.jsx';
import Clientes from './pages/Clientes.jsx';
import Optometristas from './pages/Optometristas.jsx';
import Relatorios from './pages/Relatorios.jsx';

const nav = [
  ['/', 'Início'],
  ['/pedidos', 'Pedidos'],
  ['/produtos', 'Produtos'],
  ['/consultas', 'Consultas'],
  ['/clientes', 'Clientes'],
  ['/optometristas', 'Optometristas'],
  ['/relatorios', 'Relatórios'],
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="34" height="18" viewBox="0 0 34 18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="9" cy="9" r="7" />
        <circle cx="25" cy="9" r="7" />
        <path d="M16 8.5c.6-.8 1.4-.8 2 0" />
      </svg>
      <span className="font-display text-lg font-bold leading-none">Ótica Support</span>
    </div>
  );
}

function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:flex">
      <header className="flex items-center justify-between bg-acetato px-4 py-3 text-white lg:hidden">
        <Logo />
        <button onClick={() => setOpen(!open)} aria-label="Abrir menu" aria-expanded={open} className="rounded px-2 py-1 text-xl">☰</button>
      </header>
      <aside className={`${open ? 'block' : 'hidden'} bg-acetato text-white lg:sticky lg:top-0 lg:block lg:h-screen lg:w-60 lg:shrink-0`}>
        <div className="hidden px-5 py-6 lg:block"><Logo /></div>
        <nav className="flex flex-col gap-1 px-3 pb-3 lg:pb-0">
          {nav.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-white text-acetato' : 'text-white/85 hover:bg-white/10'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/15 px-5 py-4 text-sm lg:absolute lg:bottom-0 lg:w-60">
          <p className="truncate text-white/70">{user?.email}</p>
          <button onClick={logout} className="mt-1 font-medium underline-offset-2 hover:underline">Sair</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}

function Protected() {
  const token = useAuth((s) => s.token);
  return token ? <Layout /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected />}>
        <Route index element={<Dashboard />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="produtos" element={<Produtos />} />
        <Route path="consultas" element={<Consultas />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="optometristas" element={<Optometristas />} />
        <Route path="relatorios" element={<Relatorios />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
