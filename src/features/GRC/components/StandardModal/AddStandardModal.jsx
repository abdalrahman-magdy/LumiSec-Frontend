import React, { useEffect, useState } from 'react'
import "./AddNewStandardModal.css"

const FRAMEWORKS = ["ISO27001", "NIST", "PCI_DSS", "SOC2"];
const STATUSES = [
    { value: "not_assessed", label: "Not Assessed" },
    { value: "partially_compliant", label: "Partially Compliant" },
    { value: "compliant", label: "Compliant" },
    { value: "non_compliant", label: "Non Compliant" },
];

const initialForm = {
    framework: "ISO27001",
    controlId: "",
    title: "",
    description: "",
    status: "not_assessed",
};

function getControlId(control) {
    return control?._id ?? control?.id;
}

export default function AddStandardModal({
    modalId = "addStandardModal",
    title = "Add New Standard",
    submitLabel = "Add Standard",
    savingLabel = "Saving...",
    initialValue = null,
    onCreate,
    onUpdate,
}) {
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const isEditing = Boolean(initialValue);

    useEffect(() => {
        if (!initialValue) {
            setForm(initialForm);
            return;
        }

        setForm({
            framework: initialValue.framework ?? initialForm.framework,
            controlId: initialValue.controlId ?? "",
            title: initialValue.title ?? "",
            description: initialValue.description ?? "",
            status: initialValue.status ?? initialForm.status,
        });
    }, [initialValue]);

    const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!onCreate && !onUpdate) return;
        setSaving(true);
        setError(null);
        try {
            if (isEditing) {
                await onUpdate(getControlId(initialValue), {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    status: form.status,
                });
            } else {
                await onCreate({
                    framework: form.framework,
                    controlId: form.controlId.trim(),
                    title: form.title.trim(),
                    description: form.description.trim(),
                    status: form.status,
                });
                setForm(initialForm);
            }
            document.querySelector(`#${modalId} .btn-close`)?.click();
        } catch (err) {
            setError(err.message || "Failed to save standard");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal fade" id={modalId} tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header border-0">
                        <h5 className="modal-title text-white">{title}</h5>
                        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body border-0">
                            {error && <p className="text-danger mb-3">{error}</p>}

                            <label htmlFor="standardFramework" className='d-block mb-2'>Framework</label>
                            <select
                                id="standardFramework"
                                className='form-control form-select bg-dark text-white mb-3 border-0'
                                value={form.framework}
                                onChange={(event) => updateField("framework", event.target.value)}
                                disabled={isEditing}
                                required
                            >
                                {FRAMEWORKS.map((framework) => (
                                    <option key={framework} value={framework}>{framework.replace("_", " ")}</option>
                                ))}
                            </select>

                            <label htmlFor="standardControlId" className='d-block mb-2'>Control ID</label>
                            <input
                                id="standardControlId"
                                className='form-control bg-dark text-white mb-3 border-0'
                                value={form.controlId}
                                onChange={(event) => updateField("controlId", event.target.value)}
                                placeholder="A.5.1"
                                disabled={isEditing}
                                required
                            />

                            <label htmlFor="standardTitle" className='d-block mb-2'>Title</label>
                            <input
                                id="standardTitle"
                                className='form-control bg-dark text-white mb-3 border-0'
                                value={form.title}
                                onChange={(event) => updateField("title", event.target.value)}
                                placeholder="Information security policies"
                                required
                            />

                            <label htmlFor="standardDescription" className='d-block mb-2'>Description</label>
                            <textarea
                                id="standardDescription"
                                className='form-control bg-dark text-white mb-3 border-0'
                                rows={4}
                                value={form.description}
                                onChange={(event) => updateField("description", event.target.value)}
                                placeholder="Control objective and implementation notes..."
                            />

                            <label htmlFor="standardStatus" className='d-block mb-2'>Status</label>
                            <select
                                id="standardStatus"
                                className='form-control form-select bg-dark text-white border-0'
                                value={form.status}
                                onChange={(event) => updateField("status", event.target.value)}
                            >
                                {STATUSES.map((status) => (
                                    <option key={status.value} value={status.value}>{status.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="modal-footer border-0">
                            <button type="button" className="btn import-btn border-0 btn-primary" data-bs-dismiss="modal">
                                Cancel
                            </button>
                            <button type="submit" className='btn add-btn text-white border-0' disabled={saving}>
                                {saving ? savingLabel : submitLabel}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
