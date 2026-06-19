import React, { useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import CaptureControl from "../Components/CaptureControl/CaptureControl";
import DashboardCard2 from "../Components/DashboardCard2/DashboardCard2";
import LivePacketStream from "../Components/LivePacketStream/LivePacketStream";
import DashboardPieChart from "../../SOAR/Components/DashboardPieChart/DashboardPieChart";
import NetworkAlert from "../Components/Shared/NetworkAlert";
import usePacketSniffing from "../hooks/usePacketSniffing";
import { formatNumber } from "../utils/normalizers";

export default function PacketCapture() {
  const { setTitle } = useOutletContext();
  const { stream, loading, error, active, startCapture, stopCapture } = usePacketSniffing();

  useEffect(() => {
    setTitle("Packet Capture");
  }, [setTitle]);

  const protocolChartData = useMemo(() => {
    const protocols = stream?.protocols ?? {};
    const entries = Object.entries(protocols);
    if (!entries.length) return null;
    return {
      labels: entries.map(([k]) => k),
      datasets: [
        {
          data: entries.map(([, v]) => v),
          backgroundColor: ["#06b6d4", "#22c55e", "#eab308", "#A5B4FC", "#ef4444", "#f97316"],
        },
      ],
    };
  }, [stream]);

  return (
    <>
      <NetworkAlert error={error} />

      <CaptureControl
        onStart={startCapture}
        onStop={stopCapture}
        loading={loading}
        active={active}
      />

      <div className="row align-items-center justify-content-around">
        <DashboardCard2 text="Total Packets" Statistics={formatNumber(stream?.stats?.totalPackets ?? 0)} />
        <DashboardCard2 text="Protocols" Statistics={formatNumber(stream?.stats?.protocols ?? 0)} />
        <DashboardCard2 text="Avg PPS" Statistics={formatNumber(stream?.stats?.avgPps ?? 0)} />
        <DashboardCard2 text="Suspicious Packets" Statistics={formatNumber(stream?.stats?.suspicious ?? 0)} />
      </div>

      <div className="row g-3 justify-content-between align-items-stretch mb-4 mb-lg-5 p-3">
        <div className="col-12 col-lg-8 ps-0">
          <div className="dashboard-card h-100 p-3 rounded-4 overflow-hidden">
            <LivePacketStream packets={stream?.packets ?? []} active={active} />
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="dashboard-card h-100 p-3 rounded-4">
            <h6 className="text-white mb-3">Protocol Breakdown</h6>
            {protocolChartData ? (
              <DashboardPieChart />
            ) : (
              <p className="text-secondary">Start capture to view protocol distribution.</p>
            )}
            {stream?.protocols && (
              <ul className="list-unstyled text-secondary mt-3 mb-0">
                {Object.entries(stream.protocols).map(([proto, count]) => (
                  <li key={proto} className="d-flex justify-content-between mb-1">
                    <span>{proto}</span>
                    <span className="text-white">{count}%</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
