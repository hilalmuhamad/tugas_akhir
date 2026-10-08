import { useEffect, useState } from "react";
import {
  AlumniRecord,
  fetchAlumniRaw,
  FetchAlumniResult,
} from "../service/alumniService";

// Cache di level modul supaya semua komponen dashboard berbagi SATU request
// ke /api/alumni, bukan request terpisah per komponen.
let cached: FetchAlumniResult | null = null;
let cachePromise: Promise<FetchAlumniResult> | null = null;

function load(): Promise<FetchAlumniResult> {
  if (cached) return Promise.resolve(cached);
  if (!cachePromise) {
    cachePromise = fetchAlumniRaw().then((result) => {
      cached = result;
      return result;
    });
  }
  return cachePromise;
}

export function useAlumniData() {
  const [data, setData] = useState<AlumniRecord[]>(cached?.data ?? []);
  const [source, setSource] = useState<"api" | "dummy">(cached?.source ?? "dummy");
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    load()
      .then((result) => {
        if (!active) return;
        setData(result.data);
        setSource(result.source);
      })
      .catch((err: Error) => {
        if (active) setError(err.message ?? "Gagal memuat data alumni");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, source, loading, error };
}
