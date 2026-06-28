import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import analysisIcon from "../../../assets/Overlay (6).png";
import arrowIcon from "../../../assets/Overlay (7).png";
import redDangerTriangle from "../../../assets/SVG (14).png";
import orangeDangerTriangle from "../../../assets/Overlay (8).png";
import DashboardCard4 from "../Components/DashboardCard4/DashboardCard4";
import TrafficFlowChart from "../Components/TraficFlowChart/TraficFlowChart";
import "./FlowMonitoring.css";
import AnomalyAlerts from "../Components/AnomalyAlerts/AnomalyAlerts";
import ExfiltrationIndicators from "../Components/ExfiltrationIndicators/ExfiltrationIndicators";
import NetworkAlert from "../Components/Shared/NetworkAlert";
import NetworkLoading from "../Components/Shared/NetworkLoading";
import NetworkPagination from "../Components/Shared/NetworkPagination";
import useFlowMetrics from "../hooks/useFlowMetrics";
import { formatNumber } from "../utils/normalizers";

export default function FlowMonitoring() {
  const { setTitle } = useOutletContext();
  const { metrics, pagination, page, setPage, loading, error, reload } = useFlowMetrics();

  useEffect(() => {
    setTitle("Flow Monitoring");
  }, [setTitle]);

  if (loading && !metrics) {
    return <NetworkLoading message="Loading flow metrics..." skeleton rows={4} />;
  }

  const peakIsSpike = metrics?.currentPps > (metrics?.avgPps ?? 0) * 1.5;

  return (
    <>
      <NetworkAlert error={error} onRetry={reload} />

      <div className="row g-3 mb-4">
        <DashboardCard4
          title="Current PPS"
          icon={analysisIcon}
          Statistics={formatNumber(metrics?.currentPps ?? 0)}
          text2="Packets per second"
          text3={peakIsSpike ? "▲ Spike" : ""}
          text4={peakIsSpike ? "above baseline" : ""}
        />
        <DashboardCard4
          title="Avg PPS"
          icon={arrowIcon}
          Statistics={formatNumber(metrics?.avgPps ?? 0)}
          text2="Average packets/sec"
        />
        <DashboardCard4
          title="Peak PPS"
          icon={orangeDangerTriangle}
          Statistics={formatNumber(metrics?.peakPps ?? 0)}
          text2="Peak packets/sec"
          text3="▲ High"
          text4="watch threshold"
        />
        <DashboardCard4
          title="Flood Events"
          icon={redDangerTriangle}
          Statistics={formatNumber(metrics?.floodEvents ?? 0)}
          text2="Detected floods"
        />
      </div>

      {metrics?.bandwidth && (
        <div className="row g-3 mb-4 px-2">
          <div className="col-6">
            <div className="dashboard-card p-3 rounded-4">
              <p className="text-secondary mb-1">Inbound Bandwidth</p>
              <h4 className="text-white">{formatNumber(metrics.bandwidth.inboundMbps)} Mbps</h4>
            </div>
          </div>
          <div className="col-6">
            <div className="dashboard-card p-3 rounded-4">
              <p className="text-secondary mb-1">Outbound Bandwidth</p>
              <h4 className={`${metrics.bandwidth.outboundMbps > metrics.bandwidth.inboundMbps * 1.2 ? "spike-highlight" : "text-white"}`}>
                {formatNumber(metrics.bandwidth.outboundMbps)} Mbps
              </h4>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-card mb-3">
        <div className="d-flex align-items-center mb-3">
          <figure className="mb-0 me-2">
            <img src={analysisIcon} className="w-100" alt="flow" />
          </figure>
          <h6 className="text-white mb-0">Traffic Flow — Baseline vs Current + 3σ Threshold</h6>
        </div>
        <TrafficFlowChart metrics={metrics} />
      </div>

      <div className="row justify-content-between">
        <div className="col-6">
          <AnomalyAlerts anomalies={metrics?.anomalies ?? []} />
        </div>
        <div className="col-6">
          <ExfiltrationIndicators indicators={metrics?.exfiltration ?? []} />
        </div>
      </div>

      <NetworkPagination
        page={pagination.page ?? page}
        pages={pagination.pages ?? 1}
        total={pagination.total ?? 0}
        onPageChange={setPage}
        disabled={loading}
      />
    </>
  );
}
