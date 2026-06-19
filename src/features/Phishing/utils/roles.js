const ROLE_KEY = "lumisec_phishing_role";

export const ROLES = {
  MANAGER: "phishing_manager",
  OPERATOR: "phishing_operator",
  INTEGRATION: "integration_admin",
};

export function getPhishingRole() {
  return localStorage.getItem(ROLE_KEY) || ROLES.MANAGER;
}

export function setPhishingRole(role) {
  localStorage.setItem(ROLE_KEY, role);
}

export function canManageCampaigns(role = getPhishingRole()) {
  return role === ROLES.MANAGER;
}

export function canLaunchCampaigns(role = getPhishingRole()) {
  return role === ROLES.MANAGER || role === ROLES.OPERATOR;
}

export function canEditTemplates(role = getPhishingRole()) {
  return role === ROLES.MANAGER;
}

export function canManageRecipients(role = getPhishingRole()) {
  return role === ROLES.MANAGER;
}

export function canViewReports(role = getPhishingRole()) {
  return role !== ROLES.INTEGRATION;
}

export function canUseIntegrations(role = getPhishingRole()) {
  return role === ROLES.MANAGER || role === ROLES.INTEGRATION;
}

export function canViewTracking(role = getPhishingRole()) {
  return role !== ROLES.INTEGRATION;
}
