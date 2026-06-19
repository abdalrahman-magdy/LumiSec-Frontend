import React from "react";
import globalIcon from "../../../../assets/Overlay (1).png";
import "./AssetsTabel.css";
import NetworkLoading from "../Shared/NetworkLoading";

function riskClass(level) {
  if (level === "critical") return "critical";
  if (level === "high") return "critical";
  if (level === "medium") return "medium";
  return "";
}

export default function AssetsTabel({
  assets = [],
  loading = false,
  onViewDetails,
  onContextLookup,
}) {
  if (loading) return <NetworkLoading skeleton rows={5} />;

  if (!assets.length) {
    return <p className="text-secondary p-3 mb-0">No assets found.</p>;
  }

  return (
    <div className="table-responsive-wrapper">
      <table className="w-100 discover-tabel">
        <thead>
          <tr>
            <th className="text-center">
              <input type="checkbox" className="assets-select" readOnly />
            </th>
            <th>IP Address</th>
            <th>MAC</th>
            <th>OS Guess</th>
            <th>Services</th>
            <th>Risk Score</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.id}>
              <td className="text-center">
                <input type="checkbox" className="assets-select" readOnly />
              </td>
              <td className="ip-address fw-medium">
                <div className="d-flex align-items-center">
                  <figure className="me-3 mb-0">
                    <img src={globalIcon} className="w-100" alt="" />
                  </figure>
                  <p className="fw-normal mb-0 text-white ps-1">{asset.ip}</p>
                </div>
              </td>
              <td className="mac-address text-white">{asset.mac}</td>
              <td className="text-white">
                <div className="d-flex justify-content-center align-items-center operating-system rounded-3 px-3 w-fit-content">
                  <p className="m-0 ps-1">{asset.osGuess}</p>
                </div>
              </td>
              <td className="text-secondary">
                {(asset.services ?? []).slice(0, 3).join(", ") || "—"}
              </td>
              <td className="cisco">
                <p className={`risk-score rounded-3 w-fit-content mb-0 ${riskClass(asset.riskLevel)}`}>
                  {asset.riskScore} {asset.riskLevel}
                </p>
              </td>
              <td className="vendor">
                <button
                  type="button"
                  className="btn"
                  title="View details"
                  onClick={() => onViewDetails?.(asset)}
                >
                  <i className="fa-solid text-secondary fa-eye" />
                </button>
                <button
                  type="button"
                  className="btn"
                  title="Context lookup"
                  onClick={() => onContextLookup?.(asset.ip)}
                >
                  <i className="fa-solid text-secondary fa-magnifying-glass" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
