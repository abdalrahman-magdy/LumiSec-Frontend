import { useCallback, useEffect, useState } from "react";
import { createGrcFinding, getGrcFindings } from "../services/grc.api";
import { normalizeFinding, normalizeList, normalizePaginationParams } from "../utils/grcNormalizers";

export default function useGrcFindings(params = {}) {
  const paramsKey = JSON.stringify(normalizePaginationParams(params));
  const [findings, setFindings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getGrcFindings(JSON.parse(paramsKey));
      setFindings(normalizeList(result.data).map(normalizeFinding));
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

  const createFinding = useCallback(async (payload) => {
    const result = await createGrcFinding(payload);
    await load();
    return result;
  }, [load]);

  return { findings, pagination, loading, error, reload: load, createFinding };
}
