import { useCallback, useEffect, useRef, useState } from "react";
import { getLiveStream, startSniffing } from "../services/networkApi";
import { toNetworkError } from "../utils/apiErrors";

const POLL_INTERVAL_MS = 2500;

export default function usePacketSniffing() {
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(false);
  const intervalRef = useRef(null);

  const pollStream = useCallback(async () => {
    try {
      const data = await getLiveStream();
      setStream(data);
      setError(null);
    } catch (err) {
      setError(toNetworkError(err));
    }
  }, []);

  const startCapture = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      try {
        await startSniffing(payload);
        setActive(true);
        await pollStream();
      } catch (err) {
        setError(toNetworkError(err));
      } finally {
        setLoading(false);
      }
    },
    [pollStream]
  );

  const stopCapture = useCallback(() => {
    setActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    intervalRef.current = setInterval(pollStream, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, pollStream]);

  return {
    stream,
    loading,
    error,
    active,
    startCapture,
    stopCapture,
    pollStream,
  };
}
