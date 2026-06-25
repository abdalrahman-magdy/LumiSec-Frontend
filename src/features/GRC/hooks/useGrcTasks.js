import { useCallback, useEffect, useState } from "react";
import { createGrcTask, getGrcTasks, updateGrcTask } from "../services/grc.api";

export default function useGrcTasks(params = {}) {
  const paramsKey = JSON.stringify(params);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getGrcTasks(JSON.parse(paramsKey));
      setTasks(Array.isArray(result.data) ? result.data : []);
      setPagination(result.pagination ?? null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    load();
  }, [load]);

  const createTask = useCallback(async (payload) => {
    const result = await createGrcTask(payload);
    await load();
    return result;
  }, [load]);

  const updateTask = useCallback(async (id, payload) => {
    const result = await updateGrcTask(id, payload);
    await load();
    return result;
  }, [load]);

  return { tasks, pagination, loading, error, reload: load, createTask, updateTask };
}
