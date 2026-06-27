import { useCallback, useEffect, useState } from "react";
import {
  getGrcDashboardCompliance,
  getGrcDashboardOverview,
  getGrcDashboardTasks,
} from "../services/grc.api";
import {
  normalizeComplianceDashboard,
  normalizeDashboardOverview,
  normalizeTasksDashboard,
} from "../utils/grcNormalizers";

export default function useGrcDashboard() {
  const [overview, setOverview] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [tasks, setTasks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewResult, complianceResult, tasksResult] = await Promise.all([
        getGrcDashboardOverview(),
        getGrcDashboardCompliance(),
        getGrcDashboardTasks(),
      ]);

      setOverview(normalizeDashboardOverview(overviewResult.data));
      setCompliance(normalizeComplianceDashboard(complianceResult.data));
      setTasks(normalizeTasksDashboard(tasksResult.data));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { overview, compliance, tasks, loading, error, reload: load };
}
