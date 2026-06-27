import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useClickOutside from "./useClickOutside";

import "./HeaderShared.css";

export default function HeaderUserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useClickOutside(rootRef, () => setOpen(false), open);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/", { replace: true });
  };

  const displayName = user?.name || user?.email || "User";
  const displayRole = user?.role
    ? String(user.role).replace(/_/g, " ")
    : "Authenticated";

  return (
    <div className="header-dropdown-wrap" ref={rootRef}>
      <button
        type="button"
        className="header-avatar-btn"
        aria-label="Account menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="profile-figure profile-figure-icon">
          <i className="fa-solid fa-user" aria-hidden />
        </span>
      </button>

      {open && (
        <div className="header-dropdown-menu header-dropdown-menu-end">
          <div className="header-dropdown-header">
            <p className="text-white mb-0 fw-medium">{displayName}</p>
            {user?.email && user.email !== displayName && (
              <p className="header-dropdown-meta mb-0">{user.email}</p>
            )}
            <p className="header-dropdown-meta mb-0 text-capitalize">{displayRole}</p>
          </div>
          <Link
            to="/welcome"
            className="header-dropdown-item"
            onClick={() => setOpen(false)}
          >
            <i className="fa-solid fa-house me-2" aria-hidden />
            Platform home
          </Link>
          <button type="button" className="header-dropdown-item header-dropdown-item-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket me-2" aria-hidden />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
