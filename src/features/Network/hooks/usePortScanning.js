import { useCallback, useState } from "react";
import { scanPorts } from "../services/networkApi";
import { toNetworkError } from "../utils/apiErrors";

export default function usePortScanning() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runScan = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await scanPorts(payload);
      setResult(data);
    } catch (err) {
      setError(toNetworkError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return { result, loading, error, runScan };
}
