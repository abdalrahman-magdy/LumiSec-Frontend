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

      const [assets, misconfigs, flow] = await Promise.all([

        getAssetInventory(),

        getMisconfigurations(),

        getFlowMetrics(),

      ]);

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
      return true;
    } catch (err) {
      setError(toNetworkError(err));
      return false;

    } finally {

      setActionLoading(null);

    }

  }, []);



  const runPortScan = useCallback(async (payload = { target: "192.168.1.45", ports: "22,80,443", scanMode: "CONNECT" }) => {

    setActionLoading("portscan");
    setError(null);

    try {

      await scanPorts(payload);
      return true;
    } catch (err) {
      setError(toNetworkError(err));
      return false;

    } finally {

      setActionLoading(null);

    }

  }, []);



  const runSniffing = useCallback(async (payload = { interface: "eth0" }) => {

    setActionLoading("sniff");
    setError(null);

    try {

      await startSniffing(payload);
      return true;
    } catch (err) {
      setError(toNetworkError(err));
      return false;

    } finally {

      setActionLoading(null);

    }

  }, []);



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

