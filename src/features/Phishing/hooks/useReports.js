import { useCallback, useEffect, useState } from "react";
import { downloadReport, generateReport, getReport, getReportStats } from "../services/phishingApi";

export default function useReports(reportId) {
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReportStats();
      setStats(res.data);
      setIsMock(res.isMock);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReport = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getReport(id);
      setReport(res.data);
      setIsMock(res.isMock);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const download = async (id) => {
    const res = await downloadReport(id);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `phishing-report-${id}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (reportId) loadReport(reportId);
    else loadStats();
  }, [reportId, loadReport, loadStats]);

  return { stats, report, loading, error, isMock, reload: loadStats, generateReport, download };
}
