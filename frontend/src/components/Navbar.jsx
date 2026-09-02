import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import apiClient from "../api/client";

function Navbar() {
  const navigate = useNavigate();

  const [isAdmin, setIsAdmin] =
    useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response =
          await apiClient.get(
            "/users/profile/"
          );

        setIsAdmin(
          response.data.role === "ADMIN"
        );
      } catch (error) {
        console.error(
          "Profile loading failed:",
          error
        );
      }
    };

    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "refreshToken"
    );

    navigate("/login");
  };

  return (
    <nav className="navbar">
      <h2>DSA Tracker</h2>

      <div className="nav-links">
        <NavLink to="/dashboard">
          Dashboard
        </NavLink>

        <NavLink to="/questions">
          Questions
        </NavLink>

        <NavLink to="/progress">
          My Progress
        </NavLink>

        <NavLink to="/profile">
          Profile
        </NavLink>

        {isAdmin && (
          <NavLink to="/admin/questions">
            Admin
          </NavLink>
        )}

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;