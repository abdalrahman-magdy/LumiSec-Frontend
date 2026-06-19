import React from "react";
import "./NetworkShared.css";

export default function NetworkLoading({ message = "Loading...", skeleton = false, rows = 4 }) {
  if (skeleton) {
    return (
      <div className="p-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="network-skeleton network-skeleton-card mb-3" />
        ))}
      </div>
    );
  }

  return (
    <div className="network-loading">
      <div className="network-spinner" />
      <p className="mb-0">{message}</p>
    </div>
  );
}
