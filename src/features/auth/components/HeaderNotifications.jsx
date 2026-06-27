import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import useClickOutside from "./useClickOutside";

import "./HeaderShared.css";

export default function HeaderNotifications({
  viewAllPath,
  viewAllLabel = "View activity",
  emptyMessage = "No new notifications",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useClickOutside(rootRef, () => setOpen(false), open);

  return (
    <div className="header-dropdown-wrap" ref={rootRef}>
      <button
        type="button"
        className="header-icon-btn"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <i className="fa-regular fa-bell" />
      </button>

      {open && (
        <div className="header-dropdown-menu header-dropdown-menu-end">
          <p className="header-dropdown-title">Notifications</p>
          <p className="header-dropdown-empty">{emptyMessage}</p>
          {viewAllPath && (
            <Link
              to={viewAllPath}
              className="header-dropdown-item"
              onClick={() => setOpen(false)}
            >
              <i className="fa-solid fa-arrow-right me-2" aria-hidden />
              {viewAllLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
