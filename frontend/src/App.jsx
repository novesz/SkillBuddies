import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import "./App.css";
import { useUser } from "./context/UserContext";
import { GroupFinderContext } from "./context/GroupFinderContext";

import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegistPage from "./pages/RegistPage";
import Profile from "./pages/Profile";
import AboutPage from "./pages/AboutPage";
import SupportPage from "./pages/SupportPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import GroupEditor from "./pages/GroupEditor";
import ChatPage from "./pages/ChatPage";
import GroupFinderModal from "./pages/GroupFinder";

import PrivateRoute from "./components/PrivateRoute";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(0);
  const [groupFinderOpen, setGroupFinderOpen] = useState(false);
  const { setAvatarUrl } = useUser();

  const groupFinderValue = {
    isOpen: groupFinderOpen,
    open: () => setGroupFinderOpen(true),
    close: () => setGroupFinderOpen(false),
  };

  const DEFAULT_AVATAR = "/avatars/BB.png";

  // Initial auth + profile; when not logged in, reset avatar to default
  useEffect(() => {
    axios
      .get("http://localhost:3001/auth/status", { withCredentials: true })
      .then((response) => {
        setIsLoggedIn(response.data.loggedIn);
        if (response.data.loggedIn) {
          setUserId(response.data.userId ?? 0);
          fetch("http://localhost:3001/users/me/profile", { credentials: "include" })
            .then((r) => r.json())
            .then((data) => {
              setAvatarUrl(data.avatarUrl || DEFAULT_AVATAR);
            })
            .catch((err) => console.error("Profile load on init:", err));
        } else {
          setUserId(0);
          setAvatarUrl(DEFAULT_AVATAR);
        }
      })
      .catch((error) => {
        console.error("Auth status error:", error);
        setIsLoggedIn(false);
        setUserId(0);
        setAvatarUrl(DEFAULT_AVATAR);
      });
  }, [setAvatarUrl]);

  // On logout (isLoggedIn becomes false), reset avatar so it doesn’t stay visible
  useEffect(() => {
    if (!isLoggedIn) setAvatarUrl(DEFAULT_AVATAR);
  }, [isLoggedIn, setAvatarUrl]);

  // Bejelentkezés után userId frissítése (LoginPage csak setIsLoggedIn-t hív, userId maradna 0)
  useEffect(() => {
    if (!isLoggedIn) return;
    axios
      .get("http://localhost:3001/auth/status", { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn && res.data.userId != null) {
          setUserId(res.data.userId);
        }
      })
      .catch(() => {});
  }, [isLoggedIn]);

  return (
    <GroupFinderContext.Provider value={groupFinderValue}>
      <Routes>
        <Route
          path="/"
          element={<Home isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/login"
          element={<LoginPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/register"
          element={<RegistPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute isLoggedIn={isLoggedIn}>
              <Profile isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            </PrivateRoute>
          }
        />
        <Route
          path="/about"
          element={<AboutPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/support"
          element={<SupportPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/resetpass"
          element={<ResetPasswordPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/groupeditor"
          element={<GroupEditor isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} userId={userId} />}
        />
        <Route
          path="/chat"
          element={<ChatPage isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}
        />
      </Routes>
      {groupFinderOpen && <GroupFinderModal />}
    </GroupFinderContext.Provider>
  );
}

export default App;
