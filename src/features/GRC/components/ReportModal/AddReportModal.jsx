import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./AddReportModal.css";

const FRAMEWORKS = ["ISO27001", "NIST", "PCI_DSS", "SOC2"];

const initialForm = {
    title: "",
    framework: "ISO27001",
    scope: "",
    summary: "",
    findingIds: [],
};

export default function AddReportModal({
    show = false,
    onClose,
    onCreate,
    findings = [],
    savingLabel = "Saving...",
    submitLabel = "Create Report",
}) {
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!show) return undefined;

        setForm(initialForm);
        setError(null);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKeyDown = (event) => {
            if (event.key === "Escape" && onClose) onClose();
        };
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [show, onClose]);

    const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const toggleFinding = (findingId) => {
        setForm((prev) => {
            const selected = prev.findingIds.includes(findingId)
                ? prev.findingIds.filter((id) => id !== findingId)
                : [...prev.findingIds, findingId];
            return { ...prev, findingIds: selected };
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!onCreate) return;

        setSaving(true);
        setError(null);
        try {
            await onCreate({
                title: form.title.trim(),
                framework: form.framework,
                scope: form.scope.trim() || undefined,
                summary: form.summary.trim() || undefined,
                findings: form.findingIds,
            });
            onClose?.();
        } catch (err) {
            setError(err.message || "Failed to create audit report");
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return createPortal(
        <>
            <div
                className="modal-backdrop fade show grc-report-backdrop"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className="modal fade show d-block grc-report-modal"
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="reportModalTitle"
            >
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0">
                            <h5 className="modal-title text-white" id="reportModalTitle">
                                Create Audit Report
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                aria-label="Close"
                                onClick={onClose}
                            />
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body border-0">
                                {error && <p className="text-danger mb-3">{error}</p>}

                                <label htmlFor="ReportTitle" className="d-block mb-2">
                                    Title
                                </label>
                                <input
                                    className="form-control border-0 mb-4"
                                    type="text"
                                    id="ReportTitle"
                                    value={form.title}
                                    onChange={(event) => updateField("title", event.target.value)}
                                    placeholder="Q2 ISO 27001 Internal Audit"
                                    required
                                />

                                <label htmlFor="ReportFramework" className="d-block mb-2">
                                    Framework
                                </label>
                                <select
                                    id="ReportFramework"
                                    className="form-select bg-dark text-white border-0 mb-4"
                                    value={form.framework}
                                    onChange={(event) => updateField("framework", event.target.value)}
                                >
                                    {FRAMEWORKS.map((framework) => (
                                        <option key={framework} value={framework}>
                                            {framework}
                                        </option>
                                    ))}
                                </select>

                                <label htmlFor="ReportScope" className="d-block mb-2">
                                    Scope (optional)
                                </label>
                                <input
                                    className="form-control border-0 mb-4"
                                    type="text"
                                    id="ReportScope"
                                    value={form.scope}
                                    onChange={(event) => updateField("scope", event.target.value)}
                                    placeholder="Production systems and corporate IT"
                                />

                                <label htmlFor="ReportSummary" className="d-block mb-2">
                                    Summary (optional)
                                </label>
                                <textarea
                                    className="form-control border-0 mb-4"
                                    id="ReportSummary"
                                    value={form.summary}
                                    onChange={(event) => updateField("summary", event.target.value)}
                                    placeholder="Executive summary for this audit cycle..."
                                />

                                <label className="d-block mb-2">Link Findings (optional)</label>
                                {findings.length === 0 ? (
                                    <p className="text-white-50 small mb-0">
                                        No findings available yet. Create findings first, then link them here.
                                    </p>
                                ) : (
                                    <div className="report-finding-list rounded-3 p-3 mb-2">
                                        {findings.map((finding) => {
                                            const id = finding._id ?? finding.id;
                                            return (
                                                <label key={id} className="d-flex align-items-start gap-2 mb-2 text-white">
                                                    <input
                                                        type="checkbox"
                                                        className="mt-1"
                                                        checked={form.findingIds.includes(id)}
                                                        onChange={() => toggleFinding(id)}
                                                    />
                                                    <span>{finding.title || id}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn import-btn border-0 btn-primary"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn add-btn text-white border-0"
                                    type="submit"
                                    disabled={saving}
                                >
                                    {saving ? savingLabel : submitLabel}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
