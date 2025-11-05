import React from "react";
import "../../styles/Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-box">
        <ul>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/">Group Finder</Link></li>
          <li><Link to="/support">Support</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
      </div>
    </nav>
  );
}
