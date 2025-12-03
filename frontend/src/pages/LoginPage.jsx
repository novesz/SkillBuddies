import React, { useState } from "react";
import "../styles/LoginPage.css";
import Header from "../components/header/Header";
import axios from "axios";

export default function LoginPage(isLoggedIn, setIsLoggedIn) {
  
    
  return (
    
    <div className="login-page">
        <Header isLoggedIn = {isLoggedIn} setIsLoggedIn = {setIsLoggedIn}/>
      <div className="login-container">
        <h2 className="login-title">LOGIN</h2>
        <form className="login-form" onSubmit={(e) => {
            e.preventDefault();
            const email = e.target[0].value;
            const password = e.target[1].value;
            console.log(email, password);
            axios.post("http://localhost:3001/login", { Email: email, Password: password }, { withCredentials: true })
              .then((response) => {
                isLoggedIn(response.data.loggedIn);
                alert("Login successful!");
                console.log(response.data.loggedIn);
                window.location.href = "/";
                  
              })
              .catch((error) => {
                  alert(error.response?.data?.message || "Login failed");
              });
          }}>
          <input type="text" placeholder="Email" required />
          <input type="password" placeholder="Password" required />
          <button type="submit" className="login-button">LOGIN</button>
          
        </form>
        <div className="login-links">
          <a href="/resetpass">Forgot password?</a>
          <a href="/register">Don’t have an account? Register</a>
        </div>
      </div>
    </div>
  );
}

