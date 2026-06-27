import React, { useState } from 'react'
import { NavLink, Outlet , Link } from 'react-router-dom'



import "./GRC.css"
import HeaderUserMenu from "../../auth/components/HeaderUserMenu";
import HeaderNotifications from "../../auth/components/HeaderNotifications";

import {
    CircleCheck,
    ClipboardCheck,
    FileChartColumnIncreasing,
    LayoutGrid,
    Settings,
    Menu,
} from 'lucide-react'

export default function GRC() {

    const [collapsed, setCollapsed] = useState(false)

    return (
        <>
            {/* ================= LAYOUT ================= */}
            <div className='main-layout'>

                {/* DESKTOP SIDEBAR */}
                <aside className='d-none d-lg-block'>

                    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>

                        <SidebarLinks collapsed={collapsed} />

                    </div>

                </aside>

                {/* CONTENT */}
                <main className='content'>
                    {/* ================= HEADER ================= */}
                    <header className='topbar'>

                    <div className='left-section'>

                        {/* Mobile open sidebar */}
                        <button
                            className='btn text-white border-0 p-0 d-lg-none'
                            data-bs-toggle="offcanvas"
                            data-bs-target="#mobileSidebar"
                        >
                            <Menu size={28} />
                        </button>

                        {/* Desktop collapse */}
                        <button
                            className='btn text-white border-0 p-0 d-none d-lg-block'
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            <Menu size={28} />
                        </button>

                        <Link to="/GRC" className="text-decoration-none">
                            <h1 className="logo m-0">LumiSec</h1>
                        </Link>

                    </div>

                        {/* SEARCH */}
                        <div className='search-container'>

                            <i className="fa-brands fa-sistrix search-icon"></i>

                            <input
                                type="text"
                                className='form-control header-search-input rounded-5'
                                placeholder='Search tasks...'
                            />

                        </div>

                        {/* RIGHT */}
                        <div className='right-section'>

                            <HeaderNotifications
                                viewAllPath="/GRC/Remediation"
                                viewAllLabel="View remediation tasks"
                                emptyMessage="No new task notifications"
                            />

                            <HeaderUserMenu />

                        </div>

                    </header>
                    <Outlet />
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

function SidebarLinks({ collapsed }) {

    return (
        <nav className='d-flex flex-column gap-2'>

            <NavItem to="/GRC" icon={<LayoutGrid size={22} />} text="Dashboard" collapsed={collapsed} />
            <NavItem to="/GRC/Audits" icon={<CircleCheck size={22} />} text="Audits" collapsed={collapsed} />
            <NavItem to="/GRC/Standards" icon={<FileChartColumnIncreasing size={22} />} text="Standards" collapsed={collapsed} />
            <NavItem to="/GRC/Remediation" icon={<ClipboardCheck size={22} />} text="Remediation" collapsed={collapsed} />
            <NavItem to="/GRC/Settings" icon={<Settings size={22} />} text="Settings" collapsed={collapsed} />

        </nav>
    )
}

function NavItem({ to, icon, text, collapsed }) {

    return (
        <NavLink
            to={to}
            end={to === "/GRC"}
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
