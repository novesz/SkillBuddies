import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import "../../styles/Header.css";
import "../../styles/PfDropdown.css";

export default function PfDropdown({ avatarUrl, isLoggedIn }) {
  const [open, setOpen] = useState(false); // lowercase "open"
  const profileRef = useRef(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  const togglePopup = () => {
    if (!open && profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setPopupPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 70,
      });
    }
    setOpen(!open);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3001/logout",
        {},
        { withCredentials: true }
        
      );
      
      alert("Logged out successfully!");
      window.location.href = "/";
    } catch (error) {
      alert("Logout failed");
      console.error(error);
    }
  };

  useEffect(() => {
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={profileRef} className="profile-container">
      <img
        className="sb-profile-img profile-pic"
        aria-label="Menu"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={togglePopup}
        src={avatarUrl}
        alt="Profile"
      />

      {open && (
        <div
          className="profile-popup"
          style={{ top: popupPosition.top, left: -70 }}
        >
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="link-item">
                <p>Profile</p>
              </Link>
              <button
                className="link-item"
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  margin: "5px 0",
                  fontSize: "18px",
                  fontWeight: 500,
                  textDecoration: "underline",
                  color: "black",
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="link-item">
                <p>Login</p>
              </Link>
              <Link to="/register" className="link-item">
                <p>Register</p>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
