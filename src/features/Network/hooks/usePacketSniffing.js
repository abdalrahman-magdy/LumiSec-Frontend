import { useCallback, useEffect, useRef, useState } from "react";
import { getLiveStream, startSniffing } from "../services/networkApi";
import { normalizeLiveStream } from "../utils/normalizers";
import { toNetworkError } from "../utils/apiErrors";

const POLL_INTERVAL_MS = 2000;

function buildStreamFromStartResult(result = {}, durationSec = 60) {
  return normalizeLiveStream({
    session_id: result.session_id ?? result.sessionId,
    status: result.status ?? "running",
    duration_sec: durationSec,
    packet_count: result.packet_count ?? result.packetCount,
    sample_packets: result.sample_packets ?? result.samplePackets ?? [],
    stats: {
      totalPackets: result.packet_count ?? result.packetCount,
    },
  });
}

export default function usePacketSniffing() {
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(false);
  const [captureComplete, setCaptureComplete] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const intervalRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pollStream = useCallback(async (activeSessionId = sessionId) => {
    try {
      const params = activeSessionId ? { session_id: String(activeSessionId) } : undefined;
      const data = await getLiveStream(params);
      setStream(data);
      setError(null);

      if (data.status === "completed") {
        setCaptureComplete(true);
        setActive(false);
        stopPolling();
      }
    } catch (err) {
      setError(toNetworkError(err));
    }
  }, [sessionId, stopPolling]);

  const startCapture = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      setStream(null);
      setCaptureComplete(false);
      stopPolling();

      try {
        const result = await startSniffing(payload);
        const nextSessionId = result?.session_id ?? result?.sessionId ?? null;
        const initialStream = buildStreamFromStartResult(result, payload?.duration_sec ?? 60);

        setSessionId(nextSessionId);
        setActive(true);
        setStream(initialStream);

        if (initialStream.packets.length) {
          await pollStream(nextSessionId);
        } else {
          await pollStream(nextSessionId);
        }
      } catch (err) {
        setError(toNetworkError(err));
        setActive(false);
        setCaptureComplete(false);
      } finally {
        setLoading(false);
      }
    },
    [pollStream, stopPolling]
  );

  const stopCapture = useCallback(() => {
    setActive(false);
    setCaptureComplete(false);
    setSessionId(null);
    stopPolling();
  }, [stopPolling]);

  useEffect(() => {
    if (!active || !sessionId) return undefined;

    intervalRef.current = setInterval(() => pollStream(sessionId), POLL_INTERVAL_MS);
    return stopPolling;
  }, [active, pollStream, sessionId, stopPolling]);

  return {
    stream,
    loading,
    error,
    active,
    captureComplete,
    sessionId,
    startCapture,
    stopCapture,
    pollStream,
  };
}
