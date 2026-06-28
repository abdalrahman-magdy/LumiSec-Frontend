import { useCallback, useEffect, useMemo, useState } from "react";
import { getAssetContext, getAssetDetails, getAssetInventory } from "../services/networkApi";
import { toNetworkError } from "../utils/apiErrors";

const PAGE_SIZE = 20;

export default function useAssetInventory() {
  const [assets, setAssets] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: PAGE_SIZE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

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
      const params = { page, limit: PAGE_SIZE };
      if (search.trim()) params.search = search.trim();

      const result = await getAssetInventory(params);
      setAssets(result.items);
      setPagination(result.pagination);
    } catch (err) {
      setError(toNetworkError(err));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => categoryFilter === "all" || a.category === categoryFilter);
  }, [assets, categoryFilter]);

  const openDetails = useCallback(async (asset) => {
    setSelectedAsset(asset);
    setDetailsLoading(true);
    setAssetDetails(null);
    try {
      const data = await getAssetDetails(asset.mac);
      setAssetDetails(data);
    } catch (err) {
      setAssetDetails({
        asset,
        misconfigurations: [],
        error: toNetworkError(err).message,
      });
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
    pagination,
    page,
    setPage,
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
