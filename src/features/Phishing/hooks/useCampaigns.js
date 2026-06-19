import { useCallback, useEffect, useState } from "react";
import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  getCampaignQueue,
  launchCampaign,
  listCampaigns,
  pauseCampaign,
  resumeCampaign,
  stopCampaign,
  updateCampaign,
  attachCampaignRecipients,
} from "../services/phishingApi";

export default function useCampaigns(campaignId) {
  const [campaigns, setCampaigns] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMock, setIsMock] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCampaigns();
      setCampaigns(res.data);
      setIsMock(res.isMock);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOne = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getCampaign(id);
      setCampaign(res.data);
      setIsMock(res.isMock);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadQueue = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await getCampaignQueue(id);
      setQueue(res.data);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (campaignId) loadOne(campaignId);
    else loadList();
  }, [campaignId, loadOne, loadList]);

  return {
    campaigns,
    campaign,
    queue,
    loading,
    error,
    isMock,
    reload: campaignId ? () => loadOne(campaignId) : loadList,
    loadQueue,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    attachCampaignRecipients,
    launchCampaign,
    pauseCampaign,
    resumeCampaign,
    stopCampaign,
  };
}
