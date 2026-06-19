import React from "react";
import wifiIcon from "../../../../assets/SVG (2).png";

export default function CaptureControl({
  onStart,
  onStop,
  loading = false,
  active = false,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    if (active) {
      onStop?.();
      return;
    }
    onStart?.({
      interface: form.interface.value,
      duration: Number(form.duration.value) || 60,
      bpfFilter: form.bpfFilter.value,
    });
  };

  return (
    <div className="dashboard-card mb-3">
      <div className="d-flex align-items-center mb-2">
        <figure className="mb-0 me-2">
          <img src={wifiIcon} className="w-100" alt="codeIcon" />
        </figure>
        <h6 className="text-white mb-0">Capture Controls</h6>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row justify-content-between align-items-center mb-3">
          <div className="col">
            <label htmlFor="interface" className="d-block mb-1">Interface</label>
            <select name="interface" id="interface" className="form-select ScanType-select border-0" defaultValue="eth0">
              <option value="eth0">eth0</option>
              <option value="eth1">eth1</option>
              <option value="wlan0">wlan0</option>
            </select>
          </div>

          <div className="col">
            <label htmlFor="duration" className="d-block mb-1">Duration (sec)</label>
            <input
              type="number"
              className="form-control border-0"
              id="duration"
              name="duration"
              defaultValue={60}
              placeholder="Duration (sec)"
            />
          </div>

          <div className="col">
            <label htmlFor="bpfFilter" className="d-block mb-1">BPF Filter</label>
            <input
              type="text"
              className="form-control border-0"
              id="bpfFilter"
              name="bpfFilter"
              placeholder="tcp port 443"
            />
          </div>

          <div className="col">
            <label className="d-block mb-1">Status</label>
            <button type="button" className={`btn border-0 w-100 ${active ? "btn-success" : "btn-secondary text-white"}`}>
              {active ? "Capturing" : "Stopped"}
            </button>
          </div>

          <div className="col">
            <button
              type="submit"
              disabled={loading}
              className={`btn border-0 rounded-3 text-white fw-medium me-3 ps-0 d-flex justify-content-between align-items-center mt-4 ${active ? "btn-danger" : "start-btn"}`}
            >
              {loading ? (
                <i className="fa-solid fa-spinner fa-spin mx-2 text-white" />
              ) : (
                <i className={`fa-solid ${active ? "fa-stop" : "fa-play"} mx-2 text-white`} />
              )}
              {loading ? "Starting..." : active ? "Stop Capture" : "Start Capture"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
