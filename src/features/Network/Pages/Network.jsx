import React, { useState } from 'react'
import { NavLink, Outlet , Link } from 'react-router-dom'



import "./Network.css"

import {
    CircleCheck,
    ClipboardCheck,
    FileChartColumnIncreasing,
    LayoutGrid,
    Settings,
    Menu,
    Shield,
} from 'lucide-react'

export default function Network() {

    const [collapsed, setCollapsed] = useState(false)
    const [title, setTitle] = useState(null)


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

                        <Link to="/Network" className="text-decoration-none">
                            <h1 className="logo m-0">LumiSec</h1>
                        </Link>


                        <div className='d-flex align-items-center mt-2 ms-5'>
                            <h3 className='text-white mb-0 me-3'>{title}</h3>
                            <p className='system rounded-5 mb-0 ps-4'>System Active</p>
                        </div>

                    </div>


                        {/* RIGHT */}
                        <div className='right-section'>

                            <div className='d-flex justify-content-between align-items-center'>

                                <p className='threate mb-0 rounded-3 me-3'><Shield size={25} className='pe-1' style={{color: "#06B6D4"}} />Threat Level: <span className='network-high fw-medium border-0'>High</span></p>
                                <p className=' mb-0 date'>Saturday, June 6, 2026</p>

                            </div>
                        </div>

                    </header>
                    <Outlet context = {{title , setTitle}} />
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

            <NavItem to="/Network" icon={<LayoutGrid size={22} />} text="Dashboard" collapsed={collapsed} />
            <NavItem to="/Network/NetworkDiscovery" icon={<CircleCheck size={22} />} text="Network Discovery" collapsed={collapsed} />
            <NavItem to="/Network/PortScanning" icon={<FileChartColumnIncreasing size={22} />} text="Port Scanning" collapsed={collapsed} />
            <NavItem to="/Network/PacketCapture" icon={<ClipboardCheck size={22} />} text="Packet Capture" collapsed={collapsed} />
            <NavItem to="/Network/AssetInventory" icon={<Settings size={22} />} text="Asset Inventory" collapsed={collapsed} />
            <NavItem to="/Network/Misconfigurations" icon={<Settings size={22} />} text="Misconfigurations" collapsed={collapsed} />
            <NavItem to="/Network/FlowMonitoring" icon={<Settings size={22} />} text="Flow Monitoring" collapsed={collapsed} />


        </nav>
    )
}

function NavItem({ to, icon, text, collapsed }) {

    return (
        <NavLink
            to={to}
            end={to === "/Network"}
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
