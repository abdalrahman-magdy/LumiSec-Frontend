import React, { useEffect } from "react";
import "./AssetInventory.css";
import { useOutletContext } from "react-router-dom";
import assetsInventoryIcon from "../../../assets/SVG (3).png";
import AssetsTabel from "../Components/AssetsTabel/AssetsTabel";
import NetworkAlert from "../Components/Shared/NetworkAlert";
import NetworkLoading from "../Components/Shared/NetworkLoading";
import AssetDetailModal from "../Components/Shared/AssetDetailModal";
import AssetContextModal from "../Components/Shared/AssetContextModal";
import NetworkPagination from "../Components/Shared/NetworkPagination";
import useAssetInventory from "../hooks/useAssetInventory";

export default function AssetInventory() {
  const { setTitle } = useOutletContext();
  const {
    assets,
    pagination,
    page,
    setPage,
    loading,
    error,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    reload,
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
  } = useAssetInventory();

  useEffect(() => {
    setTitle("Asset Inventory");
  }, [setTitle]);

  const categories = ["all", "network", "servers", "iot", "general"];

  return (
    <>
      <NetworkAlert error={error} onRetry={reload} />

      <div className="row align-items-center mb-3">
        <div className="col-6 search-container m-0">
          <i className="fa-brands mx-2 fa-sistrix discover-search-icon" />
          <input
            type="text"
            className="form-control header-search-input assets rounded-3"
            placeholder="Search IP, MAC, hostname, OS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-4">
          <select
            className="form-select Allcategories scanType-select border-0"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="col-2">
          <button
            type="button"
            className="btn mx-auto start-btn border-0 rounded-3 text-white fw-medium ps-0 d-flex align-items-center"
            onClick={reload}
          >
            <i className="fa-solid fa-arrow-rotate-right mx-2 text-white" />
            Refresh
          </button>
        </div>
      </div>

      <div className="dashboard-card mb-3">
        <div className="row justify-content-between align-items-center mb-3">
          <div className="col-9 d-flex align-items-center mb-0">
            <figure className="mb-0 me-2">
              <img src={assetsInventoryIcon} className="w-100" alt="inventory" />
            </figure>
            <h6 className="text-white mb-0">Asset Inventory ({pagination.total || assets.length})</h6>
          </div>
        </div>
        {loading && !assets.length ? (
          <NetworkLoading skeleton rows={6} />
        ) : (
          <AssetsTabel
            assets={assets}
            loading={loading}
            onViewDetails={openDetails}
            onContextLookup={openContext}
          />
        )}
        <NetworkPagination
          page={pagination.page ?? page}
          pages={pagination.pages ?? 1}
          total={pagination.total ?? 0}
          onPageChange={setPage}
          disabled={loading}
        />
      </div>

      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          details={assetDetails}
          loading={detailsLoading}
          onClose={closeDetails}
          onContextLookup={openContext}
        />
      )}

      {contextIp && (
        <AssetContextModal
          ip={contextIp}
          context={contextData}
          loading={contextLoading}
          error={contextError}
          onClose={closeContext}
          onRetry={() => openContext(contextIp)}
        />
      )}
    </>
  );
}
