import React, { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import PortConfiguration from "../Components/PortConfiguration/PortConfiguration";
import PortScanAssetSummary from "../Components/PortScanAssetSummary/PortScanAssetSummary";
import repeateIcon from "../../../assets/⟳.png";
import semiFilledCircleIcon from "../../../assets/◐.png";
import "./PortScanning.css";
import PortResult from "../Components/PortResult/PortResult";
import ServiceDistribution from "../Components/DoughnutChart/ServiceDistribution";
import MisconfigurationsTabel from "../Components/MisconfigurationsTabel/MisconfigurationsTabel";
import NetworkAlert from "../Components/Shared/NetworkAlert";
import usePortScanning from "../hooks/usePortScanning";

export default function PortScanning() {
  const { setTitle } = useOutletContext();
  const { result, loading, error, runScan } = usePortScanning();

  useEffect(() => {
    setTitle("Port Scanning");
  }, [setTitle]);

  const openPorts = result?.results ?? [];
  const openCount = openPorts.filter((row) => row.state === "open").length;
  const scanTarget = result?.target ?? result?.asset?.ip ?? "—";

  return (
    <>
      <NetworkAlert error={error} />

      <PortConfiguration onScan={runScan} loading={loading} />

      {result?.asset && (
        <PortScanAssetSummary
          asset={result.asset}
          taskId={result.taskId}
          status={result.status}
        />
      )}

      <div className="row g-3 justify-content-between align-items-stretch mb-4 mb-lg-5 px-2 mt-0">
        <div className="col-8 dashboard-card me-2">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center w-100 justify-content-between">
              <div className="d-flex align-items-center">
                <figure className="mb-1 me-2">
                  <img src={repeateIcon} className="w-100" alt="results" />
                </figure>
                <h6 className="text-white mb-0">
                  Open Ports ({openPorts.length})
                </h6>
              </div>
              {result && <p className="open rounded-5 mb-0">{openCount} Open</p>}
            </div>
          </div>
          <PortResult
            results={openPorts}
            loading={loading && !result}
            target={scanTarget}
          />
        </div>

        <div className="col dashboard-card">
          <div className="d-flex align-items-center mb-3">
            <figure className="mb-0 me-2">
              <img src={semiFilledCircleIcon} className="w-100" alt="distribution" />
            </figure>
            <h6 className="text-white mb-0">Service Distribution</h6>
          </div>
          <ServiceDistribution results={openPorts} protocols={result?.services} />
        </div>
      </div>

      {result && (
        <div className="dashboard-card p-3 mx-2 mb-4">
          <h6 className="text-white mb-3">
            Misconfigurations ({result.misconfigurations?.length ?? 0})
          </h6>
          <MisconfigurationsTabel items={result.misconfigurations ?? []} loading={loading} />
        </div>
      )}
    </>
  );
}
