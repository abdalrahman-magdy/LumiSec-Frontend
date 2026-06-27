import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Mail,
  MapPin,
  Network,
  Phone,
  Radar,
  ShieldCheck,
} from "lucide-react";
import logo from "../../assets/LumiSecLogoB 1@3x.png";
import networkImage from "../../assets/Background+Shadow.png";
import phishingImage from "../../assets/Overlay (1).png";
import grcImage from "../../assets/Container.png";
import soarImage from "../../assets/Module.png";
import siemImage from "../../assets/Background+Shadow (2).png";
import threatImage from "../../assets/background.png";
import "./LandingPage.css";

const tools = [
  {
    title: "Network Security Scanner",
    description: "Discover assets, scan ports, inspect traffic, and surface misconfigurations.",
    points: ["Network discovery", "Port scanning"],
    image: networkImage,
  },
  {
    title: "Phishing Simulation",
    description: "Run phishing campaigns, track user behavior, and report training risk.",
    points: ["Campaigns", "Reports"],
    image: phishingImage,
  },
  {
    title: "GRC",
    description: "Manage controls, audits, standards, and remediation tasks in one place.",
    points: ["Audits", "Compliance"],
    image: grcImage,
  },
  {
    title: "SOAR",
    description: "Triage incidents, connect alerts, and coordinate response playbooks.",
    points: ["Incident queue", "Playbooks"],
    image: soarImage,
  },
  {
    title: "SIEM Integration",
    description: "Connect external SIEM solutions and route alerts into response workflows.",
    points: ["Connectors", "Alert intake"],
    image: siemImage,
  },
  {
    title: "Threat Intelligence",
    description: "Monitor security signals and enrich findings across platform modules.",
    points: ["Monitoring", "Enrichment"],
    image: threatImage,
  },
];

const heroMetrics = [
  { value: "5", label: "connected modules" },
  { value: "24/7", label: "security visibility" },
  { value: "1", label: "operator workspace" },
];

const heroTitle = "Control Your Cyber Risk From One Live Workspace";
const heroHighlight = "Live Workspace";

const plans = [
  {
    name: "Starter",
    price: "$120/month",
    features: ["Network scanner", "Basic phishing reports", "GRC task tracking"],
  },
  {
    name: "Professional",
    price: "$399/month",
    featured: true,
    features: ["All core tools", "SOAR incident workflows", "SIEM integration"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Advanced automation", "Dedicated security workflows", "Compliance reporting"],
  },
];

export default function LandingPage() {
  const [typedTitle, setTypedTitle] = useState("");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setTypedTitle(heroTitle);
      return undefined;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedTitle(heroTitle.slice(0, index));
      if (index >= heroTitle.length) window.clearInterval(timer);
    }, 42);

    return () => window.clearInterval(timer);
  }, []);

  const highlightStart = heroTitle.indexOf(heroHighlight);
  const normalTitle = typedTitle.slice(0, Math.min(typedTitle.length, highlightStart));
  const highlightedTitle = typedTitle.slice(highlightStart);

  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Main navigation">
        <Link className="landing-brand" to="/">
          <img src={logo} alt="LumiSec" />
          <span>
            LumiSec
            <small>Cyber Defense Platform</small>
          </span>
        </Link>
        <div className="landing-links">
          <a href="#home">Home</a>
          <a href="#tools">Tools</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="landing-actions">
          <Link className="landing-btn landing-btn-primary" to="/login">
            Login
          </Link>
        </div>
      </nav>

      <section className="landing-hero" id="home">
        <div className="landing-hero-content">
          <p className="landing-eyebrow">Security command center</p>
          <h1 className="typing-title" aria-label={heroTitle}>
            {normalTitle}
            {highlightedTitle && <span>{highlightedTitle}</span>}
          </h1>
          <p>
            LumiSec connects phishing simulation, network scanning, GRC, SOAR, and SIEM
            workflows so your team can detect, investigate, and remediate faster.
          </p>
          <div className="landing-hero-actions">
            <Link className="landing-btn landing-btn-primary" to="/login">
              Open Dashboard
            </Link>
            <a className="landing-btn landing-btn-outline" href="#tools">
              Explore Platform
            </a>
          </div>
          <div className="hero-metrics" aria-label="Platform highlights">
            {heroMetrics.map((metric) => (
              <div key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section" id="tools">
        <div className="landing-section-heading">
          <p className="landing-eyebrow">Platform modules</p>
          <h2>Built for the full security loop</h2>
          <span>
            Each module feeds the next, from discovery and simulation to response and governance.
          </span>
        </div>
        <div className="tools-grid">
          {tools.map((tool, index) => (
            <article className="tool-card" key={tool.title}>
              <div className="tool-card-number">{String(index + 1).padStart(2, "0")}</div>
              <img src={tool.image} alt="" aria-hidden="true" />
              <div className="tool-card-body">
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <div className="tool-points">
                  {tool.points.map((point) => (
                    <span key={point}>{point}</span>
                  ))}
                </div>
                <small>Active module</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-process" id="about">
        <div>
          <p className="landing-eyebrow">How it works</p>
          <h2>From scan to response</h2>
          <p>
            LumiSec is designed around a single security workflow: collect signals, detect risk,
            investigate incidents, and push remediation into governance.
          </p>
        </div>
        <div className="process-list">
          <div>
            <Network aria-hidden="true" />
            <span>Network scans produce assets, open ports, and misconfigurations.</span>
          </div>
          <div>
            <Radar aria-hidden="true" />
            <span>SIEM alerts and tool findings flow into SOAR for triage.</span>
          </div>
          <div>
            <Activity aria-hidden="true" />
            <span>SOAR playbooks guide investigation and response actions.</span>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <span>Confirmed risks move into GRC for audit and remediation tracking.</span>
          </div>
        </div>
      </section>

      <section className="landing-section" id="pricing">
        <div className="landing-section-heading">
          <p className="landing-eyebrow">Plans</p>
          <h2>Flexible Security Plans for Every Application</h2>
        </div>
        <div className="plans-grid">
          {plans.map((plan) => (
            <article className={`plan-card ${plan.featured ? "plan-card-featured" : ""}`} key={plan.name}>
              <div>
                <p>{plan.name}</p>
                <h3>{plan.price}</h3>
              </div>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <CheckCircle2 aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link className="landing-btn landing-btn-primary" to="/login">
                Enroll Now
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-contact" id="contact">
        <div>
          <BarChart3 aria-hidden="true" />
          <h2>Secure Your Cloud Infrastructure</h2>
          <p>Manage, monitor, and optimize your security operations with connected tools.</p>
        </div>
        <Link className="landing-btn landing-btn-primary" to="/login">
          Send Message
        </Link>
      </section>

      <footer className="landing-footer" id="footer">
        <div className="footer-main">
          <div className="footer-brand-block">
            <Link className="footer-logo" to="/">
              <img src={logo} alt="LumiSec" />
              <span>LumiSec</span>
            </Link>
            <p>
              Your unified partner for phishing simulation, network security, GRC,
              SOAR, and SIEM-ready operations.
            </p>
          </div>

          <div className="footer-column">
            <h3>Navigation</h3>
            <a href="#tools">Security Tools</a>
            <a href="#about">Workflow</a>
            <a href="#pricing">Plans</a>
            <Link to="/login">Login</Link>
          </div>

          <div className="footer-column">
            <h3>Contact</h3>
            <a href="mailto:support@lumisec.com"><Mail aria-hidden="true" /> support@lumisec.com</a>
            <a href="tel:+201000000000"><Phone aria-hidden="true" /> +20 100 000 0000</a>
            <a href="https://www.google.com/maps/search/?api=1&query=Cairo%2C%20Egypt" target="_blank" rel="noreferrer">
              <MapPin aria-hidden="true" /> Cairo, Egypt
            </a>
          </div>

          <div className="footer-column">
            <h3>Follow Us</h3>
            <div className="footer-socials" aria-label="Social links">
              <a href="https://www.linkedin.com" aria-label="LumiSec on LinkedIn">
                <i className="fa-brands fa-linkedin-in" aria-hidden="true" />
              </a>
              <a href="https://github.com" aria-label="LumiSec on GitHub">
                <i className="fa-brands fa-github" aria-hidden="true" />
              </a>
              <a href="https://twitter.com" aria-label="LumiSec on Twitter">
                <i className="fa-brands fa-x-twitter" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-credit">
          <span>© 2026 LumiSec</span>
          <span>Design and development by LumiSec Team</span>
        </div>
      </footer>
    </main>
  );
}
