import React from 'react'
import AuditCard from '../components/AuditCard/AuditCard'
import AuditAccordion from '../components/AuditAccordion/AuditAccordion'
import useGrcReports from '../hooks/useGrcReports'

export default function GRCAudits() {
const { reports, findings, loading, error } = useGrcReports({ limit: 20, sort: "-createdAt" });

return <>
    
    <div className='ps-0'>

        <h2 className='text-white mb-5'>
            Active Audits
        </h2>

        <div className='mb-3'>

            {loading && <p className='text-white'>Loading audit reports...</p>}
            {!loading && error && <p className='text-danger'>{error.message || "Failed to load audit reports"}</p>}
            {!loading && !error && reports.length === 0 && (
                <AuditCard
                    title={"No audit reports yet"}
                    desc={"Create a report from backend GRC reports to populate this view."}
                    progrssText={`${findings.length} recent findings available`}
                />
            )}
            {!loading && !error && reports.map((report) => (
                <div className='mb-3' key={report._id}>
                    <AuditCard
                        title={report.title}
                        desc={`Framework: ${report.framework} | Status: ${report.status}`}
                        progrssText={`Findings: ${report.findings?.length || 0}`}
                    />
                </div>
            ))}

        </div>

        {findings.slice(0, 5).map((finding, index) => (
            <AuditAccordion
                key={finding._id}
                title={finding.title}
                id={`finding-${index}`}
            />
        ))}

    </div>

</>
}
