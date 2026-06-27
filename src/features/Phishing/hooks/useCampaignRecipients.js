import { useCallback, useEffect, useState } from "react";
import { deleteRecipient, listRecipients } from "../services/phishingApi";

const PAGE_SIZE = 50;

export default function useCampaignRecipients(campaignId) {
  const [recipients, setRecipients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (pageNum = page) => {
    if (!campaignId) return;
    setLoading(true);
    try {
      const res = await listRecipients({ campaignId, limit: PAGE_SIZE, page: pageNum });
      setRecipients(res.data ?? []);
      setTotal(res.total ?? res.data?.length ?? 0);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [campaignId, page]);

  useEffect(() => {
    load(1);
  }, [campaignId]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeRecipient = async (recipientId) => {
    await deleteRecipient(recipientId);
    await load(page);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return {
    recipients,
    total,
    page,
    totalPages,
    loading,
    error,
    reload: () => load(page),
    goToPage: (p) => load(p),
    removeRecipient,
  };
}
