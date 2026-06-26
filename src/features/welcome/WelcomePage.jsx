import React from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Cloud,
  Code2,
  Database,
  FileCheck2,
  Home,
  Lock,
  LogOut,
  Mail,
  Network,
  Shield,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import logo from "../../assets/LumiSecLogoB 1@3x.png";
import { useAuth } from "../auth/context/AuthContext";
import "./WelcomePage.css";

const metrics = [
  { value: "24", label: "Active Threats" },
  { value: "112", label: "Incidents Resolved" },
  { value: "3.4s", label: "Avg. Response Time" },
];

const features = [
  {
    icon: <ShieldCheck aria-hidden="true" />,
    title: "SOAR Automation",
    to: "/SOAR/playbook",
    description:
      "Orchestrate, automate, and respond to threats in real-time with our advanced SOAR engine.",
  },
  {
    icon: <Code2 aria-hidden="true" />,
    title: "Integrated IDE",
    to: "/SOAR/playbook",
    description:
      "Write, test, and execute custom security scripts directly within LumiSec.",
  },
  {
    icon: <BarChart3 aria-hidden="true" />,
    title: "Deep Analytics",
    to: "/SOAR",
    description:
      "Gain actionable insights with real-time dashboards and predictive analytics.",
  },
];

const integrations = [
  { icon: <Database aria-hidden="true" />, label: "SIEM" },
  { icon: <Cloud aria-hidden="true" />, label: "Cloud" },
  { icon: <Wifi aria-hidden="true" />, label: "Threat Feeds" },
  { icon: <Lock aria-hidden="true" />, label: "Zero Trust" },
];

const trustedLogos = ["in", "GitHub", "Microsoft", "Google", "aws", "CyberGrid", "CISCO", "TechOps"];

export default function WelcomePage() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <main className="lumisec-shell">
      <aside className="welcome-sidebar" aria-label="LumiSec navigation">
        <Link className="welcome-brand" to="/">
          <img src={logo} alt="LumiSec" />
          <span>LUMISEC</span>
        </Link>

        <nav className="welcome-nav">
          <Link className="welcome-nav-link active" to="/welcome">
            <Home aria-hidden="true" />
            <span>Welcome</span>
          </Link>
          <Link className="welcome-nav-link" to="/Phishing">
            <Mail aria-hidden="true" />
            <span>Phishing</span>
          </Link>
          <Link className="welcome-nav-link" to="/GRC">
            <FileCheck2 aria-hidden="true" />
            <span>GRC</span>
          </Link>
          <Link className="welcome-nav-link" to="/SOAR">
            <Shield aria-hidden="true" />
            <span>SOAR</span>
          </Link>
          <Link className="welcome-nav-link" to="/Network">
            <Network aria-hidden="true" />
            <span>Network</span>
          </Link>
        </nav>

        {isAuthenticated ? (
          <button className="logout-button" type="button" onClick={logout}>
            <LogOut aria-hidden="true" />
            <span>Log Out</span>
          </button>
        ) : (
          <Link className="logout-button" to="/login">
            <LogOut aria-hidden="true" />
            <span>Log In</span>
          </Link>
        )}
      </aside>

      <section className="welcome-content">
        <div className="welcome-hero">
          <h1>
            Welcome to
            <span>LumiSec Platform</span>
          </h1>
          <p className="hero-kicker">Redefining Cybersecurity</p>
          <p className="hero-subtitle">Powered by SOAR Automation &amp; Integrated IDE</p>
          <p className="hero-copy">
            The future of <strong>Cybersecurity Platforms</strong> - featuring our powerful
            SOAR automation engine and integrated IDE for custom scripting. Stay in control,
            stay secure.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" to="/SOAR">
              Get Started
            </Link>
            <a className="secondary-action" href="#features">
              Learn More
            </a>
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

        <article className="glass-panel ide-preview">
          <h2>
            <Code2 aria-hidden="true" />
            Demo IDE Preview
          </h2>
          <pre>
            <code>{`# Example Script 1
def check_system():
    print("Scanning system for threats...")
    return "No threats found"`}</code>
          </pre>
        </article>

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
      </section>
    </main>
  );
}
