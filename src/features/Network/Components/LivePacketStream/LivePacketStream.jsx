import React, { useEffect, useRef } from "react";
import waveIcon from "../../../../assets/Vector (1).png";
import "../Shared/NetworkShared.css";

function protocolClass(protocol) {
  const p = (protocol ?? "").toLowerCase();
  if (p === "tcp") return "packet-protocol-tcp";
  if (p === "dns") return "packet-protocol-dns";
  if (p === "tls" || p === "ssl") return "packet-protocol-tls";
  return "";
}

export default function LivePacketStream({ packets = [], active = false }) {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [packets]);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center">
          <figure className="mb-0 me-2">
            <img src={waveIcon} className="w-100" alt="stream" />
          </figure>
          <h6 className="text-white mb-0">Live Packet Stream</h6>
        </div>
        {active && (
          <span className="badge rounded-pill" style={{ background: "#10B981" }}>
            <i className="fa-solid fa-circle me-1" style={{ fontSize: "8px" }} />
            LIVE
          </span>
        )}
      </div>
      <div className="packet-terminal h-100" ref={terminalRef}>
        {!packets.length && (
          <div className="packet-line text-secondary">
            {active ? "Waiting for packets..." : "Start capture to view live packet stream."}
          </div>
        )}
        {packets.map((pkt) => (
          <div
            key={`${pkt.id}-${pkt.timestamp}`}
            className={`packet-line ${pkt.summary?.toLowerCase().includes("suspicious") ? "packet-line-suspicious" : ""}`}
          >
            <span className="text-secondary me-2">{String(pkt.id).padStart(4, "0")}</span>
            <span className="text-secondary me-2">{pkt.timestamp}</span>
            <span className={`me-2 ${protocolClass(pkt.protocol)}`}>{pkt.protocol}</span>
            <span className="me-2">{pkt.src} → {pkt.dst}</span>
            <span className="text-secondary me-2">Len:{pkt.length}</span>
            <span>{pkt.summary}</span>
          </div>
        ))}
      </div>
    </>
  );
}
