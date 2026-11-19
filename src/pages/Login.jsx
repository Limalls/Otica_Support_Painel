import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../services';
import { useAuth } from '../store/auth';
import { Button, Field, inputCls } from '../components/ui.jsx';

export default function Login() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [erro, setErro] = useState('');
  const [busy, setBusy] = useState(false);
  if (token) return <Navigate to="/" replace />;

  const enviar = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErro('');
    try {
      const r = await authApi.login(f.email, f.password);
      login(r.token, r.user);
      navigate('/');
    } catch (err) {
      setErro(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={enviar} className="w-full max-w-sm space-y-4 rounded-xl border border-linha bg-white p-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Painel da Ótica Support</h1>
          <p className="mt-1 text-sm text-stone-600">Entre para acompanhar pedidos e consultas.</p>
        </div>
        <Field label="E-mail">
          <input type="email" required autoComplete="username" className={inputCls} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </Field>
        <Field label="Senha">
          <input type="password" required autoComplete="current-password" className={inputCls} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        </Field>
        {erro && <p role="alert" className="text-sm text-red-700">{erro}</p>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? 'Entrando…' : 'Entrar'}</Button>
        <p className="text-xs text-stone-500">Modo de teste: dono@oticasupport.com / 123456</p>
      </form>
    </div>
  );
}
