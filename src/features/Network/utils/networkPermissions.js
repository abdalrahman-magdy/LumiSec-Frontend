const RUN_ROLES = new Set(["admin", "detection_engineer", "it_manager"]);
const READ_ROLES = new Set([...RUN_ROLES, "soc_analyst", "soc_manager", "grc_manager"]);
const SNIFF_ROLES = new Set(["admin", "detection_engineer", "soc_analyst"]);
const INTEGRATE_ROLES = new Set([
  "admin",
  "soc_manager",
  "detection_engineer",
  "it_manager",
  "integration_admin",
]);

export function canRunNetwork(role = "") {
  return RUN_ROLES.has(role);
}

export function canReadNetwork(role = "") {
  return READ_ROLES.has(role);
}

export function canSniffTraffic(role = "") {
  return SNIFF_ROLES.has(role);
}

export function canIntegrateNetwork(role = "") {
  return INTEGRATE_ROLES.has(role);
}
