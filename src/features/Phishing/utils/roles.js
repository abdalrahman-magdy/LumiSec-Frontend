import { getUser } from "../../auth/utils/authStorage";

const ROLE_KEY = "lumisec_phishing_role";
const DEV_ROLE_SWITCHER = process.env.REACT_APP_PHISHING_DEV_ROLE_SWITCHER === "true";

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "phishing_manager",
  OPERATOR: "phishing_operator",
  SOC_MANAGER: "soc_manager",
  SOC_ANALYST: "soc_analyst",
  INTEGRATION: "integration_admin",
  AUDITOR: "auditor",
};

const MANAGE_CAMPAIGN_ROLES = [ROLES.ADMIN, ROLES.MANAGER];
const LAUNCH_CAMPAIGN_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
const MANAGE_CONTENT_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR, ROLES.SOC_MANAGER];
const EDIT_TEMPLATE_ROLES = MANAGE_CONTENT_ROLES;
const DELETE_CONTENT_ROLES = [ROLES.ADMIN, ROLES.MANAGER];
const MANAGE_RECIPIENT_ROLES = [ROLES.ADMIN, ROLES.MANAGER, ROLES.OPERATOR];
const VIEW_REPORT_ROLES = [
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.OPERATOR,
  ROLES.SOC_MANAGER,
  ROLES.SOC_ANALYST,
  ROLES.AUDITOR,
];
const INTEGRATION_ROLES = [
  ROLES.ADMIN,
  ROLES.SOC_MANAGER,
  ROLES.MANAGER,
  ROLES.SOC_ANALYST,
  ROLES.INTEGRATION,
];

export function getPhishingRole() {
  const authRole = getUser()?.role;
  if (authRole) return authRole;
  if (DEV_ROLE_SWITCHER) {
    return localStorage.getItem(ROLE_KEY) || ROLES.MANAGER;
  }
  return "";
}

export function setPhishingRole(role) {
  if (!DEV_ROLE_SWITCHER) return;
  localStorage.setItem(ROLE_KEY, role);
}

export function isDevRoleSwitcherEnabled() {
  return DEV_ROLE_SWITCHER;
}

function hasRole(role, allowed) {
  return allowed.includes(role);
}

export function canManageCampaigns(role = getPhishingRole()) {
  return hasRole(role, MANAGE_CAMPAIGN_ROLES);
}

export function canCreateCampaigns(role = getPhishingRole()) {
  return hasRole(role, [...MANAGE_CAMPAIGN_ROLES, ROLES.OPERATOR]);
}

export function canLaunchCampaigns(role = getPhishingRole()) {
  return hasRole(role, LAUNCH_CAMPAIGN_ROLES);
}

/** Templates & landing pages — create/update (matches backend) */
export function canEditTemplates(role = getPhishingRole()) {
  return hasRole(role, EDIT_TEMPLATE_ROLES);
}

export function canDeleteTemplates(role = getPhishingRole()) {
  return hasRole(role, DELETE_CONTENT_ROLES);
}

export function canManageRecipients(role = getPhishingRole()) {
  return hasRole(role, MANAGE_RECIPIENT_ROLES);
}

export function canDeleteRecipients(role = getPhishingRole()) {
  return hasRole(role, DELETE_CONTENT_ROLES);
}

export function canDeleteCampaigns(role = getPhishingRole()) {
  return hasRole(role, MANAGE_CAMPAIGN_ROLES);
}

export function canGenerateReports(role = getPhishingRole()) {
  return hasRole(role, [
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.OPERATOR,
    ROLES.SOC_MANAGER,
  ]);
}

export function canViewReports(role = getPhishingRole()) {
  return hasRole(role, VIEW_REPORT_ROLES);
}

export function canUseIntegrations(role = getPhishingRole()) {
  return hasRole(role, INTEGRATION_ROLES);
}

export function canViewTracking(role = getPhishingRole()) {
  return hasRole(role, VIEW_REPORT_ROLES);
}
