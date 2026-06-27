import React, { useState } from 'react'
import "./AuditAccordion.css"

export default function AuditAccordion({ finding, id, severityClass = "meduim" }) {
const [isDown , setIsDown] = useState(true)

const title = finding?.title ?? "Untitled finding";
const description = finding?.description ?? "No description provided.";
const controlRef = finding?.control || "—";
const status = finding?.status ?? "open";
const severity = finding?.severity ?? "medium";
const asset = finding?.asset;
const assignee = finding?.assignedTo?.name || finding?.assignedTo?.email;

return <>
<div id="accordion" className='mb-3'>
    <div className="card audit-accordion w-100">
        <div className="card-header" id="headingOne">
            <h5 className="mb-0">
                <div className='d-flex justify-content-between align-items-center gap-3'>
                    <button
                        onClick={() => setIsDown(!isDown)}
                        className="btn btn-link text-decoration-none text-white w-100 text-start accordion-btn"
                        data-bs-toggle="collapse"
                        data-bs-target={`#${id}`}
                        aria-expanded="true"
                        aria-controls={id}
                        type="button"
                    >
                        {title}
                    </button>
                    {isDown
                        ? <i className="fa-solid fa-angle-down accordion-icon"></i>
                        : <i className="fa-solid fa-angle-up accordion-icon"></i>
                    }
                </div>
            </h5>
        </div>

        <div
            id={id}
            className="collapse"
            aria-labelledby="headingOne"
        >
            <div className="card-body ps-2 ps-md-4 ps-lg-5">
                <div className='d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3'>
                    <div className='d-flex justify-content-between align-items-start w-100'>
                        <div>
                            <h5 className='me-3 mb-1 text-capitalize'>
                                {controlRef}
                            </h5>
                            <p className='mb-0'>
                                {description}
                            </p>
                            <p className='mb-0 mt-2 text-white-50 small'>
                                Status: <span className='text-capitalize'>{String(status).replaceAll("_", " ")}</span>
                                {asset ? ` · Asset: ${asset}` : ""}
                                {assignee ? ` · Assigned: ${assignee}` : ""}
                            </p>
                        </div>
                        <button
                            type="button"
                            className={`p-2 py-1 btn text-white flex-shrink-0 text-uppercase ${severityClass}`}
                        >
                            {severity.charAt(0)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</>
}
