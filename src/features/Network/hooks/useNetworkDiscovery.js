import { useCallback, useMemo, useState } from "react";
import { discoverNetwork } from "../services/networkApi";
import { toNetworkError } from "../utils/apiErrors";

export default function useNetworkDiscovery() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);

  const [osFilter, setOsFilter] = useState("all");
  const [subnetFilter, setSubnetFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [search, setSearch] = useState("");

  const runDiscovery = useCallback(async (payload) => {
    setLoading(true);
    setScanning(true);
    setError(null);
    setProgress(10);

    const progressTimer = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + 12));
    }, 400);

    try {
      const data = await discoverNetwork(payload);
      setResult(data);
      setProgress(100);
    } catch (err) {
      setError(toNetworkError(err));
      setProgress(0);
    } finally {
      clearInterval(progressTimer);
      setLoading(false);
      setTimeout(() => setScanning(false), 600);
    }
  }, []);

  const filteredHosts = useMemo(() => {
    if (!result?.hosts) return [];
    return result.hosts.filter((h) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        h.ip.toLowerCase().includes(q) ||
        h.hostname.toLowerCase().includes(q) ||
        h.osGuess.toLowerCase().includes(q);
      const matchesOs =
        osFilter === "all" ||
        h.osGuess.toLowerCase().includes(osFilter.toLowerCase());
      const matchesSubnet =
        subnetFilter === "all" || h.subnet === subnetFilter;
      const matchesRisk =
        riskFilter === "all" || h.riskLevel === riskFilter;
      return matchesSearch && matchesOs && matchesSubnet && matchesRisk;
    });
  }, [result, search, osFilter, subnetFilter, riskFilter]);

  const osOptions = useMemo(() => {
    const set = new Set((result?.hosts ?? []).map((h) => h.osGuess));
    return ["all", ...Array.from(set)];
  }, [result]);

  const subnetOptions = useMemo(() => {
    const set = new Set((result?.subnets ?? []).map((s) => s.cidr));
    return ["all", ...Array.from(set)];
  }, [result]);

  return {
    result,
    hosts: filteredHosts,
    subnets: result?.subnets ?? [],
    misconfigurations: result?.misconfigurations ?? [],
    loading,
    error,
    progress,
    scanning,
    runDiscovery,
    osFilter,
    setOsFilter,
    subnetFilter,
    setSubnetFilter,
    riskFilter,
    setRiskFilter,
    search,
    setSearch,
    osOptions,
    subnetOptions,
  };
}
