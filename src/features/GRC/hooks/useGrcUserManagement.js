import { useCallback, useEffect, useState } from "react";
import { createGrcUser, getGrcUsers, updateGrcUser } from "../services/grc.api";
import { normalizeGrcUser, normalizeList, normalizePaginationParams } from "../utils/grcNormalizers";

export default function useGrcUserManagement(params = { limit: 50, sort: "-createdAt" }) {
  const paramsKey = JSON.stringify(normalizePaginationParams(params));
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getGrcUsers(JSON.parse(paramsKey));
      setUsers(normalizeList(result.data).map(normalizeGrcUser));
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

  const createUser = useCallback(async (payload) => {
    const result = await createGrcUser(payload);
    await load();
    return result;
  }, [load]);

  const updateUser = useCallback(async (id, payload) => {
    const result = await updateGrcUser(id, payload);
    await load();
    return result;
  }, [load]);

  return { users, pagination, loading, error, reload: load, createUser, updateUser };
}
