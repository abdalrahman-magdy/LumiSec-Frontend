import React, { useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import CaptureControl from "../Components/CaptureControl/CaptureControl";
import DashboardCard2 from "../Components/DashboardCard2/DashboardCard2";
import LivePacketStream from "../Components/LivePacketStream/LivePacketStream";
import ServiceDistribution from "../Components/DoughnutChart/ServiceDistribution";
import NetworkAlert from "../Components/Shared/NetworkAlert";
import usePacketSniffing from "../hooks/usePacketSniffing";
import useNetworkPermissions from "../hooks/useNetworkPermissions";
import { formatNumber } from "../utils/normalizers";

export default function PacketCapture() {
  const { setTitle } = useOutletContext();
  const { canSniffTraffic } = useNetworkPermissions();
  const { stream, loading, error, active, captureComplete, startCapture, stopCapture } = usePacketSniffing();

  useEffect(() => {
    setTitle("Packet Capture");
  }, [setTitle]);

  const protocolCounts = useMemo(() => stream?.protocols ?? {}, [stream]);

  return (
    <>
      <NetworkAlert error={error} />

      <CaptureControl
        onStart={startCapture}
        onStop={stopCapture}
        loading={loading}
        active={active}
        captureComplete={captureComplete}
        disabled={!canSniffTraffic}
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
            <LivePacketStream
              packets={stream?.packets ?? []}
              active={active}
              captureComplete={captureComplete}
            />
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="dashboard-card h-100 p-3 rounded-4">
            <h6 className="text-white mb-3">Protocol Breakdown</h6>
            {Object.keys(protocolCounts).length ? (
              <ServiceDistribution protocols={protocolCounts} />
            ) : (
              <p className="text-secondary">Start capture to view protocol distribution.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
