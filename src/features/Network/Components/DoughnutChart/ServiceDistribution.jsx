import React, { useMemo } from "react";
import "./ServiceDistribution.css";
import { resolveDisplayText } from "../../utils/normalizers";

const COLORS = ["#00D5FF", "#18D28E", "#FFB11B", "#9D7CFF", "#FF5555", "#70809B", "#7F56D9", "#539BFF"];

const DEFAULT_SERVICES = [
  { color: "#00D5FF", text: "SSH", value: 3 },
  { color: "#18D28E", text: "HTTP/HTTPS", value: 3 },
  { color: "#FFB11B", text: "Databases", value: 2 },
  { color: "#9D7CFF", text: "Mail", value: 3 },
  { color: "#FF5555", text: "Files", value: 2 },
  { color: "#70809B", text: "Other", value: 7 },
];

function buildFromResults(results = []) {
  const map = {};
  results.forEach((r) => {
    const key = resolveDisplayText(r.service, "Other");
    map[key] = (map[key] ?? 0) + 1;
  });
  return Object.entries(map).map(([text, value], i) => ({
    text,
    value,
    color: COLORS[i % COLORS.length],
  }));
}

export default function ServiceDistribution({ results = [], protocols = null }) {
  const services = useMemo(() => {
    if (protocols && typeof protocols === "object") {
      return Object.entries(protocols).map(([text, value], i) => ({
        text: resolveDisplayText(text, "Other"),
        value: Number(value) || 0,
        color: COLORS[i % COLORS.length],
      }));
    }
    if (results.length) return buildFromResults(results);
    return DEFAULT_SERVICES;
  }, [results, protocols]);

  const total = services.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="service-card">
      <div className="chart-container">
        <svg viewBox="0 0 300 300">
          <path d="M120 30 Q150 20 180 30 L165 100 Q150 95 135 100 Z" className="segment" fill="#697A96" />
          <path d="M270 120 Q280 150 270 180 L200 165 Q195 150 200 135 Z" className="segment" fill="#697A96" />
          <path d="M180 270 Q150 280 120 270 L135 200 Q150 205 165 200 Z" className="segment" fill="#697A96" />
          <path d="M30 180 Q20 150 30 120 L100 135 Q105 150 100 165 Z" className="segment" fill="#697A96" />
        </svg>
        <div className="center">
          <h1>{total}</h1>
          <p>Total Ports</p>
        </div>
      </div>
      <div className="services">
        {services.map((s) => (
          <ServiceItem key={s.text} {...s} />
        ))}
      </div>
    </div>
  );
}

function ServiceItem({ color, text, value }) {
  return (
    <div className="service-item">
      <div className="service-left">
        <span className="service-color" style={{ background: color }} />
        <span>{text}</span>
      </div>
      <strong>{value}</strong>
    </div>
  );
}
