import { useMemo } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import {
  canIntegrateNetwork,
  canReadNetwork,
  canRunNetwork,
  canSniffTraffic,
} from "../utils/networkPermissions";

export default function useNetworkPermissions() {
  const { user } = useAuth();
  const role = user?.role ?? "";

  return useMemo(
    () => ({
      role,
      canRunNetwork: canRunNetwork(role),
      canReadNetwork: canReadNetwork(role),
      canSniffTraffic: canSniffTraffic(role),
      canIntegrate: canIntegrateNetwork(role),
    }),
    [role]
  );
}
