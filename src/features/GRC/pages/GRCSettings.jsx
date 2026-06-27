import React from 'react'
import "./GRCSettings.css"
import ProfileModal from '../components/ProfileModal/ProfileModal'
import UserManagementPanel from '../components/UserManagement/UserManagementPanel'

export default function GRCSettings() {
return <>
    <div>
        <h1 className='text-white'>Settings</h1>
        <ul className="nav mb-4" id="myTab" role="tablist">
            <li className="nav-item">
                <a className="nav-link active" data-bs-toggle="tab" href="#Profile">Profile</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" data-bs-toggle="tab"  href="#UserManagement">User Management</a>
            </li>
            <li className="nav-item">
                <a className="nav-link" data-bs-toggle="tab" href="#Integrations">Integrations</a>
            </li>
        </ul>

        <div className="tab-content" id="pills-tabContent">
            <div className="tab-pane fade show active" id="Profile" role="tabpanel" aria-labelledby="Profile">
                <ProfileModal />
            </div>
            <div className="tab-pane fade" id="UserManagement" role="tabpanel" aria-labelledby="UserManagement">
                <UserManagementPanel />
            </div>
            <div className="tab-pane fade text-white" id="Integrations" role="tabpanel" aria-labelledby="Integrations">
                Integrations configuration is not available in this release.
            </div>
        </div>
    </div>

</>
}
