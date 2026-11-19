import { useEffect, useState } from 'react';

// Carrega dados de um serviço. Retorna [dados, recarregar].
export function useData(fn, deps = []) {
  const [data, setData] = useState(null);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let ativo = true;
    fn().then((d) => ativo && setData(d));
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return [data, () => setTick((t) => t + 1)];
}
