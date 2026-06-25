import { useCallback, useEffect, useState } from "react";
import { getGrcFindings } from "../services/grc.api";

export default function useGrcFindings(params = {}) {
  const paramsKey = JSON.stringify(params);
  const [findings, setFindings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getGrcFindings(JSON.parse(paramsKey));
      setFindings(Array.isArray(result.data) ? result.data : []);
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

  return { findings, pagination, loading, error, reload: load };
}
