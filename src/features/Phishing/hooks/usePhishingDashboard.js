import { useCallback, useEffect, useState } from "react";
import {
  getDashboardDepartments,
  getDashboardOverview,
  getDashboardRisks,
  getDashboardTrends,
} from "../services/phishingApi";

export function useDashboardOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardOverview();
      setData(res.data);
      setIsMock(res.isMock);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, isMock, reload: load };
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
      setData(Array.isArray(res.data) ? res.data : res.data?.risks ?? []);
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

export function useDashboardTrends() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardTrends();
      setData(res.data);
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
