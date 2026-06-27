import { useCallback, useEffect, useState } from "react";
import { getGrcAssignees } from "../services/grc.api";
import { normalizeAssignee, normalizeList, normalizePaginationParams } from "../utils/grcNormalizers";

export default function useGrcAssignees(params = { limit: 100 }) {
  const paramsKey = JSON.stringify(normalizePaginationParams(params));
  const [assignees, setAssignees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getGrcAssignees(JSON.parse(paramsKey));
      setAssignees(normalizeList(result.data).map(normalizeAssignee));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => {
    load();
  }, [load]);

  return { assignees, loading, error, reload: load };
}
