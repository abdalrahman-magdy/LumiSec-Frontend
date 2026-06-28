import React from "react";
import codeIcon from "../../../../assets/⟨⟩.png";
import "./ScanConfiguration.css";

export default function ScanConfiguration({ onScan, loading = false, defaults = {}, disabled = false }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    onScan?.({ subnet: form.subnet.value.trim() });
  };

  return (
    <div className="dashboard-card mb-3">
      <div className="d-flex align-items-center">
        <figure className="mb-0 mt-2 me-2">
          <img src={codeIcon} className="w-100" alt="codeIcon" />
        </figure>
        <h6 className="text-white mb-0">Scan Configuration</h6>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row justify-content-between align-items-center mb-3">
          <div className="col-8">
            <label htmlFor="subnet" className="d-block">Subnet (CIDR)</label>
            <input
              type="text"
              className="form-control border-0"
              id="subnet"
              name="subnet"
              defaultValue={defaults.subnet ?? "192.168.1.0/24"}
              placeholder="192.168.1.0/24"
              required
              disabled={disabled}
            />
            <small className="text-secondary">
              Discovery uses ICMP/TCP probes configured on the backend scan mode.
            </small>
          </div>

          <div className="col-4">
            <button
              type="submit"
              disabled={loading || disabled}
              className="btn start-btn border-0 rounded-3 text-black fw-medium me-3 ps-0 d-flex justify-content-between align-items-center mt-4"
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin mx-2 text-dark" />
              ) : (
                <i className="fa-solid fa-play mx-2 text-dark" />
              )}
              {loading ? "Scanning..." : "Start Scan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
