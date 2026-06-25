import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSoarAnalyticsReport,
  getSoarDashboardAnalysts,
} from "../Services/soar.api";

function normalizeDays(period) {
  const numeric = Number(period);
  return Number.isFinite(numeric) ? numeric : 30;
}

export default function useSoarAnalytics(period = "30") {
  const days = useMemo(() => normalizeDays(period), [period]);
  const [report, setReport] = useState(null);
  const [analysts, setAnalysts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [reportResult, analystsResult] = await Promise.all([
        getSoarAnalyticsReport({ days }),
        getSoarDashboardAnalysts(),
      ]);

      setReport(reportResult.data ?? null);
      setAnalysts(Array.isArray(analystsResult.data) ? analystsResult.data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    days,
    report,
    analysts,
    loading,
    error,
    reload: loadAnalytics,
  };
}
