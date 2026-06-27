import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  FileCheck2,
  LogOut,
  Mail,
  Network,
  Shield,
} from "lucide-react";
import logo from "../../assets/LumiSecLogoB 1@3x.png";
import { useAuth } from "../auth/context/AuthContext";
import "./WelcomePage.css";

export default function WelcomePage() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <main className="lumisec-shell">
      <aside className="welcome-sidebar" aria-label="LumiSec navigation">
        <Link className="welcome-brand" to="/welcome">
          <img src={logo} alt="LumiSec" />
          <span>LUMISEC</span>
        </Link>

        <nav className="welcome-nav">
          <NavLink className="welcome-nav-link" to="/Phishing">
            <Mail aria-hidden="true" />
            <span>Phishing</span>
          </NavLink>
          <NavLink className="welcome-nav-link" to="/GRC">
            <FileCheck2 aria-hidden="true" />
            <span>GRC</span>
          </NavLink>
          <NavLink className="welcome-nav-link" to="/SOAR">
            <Shield aria-hidden="true" />
            <span>SOAR</span>
          </NavLink>
          <NavLink className="welcome-nav-link" to="/Network">
            <Network aria-hidden="true" />
            <span>Network</span>
          </NavLink>
        </nav>

        {isAuthenticated ? (
          <button className="logout-button" type="button" onClick={logout}>
            <LogOut aria-hidden="true" />
            <span>Log Out</span>
          </button>
        ) : (
          <Link className="logout-button" to="/login">
            <LogOut aria-hidden="true" />
            <span>Log In</span>
          </Link>
        )}
      </aside>

      <section className="welcome-content">
        <Outlet />
      </section>
    </main>
  );
}
