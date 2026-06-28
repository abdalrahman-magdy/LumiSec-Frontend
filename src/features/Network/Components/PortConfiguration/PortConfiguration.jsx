import React from "react";
import circleIcon from "../../../../assets/◎.png";
import { SCAN_MODE_OPTIONS } from "../../utils/portScan";
import "./PortConfiguration.css";

export default function PortConfiguration({ onScan, loading = false, defaults = {}, disabled = false }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    onScan?.({
      target: form.target.value,
      ports: form.ports.value,
      scanMode: form.scanMode.value,
    });
  };

  return (
    <div className="dashboard-card mb-3">
      <div className="d-flex align-items-center mb-2">
        <figure className="mb-0 me-2">
          <img src={circleIcon} className="w-100" alt="codeIcon" />
        </figure>
        <h6 className="text-white mb-0">Scan Configuration</h6>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row justify-content-between align-items-center mb-3">
          <div className="col">
            <label htmlFor="target" className="d-block mb-1">Target IP / Host</label>
            <input
              type="text"
              className="form-control border-0"
              id="target"
              name="target"
              defaultValue={defaults.target ?? "192.168.1.45"}
              placeholder="192.168.1.45"
              required
              disabled={disabled}
            />
          </div>

          <div className="col">
            <label htmlFor="ports" className="d-block mb-1">Ports</label>
            <input
              type="text"
              className="form-control border-0"
              id="ports"
              name="ports"
              defaultValue={defaults.ports ?? "22,80,443"}
              placeholder="22,80,443"
              required
              disabled={disabled}
            />
          </div>

          <div className="col">
            <label htmlFor="scanMode" className="d-block mb-1">Scan Mode</label>
            <select
              name="scanMode"
              id="scanMode"
              className="form-select ScanType-select border-0"
              defaultValue={defaults.scanMode ?? "CONNECT"}
              disabled={disabled}
            >
              {SCAN_MODE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col">
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
