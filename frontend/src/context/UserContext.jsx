import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);
const STORAGE_KEY = "sb.avatarUrl";
const DEFAULT_AVATAR = "/avatars/BB.png"; // tetszőleges alapértelmezett

export function UserProvider({ children }) {
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);

  // betöltés localStorage-ból
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setAvatarUrl(saved);
  }, []);

  // mentés localStorage-ba
  useEffect(() => {
    if (avatarUrl) localStorage.setItem(STORAGE_KEY, avatarUrl);
  }, [avatarUrl]);

  const value = { avatarUrl, setAvatarUrl };
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}
