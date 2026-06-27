import React, { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import "./Phishing.css";
import {
  LayoutGrid,
  Mail,
  FileText,
  Globe,
  Users,
  Activity,
  BarChart3,
  Settings,
  Menu,
  Shield,
} from "lucide-react";
import { getPhishingRole, isDevRoleSwitcherEnabled, ROLES, setPhishingRole } from "../utils/roles";
import { getUser } from "../../auth/utils/authStorage";
import HeaderNotifications from "../../auth/components/HeaderNotifications";
import HeaderUserMenu from "../../auth/components/HeaderUserMenu";

export default function Phishing() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const devRoleSwitcher = isDevRoleSwitcherEnabled();
  const authUser = getUser();
  const role = getPhishingRole();
  const roleLabel = (authUser?.role ?? role ?? "user").replace(/_/g, " ");

  return (
    <>
      <div className="main-layout">
        <aside className="d-none d-lg-block">
          <div className={collapsed ? "sidebar collapsed" : "sidebar"}>
            <SidebarLinks collapsed={collapsed} />
          </div>
        </aside>
        <main className="content">
          <header className="topbar">
            <div className="left-section">
              <button className="btn text-white border-0 p-0 d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#mobileSidebar">
                <Menu size={28} />
              </button>
              <button className="btn text-white border-0 p-0 d-none d-lg-block" onClick={() => setCollapsed(!collapsed)}>
                <Menu size={28} />
              </button>
              <Link to="/Phishing" className="text-decoration-none">
                <h1 className="logo m-0">LumiSec</h1>
              </Link>
              <span className="role-badge ms-2 d-none d-md-inline text-capitalize">{roleLabel}</span>
            </div>

            <div className="right-section">
              {devRoleSwitcher && (
              <select
                className="form-select scanType-select border-0 me-2 d-none d-md-block"
                style={{ width: 160 }}
                value={role || ROLES.MANAGER}
                onChange={(e) => setPhishingRole(e.target.value)}
                title="Dev role switcher"
              >
                <option value={ROLES.MANAGER}>phishing_manager</option>
                <option value={ROLES.OPERATOR}>phishing_operator</option>
                <option value={ROLES.INTEGRATION}>integration_admin</option>
                <option value={ROLES.SOC_ANALYST}>soc_analyst</option>
              </select>
              )}
              <button type="button" className="btn add-btn text-white border-0" onClick={() => navigate("/Phishing/Campaigns/create")}>
                <i className="fa-solid fa-plus me-2" />
                New Campaign
              </button>
              <HeaderNotifications
                viewAllPath="/Phishing/Tracking/Timeline"
                viewAllLabel="View live timeline"
                emptyMessage="No new phishing alerts"
              />
              <HeaderUserMenu />
            </div>
          </header>
          <Outlet />
        </main>
      </div>

      <div className="offcanvas offcanvas-start sidebar-offcanvas d-lg-none" tabIndex="-1" id="mobileSidebar">
        <div className="offcanvas-body">
          <SidebarLinks collapsed={false} />
        </div>
      </div>
    </>
  );
}

function SidebarLinks({ collapsed }) {
  return (
    <nav className="d-flex flex-column gap-2">
      <NavItem to="/Phishing" icon={<LayoutGrid size={22} />} text="Overview" collapsed={collapsed} end />
      <NavItem to="/Phishing/Dashboard/Risks" icon={<Shield size={22} />} text="Risks" collapsed={collapsed} />
      <NavItem to="/Phishing/Dashboard/Departments" icon={<BarChart3 size={22} />} text="Departments" collapsed={collapsed} />
      <NavItem to="/Phishing/Dashboard/Trends" icon={<Activity size={22} />} text="Trends" collapsed={collapsed} />
      <NavItem to="/Phishing/Campaigns" icon={<Mail size={22} />} text="Campaigns" collapsed={collapsed} />
      <NavItem to="/Phishing/Templates" icon={<FileText size={22} />} text="Templates" collapsed={collapsed} />
      <NavItem to="/Phishing/LandingPages" icon={<Globe size={22} />} text="Landing Pages" collapsed={collapsed} />
      <NavItem to="/Phishing/Recipients" icon={<Users size={22} />} text="Recipients" collapsed={collapsed} />
      <NavItem to="/Phishing/Tracking/Timeline" icon={<Activity size={22} />} text="Live Timeline" collapsed={collapsed} />
      <NavItem to="/Phishing/Tracking/Logs" icon={<Activity size={22} />} text="Tracking Logs" collapsed={collapsed} />
      <NavItem to="/Phishing/Reports" icon={<BarChart3 size={22} />} text="Reports" collapsed={collapsed} />
      <NavItem to="/Phishing/Settings" icon={<Settings size={22} />} text="Settings" collapsed={collapsed} />
    </nav>
  );
}

function NavItem({ to, icon, text, collapsed, end }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}>
      <span className="icon">{icon}</span>
      {!collapsed && <span className="text">{text}</span>}
    </NavLink>
  );
}
