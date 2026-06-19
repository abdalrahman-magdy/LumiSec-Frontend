export const MOCK_OVERVIEW = {
  activeCampaigns: 12,
  emailsSent: 12540,
  openRate: 74,
  clickRate: 31,
  submitRate: 11,
  risksCreated: 45,
  successRate: 68,
  industryOpenAvg: 65,
  industryClickAvg: 41,
  criticalThreshold: 15,
};

export const MOCK_RISKS = [
  { id: "r1", email: "john.doe@corp.com", name: "John Doe", department: "Finance", score: 92, level: "high" },
  { id: "r2", email: "jane.smith@corp.com", name: "Jane Smith", department: "HR", score: 78, level: "high" },
  { id: "r3", email: "bob@corp.com", name: "Bob Wilson", department: "IT", score: 55, level: "medium" },
  { id: "r4", email: "alice@corp.com", name: "Alice Chen", department: "Sales", score: 22, level: "low" },
];

export const MOCK_DEPARTMENTS = [
  { department: "Finance", vulnerability: 82, employees: 45, clicked: 18 },
  { department: "HR", vulnerability: 71, employees: 32, clicked: 14 },
  { department: "IT", vulnerability: 38, employees: 28, clicked: 5 },
  { department: "Sales", vulnerability: 55, employees: 60, clicked: 22 },
  { department: "Engineering", vulnerability: 29, employees: 85, clicked: 8 },
];

export const MOCK_TRENDS = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  openRate: [62, 65, 70, 68, 72, 74],
  clickRate: [38, 35, 33, 30, 32, 31],
  submitRate: [18, 16, 14, 13, 12, 11],
};

export const MOCK_CAMPAIGNS = [
  {
    id: "camp-1",
    name: "Q2 Password Reset Drill",
    status: "active",
    templateId: "tpl-1",
    landingPageId: "lp-1",
    recipientsCount: 450,
    sent: 450,
    opened: 332,
    clicked: 140,
    submitted: 48,
    createdAt: "2026-05-01T10:00:00Z",
  },
  {
    id: "camp-2",
    name: "Invoice Phish Simulation",
    status: "paused",
    templateId: "tpl-2",
    landingPageId: "lp-2",
    recipientsCount: 200,
    sent: 120,
    opened: 88,
    clicked: 42,
    submitted: 12,
    createdAt: "2026-05-15T14:00:00Z",
  },
];

export const MOCK_TEMPLATES = [
  { id: "tpl-1", name: "Password Reset", subject: "Urgent: Reset your password", category: "credential", updatedAt: "2026-04-01" },
  { id: "tpl-2", name: "Invoice Due", subject: "Payment overdue — action required", category: "finance", updatedAt: "2026-04-10" },
];

export const MOCK_LANDING_PAGES = [
  { id: "lp-1", name: "Microsoft Login Clone", url: "/lp/ms-login", category: "credential", updatedAt: "2026-04-01" },
  { id: "lp-2", name: "Payroll Portal", url: "/lp/payroll", category: "finance", updatedAt: "2026-04-05" },
];

export const MOCK_RECIPIENTS = [
  { id: "rec-1", email: "john.doe@corp.com", name: "John Doe", department: "Finance", valid: true },
  { id: "rec-2", email: "jane.smith@corp.com", name: "Jane Smith", department: "HR", valid: true },
  { id: "rec-3", email: "invalid@", name: "Bad Email", department: "IT", valid: false },
];

export const MOCK_TRACKING_EVENTS = [
  { id: "ev-1", type: "open", email: "john.doe@corp.com", campaignId: "camp-1", timestamp: "2026-06-18T10:01:22Z", severity: "info" },
  { id: "ev-2", type: "click", email: "john.doe@corp.com", campaignId: "camp-1", timestamp: "2026-06-18T10:02:45Z", severity: "warning" },
  { id: "ev-3", type: "submit", email: "jane.smith@corp.com", campaignId: "camp-1", timestamp: "2026-06-18T10:05:11Z", severity: "critical" },
  { id: "ev-4", type: "visit", email: "bob@corp.com", campaignId: "camp-1", timestamp: "2026-06-18T10:06:33Z", severity: "warning" },
  { id: "ev-5", type: "download", email: "alice@corp.com", campaignId: "camp-1", timestamp: "2026-06-18T10:08:01Z", severity: "high" },
];

export const MOCK_QUEUE = {
  total: 450,
  sent: 320,
  pending: 130,
  failed: 0,
  status: "running",
  logs: [
    { time: "10:00:01", message: "Queue worker started" },
    { time: "10:00:05", message: "Batch 1/5 dispatched (100 emails)" },
    { time: "10:00:12", message: "Batch 2/5 dispatched (100 emails)" },
  ],
};

export const MOCK_REPORT_STATS = {
  campaigns: 7,
  totalRecipients: 1250,
  avgClickRate: 31,
  avgSubmitRate: 11,
  highRiskUsers: 23,
};
