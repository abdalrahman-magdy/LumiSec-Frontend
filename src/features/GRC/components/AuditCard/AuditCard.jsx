import React from 'react'
import "./AuditCard.css"

export default function AuditCard({
    title,
    desc,
    progrssText,
    progressPercent = 25,
    actionLabel = "View Report",
    onAction,
}) {
return <>
        <div className='audit-card row gx-0 gy-4 justify-content-between align-items-center rounded-3 p-3'>
            <div className='col-12 col-md-4 col-lg-5 px-2'>
                <h4 className='text-white audit-title'>
                    {title}
                </h4>
                <p className='desc mb-0'>
                    {desc}
                </p>
            </div>

            <div className='col-12 col-md-4 col-lg-3 px-2'>
                <p className='mb-2'>
                    {progrssText}
                </p>
                <div className="progress">
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${progressPercent}%` }}
                        aria-valuenow={progressPercent}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    ></div>
                </div>
            </div>

            <div className='col-12 col-md-4 col-lg-3 d-flex justify-content-md-end px-2'>
                {onAction ? (
                    <button
                        type="button"
                        className='save-btn p-2 px-3 rounded-3 text-white border-0 w-100 w-md-auto'
                        onClick={onAction}
                    >
                        <i className="fa-solid fa-eye pe-2"></i>
                        {actionLabel}
                    </button>
                ) : null}
            </div>
        </div>
</>
}
