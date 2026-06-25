import React, { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'



import "./Soar.css"
import {
    Code2,
    TriangleAlert,
} from 'lucide-react'

export default function Soar() {


    const [collapsed, setCollapsed] = useState(false)



    return (
        <>



            <div className='main-layout soar-main-layout'>
                
                <aside className='d-none d-lg-block'>
                
                            <div className={collapsed ? "sidebar collapsed" : "sidebar"}>
                
                                <SidebarLinks collapsed={collapsed} />
                
                            </div>
                
                </aside>

                {/* CONTENT */}
                <main className='content p-0'>
                    <Outlet context={{ collapsed, setCollapsed }} />
                </main>

            </div>

            {/* ================= MOBILE SIDEBAR (OFFCANVAS) ================= */}
            <div
                className="offcanvas offcanvas-start sidebar-offcanvas d-lg-none"
                tabIndex="-1"
                id="mobileSidebar"
            >

                <div className="offcanvas-body">

                    <SidebarLinks collapsed={false} />

                </div>

            </div>

        </>
    )
}

/* ================= SIDEBAR LINKS ================= */

export function SidebarLinks({ collapsed }) {

    return (
        <nav className='d-flex flex-column gap-2'>

            <NavItem to="/SOAR" icon={<i class="fa-solid fa-chart-pie"></i>} text="Analytics & Reports" collapsed={collapsed} />
            <NavItem to="/SOAR/playbook" icon={<Code2 size={22} />} text="Playbook Builder" collapsed={collapsed} />
            <NavItem to="/SOAR/IncidentsQueue" icon={<i class="fa-solid fa-screwdriver-wrench"></i>} text="Incidents Queue" collapsed={collapsed} />
            <NavItem to="/SOAR/IncidentManagement" icon={<TriangleAlert size={22} />} text="Incident Management" collapsed={collapsed} />


        </nav>
    )
}

function NavItem({ to, icon, text, collapsed }) {

    return (
        <NavLink
            to={to}
            end={to === "/SOAR"}
            className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
            }
        >

            <span className='icon'>
                {icon}
            </span>

            {!collapsed && (
                <span className='text'>
                    {text}
                </span>
            )}

        </NavLink>
    )
}
