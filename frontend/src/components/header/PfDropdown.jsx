import React, { useState, useRef, useEffect } from "react";
import {Link} from "react-router-dom";

import "../../styles/Header.css";
import "../../styles/PfDropdown.css";

export default function PfDropdown({ avatarUrl }) {
  const [Open, setOpen] = useState(false);
  const profileRef = useRef(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const togglePopup = () => {
    if (!Open && profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setPopupPosition({ top: rect.bottom + window.scrollY, left: window.scrollX - 70 });
    }
    setOpen(!Open);
  };
  useEffect(() => {
      const onDocClick = (e) => {
        // kattintás a hamburger-blokkon kívül: zárd be
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
    <div className="" ref={profileRef}>
      <img
        className={`sb-profile-img`}
        aria-label="Menu"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={togglePopup}
        src={avatarUrl}
        alt="Profile"
        
      />

      {Open && (
        <div
          className="profile-popup"
          style={{ top: popupPosition.top, left: popupPosition.left }}
          onClick={() => setOpen(false)}
        >
            {isLoggedIn ? (
                <>
                    <Link to="/profile" className="link-item"><p>profile</p></Link>
                </>
            ) : (
                <>
                    <Link to="/login" className="link-item"><p>login</p></Link>
                    <Link to="/register" className="link-item"><p>register</p></Link>
                </>
            )}
          
        </div>
      )}
    </div>
  );
}

