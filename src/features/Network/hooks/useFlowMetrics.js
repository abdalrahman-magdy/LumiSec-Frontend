import { useCallback, useEffect, useState } from "react";
import { getFlowMetrics } from "../services/networkApi";
import { toNetworkError } from "../utils/apiErrors";

const PAGE_SIZE = 20;

export default function useFlowMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: PAGE_SIZE });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getFlowMetrics({ page, limit: PAGE_SIZE });
      setMetrics(result.metrics);
      setPagination(result.pagination);
    } catch (err) {
      setError(toNetworkError(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  return { metrics, pagination, page, setPage, loading, error, reload: load };
}
