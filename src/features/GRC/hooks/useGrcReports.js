import { useCallback, useEffect, useState } from "react";
import {
  addGrcReportFindings,
  createGrcFinding,
  createGrcReport,
  generateGrcReport,
  getGrcFindings,
  getGrcReports,
} from "../services/grc.api";
import { normalizeFinding, normalizeList, normalizePaginationParams, normalizeReport } from "../utils/grcNormalizers";

export default function useGrcReports(params = {}) {
  const paramsKey = JSON.stringify(normalizePaginationParams(params));
  const [reports, setReports] = useState([]);
  const [findings, setFindings] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parsed = JSON.parse(paramsKey);
      const [reportsResult, findingsResult] = await Promise.all([
        getGrcReports(parsed),
        getGrcFindings({ limit: 50, sort: "-createdAt" }),
      ]);
      setReports(normalizeList(reportsResult.data).map(normalizeReport));
      setFindings(normalizeList(findingsResult.data).map(normalizeFinding));
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

  const createFinding = useCallback(async (payload) => {
    const result = await createGrcFinding(payload);
    await load();
    return result;
  }, [load]);

  const createReport = useCallback(async (payload) => {
    const result = await createGrcReport(payload);
    await load();
    return result;
  }, [load]);

  const addReportFindings = useCallback(async (reportId, findingIds) => {
    const result = await addGrcReportFindings(reportId, findingIds);
    await load();
    return result;
  }, [load]);

  const generateReport = useCallback(async (reportId) => {
    const result = await generateGrcReport(reportId);
    await load();
    return result;
  }, [load]);

  return {
    reports,
    findings,
    pagination,
    loading,
    error,
    reload: load,
    createFinding,
    createReport,
    addReportFindings,
    generateReport,
  };
}
