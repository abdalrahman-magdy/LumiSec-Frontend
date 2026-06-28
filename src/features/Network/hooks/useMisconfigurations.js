import { useCallback, useEffect, useState } from "react";
import { getMisconfigurations, resolveMisconfiguration } from "../services/networkApi";
import { toNetworkError } from "../utils/apiErrors";
import { countBySeverity, sortBySeverity } from "../utils/normalizers";

const PAGE_SIZE = 20;

export default function useMisconfigurations() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [resolvingId, setResolvingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: PAGE_SIZE };
      if (severityFilter !== "all") params.severity = severityFilter;

      const result = await getMisconfigurations(params);
      setItems(sortBySeverity(result.items));
      setPagination(result.pagination);
    } catch (err) {
      setError(toNetworkError(err));
    } finally {
      setLoading(false);
    }
  }, [page, severityFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [severityFilter]);

  const resolveItem = useCallback(async (item) => {
    if (!item?.id) return;
    setResolvingId(item.id);
    setError(null);
    try {
      await resolveMisconfiguration(item.id, "resolved");
      await load();
    } catch (err) {
      setError(toNetworkError(err));
    } finally {
      setResolvingId(null);
    }
  }, [load]);

  const severityCounts = countBySeverity(items);

  const recommendations = items
    .filter((i) => !["fixed", "resolved", "accepted"].includes(i.status) && ["critical", "high"].includes(i.severity))
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      title: i.type,
      asset: i.asset,
      severity: i.severity,
    }));

  return {
    items,
    pagination,
    page,
    setPage,
    severityCounts,
    recommendations,
    loading,
    error,
    severityFilter,
    setSeverityFilter,
    reload: load,
    resolveItem,
    resolvingId,
  };
}
