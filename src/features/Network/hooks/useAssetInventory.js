import { useCallback, useEffect, useMemo, useState } from "react";
import { getAssetContext, getAssetDetails, getAssetInventory } from "../services/networkApi";
import { toNetworkError } from "../utils/apiErrors";

export default function useAssetInventory() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetDetails, setAssetDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [contextIp, setContextIp] = useState(null);
  const [contextData, setContextData] = useState(null);
  const [contextLoading, setContextLoading] = useState(false);
  const [contextError, setContextError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAssetInventory();
      setAssets(data);
    } catch (err) {
      setError(toNetworkError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        a.ip.toLowerCase().includes(q) ||
        a.hostname.toLowerCase().includes(q) ||
        a.mac.toLowerCase().includes(q) ||
        a.osGuess.toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === "all" || a.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [assets, search, categoryFilter]);

  const openDetails = useCallback(async (asset) => {
    setSelectedAsset(asset);
    setDetailsLoading(true);
    setAssetDetails(null);
    try {
      const data = await getAssetDetails(asset.mac);
      setAssetDetails(data);
    } catch (err) {
      setAssetDetails({ ...asset, error: toNetworkError(err).message });
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const closeDetails = useCallback(() => {
    setSelectedAsset(null);
    setAssetDetails(null);
  }, []);

  const openContext = useCallback(async (ip) => {
    setContextIp(ip);
    setContextLoading(true);
    setContextError(null);
    setContextData(null);
    try {
      const data = await getAssetContext(ip);
      setContextData(data);
    } catch (err) {
      setContextError(toNetworkError(err));
    } finally {
      setContextLoading(false);
    }
  }, []);

  const closeContext = useCallback(() => {
    setContextIp(null);
    setContextData(null);
    setContextError(null);
  }, []);

  return {
    assets: filteredAssets,
    allAssets: assets,
    loading,
    error,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    reload: load,
    selectedAsset,
    assetDetails,
    detailsLoading,
    openDetails,
    closeDetails,
    contextIp,
    contextData,
    contextLoading,
    contextError,
    openContext,
    closeContext,
  };
}
