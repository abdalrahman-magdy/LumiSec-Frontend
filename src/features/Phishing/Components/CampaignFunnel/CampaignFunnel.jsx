import React from "react";
import { formatNumber } from "../../utils/normalizers";
import "./CampaignFunnel.css";

function pct(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

function FunnelRow({ label, count, total, barClass, numberClass }) {
  const rate = pct(count, total);
  const width = total ? Math.max(rate, 4) : 0;
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center">
        <p>{label}</p>
        <p>
          <span className={`${numberClass} me-1`}>{formatNumber(count)}</span>
          ({rate}%)
        </p>
      </div>
      <div className="progress">
        <div
          className={`progress-bar ${barClass}`}
          role="progressbar"
          style={{ width: `${width}%` }}
          aria-valuenow={rate}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
}

export default function CampaignFunnel({ overview }) {
  const sent = Number(overview?.emailsSent ?? 0);
  const opened = Number(overview?.opened ?? 0);
  const clicked = Number(overview?.clicked ?? 0);
  const submitted = Number(overview?.submitted ?? 0);

  return (
    <>
      <h6 className="text-white mb-2">Campaign Funnel</h6>
      <p>Email → Submission conversion</p>

      <FunnelRow label="Opened" count={opened} total={sent} barClass="progress-bar-blue w-75" numberClass="blue-number" />
      <FunnelRow label="Clicked Link" count={clicked} total={sent} barClass="progress-bar-purple w-75" numberClass="purple-number" />
      <FunnelRow label="Submitted Data" count={submitted} total={sent} barClass="progress-bar-orange w-75" numberClass="orange-number" />
      <FunnelRow label="Emails Sent" count={sent} total={sent || 1} barClass="progress-bar-red w-75" numberClass="red-number" />
    </>
  );
}
