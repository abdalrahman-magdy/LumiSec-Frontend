import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./ReportDetailModal.css";
import { downloadGrcReport, getGrcReport } from "../../services/grc.api";
import { normalizeFinding, normalizeList, normalizeReport } from "../../utils/grcNormalizers";

function getFindingId(finding) {
    return finding?._id ?? finding?.id ?? finding;
}

export default function ReportDetailModal({
    show = false,
    reportId,
    onClose,
    allFindings = [],
    onAddFindings,
    onGenerate,
    onUpdated,
}) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null);
    const [selectedFindingIds, setSelectedFindingIds] = useState([]);
    const [busy, setBusy] = useState(false);

    const loadReport = useCallback(async () => {
        if (!reportId) return;
        setLoading(true);
        setError(null);
        try {
            const result = await getGrcReport(reportId);
            setReport(normalizeReport(result.data));
        } catch (err) {
            setError(err.message || "Failed to load report");
            setReport(null);
        } finally {
            setLoading(false);
        }
    }, [reportId]);

    useEffect(() => {
        if (!show || !reportId) return undefined;

        loadReport();
        setSelectedFindingIds([]);
        setActionError(null);

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
    }, [show, reportId, loadReport, onClose]);

    const linkedIds = new Set(
        (report?.findings ?? []).map((finding) => String(getFindingId(finding)))
    );

    const availableFindings = allFindings.filter(
        (finding) => !linkedIds.has(String(getFindingId(finding)))
    );

    const toggleFinding = (findingId) => {
        setSelectedFindingIds((prev) =>
            prev.includes(findingId)
                ? prev.filter((id) => id !== findingId)
                : [...prev, findingId]
        );
    };

    const handleAddFindings = async () => {
        if (!selectedFindingIds.length || !onAddFindings) return;
        setBusy(true);
        setActionError(null);
        try {
            await onAddFindings(reportId, selectedFindingIds);
            await loadReport();
            onUpdated?.();
            setSelectedFindingIds([]);
        } catch (err) {
            setActionError(err.message || "Failed to link findings");
        } finally {
            setBusy(false);
        }
    };

    const handleGenerate = async () => {
        if (!onGenerate) return;
        setBusy(true);
        setActionError(null);
        try {
            await onGenerate(reportId);
            await loadReport();
            onUpdated?.();
        } catch (err) {
            setActionError(err.message || "Failed to queue report generation");
        } finally {
            setBusy(false);
        }
    };

    const handleDownload = async () => {
        setBusy(true);
        setActionError(null);
        try {
            const filename = `${(report?.title || "audit-report").replace(/\s+/g, "_")}.pdf`;
            await downloadGrcReport(reportId, filename);
        } catch (err) {
            setActionError(err.message || "PDF not ready yet. Generate the report first.");
        } finally {
            setBusy(false);
        }
    };

    if (!show) return null;

    const linkedFindings = normalizeList(report?.findings).map((item) =>
        typeof item === "object" && item !== null ? normalizeFinding(item) : { title: String(item) }
    );

    return createPortal(
        <>
            <div
                className="modal-backdrop fade show grc-report-detail-backdrop"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className="modal fade show d-block grc-report-detail-modal"
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="reportDetailTitle"
            >
                <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0">
                            <h5 className="modal-title text-white" id="reportDetailTitle">
                                {report?.title || "Audit Report"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                aria-label="Close"
                                onClick={onClose}
                            />
                        </div>

                        <div className="modal-body border-0">
                            {loading && <p className="text-white">Loading report...</p>}
                            {!loading && error && <p className="text-danger">{error}</p>}
                            {!loading && !error && report && (
                                <>
                                    <div className="report-meta mb-4">
                                        <p className="mb-1 text-white">
                                            <strong>Framework:</strong> {report.framework}
                                        </p>
                                        <p className="mb-1 text-white text-capitalize">
                                            <strong>Status:</strong> {report.status}
                                        </p>
                                        {report.scope && (
                                            <p className="mb-1 text-white-50">
                                                <strong>Scope:</strong> {report.scope}
                                            </p>
                                        )}
                                        {report.summary && (
                                            <p className="mb-0 text-white-50">{report.summary}</p>
                                        )}
                                    </div>

                                    <h6 className="text-white mb-2">Linked Findings ({linkedFindings.length})</h6>
                                    {linkedFindings.length === 0 ? (
                                        <p className="text-white-50 small">No findings linked to this report yet.</p>
                                    ) : (
                                        <ul className="report-linked-findings list-unstyled mb-4">
                                            {linkedFindings.map((finding, index) => (
                                                <li key={getFindingId(finding) ?? index} className="text-white-50 small mb-1">
                                                    {finding.title}
                                                    {finding.severity ? ` · ${finding.severity}` : ""}
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {availableFindings.length > 0 && (
                                        <>
                                            <h6 className="text-white mb-2">Add Findings</h6>
                                            <div className="report-finding-list rounded-3 p-3 mb-3">
                                                {availableFindings.map((finding) => {
                                                    const id = getFindingId(finding);
                                                    return (
                                                        <label key={id} className="d-flex align-items-start gap-2 mb-2 text-white">
                                                            <input
                                                                type="checkbox"
                                                                className="mt-1"
                                                                checked={selectedFindingIds.includes(id)}
                                                                onChange={() => toggleFinding(id)}
                                                                disabled={busy}
                                                            />
                                                            <span>{finding.title || id}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                            <button
                                                type="button"
                                                className="btn add-btn text-white border-0 mb-4"
                                                onClick={handleAddFindings}
                                                disabled={busy || selectedFindingIds.length === 0}
                                            >
                                                Link Selected Findings
                                            </button>
                                        </>
                                    )}

                                    {actionError && <p className="text-danger">{actionError}</p>}
                                </>
                            )}
                        </div>

                        {!loading && !error && report && (
                            <div className="modal-footer border-0 flex-wrap gap-2">
                                <button
                                    type="button"
                                    className="btn import-btn border-0 btn-primary"
                                    onClick={onClose}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    className="btn add-btn text-white border-0"
                                    onClick={handleGenerate}
                                    disabled={busy || report.status === "generating"}
                                >
                                    {report.status === "generating" ? "Generating..." : "Generate PDF"}
                                </button>
                                {(report.status === "ready" || report.status === "published") && (
                                    <button
                                        type="button"
                                        className="btn grc-edit-btn"
                                        onClick={handleDownload}
                                        disabled={busy}
                                    >
                                        <i className="fa-solid fa-download me-1" aria-hidden="true"></i>
                                        Download PDF
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}
