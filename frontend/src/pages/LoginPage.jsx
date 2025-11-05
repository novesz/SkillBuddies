import React from "react";
import "../styles/LoginPage.css";
import Header from "../components/header/Header";

export default function LoginPage() {
    
    
  return (
    
    <div className="login-page">
         <Header />
      <div className="login-container">
        <h2 className="login-title">LOGIN</h2>
        <form className="login-form">
          <input type="text" placeholder="Username/Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit" className="login-button">LOGIN</button>
          
        </form>
        <div className="login-links">
          <a href="#">Forgot password?</a>
          <a href="/register">Don’t have an account? Register</a>
        </div>
      </div>
    </div>
  );
}

