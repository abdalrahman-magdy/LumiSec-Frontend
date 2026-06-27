import React from "react";
import NetworkAlert from "../../../Network/Components/Shared/NetworkAlert";
import "../../../Network/Components/Shared/NetworkShared.css";

export default function PhishingAlert({ isMock, message, type = "danger", ...props }) {
  const mockMessage = isMock
    ? "Showing demo data — API unavailable or mock fallback is enabled."
    : null;

  return (
    <>
      {mockMessage && (
        <div className="network-alert network-alert-warning d-flex mb-3" role="status">
          <span>{mockMessage}</span>
        </div>
      )}
      <NetworkAlert type={type} message={message} {...props} />
    </>
  );
}
