import React, { useState } from 'react'
import AddTaskRemediationModal from '../components/TaskRemediationModal/AddTaskRemediationModal'
import RemedationTabel from '../components/RemedationTabel/RemedationTabel'
import useGrcTasks from '../hooks/useGrcTasks'
import useGrcFindings from '../hooks/useGrcFindings'
import useGrcAssignees from '../hooks/useGrcAssignees'

export default function GRCRemediation() {
const { tasks, loading, error, createTask, updateTask } = useGrcTasks({ limit: 50, sort: "-createdAt" });
const { findings } = useGrcFindings({ limit: 100, sort: "-createdAt" });
const { assignees } = useGrcAssignees({ limit: 100 });
const [showAddModal, setShowAddModal] = useState(false);
const [editTask, setEditTask] = useState(null);

return <>
    <div className='d-flex justify-content-between align-items-center mb-5'>
        <h1 className='text-white'>Remediation Tasks</h1>
        <button
            type="button"
            className='btn add-btn text-white border-0'
            onClick={() => setShowAddModal(true)}
        >
            <i className="fa-solid fa-plus me-2"></i>New Task
        </button>
    </div>
    <div>
        <RemedationTabel
            tasks={tasks}
            loading={loading}
            error={error}
            onEdit={(task) => setEditTask(task)}
        />
    </div>

    <AddTaskRemediationModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        findings={findings}
        assignees={assignees}
        onCreate={createTask}
    />
    <AddTaskRemediationModal
        show={Boolean(editTask)}
        onClose={() => setEditTask(null)}
        title="Edit Remediation Task"
        submitLabel="Save Task"
        findings={findings}
        assignees={assignees}
        initialValue={editTask}
        onUpdate={updateTask}
    />

</>
}
