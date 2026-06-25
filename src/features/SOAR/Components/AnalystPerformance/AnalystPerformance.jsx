import React from 'react'
import profileImage from "../../../../assets/prrofile.png"
import "./AnalystPerformance.css"
export default function AnalystPerformance({ analysts = [], loading = false, onViewAll }) {
    const rows = analysts.slice(0, 5);

  return <>
  
  <div className='AnalystPerformanceTabel-card rounded-3 p-3 w-100'>

    <div className='d-flex justify-content-between align-items-center'>
        <h3 className='text-white mb-3'>Analyst Performance</h3>
        <button className='AnalystPerformanceTabel-view-all' type='button' onClick={onViewAll}>View All</button>
    </div>

    <table className='AnalystPerformanceTabel'>
        <thead>
            <tr>
                <th>Analyst Name</th>
                <th>Incidents Resolved Avg</th>
                <th>Avg. Response Time</th>
            </tr>
        </thead>

        <tbody>
            {loading && (
                <tr><td colSpan="3">Loading analysts...</td></tr>
            )}
            {!loading && rows.length === 0 && (
                <tr><td colSpan="3">No analyst data yet.</td></tr>
            )}
            {!loading && rows.map((row) => (
                <tr key={row.analyst?._id || row.analyst?.email || row.analyst?.name}>
                    <td>
                        <div className='d-flex align-items-center'>
                            <figure className='mb-0 me-2'>
                                <img className='rounded-circle w-100' src={profileImage} alt="profileImage" />
                            </figure>
                            <p className='mb-0'>{row.analyst?.name || row.analyst?.email || "Unknown analyst"}</p>
                        </div>
                    </td>
                    <td>{row.closed ?? row.assigned ?? 0}</td>
                    <td>{row.open ?? 0} open</td>
                </tr>
            ))}
        </tbody>

    </table>
  
  </div>
  
  </>
}
