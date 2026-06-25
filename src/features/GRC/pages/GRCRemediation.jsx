import React, { useState } from 'react'
import AddTaskRemediationModal from '../components/TaskRemediationModal/AddTaskRemediationModal'
import RemedationTabel from '../components/RemedationTabel/RemedationTabel'
import useGrcTasks from '../hooks/useGrcTasks'
import useGrcFindings from '../hooks/useGrcFindings'

export default function GRCRemediation() {
const { tasks, loading, error, createTask, updateTask } = useGrcTasks({ limit: 50, sort: "-createdAt" });
const { findings } = useGrcFindings({ limit: 100, sort: "-createdAt" });
const [selectedTask, setSelectedTask] = useState(null);
return <>
    <div className='d-flex justify-content-between align-items-center mb-5'>
                <h1 className='text-white'>Standards Library</h1>
                <button className='btn add-btn text-white border-0' data-bs-toggle="modal" data-bs-target="#AddTaskRemediationModal"><i className="fa-solid fa-plus me-2"></i>New Task</button>
    </div>
    <div>
        <RemedationTabel tasks={tasks} loading={loading} error={error} onEdit={setSelectedTask} />
    </div>


<AddTaskRemediationModal findings={findings} onCreate={createTask} />
<AddTaskRemediationModal
    modalId="EditTaskRemediationModal"
    title="Edit Remediation Task"
    submitLabel="Save Task"
    findings={findings}
    initialValue={selectedTask}
    onUpdate={updateTask}
/>

</>
}
