import React, { useState, useRef, useEffect } from "react";
import "../styles/Header.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
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
      <button
        className={`sb-hamburger ${open ? "is-open" : ""}`}
        aria-label="Menü"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <span></span><span></span><span></span>
      </button>

      <div className="sb-brand">
        <img src="/SBLogo.png" alt="SkillBuddies" className="sb-logo-only" />
      </div>

      <button className="sb-profile" aria-label="Profil" />

      {/* LENYÍLÓ MENÜ */}
      <nav
        ref={menuRef}
        className={`sb-menu ${open ? "open" : ""}`}
        aria-label="Főmenü"
      >
        <ul>
          <li><a href="#">Group Finder</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Support</a></li>
          <li><a href="#">Profile</a></li>
        </ul>
      </nav>
    </header>
  );
}
