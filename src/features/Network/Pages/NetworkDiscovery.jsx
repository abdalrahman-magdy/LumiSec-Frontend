import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import diagonalIcon from "../../../assets/◈.png";
import squareIcon from "../../../assets/▣.png";
import ScanConfiguration from "../Components/ScanConfiguration/ScanConfiguration";
import "./NetworkDiscovery.css";
import SubnetOverview from "../Components/SubnetOverview/SubnetOverview";
import HostsTabel from "../Components/HostsTabel/HostsTabel";
import NetworkAlert from "../Components/Shared/NetworkAlert";
import ScanProgress from "../Components/Shared/ScanProgress";
import MisconfigurationsTabel from "../Components/MisconfigurationsTabel/MisconfigurationsTabel";
import useNetworkDiscovery from "../hooks/useNetworkDiscovery";
import useNetworkPermissions from "../hooks/useNetworkPermissions";

export default function NetworkDiscovery() {
  const { setTitle } = useOutletContext();
  const { canRunNetwork } = useNetworkPermissions();
  const {
    hosts,
    subnets,
    misconfigurations,
    loading,
    error,
    progress,
    scanning,
    runDiscovery,
    osFilter,
    setOsFilter,
    subnetFilter,
    setSubnetFilter,
    riskFilter,
    setRiskFilter,
    search,
    setSearch,
    osOptions,
    subnetOptions,
  } = useNetworkDiscovery();

  useEffect(() => {
    setTitle("Network Discovery");
  }, [setTitle]);

  return (
    <>
      <NetworkAlert error={error} onRetry={() => runDiscovery({ subnet: "192.168.1.0/24" })} />

      <ScanConfiguration onScan={runDiscovery} loading={loading} disabled={!canRunNetwork} />
      <ScanProgress progress={progress} status="Discovering network hosts..." active={scanning || loading} />

      {subnets.length > 0 && (
        <div className="dashboard-card mb-3">
          <div className="d-flex align-items-center mb-3">
            <figure className="mb-0 mt-2 me-2">
              <img src={diagonalIcon} className="w-100" alt="subnet" />
            </figure>
            <h6 className="text-white mb-0">Subnet Overview</h6>
          </div>
          <div className="row justify-content-between align-items-center px-3">
            {subnets.map((subnet) => (
              <SubnetOverview
                key={subnet.cidr}
                title={subnet.cidr}
                status={`${subnet.active}/${subnet.total} active`}
                text={`Address Range: ${subnet.range}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-card mb-3">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div className="d-flex align-items-center">
            <figure className="mb-1 me-2">
              <img src={squareIcon} className="w-100" alt="hosts" />
            </figure>
            <h6 className="text-white mb-0">Discovered Hosts ({hosts.length})</h6>
          </div>

          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div className="search-container">
              <i className="fa-brands fa-sistrix discover-search-icon" />
              <input
                type="text"
                className="form-control header-search-input rounded-3"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-select scanType-select border-0"
              value={osFilter}
              onChange={(e) => setOsFilter(e.target.value)}
            >
              {osOptions.map((opt) => (
                <option key={opt} value={opt}>{opt === "all" ? "All OS" : opt}</option>
              ))}
            </select>
            <select
              className="form-select scanType-select border-0"
              value={subnetFilter}
              onChange={(e) => setSubnetFilter(e.target.value)}
            >
              {subnetOptions.map((opt) => (
                <option key={opt} value={opt}>{opt === "all" ? "All Subnets" : opt}</option>
              ))}
            </select>
            <select
              className="form-select scanType-select border-0"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="all">All Risk</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <HostsTabel hosts={hosts} loading={loading && !hosts.length} />
      </div>

      {misconfigurations.length > 0 && (
        <div className="dashboard-card mb-3 p-3">
          <h6 className="text-white mb-3">
            <i className="fa-solid fa-triangle-exclamation text-warning me-2" />
            Post-Scan Misconfiguration Warnings
          </h6>
          <MisconfigurationsTabel items={misconfigurations} />
        </div>
      )}
    </>
  );
}
