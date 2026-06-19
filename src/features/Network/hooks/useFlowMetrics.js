import { useCallback, useEffect, useState } from "react";
import { getFlowMetrics } from "../services/networkApi";
import { toNetworkError } from "../utils/apiErrors";

export default function useFlowMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFlowMetrics();
      setMetrics(data);
    } catch (err) {
      setError(toNetworkError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  return { metrics, loading, error, reload: load };
}
