# Backend -> Frontend Contract

This file is the working source of truth for wiring the frontend to the added backend. Do not add frontend data fields or screens unless they map to these APIs/models.

## Global API Rules

- Base URL: `REACT_APP_API_BASE_URL` or `http://localhost:4000`.
- Auth header for protected routes: `Authorization: Bearer <token>`.
- Standard success response:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

- Paginated response:

```json
{
  "success": true,
  "message": "...",
  "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 },
  "data": []
}
```

- Frontend services should read `body.data`, and lists should also read `body.pagination`.
- All protected modules use backend roles; hide/disable actions in UI when the user's role cannot call the endpoint.

## Auth

Base path: `/api/auth`

| UI Need | Method/Path | Payload/Response |
| --- | --- | --- |
| Signup | `POST /signup` | `{ name, email, password, role, department? }` -> `{ user, token }` |
| Login | `POST /login` | `{ email, password }` -> `{ user, token }` |
| Current profile | `GET /profile` | token required -> user |

Roles from backend:
`admin`, `soc_analyst`, `soc_manager`, `red_team`, `detection_engineer`, `auditor`, `compliance_manager`, `it_manager`, `assignee`, `grc_manager`, `phishing_operator`, `phishing_manager`, `senior_analyst`, `integration_admin`, `read_only`.

## SOAR

Base path: `/api/soar`

### Incident Queue

Use:
- `GET /incidents?page&limit&sort&search&severity&status&incidentType`
- `POST /incidents`
- `GET /incidents/:id`
- `PATCH /incidents/:id`
- `DELETE /incidents/:id`

Incident fields:
- `_id`
- `title`
- `description?`
- `severity`: `low | medium | high | critical`
- `status`: `new | open | in_progress | escalated | resolved | closed | false_positive`
- `incidentType?`
- `assignedTo?`
- `createdBy`
- `sourceIP?`
- `affectedHost?`
- `tags[]`
- `enrichment?`
- `createdAt`, `updatedAt`, `closedAt?`, `resolvedAt?`

Create incident minimum payload:

```json
{
  "title": "Suspicious login",
  "severity": "high",
  "description": "Brute force activity detected"
}
```

### Incident Management Detail

Use:
- Summary: `GET /incidents/:id`
- Timeline: `GET /incidents/:id/timeline`
- Artifacts: `GET /incidents/:id/artifacts`
- Add artifact: `POST /incidents/:id/artifacts`
- Notes: `GET /incidents/:id/notes`, `POST /incidents/:id/notes`
- Related incidents: `GET /incidents/:id/related`, `POST /incidents/:id/related`
- Close: `PATCH /incidents/:id/close`
- Run playbook: `POST /incidents/:id/playbooks/run`

Timeline response shape:

```json
{
  "incidentId": "...",
  "events": [
    {
      "type": "audit | note | playbook_run | alert | artifact | incident_created",
      "timestamp": "ISO date"
    }
  ]
}
```

Artifact payload:

```json
{
  "type": "ip | domain | url | hash | email | username | cve | file",
  "value": "203.0.113.55",
  "label": "C2 server",
  "source": "CrowdStrike"
}
```

Do not hardcode fake linked alerts. Use `GET /alerts` or timeline alert events if available.

### SOAR Dashboard / Analytics

Use:
- `GET /dashboard/overview`
- `GET /dashboard/incidents`
- `GET /dashboard/playbooks`
- `GET /dashboard/automation`
- `GET /dashboard/connectors`
- `GET /dashboard/analysts`
- `GET /analytics/kpis?days=30`
- `GET /analytics/report?days=30`
- `POST /analytics/export`

Dashboard overview returns real fields:
`totalIncidents`, `openIncidents`, `criticalOpen`, `totalPlaybooks`, `activePlaybooks`, `activeRuns`, `totalConnectors`, `activeConnectors`, `alertsToday`, `openBySeverity`, `recentIncidents`.

### SOAR Playbooks

Use:
- `GET /playbooks`
- `POST /playbooks`
- `GET /playbooks/:id`
- `PATCH /playbooks/:id`
- `DELETE /playbooks/:id`
- `GET /playbook-runs`
- `GET /playbook-runs/:runId`
- `POST /playbook-runs/:runId/pause|resume|cancel`

Playbook fields:
- `name`, `description?`, `triggerType: manual | auto`, `triggerCondition?`, `actions[]`, `graph?`, `isActive`.

Action shape:

```json
{
  "id": "step-0",
  "type": "block_ip",
  "params": {},
  "order": 0,
  "nextOnSuccess": "step-1",
  "nextOnFailure": "step-error",
  "condition": "optional"
}
```

### SOAR Connectors / Vault

Use:
- Connectors: `/connectors`, `/connectors/:id/test`, `/connectors/:id/actions`
- Vault: `/vault`, `/vault/:id`

Connector type: `firewall | siem | edr | ticketing | email | ssh | custom`.

## LumiNet / Network

Base path: `/api/luminet`

Use only these screens/actions:
- Discovery: `POST /network/discover` with `{ subnet }`
- Port scan: `POST /network/scan-ports` with `{ target, ports?, type? }`
- Inventory: `GET /assets/inventory?page&limit&os_type&status&search`
- Asset details: `GET /assets/details/:mac`
- Asset context: `GET /assets/context/:ip`
- Packet sniffing: `POST /sniffing/start`, `GET /sniffing/live-stream`
- Misconfigurations: `GET /network/misconfigurations?page&limit&severity&status`
- Flow metrics: `GET /network/flow-metrics?page&limit&asset&anomaly_only`

Network asset fields:
`ip`, `mac`, `hostname`, `osType`, `vendor`, `status`, `firstSeenAt`, `lastSeenAt`, `openPorts[]`, `tags[]`, `riskScore`, `metadata`.

## Phishing

Base path: `/api/phishing`

Use:
- Templates: `/templates`
- Landing pages: `/landing-pages`
- Recipients: `/recipients`, `/recipients/import`
- Campaigns: `/campaigns`, `/campaigns/:id/recipients`, `/campaigns/:id/launch|pause|resume|stop`
- Reports: `/reports/:campaignId/generate`, `/reports/:campaignId/download`, `/reports/:campaignId/stats`
- Dashboard: `/dashboard/overview`, `/dashboard/risks`, `/dashboard/departments`, `/dashboard/trends?days=30`
- Public tracking: `/track/open/:trackingId`, `/track/click/:trackingId`, `/track/visit/:trackingId`, `/track/submit/:trackingId`, `/track/download/:trackingId`

Campaign fields:
`name`, `description?`, `templateId`, `landingPageId?`, `status`, `launchDate?`, `completedAt?`, `recipientsCount`, `sentCount`, `openedCount`, `clickedCount`, `submittedCount`, `trackingDomain`, `createdBy`.

Important: tracking submit rejects password storage behavior; frontend should not expect backend to expose captured passwords.

## GRC

Base path: `/api/grc`

Use:
- Findings: `/findings`, `/findings/:id/assign`, `/findings/:id/close`, `/findings/:id/reopen`, `/findings/:id/history`, `/findings/:id/retest`
- Risks: `/risks`, `/risks/:id/accept`, `/risks/:id/mitigate`, `/risks/:id/close`
- Tasks: `/tasks`, `/tasks/:id/complete`, `/tasks/:id/verify`
- Evidence upload: `POST /evidence` multipart field `file`
- Reports: `/reports`, `/reports/:id/findings`, `/reports/:id/generate`, `/reports/:id/download`
- Compliance controls: `/compliance/controls`, `/compliance/status`
- Dashboard: `/dashboard/overview`, `/dashboard/risks`, `/dashboard/compliance`, `/dashboard/tasks`, `/dashboard/risk-heatmap`
- Audit logs: `/audit-logs`, `/audit-logs/:entityType/:entityId`
- Notifications: `/notifications`, `/notifications/:id/read`

Common enums:
- Finding status: `open`, `in_progress`, `ready_for_retest`, `pending_validation`, `pending_retest`, `resolved`, `closed`, `reopened`
- Severity/risk level: `low`, `medium`, `high`, `critical`
- Risk status: `open`, `mitigated`, `accepted`, `closed`
- Task status: `open`, `in_progress`, `completed`, `verified`

## UCTC

Base path: `/api/uctc` or alias `/api/v1`

Use:
- Rules validate/convert/save/list: `/rules/validate`, `/rules/convert`, `/rules`, `/rules/save`, `/rules/list`
- Rule detail/actions: `/rules/:ruleId`, `/rules/:ruleId/convert`, `/rules/:ruleId/deploy`, `/rules/:ruleId/archive`
- Network suggestions: `/rules/suggest-from-network`
- Lab: `/lab/execute-script`, `/lab/execute-scenario`, `/lab/runs`, `/scenarios/list`
- Tuning: `/tuning/noisy-rules`, `/tuning/suggestions`, `/tuning/apply`, `/tuning/alerts/ingest`
- Dashboard: `/dashboard/stats`

Rule status:
`draft`, `validated`, `converted`, `testing`, `deployed`, `noisy`, `stale`, `retired`.

## Current Frontend Mismatches To Fix

- `src/features/SOAR/Services/IncidentsQueue.js` uses `http://localhost:3001/stats`; replace with `/api/soar/dashboard/overview` or `/api/soar/incidents`.
- SOAR Incident Management is currently static; it should receive an incident id and load incident, timeline, artifacts, notes, related incidents, and alerts from backend.
- Mock labels like `Incident #1024`, fixed IPs, fixed malware file, fixed linked alerts, and fixed analyst names must become backend data or disappear.
- Network services already mostly use `/api/luminet`, but normalize against the backend wrapper shape `{ success, data, pagination }`.
- Any page with create/update forms should use Joi validation field names exactly; avoid invented frontend-only fields unless kept local and transformed before submit.

## Implementation Order

1. Create shared authenticated API client that unwraps `{ success, data, pagination }`.
2. Replace SOAR queue service with real `/api/soar/incidents` and `/api/soar/dashboard/overview`.
3. Make Incident Management route id-based, for example `/SOAR/incidents/:id`, and wire detail endpoints.
4. Wire SOAR dashboards/playbooks using real dashboard/playbook endpoints.
5. Review Network normalizers against backend response wrapper.
6. Then move to Phishing and GRC forms/lists using this contract.
