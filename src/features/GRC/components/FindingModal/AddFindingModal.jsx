import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./AddFindingModal.css";
import AssigneeSelect from "../Shared/AssigneeSelect";
import { getUser } from "../../../auth/utils/authStorage";

const SEVERITIES = ["low", "medium", "high", "critical"];
const objectIdPattern = /^[a-f\d]{24}$/i;

const initialForm = {
    title: "",
    description: "",
    severity: "medium",
    riskRating: "medium",
    asset: "",
    assignedTo: "",
    dueDate: "",
};

export default function AddFindingModal({
    show = false,
    onClose,
    onCreate,
    assignees = [],
    savingLabel = "Saving...",
    submitLabel = "Add Finding",
}) {
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!show) return undefined;

        const user = getUser();
        const userId = user?._id ?? user?.id;
        const defaultAssignee =
            userId && assignees.some((item) => (item._id ?? item.id) === userId)
                ? userId
                : "";
        setForm({
            ...initialForm,
            assignedTo: defaultAssignee,
        });
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
    }, [show, onClose, assignees]);

    const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!onCreate) return;

        if (form.assignedTo && !objectIdPattern.test(form.assignedTo)) {
            setError("Select a valid assignee.");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await onCreate({
                title: form.title.trim(),
                description: form.description.trim(),
                severity: form.severity,
                riskRating: form.riskRating,
                asset: form.asset.trim() || undefined,
                assignedTo: form.assignedTo.trim() || undefined,
                dueDate: form.dueDate || undefined,
            });
            onClose?.();
        } catch (err) {
            setError(err.message || "Failed to create finding");
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return createPortal(
        <>
            <div
                className="modal-backdrop fade show grc-finding-backdrop"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className="modal fade show d-block grc-finding-modal"
                tabIndex="-1"
                role="dialog"
                aria-modal="true"
                aria-labelledby="findingModalTitle"
            >
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header border-0">
                            <h5 className="modal-title text-white" id="findingModalTitle">
                                Add Finding
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

                                <label htmlFor="FindingTitle" className="d-block mb-2">
                                    Title
                                </label>
                                <input
                                    className="form-control border-0 mb-4"
                                    type="text"
                                    id="FindingTitle"
                                    value={form.title}
                                    onChange={(event) => updateField("title", event.target.value)}
                                    placeholder="Missing access control on admin panel"
                                    required
                                />

                                <label htmlFor="FindingDescription" className="d-block mb-2">
                                    Description
                                </label>
                                <textarea
                                    className="form-control border-0 mb-4"
                                    id="FindingDescription"
                                    value={form.description}
                                    onChange={(event) => updateField("description", event.target.value)}
                                    placeholder="Describe the gap, evidence, and impact..."
                                    required
                                />

                                <div className="row mb-4">
                                    <div className="col-6">
                                        <label htmlFor="FindingSeverity" className="d-block mb-2">
                                            Severity
                                        </label>
                                        <select
                                            id="FindingSeverity"
                                            className="form-select bg-dark text-white border-0"
                                            value={form.severity}
                                            onChange={(event) => updateField("severity", event.target.value)}
                                        >
                                            {SEVERITIES.map((level) => (
                                                <option key={level} value={level}>
                                                    {level}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-6">
                                        <label htmlFor="FindingRiskRating" className="d-block mb-2">
                                            Risk Rating
                                        </label>
                                        <select
                                            id="FindingRiskRating"
                                            className="form-select bg-dark text-white border-0"
                                            value={form.riskRating}
                                            onChange={(event) => updateField("riskRating", event.target.value)}
                                        >
                                            {SEVERITIES.map((level) => (
                                                <option key={level} value={level}>
                                                    {level}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <label htmlFor="FindingAsset" className="d-block mb-2">
                                    Asset (optional)
                                </label>
                                <input
                                    className="form-control border-0 mb-4"
                                    type="text"
                                    id="FindingAsset"
                                    value={form.asset}
                                    onChange={(event) => updateField("asset", event.target.value)}
                                    placeholder="e.g. admin-portal, db-prod-01"
                                />

                                <div className="row mb-4">
                                    <div className="col-6">
                                        <label htmlFor="FindingAssignedTo" className="d-block mb-2">
                                            Assigned To (optional)
                                        </label>
                                        <AssigneeSelect
                                            id="FindingAssignedTo"
                                            value={form.assignedTo}
                                            onChange={(value) => updateField("assignedTo", value)}
                                            assignees={assignees}
                                            allowEmpty
                                            emptyLabel="Unassigned"
                                        />
                                    </div>
                                    <div className="col-6">
                                        <label htmlFor="FindingDueDate" className="d-block mb-2">
                                            Due Date
                                        </label>
                                        <input
                                            className="form-control border-0"
                                            type="date"
                                            id="FindingDueDate"
                                            value={form.dueDate}
                                            onChange={(event) => updateField("dueDate", event.target.value)}
                                        />
                                    </div>
                                </div>
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
