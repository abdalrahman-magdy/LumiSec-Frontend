import { useCallback, useEffect, useState } from "react";
import {
  deleteRecipient,
  importRecipientsCsv,
  importRecipientsManual,
  listRecipients,
  updateRecipient,
} from "../services/phishingApi";

export default function useRecipients() {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listRecipients();
      setRecipients(res.data);
      setIsMock(res.isMock);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = recipients.filter((r) => {
    const q = search.toLowerCase();
    return !q || r.email.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.department.toLowerCase().includes(q);
  });

  const importCsv = async (file, campaignId) => {
    const res = await importRecipientsCsv(file, campaignId);
    await load();
    return res;
  };

  const addManual = async (recipient, campaignId) => {
    const res = await importRecipientsManual([recipient], campaignId);
    await load();
    return res;
  };

  return {
    recipients: filtered,
    allRecipients: recipients,
    loading,
    error,
    isMock,
    search,
    setSearch,
    reload: load,
    importCsv,
    addManual,
    updateRecipient,
    deleteRecipient,
  };
}
