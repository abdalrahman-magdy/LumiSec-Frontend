import { useCallback, useEffect, useState } from "react";
import {
  discoverNetwork,
  getAssetInventory,
  getFlowMetrics,
  getMisconfigurations,
  scanPorts,
  startSniffing,
} from "../services/networkApi";
import { toNetworkError } from "../utils/apiErrors";
import { buildDashboardSummary } from "../utils/normalizers";

export default function useNetworkDashboard() {
  const [summary, setSummary] = useState(null);
  const [misconfigPreview, setMisconfigPreview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [assetsResult, misconfigsResult, flowResult] = await Promise.all([
        getAssetInventory({ limit: 50 }),
        getMisconfigurations({ limit: 20 }),
        getFlowMetrics({ limit: 20 }),
      ]);

      const assets = assetsResult.items;
      const misconfigs = misconfigsResult.items;
      const flow = flowResult.metrics;

      const built = buildDashboardSummary(assets, misconfigs, flow);
      setSummary(built);
      setMisconfigPreview(misconfigs.slice(0, 5));
    } catch (err) {
      setError(toNetworkError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runDiscovery = useCallback(async (payload = { subnet: "192.168.1.0/24" }) => {
    setActionLoading("discover");
    setError(null);

    try {
      await discoverNetwork(payload);
      await load();
      return true;
    } catch (err) {
      setError(toNetworkError(err));
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [load]);

  const runPortScan = useCallback(async (payload = { target: "127.0.0.1", ports: "22,80,443", scanMode: "CONNECT" }) => {
    setActionLoading("portscan");
    setError(null);

    try {
      const data = await scanPorts(payload);
      await load();
      return data;
    } catch (err) {
      setError(toNetworkError(err));
      return null;
    } finally {
      setActionLoading(null);
    }
  }, [load]);

  const runSniffing = useCallback(async (payload = { interface: "eth0", duration_sec: 60, filter: "ip" }) => {
    setActionLoading("sniff");
    setError(null);

    try {
      await startSniffing(payload);
      await load();
      return true;
    } catch (err) {
      setError(toNetworkError(err));
      return false;
    } finally {
      setActionLoading(null);
    }
  }, [load]);

  return {
    summary,
    misconfigPreview,
    loading,
    error,
    actionLoading,
    reload: load,
    runDiscovery,
    runPortScan,
    runSniffing,
  };
}
