import React, { useState } from 'react'
import AuditCard from '../components/AuditCard/AuditCard'
import AuditAccordion from '../components/AuditAccordion/AuditAccordion'
import AddFindingModal from '../components/FindingModal/AddFindingModal'
import AddReportModal from '../components/ReportModal/AddReportModal'
import ReportDetailModal from '../components/ReportModal/ReportDetailModal'
import useGrcReports from '../hooks/useGrcReports'
import useGrcAssignees from '../hooks/useGrcAssignees'
import { reportProgressPercent } from '../utils/grcNormalizers'

const severityClass = {
    low: "p-btn",
    medium: "p-btn",
    high: "bg-danger",
    critical: "bg-danger",
};

export default function GRCAudits() {
const {
    reports,
    findings,
    loading,
    error,
    createFinding,
    createReport,
    addReportFindings,
    generateReport,
    reload,
} = useGrcReports({ limit: 20, sort: "-createdAt" });
const { assignees } = useGrcAssignees({ limit: 100 });

const [showAddFinding, setShowAddFinding] = useState(false);
const [showAddReport, setShowAddReport] = useState(false);
const [viewReportId, setViewReportId] = useState(null);

return <>
    <div className='ps-0'>
        <div className='d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3'>
            <h2 className='text-white mb-0'>
                Active Audits
            </h2>
            <div className='d-flex flex-wrap gap-2'>
                <button
                    type="button"
                    className='btn add-btn text-white border-0'
                    onClick={() => setShowAddReport(true)}
                >
                    <i className="fa-solid fa-plus me-2"></i>Create Report
                </button>
                <button
                    type="button"
                    className='btn grc-edit-btn'
                    onClick={() => setShowAddFinding(true)}
                >
                    <i className="fa-solid fa-plus me-1"></i>Add Finding
                </button>
            </div>
        </div>

        <div className='mb-3'>
            {loading && <p className='text-white'>Loading audit reports...</p>}
            {!loading && error && <p className='text-danger'>{error.message || "Failed to load audit reports"}</p>}
            {!loading && !error && reports.length === 0 && (
                <AuditCard
                    title={"No audit reports yet"}
                    desc={"Create a report to track audit progress and link findings from this page."}
                    progrssText={`${findings.length} finding${findings.length === 1 ? "" : "s"} available to link`}
                    progressPercent={findings.length > 0 ? 15 : 5}
                />
            )}
            {!loading && !error && reports.map((report) => (
                <div className='mb-3' key={report._id}>
                    <AuditCard
                        title={report.title}
                        desc={`Framework: ${report.framework} | Status: ${report.status}`}
                        progrssText={`Findings: ${report.findingsCount ?? 0} · ${report.status}`}
                        progressPercent={reportProgressPercent(report.status)}
                        onAction={() => setViewReportId(report._id ?? report.id)}
                    />
                </div>
            ))}
        </div>

        <h3 className='text-white mb-3'>Recent Findings</h3>
        {loading && <p className='text-white'>Loading findings...</p>}
        {!loading && findings.length === 0 && (
            <p className='text-white-50'>No findings yet. Click <strong>Add Finding</strong> to create one.</p>
        )}
        {!loading && findings.map((finding, index) => (
            <AuditAccordion
                key={finding._id ?? finding.id}
                finding={finding}
                id={`finding-${finding._id ?? finding.id ?? index}`}
                severityClass={severityClass[finding.severity] ?? "p-btn"}
            />
        ))}
    </div>

    <AddFindingModal
        show={showAddFinding}
        onClose={() => setShowAddFinding(false)}
        onCreate={createFinding}
        assignees={assignees}
    />
    <AddReportModal
        show={showAddReport}
        onClose={() => setShowAddReport(false)}
        onCreate={createReport}
        findings={findings}
    />
    <ReportDetailModal
        show={Boolean(viewReportId)}
        reportId={viewReportId}
        onClose={() => setViewReportId(null)}
        allFindings={findings}
        onAddFindings={addReportFindings}
        onGenerate={generateReport}
        onUpdated={reload}
    />
</>
}
