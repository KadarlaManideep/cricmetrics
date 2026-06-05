import { useEffect, useState } from 'react';
import Papa from 'papaparse';

type UseCSVResult<T> = {
  data: T[];
  loading: boolean;
  error: string | null;
};

export function useCSV<T = Record<string, unknown>>(filename: string): UseCSVResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/data/${filename}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch ${filename}`);
        return r.text();
      })
      .then((csvText) => {
        Papa.parse<T>(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (cancelled) return;
            setData(results.data as T[]);
            setLoading(false);
          },
          error: (err: { message: string }) => {
            if (cancelled) return;
            setError(err.message);
            setLoading(false);
          },
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(String(err));
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filename]);

  return { data, loading, error };
}

export default useCSV;
