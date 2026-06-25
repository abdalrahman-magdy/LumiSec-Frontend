import React, { useEffect, useState } from 'react'
import "./AddTaskRemediationModal.css"
import { getUser } from '../../../auth/utils/authStorage'

const PRIORITIES = ["low", "medium", "high", "critical"];
const objectIdPattern = /^[a-f\d]{24}$/i;

const initialForm = {
    findingId: "",
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "medium",
    status: "open",
};

function getTaskId(task) {
    return task?._id ?? task?.id;
}

function formatDateInput(value) {
    if (!value) return "";
    return new Date(value).toISOString().slice(0, 10);
}

function getAssigneeId(task) {
    return task?.assignedTo?._id ?? task?.assignedTo?.id ?? task?.assignedTo ?? "";
}

export default function AddTaskRemediationModal({
    modalId = "AddTaskRemediationModal",
    title = "Create Remediation Task",
    submitLabel = "Add Task",
    savingLabel = "Saving...",
    findings = [],
    initialValue = null,
    onCreate,
    onUpdate,
}) {
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const isEditing = Boolean(initialValue);

    useEffect(() => {
        if (initialValue) return;
        const user = getUser();
        const userId = user?._id ?? user?.id;
        if (userId && objectIdPattern.test(userId)) {
            setForm((prev) => ({ ...prev, assignedTo: prev.assignedTo || userId }));
        }
    }, [initialValue]);

    useEffect(() => {
        if (!initialValue) {
            setForm((prev) => ({ ...initialForm, assignedTo: prev.assignedTo }));
            return;
        }

        setForm({
            findingId: initialValue.findingId?._id ?? initialValue.findingId?.id ?? initialValue.findingId ?? "",
            title: initialValue.title ?? "",
            description: initialValue.description ?? "",
            assignedTo: getAssigneeId(initialValue),
            dueDate: formatDateInput(initialValue.dueDate),
            priority: initialValue.priority ?? "medium",
            status: initialValue.status ?? "open",
        });
    }, [initialValue]);

    const updateField = (key, value) => {
        setForm((prev) => {
            const next = { ...prev, [key]: value };
            if (key === "findingId") {
                const finding = findings.find((item) => (item._id ?? item.id) === value);
                next.title = finding?.title ? `Remediate: ${finding.title}` : next.title;
                next.description = finding?.description ?? next.description;
                const assignedId = finding?.assignedTo?._id ?? finding?.assignedTo?.id ?? finding?.assignedTo;
                if (assignedId && objectIdPattern.test(assignedId)) next.assignedTo = assignedId;
            }
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!onCreate && !onUpdate) return;
        if (!isEditing && !objectIdPattern.test(form.findingId)) {
            setError("Choose a backend finding first.");
            return;
        }
        if (!objectIdPattern.test(form.assignedTo)) {
            setError("Assigned To must be a valid backend user ObjectId.");
            return;
        }

        setSaving(true);
        setError(null);
        try {
            if (isEditing) {
                await onUpdate(getTaskId(initialValue), {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    assignedTo: form.assignedTo.trim(),
                    dueDate: form.dueDate || undefined,
                    priority: form.priority,
                    status: form.status,
                });
            } else {
                await onCreate({
                    findingId: form.findingId,
                    title: form.title.trim(),
                    description: form.description.trim(),
                    assignedTo: form.assignedTo.trim(),
                    dueDate: form.dueDate || undefined,
                    priority: form.priority,
                });
                setForm(initialForm);
            }
            document.querySelector(`#${modalId} .btn-close`)?.click();
        } catch (err) {
            setError(err.message || "Failed to save remediation task");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal fade" id={modalId} tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered AddTaskRemediationModal" role="document">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <h5 className="modal-title text-white">{title}</h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body border-0">
                            {error && <p className="text-danger mb-3">{error}</p>}

                            <label htmlFor="FindingId" className='d-block mb-2'>Finding</label>
                            <select
                                id="FindingId"
                                className='form-select bg-dark text-white border-0 mb-4'
                                value={form.findingId}
                                onChange={(event) => updateField("findingId", event.target.value)}
                                disabled={isEditing}
                                required
                            >
                                <option value="">Select finding</option>
                                {findings.map((finding) => {
                                    const id = finding._id ?? finding.id;
                                    return <option key={id} value={id}>{finding.title || id}</option>;
                                })}
                            </select>

                            <label htmlFor="TaskTitle" className='d-block mb-2'>Title</label>
                            <input
                                className='form-control border-0 mb-4'
                                type="text"
                                id="TaskTitle"
                                value={form.title}
                                onChange={(event) => updateField("title", event.target.value)}
                                placeholder='Remediate control gap...'
                                required
                            />

                            <label htmlFor="Description" className='d-block mb-2'>Description</label>
                            <textarea
                                className='form-control border-0 mb-4'
                                id="Description"
                                value={form.description}
                                onChange={(event) => updateField("description", event.target.value)}
                                placeholder='Steps required to fix this issue...'
                                required
                            />

                            <div className='row justify-content-between align-items-center'>
                                <div className="col-6">
                                    <label htmlFor="AssignedTo" className='d-block mb-2'>Assigned To ObjectId</label>
                                </div>
                                <div className="col-6">
                                    <label htmlFor="DueDate" className='d-block mb-2'>Due Date</label>
                                </div>
                            </div>

                            <div className='row justify-content-between align-items-center mb-4'>
                                <div className='col-6'>
                                    <input
                                        className='form-control border-0'
                                        type="text"
                                        id="AssignedTo"
                                        value={form.assignedTo}
                                        onChange={(event) => updateField("assignedTo", event.target.value)}
                                        placeholder='64f1...'
                                        required
                                    />
                                </div>
                                <div className='col-6'>
                                    <input
                                        className='form-control border-0'
                                        type="date"
                                        id="DueDate"
                                        value={form.dueDate}
                                        onChange={(event) => updateField("dueDate", event.target.value)}
                                    />
                                </div>
                            </div>

                            <label htmlFor="Priority" className='d-block mb-2'>Priority</label>
                            <select
                                id="Priority"
                                className='form-select bg-dark text-white border-0 mb-4'
                                value={form.priority}
                                onChange={(event) => updateField("priority", event.target.value)}
                            >
                                {PRIORITIES.map((priority) => (
                                    <option key={priority} value={priority}>{priority}</option>
                                ))}
                            </select>

                            {isEditing && (
                                <>
                                    <label htmlFor="TaskStatus" className='d-block mb-2'>Status</label>
                                    <select
                                        id="TaskStatus"
                                        className='form-select bg-dark text-white border-0'
                                        value={form.status}
                                        onChange={(event) => updateField("status", event.target.value)}
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="verified">Verified</option>
                                    </select>
                                </>
                            )}
                        </div>

                        <div className="modal-footer border-0">
                            <button type="button" className="btn import-btn border-0 btn-primary" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button className='btn add-btn text-white border-0' type="submit" disabled={saving || (!isEditing && findings.length === 0)}>
                                {saving ? savingLabel : submitLabel}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
