import React, { useState, useRef, useEffect } from "react";
import Navbar from "./Navbar";
import "../../styles/Header.css";

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
    <header className="sb-header" ref={menuRef}>
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

      {/* csak ha nyitva van */}
      {open && <Navbar />}
    </header>
  );
}
