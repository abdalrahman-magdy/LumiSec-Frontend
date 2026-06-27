import { useCallback, useEffect, useState } from "react";
import { createGrcControl, getGrcControls, updateGrcControl } from "../services/grc.api";
import { normalizeControl, normalizeList, normalizePaginationParams } from "../utils/grcNormalizers";

export default function useGrcControls(params = {}) {
  const paramsKey = JSON.stringify(normalizePaginationParams(params));
  const [controls, setControls] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getGrcControls(JSON.parse(paramsKey));
      setControls(normalizeList(result.data).map(normalizeControl));
      setPagination(result.pagination ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    load();
  }, [load]);

  const createControl = useCallback(async (payload) => {
    const result = await createGrcControl(payload);
    await load();
    return result;
  }, [load]);

  const updateControl = useCallback(async (id, payload) => {
    const result = await updateGrcControl(id, payload);
    await load();
    return result;
  }, [load]);

  return { controls, pagination, loading, error, reload: load, createControl, updateControl };
}
