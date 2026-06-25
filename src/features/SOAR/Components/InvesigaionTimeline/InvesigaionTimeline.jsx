import React, { useState } from "react";
import "./InvesigaionTimeline.css";
import clock from "../../../../assets/Clock.png";

function formatEventTitle(event) {
  if (event.type === "note") return "Analyst Note";
  if (event.type === "playbook_run") return `Playbook ${event.status || "run"}`;
  if (event.type === "alert") return `${event.source || "Alert"} - ${event.severity || "medium"}`;
  if (event.type === "artifact") return `${event.artifactType || "Artifact"} added`;
  if (event.type === "audit") return `Audit - ${event.action || "update"}`;
  return "Incident Created";
}

function formatEventBody(event) {
  return (
    event.content ||
    event.title ||
    event.value ||
    event.playbook?.name ||
    event.action ||
    "Incident activity recorded"
  );
}

function formatTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function eventColorClass(event) {
  if (event.type === "note") return "Invesigaion-Timeline-title-green";
  if (event.type === "alert" || event.type === "artifact") return "Invesigaion-Timeline-title";
  return "Invesigaion-Timeline-title-darkBlue";
}

export default function InvesigaionTimeline({
  events = [],
  onAddNote,
  savingNote = false,
  loading = false,
}) {
  const [note, setNote] = useState("");

  const submitNote = async () => {
    if (!note.trim() || savingNote) return;
    await onAddNote?.(note);
    setNote("");
  };

  return (
    <div className="timeline-container">

      {/* HEADER */}
      <div className="section-header d-flex align-items-center">
        <figure>
          <img src={clock} className="icon" alt="clock" />
        </figure>
        <h5 className="text-white mb-0">Investigation Timeline</h5>
      </div>

      <div className="timeline-list">

        {loading && <div className="dashboard-card timeline-item text-white">Loading timeline...</div>}

        {!loading && events.length === 0 && (
          <div className="dashboard-card timeline-item text-white">No timeline events yet.</div>
        )}

        {!loading && events.map((event, index) => (
          <div className="dashboard-card timeline-item" key={`${event.type}-${event.timestamp}-${index}`}>
            <div className="timeline-header">
              <h5 className={eventColorClass(event)}>
                {formatTime(event.timestamp)} - {formatEventTitle(event)}
              </h5>
              <p>{event.type}</p>
            </div>
            <p className="text-white mb-0">{formatEventBody(event)}</p>
          </div>
        ))}

        {/* NOTE INPUT */}
        <div className="text-area-card rounded-3 p-2 mb-3">
          <textarea
            className="w-100 text-white mb-3"
            placeholder="Add Investigation note..."
            aria-label="Add investigation note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />

          <div className="d-flex justify-content-end">
            <button
              className="btn add-note-btn border-0 text-white"
              type="button"
              onClick={submitNote}
              disabled={!note.trim() || savingNote}
            >
              {savingNote ? "Adding..." : "Add Note"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
