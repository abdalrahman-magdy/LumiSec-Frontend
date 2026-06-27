import React, { useState } from 'react'
import StandardsCard from '../components/StandardsCard/StandardsCard'
import "./GRCStandards.css"
import "../components/RemedationTabel/RemedationTabel.css"
import AddStandardModal from '../components/StandardModal/AddStandardModal'
import useGrcControls from '../hooks/useGrcControls'

const frameworkColors = {
    ISO27001: "#7F56D9",
    PCI_DSS: "#539BFF",
    SOC2: "#059669",
    NIST: "#F79009",
};

function summarizeControls(controls = []) {
    const groups = controls.reduce((acc, control) => {
        const framework = control.framework || "UNSPECIFIED";
        acc[framework] = acc[framework] || [];
        acc[framework].push(control);
        return acc;
    }, {});

    return Object.entries(groups).map(([framework, items]) => {
        const compliant = items.filter((item) => item.status === "compliant").length;
        const percent = items.length ? Math.round((compliant / items.length) * 100) : 0;
        return { framework, items, compliant, percent };
    });
}

export default function GRCStandards() {
const { controls, loading, error, createControl, updateControl } = useGrcControls({ limit: 100, sort: "framework" });
const [showAddModal, setShowAddModal] = useState(false);
const [editControl, setEditControl] = useState(null);

const summaries = summarizeControls(controls);

return <>
    
    <div>

        <div className='d-flex justify-content-between align-items-center mb-4 mb-lg-5 standards-header gap-3'>

            <h1 className='text-white mb-0'>
                Standards Library
            </h1>

            <button
                type="button"
                className='btn add-btn text-white border-0'
                onClick={() => setShowAddModal(true)}
            >
                <i className="fa-solid fa-plus me-2"></i>
                Add Standard
            </button>

        </div>

        <div className='row g-4'>

            {loading && <p className='text-white'>Loading controls...</p>}
            {!loading && error && <p className='text-danger'>{error.message || "Failed to load controls"}</p>}
            {!loading && !error && summaries.length === 0 && <p className='text-white'>No compliance controls found.</p>}
            {!loading && !error && summaries.map((summary) => (
                <StandardsCard
                    key={summary.framework}
                    backgroundColor={frameworkColors[summary.framework] || "#64748B"}
                    type={summary.framework}
                    title={summary.framework.replace("_", " ")}
                    desc={`Backend compliance controls for ${summary.framework}.`}
                    progressTitle={`Overall Compliance: ${summary.percent}%`}
                    progressPercent={`${summary.percent}%`}
                    Controls={`${summary.items.length} Controls`}
                />
            ))}

        </div>

        {!loading && !error && controls.length > 0 && (
            <div className='rounded-3 overflow-hidden mt-4'>
                <table className='w-100 RemedationTabel'>
                    <thead>
                        <tr>
                            <th>Framework</th>
                            <th>Control ID</th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {controls.map((control) => (
                            <tr key={control._id ?? control.id}>
                                <td>{control.framework}</td>
                                <td>{control.controlId}</td>
                                <td>{control.title}</td>
                                <td className={`risk-td ${control.status === "compliant" ? "green" : control.status === "partially_compliant" ? "meduim" : "high"} p-0`}>
                                    <p className='text-capitalize'>{String(control.status || "not_assessed").replaceAll("_", " ")}</p>
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-sm grc-edit-btn"
                                        onClick={() => setEditControl(control)}
                                    >
                                        <i className="fa-solid fa-pen-to-square me-1" aria-hidden="true"></i>
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

    </div>

    <AddStandardModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={createControl}
    />
    <AddStandardModal
        show={Boolean(editControl)}
        onClose={() => setEditControl(null)}
        title="Edit Standard"
        submitLabel="Save Standard"
        initialValue={editControl}
        onUpdate={updateControl}
    />

</>
}
