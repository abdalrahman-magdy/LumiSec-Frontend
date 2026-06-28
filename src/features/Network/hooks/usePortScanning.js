import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { scanPorts } from "../services/networkApi";
import { toNetworkError } from "../utils/apiErrors";

export default function usePortScanning() {
  const location = useLocation();
  const [result, setResult] = useState(location.state?.scanResult ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.scanResult) {
      setResult(location.state.scanResult);
    }
  }, [location.state?.scanResult]);

  const runScan = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const data = await scanPorts(payload);
      setResult(data);
      return data;
    } catch (err) {
      setError(toNetworkError(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    result,
    loading,
    error,
    runScan,
    defaults: {
      target: location.state?.target ?? undefined,
      ports: location.state?.ports ?? undefined,
      scanMode: location.state?.scanMode ?? undefined,
    },
  };
}
