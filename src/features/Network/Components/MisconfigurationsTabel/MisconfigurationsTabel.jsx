import React from "react";
import "./MisconfigurationsTabel.css";
import IntegrationActions from "../Shared/IntegrationActions";
import NetworkLoading from "../Shared/NetworkLoading";
import { resolveDisplayText } from "../../utils/normalizers";

function severityClass(severity) {
  if (severity === "critical") return "critical";
  if (severity === "high") return "high-sevarity";
  if (severity === "medium") return "medium-sevarity";
  return "";
}

export default function MisconfigurationsTabel({ items = [], loading = false }) {
  if (loading) return <NetworkLoading skeleton rows={5} />;

  if (!items.length) {
    return <p className="text-secondary p-3 mb-0">No misconfigurations detected.</p>;
  }

  return (
    <div className="table-responsive-wrapper">
      <table className="w-100 discover-tabel">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Type</th>
            <th>Severity</th>
            <th>Description</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-2">
                <p className="mb-2 text-white fw-medium assets">{resolveDisplayText(item.asset, "Unknown")}</p>
                <p className="mb-2 text-secondary assets-desc">{resolveDisplayText(item.ip)}</p>
              </td>
              <td>
                <p className="mb-2 text-white type">{resolveDisplayText(item.type, "Misconfiguration")}</p>
              </td>
              <td>
                <p className={`mb-2 rounded-5 w-fit-content text-capitalize ${severityClass(item.severity)}`}>
                  {item.severity}
                </p>
              </td>
              <td>
                <p className="mb-2 description">{resolveDisplayText(item.description)}</p>
              </td>
              <td>
                <p className={`mb-2 rounded-5 w-fit-content text-capitalize ${item.status === "fixed" ? "fixed" : "critical"}`}>
                  {item.status}
                </p>
              </td>
              <td>
                {item.status === "fixed" ? (
                  <i className="fa-solid fa-circle-check fixed-icon fs-5" />
                ) : (
                  <div>
                    <button type="button" className="btn mb-2 fix rounded-3 text-white">
                      <i className="fa-solid fa-wrench text-white me-1" />
                      Fix
                    </button>
                    <IntegrationActions item={item} source="misconfigurations" compact />
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
