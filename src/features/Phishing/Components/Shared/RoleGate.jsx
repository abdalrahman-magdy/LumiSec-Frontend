import { getPhishingRole } from "../../utils/roles";

export default function RoleGate({ allow, children, fallback = null }) {
  const role = getPhishingRole();
  if (!allow(role)) return fallback;
  return children;
}
