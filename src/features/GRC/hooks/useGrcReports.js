import { useCallback, useEffect, useState } from "react";
import { getGrcFindings, getGrcReports } from "../services/grc.api";

export default function useGrcReports(params = {}) {
  const paramsKey = JSON.stringify(params);
  const [reports, setReports] = useState([]);
  const [findings, setFindings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportsResult, findingsResult] = await Promise.all([
        getGrcReports(JSON.parse(paramsKey)),
        getGrcFindings({ limit: 20, sort: "-createdAt" }),
      ]);
      setReports(Array.isArray(reportsResult.data) ? reportsResult.data : []);
      setFindings(Array.isArray(findingsResult.data) ? findingsResult.data : []);
      setPagination(reportsResult.pagination ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { reports, findings, pagination, loading, error, reload: load };
}
