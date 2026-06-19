import { useCallback, useEffect, useState } from "react";
import {
  createTemplate,
  deleteTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
} from "../services/phishingApi";

export default function useTemplates(templateId) {
  const [templates, setTemplates] = useState([]);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listTemplates();
      setTemplates(res.data);
      setIsMock(res.isMock);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOne = useCallback(async (id) => {
    if (!id || id === "new") return;
    setLoading(true);
    try {
      const res = await getTemplate(id);
      setTemplate(res.data);
      setIsMock(res.isMock);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (templateId) loadOne(templateId);
    else loadList();
  }, [templateId, loadOne, loadList]);

  return {
    templates,
    template,
    loading,
    error,
    isMock,
    reload: templateId ? () => loadOne(templateId) : loadList,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
