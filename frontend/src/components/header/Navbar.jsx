import React from "react";
import "../../styles/Navbar.css";
import { Link } from "react-router-dom";

export default function Navbar({ isLoggedIn }) {
  return (
    <nav className="navbar">
      <div className="navbar-box">
        <ul>
          {isLoggedIn && (
            <>
              <li><Link to="/">Group Finder</Link></li>
              <li><Link to="/groupeditor">Create group</Link></li>
            </>
          )}
          <li><Link to="/support">Support</Link></li>
          <li><Link to="/about">About</Link></li>
          {isLoggedIn && (
            <li><Link to="/chat">Chat</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
}
