import { useCallback, useEffect, useState } from "react";
import {
  getDashboardDepartments,
  getDashboardOverview,
  getDashboardRisks,
  getDashboardTrends,
} from "../services/phishingApi";

export function useDashboardOverview(pollMs = 5000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getDashboardOverview();
      setData(res.data);
      setIsMock(res.isMock);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
    if (!pollMs) return undefined;
    const interval = setInterval(() => load(true), pollMs);
    return () => clearInterval(interval);
  }, [load, pollMs]);

  return { data, loading, error, isMock, reload: () => load(false) };
}

export function useDashboardRisks() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardRisks();
      setData(Array.isArray(res.data) ? res.data : []);
      setIsMock(res.isMock);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, isMock, reload: load };
}

export function useDashboardDepartments() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardDepartments();
      setData(Array.isArray(res.data) ? res.data : res.data?.departments ?? []);
      setIsMock(res.isMock);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, isMock, reload: load };
}

export function useDashboardTrends(pollMs = 5000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getDashboardTrends();
      setData(res.data);
      setIsMock(res.isMock);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
    if (!pollMs) return undefined;
    const interval = setInterval(() => load(true), pollMs);
    return () => clearInterval(interval);
  }, [load, pollMs]);

  return { data, loading, error, isMock, reload: () => load(false) };
}
