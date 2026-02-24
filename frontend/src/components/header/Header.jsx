import React, { useState, useRef, useEffect } from "react";
import Navbar from "./Navbar";
import "../../styles/Header.css";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import PfDropdown from "./PfDropdown";

export default function Header({ isLoggedIn, setIsLoggedIn }) {
  const [open, setOpen] = useState(false);
  const hambRef = useRef(null);
  const { avatarUrl } = useUser();

  useEffect(() => {
    const onDocClick = (e) => {
      if (hambRef.current && !hambRef.current.contains(e.target)) {
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
    <header className="sb-header">
      <div className="hamburger-wrap" ref={hambRef}>
        <button
          className={`sb-hamburger ${open ? "is-open" : ""}`}
          aria-label="Menu"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </button>

        {open && (
          <div className="hamburger-panel">
                   <Navbar isLoggedIn={isLoggedIn} />
          </div>
        )}
      </div>

      <div className="sb-brand">
        <Link to="/">
          <img src="/SBLogo.png" alt="SkillBuddies" className="sb-logo-only" />
        </Link>
      </div>

      <div className="sb-profile">
        <PfDropdown
          avatarUrl={avatarUrl}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
        />
      </div>
    </header>
  );
}
