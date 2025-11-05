import React from "react";
import "../styles/LoginPage.css";
import Header from "../components/header/Header";

export default function LoginPage() {
  return (
    <div className="login-page">
      <Header />
      <div className="login-container">
        <h2 className="login-title">REGISTER</h2>
        <form className="login-form">
          
          <div className="name-row">
            <input type="text" placeholder="First name" required />
            <input type="text" placeholder="Second name" required />
          </div>

          <input type="text" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <input type="password" placeholder="Password again" required />

          <button type="submit" className="login-button">REGISTER</button>
        </form>

        <div className="login-links">
          <a href="#">Forgot password?</a>
          <a href="/login">Already have an account? Log in</a>
        </div>
      </div>
    </div>
  );
}
