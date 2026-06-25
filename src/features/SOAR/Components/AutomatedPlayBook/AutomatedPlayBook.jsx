import React from 'react'
import "./AutomatedPlayBook.css"
import { Bug } from 'lucide-react'

export default function AutomatedPlayBook({ playbooks = [], loading = false, onViewAll }) {
    const rows = playbooks.slice(0, 5);

  return <>
  
  <div className='AutomatedPlayBook-card rounded-3 p-3 w-100'>

<div className='d-flex justify-content-between align-items-center'>
    <h3 className='text-white mb-3'>Top Automated Playbooks</h3>
    <button className='AutomatedPlayBook-view-all' type='button' onClick={onViewAll}>View All</button>
</div>

<table className='AutomatedPlayBook w-100'>
    <thead>
        <tr>
            <th>Playbook Name</th>
            <th>Times Executed</th>
            <th>Time Saved</th>
        </tr>
    </thead>

    <tbody>
        {loading && <tr><td colSpan="3">Loading playbooks...</td></tr>}
        {!loading && rows.length === 0 && <tr><td colSpan="3">No playbook runs yet.</td></tr>}
        {!loading && rows.map((playbook) => (
            <tr key={playbook.playbookId || playbook.name}>
                <td>
                    <div className='d-flex align-items-center'>
                        <Bug color='#10B981' className='me-2' />
                        <p className='mb-0'>{playbook.name || "Unnamed playbook"}</p>
                    </div>
                </td>
                <td>{playbook.runs ?? 0}</td>
                <td>{Math.round(playbook.successRate ?? 0)}%</td>
            </tr>
        ))}
    </tbody>

</table>

</div>
  
  </>
}
