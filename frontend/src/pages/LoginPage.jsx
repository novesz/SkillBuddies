import React from "react";
import "../styles/LoginPage.css";
import Header from "../components/header/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function LoginPage({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const { setAvatarUrl } = useUser();

  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    axios
      .post("http://localhost:3001/login", { Email: email, Password: password }, { withCredentials: true })
      .then((response) => {
        if (!response.data.loggedIn) return;
        setIsLoggedIn(true);
        return fetch("http://localhost:3001/users/me/profile", { credentials: "include" });
      })
      .then((resp) => (resp ? resp.json() : null))
      .then((data) => {
        setAvatarUrl(data?.avatarUrl || "/avatars/BB.png");
        alert("Login successful!");
        navigate("/");
      })
      .catch((error) => {
        alert(error.response?.data?.message || "Login failed");
      });
  };

  return (
    <div className="login-page">
      <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <div className="login-container">
        <h2 className="login-title">LOGIN</h2>
        <form className="login-form" onSubmit={handleLogin}>
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

