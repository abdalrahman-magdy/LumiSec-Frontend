import { useCallback, useEffect, useState } from "react";
import {
  blockIp,
  closeIncident,
  createIncidentNote,
  getIncident,
  getIncidentArtifacts,
  getIncidentNotes,
  getIncidentTimeline,
  getRelatedIncidents,
  isolateHost,
  updateIncident,
} from "../Services/soar.api";

export default function useIncidentManagement(incidentId) {
  const [incident, setIncident] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [artifacts, setArtifacts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [related, setRelated] = useState({ explicit: [], inferred: [] });
  const [loading, setLoading] = useState(Boolean(incidentId));
  const [error, setError] = useState(null);
  const [savingNote, setSavingNote] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadIncident = useCallback(async () => {
    if (!incidentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [
        incidentResult,
        timelineResult,
        artifactsResult,
        notesResult,
        relatedResult,
      ] = await Promise.all([
        getIncident(incidentId),
        getIncidentTimeline(incidentId),
        getIncidentArtifacts(incidentId),
        getIncidentNotes(incidentId),
        getRelatedIncidents(incidentId),
      ]);

      setIncident(incidentResult.data ?? null);
      setTimeline(timelineResult.data?.events ?? []);
      setArtifacts(Array.isArray(artifactsResult.data) ? artifactsResult.data : []);
      setNotes(Array.isArray(notesResult.data) ? notesResult.data : []);
      setRelated(relatedResult.data ?? { explicit: [], inferred: [] });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  const addNote = useCallback(async (content) => {
    if (!incidentId || !content?.trim()) return null;

    setSavingNote(true);
    try {
      const result = await createIncidentNote(incidentId, {
        content: content.trim(),
        isInternal: true,
      });
      await loadIncident();
      return result.data;
    } finally {
      setSavingNote(false);
    }
  }, [incidentId, loadIncident]);

  const updateStatus = useCallback(async (status) => {
    if (!incidentId || !status) return null;
    setActionLoading("status");
    try {
      const result = await updateIncident(incidentId, { status });
      await loadIncident();
      return result.data;
    } finally {
      setActionLoading(null);
    }
  }, [incidentId, loadIncident]);

  const assignIncident = useCallback(async (assignedTo) => {
    if (!incidentId) return null;
    setActionLoading("assign");
    try {
      const result = await updateIncident(incidentId, { assignedTo: assignedTo || null });
      await loadIncident();
      return result.data;
    } finally {
      setActionLoading(null);
    }
  }, [incidentId, loadIncident]);

  const closeCurrentIncident = useCallback(async () => {
    if (!incidentId) return null;
    setActionLoading("close");
    try {
      const result = await closeIncident(incidentId, {
        resolution: "Closed from Incident Management screen.",
      });
      await loadIncident();
      return result.data;
    } finally {
      setActionLoading(null);
    }
  }, [incidentId, loadIncident]);

  const runRecommendedAction = useCallback(async (action) => {
    if (!incidentId) return null;
    setActionLoading(action);
    try {
      if (action === "isolate_host") {
        const result = await isolateHost({
          affectedHost: incident?.affectedHost,
          host: incident?.affectedHost,
          incidentId,
          async: true,
          forceDefault: true,
        });
        await createIncidentNote(incidentId, {
          content: `Host isolation requested for ${incident?.affectedHost || "affected host"}.`,
          isInternal: true,
        });
        await loadIncident();
        return result.data;
      }

      if (action === "block_ip") {
        const ip = incident?.sourceIP || artifacts.find((artifact) => artifact.type === "ip")?.value;
        if (!ip) throw new Error("No IP artifact is available to block.");
        const result = await blockIp({
          ip,
          sourceIP: ip,
          incidentId,
          comment: `Block requested from incident ${incidentId}`,
          async: true,
        });
        await createIncidentNote(incidentId, {
          content: `IP block requested for ${ip}.`,
          isInternal: true,
        });
        await loadIncident();
        return result.data;
      }

      if (action === "reset_password") {
        const result = await createIncidentNote(incidentId, {
          content: "User password reset requested. No password-reset backend endpoint is currently available.",
          isInternal: true,
        });
        await loadIncident();
        return result.data;
      }

      return null;
    } finally {
      setActionLoading(null);
    }
  }, [artifacts, incident, incidentId, loadIncident]);

  useEffect(() => {
    loadIncident();
  }, [loadIncident]);

  return {
    incident,
    timeline,
    artifacts,
    notes,
    related,
    loading,
    error,
    savingNote,
    actionLoading,
    addNote,
    updateStatus,
    assignIncident,
    closeCurrentIncident,
    runRecommendedAction,
    reload: loadIncident,
  };
}
