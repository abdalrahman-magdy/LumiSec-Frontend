import React from "react";
import { useNavigate } from "react-router-dom";
import profile from "../../../assets/prrofile.png";
import { useAuth } from "../context/AuthContext";

export default function HeaderUserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const displayName = user?.name || user?.email || "User";
  const displayRole = user?.role
    ? String(user.role).charAt(0).toUpperCase() + String(user.role).slice(1)
    : "Authenticated";

  return (
    <div className="d-flex align-items-center gap-3">
      <figure className="profile-figure mb-0">
        <img src={profile} alt="profile" />
      </figure>
      <div className="user-info d-none d-md-block">
        <p className="text-white mb-0">{displayName}</p>
        <p className="header-role mb-0">{displayRole}</p>
      </div>
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary text-secondary border-secondary"
        onClick={handleLogout}
        title="Sign out"
      >
        <i className="fa-solid fa-right-from-bracket" />
      </button>
    </div>
  );
}
