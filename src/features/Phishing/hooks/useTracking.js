import { useCallback, useEffect, useState } from "react";
import { getTrackingLogs, getTrackingTimeline } from "../services/phishingApi";

const POLL_MS = 2000;

export default function useTracking(campaignId, live = false) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await getTrackingTimeline(campaignId ? { campaignId } : undefined);
      setEvents(res.data);
      setIsMock(res.isMock);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTrackingLogs(campaignId ? { campaignId } : undefined);
      setEvents(res.data);
      setIsMock(res.isMock);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    load();
    if (!live) return undefined;
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load, live]);

  return { events, loading, error, isMock, reload: load, loadLogs };
}
