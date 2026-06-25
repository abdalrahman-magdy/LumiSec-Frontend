import React from 'react'
import "./RemedationTabel.css"
export default function RemedationTabel({ tasks = [], loading = false, error = null, onEdit }) {
  const colSpan = onEdit ? "7" : "6";
  return <>
  
  <div className='rounded-3 overflow-hidden'>
  <table className='w-100 RemedationTabel'>
    <thead>
        <tr>
            <th>Control ID</th>
            <th className=''>Finding</th>
            <th>Risk</th>
            <th>Assigned To</th>
            <th>Due Date</th>
            <th>Status</th>
            {onEdit && <th>Actions</th>}
        </tr>
    </thead>
    <tbody>
        {loading && <tr><td colSpan={colSpan}>Loading remediation tasks...</td></tr>}
        {!loading && error && <tr><td colSpan={colSpan}>{error.message || "Failed to load remediation tasks"}</td></tr>}
        {!loading && !error && tasks.length === 0 && <tr><td colSpan={colSpan}>No remediation tasks found.</td></tr>}
        {!loading && !error && tasks.map((task) => (
            <tr key={task._id ?? task.id}>
                <td>{task.controlId || task.control?.controlId || "—"}</td>
                <td>{task.title || task.description || "Untitled task"}</td>
                <td className={`risk-td ${task.priority === "low" ? "low" : task.priority === "medium" ? "meduim" : "high"} p-0`}>
                    <p className='text-capitalize'>{task.priority || "medium"}</p>
                </td>
                <td>{task.assignedTo?.name || task.assignedTo?.email || "Unassigned"}</td>
                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</td>
                <td className={`risk-td ${task.status === "completed" || task.status === "verified" ? "green" : task.status === "in_progress" ? "meduim" : "high"} p-0`}>
                    <p className='text-capitalize'>{String(task.status || "open").replaceAll("_", " ")}</p>
                </td>
                {onEdit && (
                    <td>
                        <button
                            type="button"
                            className="btn btn-sm integration-btn"
                            data-bs-toggle="modal"
                            data-bs-target="#EditTaskRemediationModal"
                            onClick={() => onEdit(task)}
                        >
                            Edit
                        </button>
                    </td>
                )}
            </tr>
        ))}
    </tbody>
  </table>
  
  </div>
  
  </>
}
