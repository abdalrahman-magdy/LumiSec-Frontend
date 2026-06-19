import { useCallback, useEffect, useState } from "react";
import { getMisconfigurations } from "../services/networkApi";
import { toNetworkError } from "../utils/apiErrors";
import { countBySeverity, sortBySeverity } from "../utils/normalizers";

export default function useMisconfigurations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMisconfigurations();
      setItems(sortBySeverity(data));
    } catch (err) {
      setError(toNetworkError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items.filter(
    (item) => severityFilter === "all" || item.severity === severityFilter
  );

  const severityCounts = countBySeverity(items);

  const recommendations = filtered
    .filter((i) => i.status !== "fixed" && ["critical", "high"].includes(i.severity))
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      title: i.type,
      asset: i.asset,
      severity: i.severity,
    }));

  return {
    items: filtered,
    allItems: items,
    severityCounts,
    recommendations,
    loading,
    error,
    severityFilter,
    setSeverityFilter,
    reload: load,
  };
}
