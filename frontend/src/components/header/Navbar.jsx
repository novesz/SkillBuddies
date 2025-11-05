import React from "react";
import "../../styles/Navbar.css";
import AboutPage from "../../pages/AboutPage";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-box">
        <ul>
          <li><a href="#">Profile</a></li>
          <li><a href="#">Group Finder</a></li>
          <li><a href="#">Support</a></li>
          <li><a href="/about">About</a></li>
        </ul>
      </div>
    </nav>
  );
}
