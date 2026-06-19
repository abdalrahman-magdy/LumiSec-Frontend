# LumiSec Frontend — Architecture Documentation

> **Document version:** 1.0  
> **Generated from codebase scan:** June 18, 2026  
> **Repository:** `LumiSec-FrontEnd` (Create React App)  
> **Audience:** Frontend developers onboarding to or extending the LumiSec platform

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Folder Structure Breakdown](#2-folder-structure-breakdown)
3. [Routing / Pages Structure](#3-routing--pages-structure)
4. [Components Architecture](#4-components-architecture)
5. [State Management](#5-state-management)
6. [API Integration Layer](#6-api-integration-layer)
7. [Authentication Flow](#7-authentication-flow)
8. [Theme System](#8-theme-system)
9. [Missing Features vs Backend](#9-missing-features-vs-backend)
10. [Security Features UI](#10-security-features-ui)
11. [Performance & Optimization](#11-performance--optimization)
12. [Full Design Summary](#12-full-design-summary)

---

## 1. Project Overview

### 1.1 What the Frontend Does

LumiSec Frontend is a **single-page application (SPA)** that provides a unified web dashboard for a hybrid cybersecurity platform. It presents five major functional areas:

| Module | Purpose |
|--------|---------|
| **GRC** | Governance, Risk & Compliance — audits, standards library, remediation tasks, settings |
| **SOAR** | Security Orchestration, Automation & Response — incident queue, analytics, incident management |
| **Network** | Network security operations — discovery, port scanning, packet capture, asset inventory, misconfigurations, flow monitoring |
| **Phishing** | Phishing simulation — campaigns, email templates, recipients, reports, settings |
| **SIEM Integration** | Standalone configuration page for connecting external SIEM vendors |

The application is currently in a **UI-first / prototype stage**: most screens render **hardcoded mock data**. Only one API integration exists (SOAR stats via `json-server`), and authentication is **presentational only** (no token handling, no route guards).

### 1.2 Role in the LumiSec System

```
┌─────────────────────────────────────────────────────────────────┐
│                     LumiSec Platform (intended)                  │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│   Frontend   │   Backend    │   Agents /   │   External SIEM /  │
│  (this repo) │  (not in     │   Scanners   │   Email / IdP      │
│              │   this repo) │              │                    │
└──────┬───────┴──────┬───────┴──────┬───────┴─────────┬──────────┘
       │              │              │                 │
       │  REST/WS     │              │                 │
       └──────────────┴──────────────┴─────────────────┘
```

**Intended role:** The frontend is the operator console where security analysts, auditors, and administrators view dashboards, triage incidents, manage compliance workflows, run network scans, and orchestrate phishing simulations.

**Current role:** A high-fidelity **design implementation** and navigation shell demonstrating module layouts, visual identity, and user flows — awaiting backend wiring.

### 1.3 Main Technologies

| Technology | Version | Usage |
|------------|---------|-------|
| **React** | 19.2.4 | UI library, functional components + hooks |
| **React DOM** | 19.2.4 | Rendering |
| **React Router DOM** | 7.13.2 | Client-side routing (`createBrowserRouter`) |
| **Create React App** | react-scripts 5.0.1 | Build toolchain (Webpack under the hood) |
| **Bootstrap** | 5.3.8 | Grid, utilities, offcanvas sidebar, modals, tabs |
| **Chart.js** | 4.5.1 | Charts (bar, doughnut, line) |
| **react-chartjs-2** | 5.3.1 | React bindings for Chart.js |
| **Axios** | 1.17.0 | HTTP client (minimal usage) |
| **Lucide React** | 1.16.0 | SVG icon set (sidebar, headers) |
| **Font Awesome Free** | 7.2.0 | Icon font (search, bells, tables) |
| **json-server** | 1.0.0-beta.15 | Dev mock API dependency (no npm script configured) |
| **web-vitals** | 2.1.4 | Performance metrics (default CRA hookup) |

**Not used:** Next.js, Vue, Redux, Zustand, Tailwind CSS, styled-components, SCSS/SASS, TypeScript.

### 1.4 High-Level Architecture

```
src/index.js
    └── App.jsx  (RouterProvider + route tree)
            ├── /  → Login
            ├── /SIEMIntegration → SIEMIntegration
            ├── /GRC/*  → GRC layout + nested pages
            ├── /SOAR/* → Soar layout + nested pages
            ├── /Network/* → Network layout + nested pages
            └── /Phishing/* → Phishing layout + nested pages
```

**Architectural pattern:** **Feature-based folder structure** under `src/features/`. Each feature owns its `pages/`, `components/` (or `Components/`), and optionally `Services/`, `Hooks/`. There is **no shared `components/` or `layouts/` layer** at the `src/` root — layout code is duplicated per module.

**Data flow (current):**

```
Component (hardcoded JSX)
        │
        └── (exception) useIncidentsQueue hook
                    └── IncidentsQueue.js (axios)
                              └── http://localhost:3001/stats
                                        └── db.json (via json-server, manual start)
```

---

## 2. Folder Structure Breakdown

### 2.1 Repository Root

| Path | Purpose |
|------|---------|
| `package.json` | Dependencies and CRA scripts (`start`, `build`, `test`, `eject`) |
| `package-lock.json` | Locked dependency tree |
| `README.md` | Default Create React App readme (no LumiSec-specific docs) |
| `debug.log` | Local debug artifact (not part of application) |
| `FRONTEND_ARCHITECTURE_DOCUMENTATION.md` | This document |

### 2.2 `public/` — Static Assets Served As-Is

| File | Purpose |
|------|---------|
| `index.html` | HTML shell; mounts React at `#root`. Title still default `"React App"`. |
| `favicon.ico` | Browser tab icon |
| `logo192.png` / `logo512.png` | PWA manifest icons (CRA defaults) |
| `manifest.json` | Web app manifest for installability |
| `robots.txt` | Search engine crawler rules |

**Relationship:** Files here are referenced with `%PUBLIC_URL%` and are not processed by Webpack (except `index.html` injection).

### 2.3 `src/` — Application Source

#### `src/index.js`
Application entry point. Responsibilities:
- Creates React root with `ReactDOM.createRoot`
- Wraps `<App />` in `<React.StrictMode>`
- Imports global styles: Bootstrap CSS/JS, `index.css`, Font Awesome CSS
- Calls `reportWebVitals()` (default CRA, no custom analytics wired)

#### `src/index.css`
Minimal global typography reset for `body` and `code` font stacks. Does **not** import `variables.css` or `global.css`.

#### `src/App.jsx`
**Central router configuration.** Defines all routes using `createBrowserRouter` and renders `<RouterProvider>`. All page imports are **eager** (no lazy loading).

#### `src/App.css`
Legacy CRA boilerplate styles (`.App`, `.App-logo`, spin animation). **Not imported** by `App.jsx` — effectively unused.

#### `src/App.test.js`
Default CRA smoke test scaffold.

#### `src/setupTests.js`
Jest/testing-library setup for CRA.

#### `src/reportWebVitals.js`
CRA web vitals reporting utility (CLS, FID, FCP, LCP, TTFB).

#### `src/logo.svg`
Default React logo — **not referenced** in active routes.

---

### 2.4 `src/styles/` — Shared Style Utilities

| File | Purpose | Imported By |
|------|---------|-------------|
| `variables.css` | CSS custom properties (color tokens) | `login.css`, `SIEMIntegration.css` only |
| `global.css` | Utility classes: `box-sizing`, `img` max-width, `body` overflow, width helpers (`.w-35`, `.w-4`, `.w-8`, `.w-fit-content`) | `Login.jsx`, `SIEMIntegration.jsx` |

**Gap:** Module layout CSS files (`GRC.css`, `Network.css`, etc.) redefine the same tokens inline rather than importing `variables.css`, leading to partial token adoption.

---

### 2.5 `src/assets/` — Static Images

Contains **~70 image assets** used across dashboards: logos, dashboard card icons, overlay decorations, SVG-style PNG icons, background textures.

| Notable Assets | Usage |
|----------------|-------|
| `LumiSecLogoB 1@3x.png` | Login, SOAR headers, branding |
| `background.png` | Login/SIEM page background, sidebar background image |
| `prrofile.png` | User avatar in headers (typo in filename) |
| `Background+Shadow*.png` | Network dashboard metric cards |
| `Container*.png`, `Overlay*.png` | Phishing dashboard cards |
| `SVG (*.png)` | Network module section icons |
| `Vector.png` | SSO button icon on login |
| `checkIcon.png`, `crossIcon.png`, etc. | GRC dashboard cards |

**Relationship:** Imported directly into components via relative paths (`../../../assets/...`). No asset pipeline or sprite system.

---

### 2.6 `src/features/` — Feature Modules

Top-level feature container. Also holds `db.json` mock database at `src/features/db.json` (unusual location — typically at project root for json-server).

---

#### 2.6.1 `src/features/auth/`

| Path | Purpose |
|------|---------|
| `pages/Login.jsx` | Login page UI — email/password form, SSO button, marketing copy |
| `pages/login.css` | Login-specific styles; imports `variables.css` |

**No** `services/`, `hooks/`, `context/`, or `components/` subfolders. Auth is a single page only — no register page exists.

---

#### 2.6.2 `src/features/GRC/` — Governance, Risk & Compliance

```
GRC/
├── pages/           # Route-level screens + layout shell
├── components/      # Feature-specific UI pieces
```

##### `GRC/pages/`

| File | Route | Purpose |
|------|-------|---------|
| `GRC.jsx` | `/GRC/*` layout | Shell: fixed topbar, collapsible sidebar, `<Outlet />` |
| `GRC.css` | — | Layout styles shared by all GRC child pages (topbar, sidebar, content area) |
| `GRCDashboard.jsx` | `/GRC` | Compliance KPI cards + bar/pie charts |
| `GRCAudits.jsx` | `/GRC/Audits` | Active audit card + Bootstrap accordions for ISO controls |
| `GRCStandards.jsx` | `/GRC/Standards` | Standards library grid + "Add Standard" modal trigger |
| `GRCStandards.css` | — | Standards page header responsive styles |
| `GRCRemediation.jsx` | `/GRC/Remediation` | Remediation table + "New Task" modal |
| `GRCSettings.jsx` | `/GRC/Settings` | Tabbed settings (Profile, User Management, Integrations) |
| `GRCSettings.css` | — | Settings tab styling |

##### `GRC/components/`

| Component | Purpose |
|-----------|---------|
| `DashboardCard/` | KPI stat card (icon image, statistic, label) |
| `DashboardBarChart/` | Chart.js bar chart — hardcoded Jan–Apr audit data |
| `DashboardPieChart/` | Chart.js doughnut/pie — compliance breakdown |
| `AuditCard/` | Single audit summary with progress text |
| `AuditAccordion/` | Bootstrap collapse accordion for control sections |
| `StandardsCard/` | Standard framework card (ISO, PCI, SOC2, NIST) with progress bar |
| `StandardModal/AddStandardModal.jsx` | Bootstrap modal to add a new standard |
| `RemedationTabel/` | Remediation findings data table |
| `TaskRemediationModal/AddTaskRemediationModal.jsx` | Modal form for new remediation task |
| `ProfileModal/` | Profile settings form embedded in GRC Settings tab |

---

#### 2.6.3 `src/features/SOAR/` — Security Orchestration, Automation & Response

```
SOAR/
├── Pages/           # Note: capital "P" (inconsistent with other modules)
├── Components/      # Capital "C"
├── Services/        # API service layer (only module with this)
└── Hooks/           # Custom data-fetching hook
```

##### `SOAR/Pages/`

| File | Route | Purpose |
|------|-------|---------|
| `Soar.jsx` | `/SOAR/*` layout | Sidebar-only shell; passes `collapsed` state via Outlet context |
| `Soar.css` | — | SOAR-specific header controls (calendar select, export button) |
| `SoarAnalytics.jsx` | `/SOAR`, `/SOAR/Analytics` | Analytics dashboard with KPI cards, charts, analyst performance |
| `SoarAnalytics.css` | — | Analytics page layout styles |
| `IncidentQueue.jsx` | `/SOAR/IncidentsQueue` | Incident queue with stats, incident table, playbook sidebar |
| `IncidentsQueue.css` | — | Queue page container styles |
| `IncidentManagement.jsx` | `/SOAR/IncidentManagement` | Single-incident deep-dive: summary, timeline, actions |
| `IncidentManagement.css` | — | Incident detail layout |

**Note:** SOAR child pages embed their **own topbar** inside the page (unlike GRC/Network/Phishing where topbar is in the layout). Layout only provides sidebar.

##### `SOAR/Components/`

| Component | Purpose |
|-----------|---------|
| `DashboardCard/` | Extended KPI card with title, trend arrow, comparison text |
| `DashboardBarChart/` | Bar chart (duplicate of GRC version with SOAR data) |
| `DashboardPieChart/` | Pie chart — **also imported by Network module** |
| `StatsCard/` | Compact stat tile for incident queue header row |
| `IncidentTable/` | Responsive incident queue table with severity, MITRE tags |
| `PlaybookCard/` | Automated playbook suggestions sidebar card |
| `ThreatFeedCard/` | Threat intelligence feed sidebar card |
| `RiskCard/` | Asset risk context sidebar card |
| `AnalystPerformance/` | Analyst performance metrics panel |
| `AutomatedPlayBook/` | Automation ROI / playbook summary panel |
| `Summary/` | Incident summary panel (Incident Management) |
| `InvesigaionTimeline/` | Investigation timeline (typo in folder name) |
| `Actions/` | Incident action buttons panel |

##### `SOAR/Services/IncidentsQueue.js`
Axios service: `getStats()` → `GET http://localhost:3001/stats`

##### `SOAR/Hooks/useIncidentsQueue.js`
Fetches stats on mount; exposes `{ stats, findings, loading, error }`. **Note:** `findings` state is never populated; `stats` from API is not rendered in `IncidentQueue.jsx` (hardcoded `StatsCard` values used instead).

---

#### 2.6.4 `src/features/Network/` — Network Security

```
Network/
├── Pages/
└── Components/
```

##### `Network/Pages/`

| File | Route | Purpose |
|------|-------|---------|
| `Network.jsx` | `/Network/*` layout | Topbar with dynamic page title + threat level badge; sidebar |
| `Network.css` | — | Layout styles (mirrors GRC.css + network-specific badges) |
| `Dashboard.jsx` | `/Network` | Network overview: asset stats, activity chart, top vulnerable assets |
| `Dashboard.css` | — | Dashboard action buttons (Start Scan, Export, etc.) |
| `NetworkDiscovery.jsx` | `/Network/NetworkDiscovery` | Scan config, subnet overview, hosts table |
| `NetworkDiscovery.css` | — | Discovery page styles |
| `PortScanning.jsx` | `/Network/PortScanning` | Port config, scan results, service distribution chart |
| `PortScanning.css` | — | Port scanning styles |
| `PacketCapture.jsx` | `/Network/packetCapture` | Capture controls, live packet stream, protocol chart |
| `AssetInventory.jsx` | `/Network/AssetInventory` | Searchable asset inventory table |
| `AssetInventory.css` | — | Asset inventory search/filter styles |
| `Misconfigurations.jsx` | `/Network/Misconfigurations` | Severity cards, misconfig table, recommendations |
| `FlowMonitoring.jsx` | `/Network/FlowMonitoring` | PPS metrics, traffic flow chart, anomaly alerts |
| `FlowMonitoring.css` | — | Flow monitoring styles |

##### `Network/Components/`

| Component | Purpose |
|-----------|---------|
| `DashboardCard/` | Network KPI card with image icon |
| `DashboardCard2/` | Simplified stat card (Packet Capture) |
| `DashboardCard3/` | Stat card variant (Misconfigurations severity) |
| `DashboardCard4/` | **Misnamed in Network** — not present; `DashboardCard4` lives in Phishing |
| `NetworkActivityChart/` | Line/area chart for 24h network activity |
| `Top Assets/` | Vulnerable asset row (name, score, IP) |
| `ScanConfiguration/` | Network discovery scan settings form |
| `SubnetOverview/` | Subnet summary card |
| `HostsTabel/` | Discovered hosts table (typo: Tabel) |
| `PortConfiguration/` | Port scan target/range configuration |
| `PortResult/` | Port scan results list |
| `DoughnutChart/ServiceDistribution.jsx` | Service distribution doughnut chart |
| `CaptureControl/` | Packet capture start/stop/filter controls |
| `LivePacketStream/` | Simulated live packet log viewer |
| `AssetsTabel/` | Asset inventory data table |
| `MisconfigurationsTabel/` | Misconfiguration findings table |
| `SeverityDistributionChart/` | Severity breakdown chart |
| `UrgentRecommendations/` | Priority remediation recommendations list |
| `TraficFlowChart/` | Traffic baseline vs current chart (typo: Trafic) |
| `AnomalyAlerts/` | Network anomaly alert list |
| `ExfiltrationIndicators/` | Data exfiltration indicator panel |

---

#### 2.6.5 `src/features/Phishing/` — Phishing Simulation

```
Phishing/
├── Pages/
├── Components/
└── EmailTempletCard/   # Top-level component folder (not under Components/)
```

##### `Phishing/Pages/`

| File | Route | Purpose |
|------|-------|---------|
| `Phishing.jsx` | `/Phishing/*` layout | Topbar with "New Campaign" CTA; sidebar |
| `Phishing.css` | — | Layout styles |
| `PhishingDashboard.jsx` | `/Phishing` | Simulation overview: funnel, trends, department risk |
| `PhishingDashboard.css` | — | Dashboard grid styles |
| `Campaigns.jsx` | `/Phishing/Campaigns` | Campaign list table |
| `EmailTemplet.jsx` | `/Phishing/EmailTemplates` | Email template gallery |
| `Recipients.jsx` | `/Phishing/Recipients` | Recipient management with tabs |
| `Recipient.css` | — | Recipients page styles |
| `Reports.jsx` | `/Phishing/Reports` | Analytics reports + export buttons |
| `PhishingSettings.jsx` | `/Phishing/Settings` | Org/email/simulation settings forms |
| `PhishingSettings.css` | — | Settings form styles |

##### `Phishing/Components/`

| Component | Purpose |
|-----------|---------|
| `DashboardCard/` | Simple stat card (Reports page) |
| `DashboardCard4/` | Rich KPI card with trend indicators (primary Phishing metric card) |
| `CampaignTrendChart/` | Campaign performance over time line chart |
| `CampaignFunnel/` | Funnel visualization (sent → opened → clicked → submitted) |
| `DepartmentRisk/` | Department risk summary list |
| `DepartmentRiskChart/` | Department risk bar chart (Reports) |
| `RecentCampaignsTabel/` | Recent campaigns data table |
| `CampaignsTabel/` | Full campaigns table |
| `CampaignPerformanceChart/CampaignComparisonChart.jsx` | Campaign comparison chart |
| `RecipientTabel/` | Recipients data table |
| `TopVulnerableEmployeesTabel/` | High-risk employees table |

##### `Phishing/EmailTempletCard/`
Template preview card used on Email Templates page.

---

#### 2.6.6 `src/features/SIEMIntegration/`

| Path | Purpose |
|------|---------|
| `pages/SIEMIntegration.jsx` | SIEM connection form (protocol, host, port, endpoint, API key) |
| `pages/SIEMIntegration.css` | Styles mirroring login page aesthetic |

Standalone route — **not nested** under any module layout.

---

#### 2.6.7 `src/features/db.json`

Mock JSON database for `json-server`:

```json
{
  "stats": [ /* 4 KPI objects */ ],
  "findings": [ /* 2 GRC remediation findings */ ]
}
```

**Expected endpoints** (when json-server is running on port 3001):
- `GET /stats`
- `GET /findings` (defined in data but **not called** by frontend)

---

### 2.7 Cross-Module Relationships

```
                    ┌─────────────┐
                    │   App.jsx   │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
      ┌─────────┐    ┌──────────┐    ┌───────────┐
      │   GRC   │    │   SOAR   │    │  Network  │
      │ layout  │    │ layout   │    │  layout   │
      └────┬────┘    └────┬─────┘    └─────┬─────┘
           │              │                 │
           │              │    imports DashboardPieChart from SOAR
           │              │◄────────────────┘
           │              │
      Phishing layout      Misconfigurations imports SOAR StatsCard,
                           IncidentTable, PlaybookCard, etc.
```

**Shared dependencies (informal, not a shared library):**
- `Network/Dashboard.jsx` imports `SOAR/Components/DashboardPieChart`
- `Network/PacketCapture.jsx` imports SOAR `DashboardPieChart`
- `Network/Misconfigurations.jsx` imports multiple SOAR components
- `Network/Dashboard.jsx` imports `NetworkActivityChart`, `TopAssets`, etc.

**No formal shared component package** — cross-imports create coupling between feature folders.

---

## 3. Routing / Pages Structure

### 3.1 Complete Route Table

| Path | Component | Layout Parent | Description |
|------|-----------|---------------|-------------|
| `/` | `Login` | — | Login / landing page |
| `/SIEMIntegration` | `SIEMIntegration` | — | SIEM vendor connection form |
| `/GRC` | `GRCDashboard` | `GRC` | GRC default dashboard |
| `/GRC/Audits` | `GRCAudits` | `GRC` | Active audits & control accordions |
| `/GRC/Standards` | `GRCStandards` | `GRC` | Compliance standards library |
| `/GRC/Remediation` | `GRCRemediation` | `GRC` | Remediation task tracking |
| `/GRC/Settings` | `GRCSettings` | `GRC` | Profile, users, integrations tabs |
| `/SOAR` | `SoarAnalytics` | `Soar` | SOAR analytics (default child) |
| `/SOAR/Analytics` | `SoarAnalytics` | `Soar` | Duplicate route to same page |
| `/SOAR/IncidentsQueue` | `IncidentQueue` | `Soar` | Unified incident queue |
| `/SOAR/IncidentManagement` | `IncidentManagement` | `Soar` | Single incident investigation view |
| `/Network` | `Dashboard` | `Network` | Network security dashboard |
| `/Network/NetworkDiscovery` | `NetworkDiscovery` | `Network` | Host/subnet discovery |
| `/Network/PortScanning` | `PortScanning` | `Network` | Port scan results |
| `/Network/packetCapture` | `PacketCapture` | `Network` | Live packet capture (**lowercase 'p'**) |
| `/Network/AssetInventory` | `AssetInventory` | `Network` | Asset inventory |
| `/Network/Misconfigurations` | `Misconfigurations` | `Network` | Security misconfigurations |
| `/Network/FlowMonitoring` | `FlowMonitoring` | `Network` | Traffic flow & anomalies |
| `/Phishing` | `PhishingDashboard` | `Phishing` | Phishing simulation dashboard |
| `/Phishing/Campaigns` | `Campaigns` | `Phishing` | Campaign management |
| `/Phishing/EmailTemplates` | `EmailTemplet` | `Phishing` | Template library |
| `/Phishing/Recipients` | `Recipients` | `Phishing` | Recipient lists & groups |
| `/Phishing/Reports` | `Reports` | `Phishing` | Reporting & exports |
| `/Phishing/Settings` | `PhishingSettings` | `Phishing` | Platform settings |

**Total routable pages:** 22 (including login and SIEM)

### 3.2 Known Routing Issues

| Issue | Details |
|-------|---------|
| **SOAR case mismatch** | `App.jsx` defines `/SOAR`; sidebar `NavItem` links use `/Soar/...`. May work on case-insensitive dev servers but is inconsistent. |
| **Packet Capture path** | Route: `/Network/packetCapture`; sidebar link: `/Network/PacketCapture` — **broken navigation** on case-sensitive systems. |
| **SOAR Settings** | Sidebar links to `/Soar/settings` — **no matching route** in `App.jsx`. |
| **Logo home links** | Network, Phishing, GRC logos link to `/GRC` regardless of current module. |
| **No 404 route** | Unknown paths render blank / router error. |
| **No auth guard** | All module routes accessible without login. |

### 3.3 Navigation Flow Diagram

```
                              ┌──────────┐
                              │  Login   │
                              │    /     │
                              └────┬─────┘
                                   │ (no wired navigation)
           ┌───────────────────────┼───────────────────────┐
           ▼                       ▼                       ▼
    ┌─────────────┐         ┌─────────────┐         ┌──────────────┐
    │     GRC     │         │    SOAR     │         │   Network    │
    │  Dashboard  │         │  Analytics  │         │  Dashboard   │
    └──────┬──────┘         └──────┬──────┘         └──────┬───────┘
           │                       │                       │
    Audits │ Standards             │ IncidentsQueue        │ Discovery
    Remediation │ Settings         │ IncidentManagement    │ PortScanning
           │                       │                       │ PacketCapture
           │                       │                       │ AssetInventory
           │                       │                       │ Misconfigurations
           │                       │                       │ FlowMonitoring
           │                       │                       │
           │                ┌──────┴──────┐                │
           │                │  Investigate │◄───────────────┘ (conceptual)
           │                │   button     │   (not wired)
           │                └─────────────┘
           │
    ┌──────┴──────┐         ┌──────────────┐
    │  Phishing   │         │ SIEM Integr. │
    │  Dashboard  │         │ /SIEMIntegr. │
    └──────┬──────┘         └──────────────┘
           │
    Campaigns → EmailTemplates → Recipients → Reports → Settings
```

**Inter-module navigation:** There is **no global module switcher** (e.g., dropdown to jump GRC → SOAR). Users must manually change the URL. Header branding consistently says "LumiSec" but links to GRC.

---

## 4. Components Architecture

### 4.1 Classification Overview

| Category | Description | Examples |
|----------|-------------|----------|
| **Layout Components** | Shell, sidebar, topbar, outlet wrappers | `GRC.jsx`, `Network.jsx`, `Phishing.jsx`, `Soar.jsx` |
| **Page Components** | Route-matched screens composing feature UI | `GRCDashboard`, `IncidentQueue`, `PortScanning` |
| **Feature Components** | Domain-specific widgets tied to a security module | `IncidentTable`, `ScanConfiguration`, `CampaignFunnel` |
| **UI Components** | Generic presentational building blocks | `DashboardCard` variants, `StatsCard`, modals |
| **Shared/Reusable** | Used across modules (informal sharing) | `DashboardPieChart` (SOAR → Network), SOAR cards in Misconfigurations |

---

### 4.2 Layout Components

#### `GRC` (`GRC/pages/GRC.jsx`)
| Aspect | Detail |
|--------|--------|
| **Purpose** | GRC module shell with fixed topbar + collapsible sidebar |
| **State** | `collapsed: boolean` — sidebar width toggle |
| **Used at** | All `/GRC/*` routes via `<Outlet />` |
| **Dependencies** | `react-router-dom`, `lucide-react`, Bootstrap offcanvas, `GRC.css` |
| **Props** | None (layout route component) |

#### `Soar` (`SOAR/Pages/Soar.jsx`)
| Aspect | Detail |
|--------|--------|
| **Purpose** | SOAR sidebar-only layout; child pages own their headers |
| **State** | `collapsed`; passed to children via `<Outlet context={{ collapsed, setCollapsed }}>` |
| **Used at** | All `/SOAR/*` routes |
| **Exports** | `SidebarLinks` (used implicitly by offcanvas) |

#### `Network` (`Network/Pages/Network.jsx`)
| Aspect | Detail |
|--------|--------|
| **Purpose** | Network module shell with threat-level topbar |
| **State** | `collapsed`, `title` (dynamic page title from child via outlet context) |
| **Outlet context** | `{ title, setTitle }` — children call `setTitle("Page Name")` on render |
| **Unique UI** | "System Active" badge, "Threat Level: High", date display |

#### `Phishing` (`Phishing/Pages/Phishing.jsx`)
| Aspect | Detail |
|--------|--------|
| **Purpose** | Phishing module shell |
| **Unique UI** | "New Campaign" header button, notification bell |

---

### 4.3 UI Components — Dashboard Cards

Multiple parallel implementations exist (technical debt):

#### GRC `DashboardCard`
```jsx
Props: { icon: string (image path), Statistics: string, text: string }
Used in: GRCDashboard
```

#### SOAR `DashboardCard`
```jsx
Props: {
  icon: ReactNode,
  title: string,
  Statistics: string,
  arrow: ReactNode,
  arrowDirection: 'up' | 'down' (CSS class),
  text1: string,    // e.g. "-8%"
  desc1: string,    // e.g. "vs last period"
  text2: string     // subtitle
}
Used in: SoarAnalytics
```

#### Network `DashboardCard`
```jsx
Props: { icon: string, Statistics: string, text: string }
Used in: Network Dashboard
```

#### Phishing `DashboardCard4`
```jsx
Props: {
  icon: string,
  title: string,
  Statistics: string,
  text2: string,   // secondary metric
  text3: string,   // trend indicator
  text4: string    // trend period label
}
Used in: PhishingDashboard, FlowMonitoring (cross-module)
```

#### SOAR `StatsCard`
```jsx
Props: { title, statistics, desc, icon? }
Used in: IncidentQueue, Misconfigurations (Network)
```

#### Network `DashboardCard2` / `DashboardCard3`
Simplified variants for Packet Capture and Misconfigurations severity rows.

**Shared styling:** `.dashboard-card` class — dark container `#1B202D` (`--container-background`), `3px solid #2A3042` border, rounded corners.

---

### 4.4 Feature Components — Complete Inventory

#### GRC Components

| Component | Purpose | Props | Used In |
|-----------|---------|-------|---------|
| `AuditCard` | Audit progress summary | `title`, `desc`, `progrssText` | GRCAudits |
| `AuditAccordion` | Collapsible control section | `title`, `id` | GRCAudits |
| `StandardsCard` | Framework compliance card | `backgroundColor`, `type`, `title`, `desc`, `progressTitle`, `progressPercent`, `Controls` | GRCStandards |
| `AddStandardModal` | Modal to add standard | — (Bootstrap modal) | GRCStandards |
| `RemedationTabel` | Findings table | — (static rows) | GRCRemediation |
| `AddTaskRemediationModal` | New task form modal | — | GRCRemediation |
| `ProfileModal` | User profile form | — | GRCSettings |
| `DashboardBarChart` | Bar chart | — (internal data) | GRCDashboard |
| `DashboardPieChart` | Pie chart | — (internal data) | GRCDashboard |

#### SOAR Components

| Component | Purpose | Used In |
|-----------|---------|---------|
| `IncidentTable` | Responsive incident queue table | IncidentQueue, Misconfigurations |
| `PlaybookCard` | Suggested playbook actions | IncidentQueue, Misconfigurations |
| `ThreatFeedCard` | Threat intel feed | IncidentQueue, Misconfigurations |
| `RiskCard` | Asset risk context | IncidentQueue, Misconfigurations |
| `AnalystPerformance` | Analyst KPI panel | SoarAnalytics |
| `AutomatedPlayBook` | Automation summary | SoarAnalytics |
| `Summary` | Incident metadata sidebar | IncidentManagement |
| `InvesigaionTimeline` | Event timeline | IncidentManagement |
| `Actions` | Response action panel | IncidentManagement |
| `DashboardBarChart` | Analytics bar chart | SoarAnalytics |
| `DashboardPieChart` | Analytics pie chart | SoarAnalytics, Network Dashboard, PacketCapture |

#### Network Components

| Component | Purpose | Used In |
|-----------|---------|---------|
| `ScanConfiguration` | Discovery scan settings | NetworkDiscovery |
| `SubnetOverview` | Subnet card | `title`, `status`, `text` — NetworkDiscovery |
| `HostsTabel` | Hosts data table | NetworkDiscovery |
| `PortConfiguration` | Port scan settings | PortScanning |
| `PortResult` | Scan result rows | PortScanning |
| `ServiceDistribution` | Doughnut chart | PortScanning |
| `CaptureControl` | Capture UI controls | PacketCapture |
| `LivePacketStream` | Packet log stream | PacketCapture |
| `NetworkActivityChart` | 24h activity chart | Dashboard |
| `TopAssets` | Vulnerable asset row | `title`, `number`, `text` — Dashboard |
| `AssetsTabel` | Asset inventory table | AssetInventory, Misconfigurations |
| `MisconfigurationsTabel` | Misconfig findings | Misconfigurations |
| `SeverityDistributionChart` | Severity chart | Misconfigurations |
| `UrgentRecommendations` | Recommendation list | Misconfigurations |
| `TraficFlowChart` | Traffic baseline chart | FlowMonitoring |
| `AnomalyAlerts` | Anomaly list | FlowMonitoring |
| `ExfiltrationIndicators` | Exfiltration panel | FlowMonitoring |

#### Phishing Components

| Component | Purpose | Used In |
|-----------|---------|---------|
| `CampaignTrendChart` | Trend line chart | PhishingDashboard |
| `CampaignFunnel` | Conversion funnel | PhishingDashboard |
| `DepartmentRisk` | Department list | PhishingDashboard |
| `DepartmentRiskChart` | Department bar chart | Reports |
| `RecentCampaignsTabel` | Recent campaigns | PhishingDashboard |
| `CampaignsTabel` | All campaigns | Campaigns |
| `CampaignComparisonChart` | Campaign comparison | Reports |
| `RecipientTabel` | Recipients table | Recipients |
| `TopVulnerableEmployeesTabel` | Risk employees | Reports |
| `EmailTempletCard` | Template preview card | EmailTemplet |

---

### 4.5 Component Behavior Patterns

1. **Static data:** ~95% of components render hardcoded JSX — no props for row data from parent.
2. **Bootstrap interactivity:** Modals (`data-bs-toggle="modal"`), tabs (`data-bs-toggle="tab"`), offcanvas sidebars — rely on Bootstrap JS bundled in `index.js`.
3. **Charts:** Each chart component registers Chart.js scales internally and defines datasets inline.
4. **Responsive tables:** `IncidentTable` uses `data-label` attributes for mobile stacked layout.
5. **Side effect on render:** Network child pages call `setTitle(...)` directly in component body (not `useEffect`) — works but triggers React strict-mode double-render warnings.

---

## 5. State Management

### 5.1 Global State

**None implemented.** The application does not use:
- Redux / Redux Toolkit
- Zustand
- Jotai / Recoil
- React Context for app-wide data (except router outlet context)

### 5.2 Local Component State (`useState`)

| Location | State | Purpose |
|----------|-------|---------|
| `GRC.jsx` | `collapsed` | Sidebar collapse |
| `Network.jsx` | `collapsed`, `title` | Sidebar + dynamic header title |
| `Phishing.jsx` | `collapsed` | Sidebar collapse |
| `Soar.jsx` | `collapsed` | Sidebar collapse (shared via outlet) |
| `useIncidentsQueue` | `stats`, `findings`, `loading`, `error` | API fetch lifecycle |

### 5.3 Router Outlet Context

| Parent | Context Shape | Consumers |
|--------|---------------|-----------|
| `Network.jsx` | `{ title, setTitle }` | Dashboard, NetworkDiscovery, PortScanning, PacketCapture, AssetInventory |
| `Soar.jsx` | `{ collapsed, setCollapsed }` | SoarAnalytics, IncidentQueue, IncidentManagement |

This is **UI state only** — not authentication or domain data.

### 5.4 API State Handling

Only `useIncidentsQueue` implements async state:

```javascript
// Pattern used (simplified)
const [stats, setStats] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => { loadData(); }, []);

// Issues:
// - findings never fetched from /findings
// - stats not consumed in IncidentQueue UI
// - useCallback dependency array includes [stats] (stale closure risk)
// - console.log(stats) left in production code
```

**No caching layer** (React Query, SWR, RTK Query). No request deduplication. No optimistic updates.

---

## 6. API Integration Layer

### 6.1 Current Backend Connection

| Aspect | Status |
|--------|--------|
| Production API URL | **Not configured** |
| Environment variables (`.env`) | **None present** |
| API client singleton | **Not implemented** |
| Interceptors (auth, errors) | **None** |

### 6.2 Existing Service Layer

**File:** `src/features/SOAR/Services/IncidentsQueue.js`

```javascript
const baseURL = "http://localhost:3001";

export async function getStats() {
  const response = await axios.get(baseURL + "/stats");
  return response.data;
}
```

| Endpoint | Method | Used By | Response Shape |
|----------|--------|---------|----------------|
| `/stats` | GET | `useIncidentsQueue` | Array of `{ id, title, value, change, type }` |
| `/findings` | GET | **Not used** | Array of remediation findings in `db.json` |

### 6.3 Mock Data (`db.json`)

Located at `src/features/db.json`. To serve locally:

```bash
# Not in package.json scripts — must run manually:
npx json-server --watch src/features/db.json --port 3001
```

### 6.4 Authentication Handling

| Concern | Implementation |
|---------|----------------|
| JWT storage | **None** |
| Refresh tokens | **None** |
| Authorization headers | **None** |
| Axios interceptors | **None** |
| CSRF | **None** |

### 6.5 Error Handling Strategy

| Layer | Behavior |
|-------|----------|
| API service | Errors propagate to hook `catch` → `setError(error)` |
| Hook consumers | `IncidentQueue` does **not** render loading/error UI |
| Forms | No submit handlers — no validation or error display |
| Global error boundary | **Not implemented** |

**Recommendation gap:** No toast/notification system, no retry logic, no user-facing error messages.

---

## 7. Authentication Flow

### 7.1 Login Flow (Current — UI Only)

```
User visits /
    → Login.jsx renders
    → User fills email/password (uncontrolled inputs — no React state)
    → "Sign in" button (type=submit but form has no onSubmit)
    → Nothing happens — no navigation, no API call
```

| UI Element | Behavior |
|------------|----------|
| Email input | `placeholder="you@organization.org"` |
| Password input | `placeholder="Your secure password"` |
| Remember me | Checkbox — no persistence |
| Forgot password | `<Link>` with **no `to` prop** — broken |
| Sign in button | No handler |
| SSO button | No handler |
| Terms / Privacy | Styled spans — not links |

### 7.2 Register Flow

**Not implemented.** No `/register` route or component.

### 7.3 Token Storage

**Not implemented.** No `localStorage`, `sessionStorage`, or cookie usage anywhere in `src/`.

### 7.4 Route Protection

**Not implemented.** All module routes (`/GRC`, `/SOAR`, etc.) are publicly accessible. No `ProtectedRoute` wrapper, no redirect-to-login logic.

### 7.5 Role-Based Access Control (RBAC)

**UI hints only** (hardcoded display text):

| Location | Displayed Role |
|----------|----------------|
| GRC header | "0xMOSTA" / "Lead Auditor" |
| IncidentQueue header | "Mohamed Atef" / "Lead Security Analyst (Tier III)" |

No permission checks, no role-based menu hiding, no feature flags.

### 7.6 Intended Flow (Assumption)

Based on login page copy ("institution credentials", "audit logs", SSO):

```
1. User authenticates via email/password OR SSO (IdP)
2. Backend returns JWT + user profile + roles
3. Frontend stores token securely
4. Axios interceptor attaches Authorization: Bearer <token>
5. Router guard checks token before module routes
6. Role determines visible modules (GRC vs SOAR vs Network)
```

---

## 8. Theme System

### 8.1 Design Philosophy

LumiSec uses a **dark-first cybersecurity aesthetic**:
- Deep navy/charcoal backgrounds
- Purple-to-blue gradient accents (primary brand)
- Red/orange for danger and critical severity
- Green for success and healthy states
- High contrast white headings with muted gray body text

**Light mode:** **Not implemented.** No theme toggle, no `prefers-color-scheme` handling.

### 8.2 CSS Architecture

| Layer | Technology |
|-------|------------|
| Framework | Bootstrap 5 utilities + grid |
| Custom CSS | Per-component `.css` files co-located with `.jsx` |
| CSS Variables | `src/styles/variables.css` (partially adopted) |
| CSS Modules | **Not used** |
| Tailwind | **Not used** |
| SCSS | **Not used** |

### 8.3 CSS Custom Properties (`variables.css`)

```css
:root {
  --light-purple: #A5B4FC;      /* Accent text, purple labels */
  --dark-background: #111827b5; /* Semi-transparent panels (login) */
  --screen-background: #10141F; /* Main content area background */
  --container-background: #1B202D; /* Cards, tables, modals */
}
```

**Import chain:** Only `login.css` and `SIEMIntegration.css` import `variables.css`. Module layouts duplicate hex values instead of using variables.

### 8.4 Complete Color Palette

#### Primary & Brand

| Token / Usage | Hex | Where Used |
|---------------|-----|------------|
| Primary gradient start | `#7F56D9` | Logo text, active sidebar, buttons, progress |
| Primary gradient end | `#539BFF` | Logo text, active sidebar, profile border |
| Light purple accent | `#A5B4FC` (`--light-purple`) | `.text-purple` headings, links |
| Purple border accent | `#553399` | Topbar bottom border, modal borders |
| Blue accent | `#3B82F6` | Stat highlight text |
| Violet chart | `#4F46E5` | GRC bar chart bars |
| Blue Violet | `#8A2BE2` | Login form border |

#### Backgrounds

| Token | Hex | Usage |
|-------|-----|-------|
| Screen background | `#10141F` | Main content (`--screen-background`) |
| Container / card | `#1B202D` | Cards, tables (`--container-background`) |
| Topbar | `#1B202D` | Fixed header |
| Table header | `#252B3A` | Table `<thead>` |
| Input background | `#10141F` / `#1F2937` | Search inputs, form fields |
| Form panel dark | `#0B0E15` | Login/SIEM form background |
| Overlay panel | `#111827` / `#111827b5` | Info panels, offcanvas |
| Select dropdown | `#44546B` | SOAR date select |

#### Borders

| Hex | Usage |
|-----|-------|
| `#2A3042` | Card borders, sidebar divider, table borders |
| `#374151` | Input borders |
| `#1F2937` | Panel borders, separator lines |
| `#64748B` | Port result borders |
| `#6c757d` | Dashed upload zones (modals) |

#### Text

| Hex | Usage |
|-----|-------|
| `#FFFFFF` / `text-white` | Headings, primary values |
| `#9DA3B0` | Secondary labels, sidebar inactive links |
| `#9CA3AF` | Input placeholders |
| `#94A3B8` | Muted metadata |
| `#D1D5DB` | Remember me label |
| `#8f9bb8` | Queue page secondary text |
| `#C9D1D9` | Icon tints |

#### Semantic / Status

| Status | Hex | Usage |
|--------|-----|-------|
| Danger red | `#DC2626` / `#EF4444` | Sign-in button, critical badges |
| Error red | `#D92D20` | High-risk table cells |
| Warning orange | `#F59E0B` / `#F79009` | Medium severity, warning badges |
| Warning bg | `#F59E0B40` / `#F8A30656` | Threat level badges |
| Success green | `#10B981` / `#059669` | System active, resolved, open ports |
| Success bg | `#10b98140` | Badge backgrounds |
| Cyan accent | `#06B6D4` / `#00D4FF` | Threat shield icon, port highlights |
| Yellow MITRE | `#DBAB09` | Bot/automation icon |
| SIEM gradient | `#9333EA` → `#0891B2` | Connect button |
| Login title gradient | `#EF4444` → `#818CF8` | "Sign in" heading |

#### Standards Card Colors (GRC)

| Framework | Hex |
|-----------|-----|
| ISO | `#7F56D9` |
| PCI | `#539BFF` |
| SOC 2 | `#059669` |
| NIST | `#F79009` |

### 8.5 Typography

| Element | Style |
|---------|-------|
| Font family | System stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, ...` |
| Logo / page titles | Gradient text, no custom web font loaded |
| Headings | Bootstrap defaults + `text-white` |
| Body secondary | `text-secondary` (Bootstrap gray) or custom `#9DA3B0` |
| Code | `source-code-pro, Menlo, Monaco, Consolas` |

**No explicit type scale** — sizes via Bootstrap (`h1`–`h6`, `fs-5`, etc.).

### 8.6 Spacing

| Pattern | Value |
|---------|-------|
| Content padding | `20px` (`.content`) |
| Topbar height | `70px` fixed |
| Sidebar width | `260px` expanded / `80px` collapsed |
| Sidebar link height | `48px` |
| Card border radius | `rounded-4` (~16px Bootstrap), `rounded-3` for smaller |
| Grid gutters | `g-3`, `g-4` Bootstrap spacing |
| Card padding | `p-3`, `py-4` typical |

### 8.7 Borders & Shadows

| Pattern | Value |
|---------|-------|
| Card border | `3px solid #2A3042` (most cards) |
| Topbar border | `2px solid #553399` |
| Profile avatar border | `2px solid #539BFF` |
| Login panel shadow | `rgba(0,0,0,0.35) 0px 5px 15px` |
| Modal border | `3px solid #553399` |

### 8.8 Gradients (Primary UI Motif)

```css
/* Brand gradient — used for logo, active nav, CTA buttons */
background: linear-gradient(90deg, #7F56D9, #539BFF);

/* Login/SIEM headline */
background: linear-gradient(90deg, #EF4444, #818CF8);

/* SIEM connect button */
background: linear-gradient(90deg, #9333EA, #0891B2);
```

### 8.9 UI Consistency Rules (Observed)

1. **Dashboard cards** use `--container-background` with `#2A3042` border.
2. **Active sidebar link** always uses purple-blue gradient fill.
3. **Primary actions** use `.add-btn` — gradient background (defined in module CSS).
4. **Tables** use dark header row `#252B3A`, body rows on container background.
5. **Search inputs** reuse `.header-search-input` with icon overlay pattern.
6. **Severity badges** follow color coding: red=critical, orange=high, green=healthy.

### 8.10 Background Imagery

- `background.png` used on login page and sidebar (`background-image` with `cover`)
- Decorative PNG icons per metric card rather than inline SVG (except Lucide)

---

## 9. Missing Features vs Backend

> **Note:** No LumiSec backend repository exists in this workspace. This section compares the **current frontend implementation** against (a) the mock `db.json` schema, (b) implied platform capabilities from UI copy and module structure, and (c) standard expectations for a hybrid cybersecurity platform. Items marked **(assumption)** are inferred from industry patterns and UI placeholders.

### 9.1 API Endpoints: Defined but Unused

| Endpoint (mock) | Data | Frontend Status |
|-----------------|------|-----------------|
| `GET /stats` | SOAR KPI stats | Called by hook but **UI ignores response** — hardcoded values shown |
| `GET /findings` | GRC remediation findings | **Never called** — table uses static JSX |

### 9.2 Module Integration Gaps

| Module | UI Built | Backend Integration |
|--------|----------|---------------------|
| Auth / Login | ✅ | ❌ No login API, SSO, session |
| GRC Dashboard | ✅ | ❌ No compliance score API |
| GRC Audits | ✅ | ❌ No audit CRUD, no control checklist persistence |
| GRC Standards | ✅ | ❌ No standards API; modal doesn't submit |
| GRC Remediation | ✅ | ❌ `/findings` not wired; modal doesn't submit |
| GRC Settings | ⚠️ Partial | Profile form static; User Management & Integrations tabs are placeholder text |
| SOAR Analytics | ✅ | ❌ All metrics hardcoded |
| SOAR Incident Queue | ✅ | ⚠️ Partial — only `/stats` fetched, unused |
| SOAR Incident Management | ✅ | ❌ No incident detail API, actions non-functional |
| SOAR Settings | ❌ Route missing | Sidebar link exists, no page |
| Network (all pages) | ✅ | ❌ No scanner/agent APIs |
| Phishing (all pages) | ✅ | ❌ No campaign/email/recipient APIs |
| SIEM Integration | ✅ | ❌ Connect/Test/Save buttons have no handlers |

### 9.3 Missing Screens (Expected for Full Platform) — (Assumption)

| Missing Screen | Rationale |
|----------------|-----------|
| Global landing / module picker | No post-login home; modules only via URL |
| User registration / onboarding | Not in routes |
| Admin / RBAC management | GRC Settings tab is placeholder |
| Audit log viewer | Mentioned in login copy, no UI |
| Notification center | Bell icon present, no panel |
| Real-time WebSocket dashboards | Live packet stream is static simulation |
| Dark web monitoring | SIEM page tagline only |
| API keys / vault management | SIEM mentions vault, no UI |
| 404 / error pages | Not implemented |

### 9.4 Missing Infrastructure

| Concern | Status |
|---------|--------|
| `.env` / environment config | Missing |
| Centralized `apiClient` | Missing |
| OpenAPI / Swagger client generation | Missing |
| WebSocket client | Missing |
| File upload (CSV import) | Button UI only (Recipients) |
| PDF/Excel export | Button UI only (Reports, SOAR) |
| i18n / localization | Missing |
| Unit/integration tests for features | Only default App.test.js |

### 9.5 Backend Features Likely Expected (Assumption)

Based on the platform description ("Hybrid Cybersecurity Simulation and Real-Time Response"):

```
Authentication Service     → JWT, SSO, RBAC, audit logging
GRC Service               → Standards, controls, audits, evidence upload
SOAR Service              → Incidents, playbooks, MITRE mapping, automation
Network Agent API         → Discovery, port scan, packet capture, flow data
Phishing Service          → Campaigns, templates, tracking pixels, reporting
SIEM Connector            → Ingestion endpoint validation, credential vault
Notification Service      → Alerts, bell icon feed
Reporting Service         → PDF/Excel generation
```

**None of these are connected** in the current frontend beyond the single unused `/stats` fetch.

---

## 10. Security Features UI

### 10.1 Dashboards

| Dashboard | Route | Key Metrics Displayed |
|-----------|-------|----------------------|
| GRC Dashboard | `/GRC` | Compliance %, non-compliant controls, remediation tasks, active audits |
| SOAR Analytics | `/SOAR` | MTTR, MTTR resolve, incidents resolved, false positive rate, automation ROI |
| Network Dashboard | `/Network` | Total assets, active hosts, open ports, alerts, threats |
| Phishing Dashboard | `/Phishing` | Active campaigns, emails sent, open/click/submit rates, GRC risks |

All metrics are **static mock values**.

### 10.2 Alerts System

| UI Element | Location | Functional? |
|------------|----------|-------------|
| Notification bell icon | GRC, Phishing headers | ❌ No dropdown/panel |
| Network "Alerts: 23" card | Network Dashboard | ❌ Display only |
| Anomaly Alerts panel | Flow Monitoring | ❌ Static list |
| Threat Level: High badge | Network topbar | ❌ Hardcoded |
| Exfiltration Indicators | Flow Monitoring | ❌ Static |

### 10.3 Logs View

| UI Element | Location | Functional? |
|------------|----------|-------------|
| Live Packet Stream | Packet Capture | Simulated static log entries |
| Investigation Timeline | Incident Management | Static timeline events |
| Audit log reference | Login marketing copy | No dedicated logs page |

### 10.4 Monitoring UI

| Feature | Page | Components |
|---------|------|------------|
| Network activity (24h) | Network Dashboard | `NetworkActivityChart` |
| Traffic flow baseline | Flow Monitoring | `TraficFlowChart` |
| PPS metrics | Flow Monitoring | `DashboardCard4` × 4 |
| Service distribution | Port Scanning | `ServiceDistribution` doughnut |
| Threat feed | Incident Queue | `ThreatFeedCard` |
| Subnet/host discovery | Network Discovery | `SubnetOverview`, `HostsTabel` |

### 10.5 Role Permissions UI

| Feature | Status |
|---------|--------|
| Role display in header | Hardcoded username/role text |
| Permission-gated routes | Not implemented |
| User Management tab | Placeholder: text "User Management" only |
| Institution authorization mention | Login copy only |

### 10.6 Incident Response UI (SOAR)

| Feature | Component | Actions |
|---------|-----------|---------|
| Incident queue table | `IncidentTable` | "Investigate" button (no navigation wired) |
| Playbook suggestions | `PlaybookCard` | Display only |
| Incident detail | `IncidentManagement` | Status/assign dropdowns, "Close Incident" button — no handlers |
| MITRE ATT&CK tags | `IncidentTable` | Static T1486, T1059, etc. |
| Automation bot status | `IncidentTable` | "Pending Admin Approval" display |

### 10.7 Compliance UI (GRC)

| Feature | Component |
|---------|-----------|
| ISO 27001 audit tracking | `AuditCard`, `AuditAccordion` |
| Multi-framework standards | `StandardsCard` × 4 |
| Remediation workflow | `RemedationTabel`, `AddTaskRemediationModal` |
| Evidence upload zone | Modal dashed border area (non-functional) |

### 10.8 Phishing Simulation UI

| Feature | Page |
|---------|------|
| Campaign funnel | PhishingDashboard |
| Department risk heatmap | PhishingDashboard, Reports |
| Email template gallery | EmailTemplet |
| Recipient CSV import | Recipients (button only) |
| GRC risk pipeline link | Dashboard card "Risks Created → In GRC pipeline" |

---

## 11. Performance & Optimization

### 11.1 Lazy Loading

**Not implemented.**

- All 27+ page components are **statically imported** in `App.jsx`
- No `React.lazy()` or `Suspense` boundaries anywhere in `src/`
- Initial bundle includes every module (GRC + SOAR + Network + Phishing + SIEM)

### 11.2 Code Splitting

| Mechanism | Status |
|-----------|--------|
| Route-based splitting | ❌ |
| Component-level dynamic import | ❌ |
| CRA default chunking | ✅ Webpack splits vendors automatically on `build` only |

### 11.3 API Caching

**Not implemented.** Single `useEffect` fetch with no cache, stale-while-revalidate, or deduplication.

### 11.4 Rendering Strategy

| Aspect | Approach |
|--------|----------|
| Rendering mode | Client-side only (CSR) — standard CRA |
| SSR / SSG | Not used |
| Strict Mode | Enabled in `index.js` (double-render in dev) |
| Memoization | No `React.memo`, `useMemo`, or `useCallback` (except broken dep in hook) |
| List virtualization | Not used (tables are small static datasets) |

### 11.5 Asset Optimization

| Aspect | Status |
|--------|--------|
| Image formats | PNG only — no WebP/AVIF |
| Icon strategy | Mixed: Lucide (tree-shakeable) + Font Awesome (full CSS) + many PNG icons |
| Background images | Large `background.png` loaded per layout sidebar |
| Chart.js | Full chart registration per component instance |

### 11.6 Web Vitals

`reportWebVitals()` is called in `index.js` with default noop — **not sent to analytics**.

### 11.7 Recommended Optimizations (For Future Work)

1. `React.lazy()` per feature module in `App.jsx`
2. Replace Font Awesome bulk import with tree-shaken icon imports
3. Consolidate duplicate `DashboardCard` implementations
4. Introduce React Query for API caching and loading states
5. Convert repeated PNG icons to Lucide SVG components
6. Add `useEffect` for `setTitle` instead of render-body calls
7. Configure `json-server` script in `package.json` for dev workflow

---

## 12. Full Design Summary

### 12.1 UI Style

LumiSec presents as a **professional dark-mode security operations console** inspired by modern SOC/SIEM dashboards:

- **Layout:** Fixed topbar (70px) + left sidebar (collapsible) + scrollable content
- **Density:** Medium — cards and tables with comfortable padding
- **Iconography:** Mixed Lucide line icons (navigation) + Font Awesome (actions) + custom PNG decorations (metrics)
- **Data visualization:** Chart.js for bar, line, and doughnut charts with dark-friendly default colors
- **Forms:** Dark inputs with subtle borders; gradient primary buttons; Bootstrap modals for create flows
- **Responsive:** Bootstrap breakpoints; sidebar becomes offcanvas on `< lg`; tables stack on mobile (incident table)

### 12.2 Visual Identity

| Element | Identity |
|---------|----------|
| **Brand name** | LumiSec |
| **Tagline** | "A Hybrid Cybersecurity Simulation and Real-Time Response Platform" |
| **Primary colors** | Purple (`#7F56D9`) + Blue (`#539BFF`) gradient |
| **Accent** | Lavender text (`#A5B4FC`), red CTA on login (`#DC2626`) |
| **Mood** | Serious, technical, high-stakes — appropriate for security tooling |
| **Logo** | `LumiSecLogoB` wordmark image with gradient "LumiSec" text in headers |

### 12.3 User Experience Flow

**Current (developer/demo flow):**

```
1. Land on Login (/) — visual only
2. Manually navigate to /GRC, /SOAR, /Network, or /Phishing
3. Use sidebar to explore sub-pages within module
4. Interact with Bootstrap modals/tabs (no persistence)
5. SOAR Incident Queue may silently fail API fetch if json-server not running
```

**Intended (assumption):**

```
1. Login → authenticate → module picker based on role
2. Analyst → SOAR incident queue → investigate → manage incident
3. Auditor → GRC audits → remediation tracking
4. Network engineer → discovery → scan → review misconfigurations
5. Training admin → Phishing campaigns → reports → export
6. Admin → SIEM integration → settings
```

### 12.4 Component Consistency

| Consistent | Inconsistent |
|------------|--------------|
| Dark card pattern across modules | Four different `DashboardCard` implementations |
| Gradient active sidebar link | SOAR uses Font Awesome in sidebar; others use Lucide |
| `.dashboard-card` container style | SOAR pages have own topbar; GRC/Network/Phishing share layout topbar |
| Bootstrap grid for page layout | Folder naming: `components/` vs `Components/`, `Pages/` vs `pages/` |
| Search input pattern in headers | Route casing: `/SOAR` vs `/Soar`, `/packetCapture` vs `/PacketCapture` |
| `add-btn` gradient for primary actions | Logo links always go to `/GRC` |

### 12.5 Module UX Signatures

| Module | UX Character |
|--------|--------------|
| **GRC** | Compliance officer workflow — audits, standards cards, remediation tables |
| **SOAR** | Analyst-centric — incident queue hero, MITRE tags, investigation detail view |
| **Network** | Operator console — threat level header, scan triggers, technical tables |
| **Phishing** | Campaign manager — funnel metrics, template gallery, recipient lists |
| **SIEM** | Setup wizard — mirrors login page layout for integration config |

### 12.6 Development Conventions (Observed)

| Convention | Pattern |
|------------|---------|
| File naming | PascalCase for components, camelCase for hooks/services |
| Styling | Co-located `.css` file per component/page |
| Routing | Nested routes with layout parent + `<Outlet />` |
| Assets | Relative imports from `../../../assets/` |
| Bootstrap | Heavy use of utility classes (`d-flex`, `rounded-4`, `text-white`) |
| JSX attribute | Some `class` instead of `className` (invalid React — should be fixed) |

---

## Appendix A: Quick Reference — npm Scripts

```bash
npm start    # Dev server at http://localhost:3000
npm build    # Production build → build/
npm test     # Jest + Testing Library (watch mode)
npm eject    # Eject CRA (irreversible)
```

**Mock API (manual):**
```bash
npx json-server --watch src/features/db.json --port 3001
```

---

## Appendix B: Key Files for New Developers

| Task | Start Here |
|------|------------|
| Add a new route | `src/App.jsx` |
| Understand GRC layout | `src/features/GRC/pages/GRC.jsx` + `GRC.css` |
| Wire API calls | Create `src/services/apiClient.js` (recommended), extend pattern from `SOAR/Services/` |
| Theme tokens | `src/styles/variables.css` — expand and import globally |
| Auth implementation | `src/features/auth/pages/Login.jsx` + new `ProtectedRoute` wrapper |
| Charts | Any `DashboardBarChart.jsx` — Chart.js + react-chartjs-2 pattern |

---

## Appendix C: Technical Debt Summary

| Priority | Item |
|----------|------|
| High | No authentication or route protection |
| High | No real backend integration (except unused `/stats`) |
| High | Routing case mismatches (`/Soar` vs `/SOAR`, packet capture path) |
| Medium | Duplicated layout CSS across GRC/Network/Phishing |
| Medium | Four `DashboardCard` variants should be unified |
| Medium | `class` vs `className` JSX bugs in several files |
| Medium | `setTitle()` called during render in Network pages |
| Low | `variables.css` not globally imported |
| Low | Default CRA `index.html` title and meta description |
| Low | `console.log` in `useIncidentsQueue` hook |

---

*End of document.*
