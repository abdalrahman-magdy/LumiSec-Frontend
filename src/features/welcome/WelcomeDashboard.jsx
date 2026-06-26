import React from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Cloud,
  Database,
  Lock,
  Network,
  ShieldCheck,
  Wifi,
} from "lucide-react";

const metrics = [
  { value: "5", label: "Security Modules" },
  { value: "112", label: "Incidents Resolved" },
  { value: "24/7", label: "Operational Visibility" },
];

const features = [
  {
    icon: <ShieldCheck aria-hidden="true" />,
    title: "SOAR Response",
    to: "/SOAR",
    description:
      "Triage incidents, coordinate playbooks, and move response actions faster.",
  },
  {
    icon: <Network aria-hidden="true" />,
    title: "Network Security",
    to: "/Network",
    description:
      "Discover assets, scan ports, inspect packets, and monitor network exposure.",
  },
  {
    icon: <BarChart3 aria-hidden="true" />,
    title: "GRC Tracking",
    to: "/GRC",
    description:
      "Track controls, remediation tasks, findings, and compliance workflows.",
  },
];

const integrations = [
  { icon: <Database aria-hidden="true" />, label: "SIEM" },
  { icon: <Cloud aria-hidden="true" />, label: "Cloud" },
  { icon: <Wifi aria-hidden="true" />, label: "Threat Feeds" },
  { icon: <Lock aria-hidden="true" />, label: "Zero Trust" },
];

const trustedLogos = ["in", "GitHub", "Microsoft", "Google", "aws", "CyberGrid", "CISCO", "TechOps"];

export default function WelcomeDashboard() {
  return (
    <div className="welcome-dashboard">
      <div className="welcome-hero">
        <p className="welcome-eyebrow">Cyber defense workspace</p>
        <h1>
          Welcome to the
          <span>LumiSec Command Center</span>
        </h1>
        <p className="hero-kicker">Operate phishing, network, GRC, SOAR, and SIEM workflows from one calm workspace.</p>
        <p className="hero-subtitle">Choose a module and continue your security operation.</p>
        <p className="hero-copy">
          LumiSec keeps your detection, investigation, and remediation work connected
          across the full <strong>cybersecurity lifecycle</strong>.
        </p>
        <div className="hero-actions">
          <Link className="primary-action" to="/SOAR">
            Open SOAR
          </Link>
          <Link className="secondary-action" to="/Network">
            Open Network
          </Link>
        </div>
      </div>

      <div className="metric-grid" aria-label="Platform metrics">
        {metrics.map((metric) => (
          <article className="glass-panel metric-card" key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </div>

      <section className="feature-grid" id="features" aria-label="Platform features">
        {features.map((feature) => (
          <Link className="glass-panel feature-card" to={feature.to} key={feature.title}>
            <div className="feature-heading">
              {feature.icon}
              <h2>{feature.title}</h2>
            </div>
            <p>{feature.description}</p>
          </Link>
        ))}
      </section>

      <section className="integrations-section" aria-label="Integrations">
        <h2>Integrations</h2>
        <div className="integration-grid">
          {integrations.map((integration) => (
            <article className="glass-panel integration-card" key={integration.label}>
              {integration.icon}
              <span>{integration.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel trusted-section" aria-label="Trusted by global leaders">
        <h2>Trusted by Global Leaders</h2>
        <div className="trusted-grid">
          {trustedLogos.map((item) => (
            <span className={`trusted-logo trusted-${item.toLowerCase()}`} key={item}>
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
