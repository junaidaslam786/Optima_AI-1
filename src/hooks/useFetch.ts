// hooks/useFetch.ts
"use client";

import { useState, useEffect } from "react";

export function useFetch<T>(url: string) {
  const [data, setData]     = useState<T | null>(null);
  const [error, setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return;
    setLoading(true);
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json() as Promise<T>;
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);

  return { data, error, loading };
}
