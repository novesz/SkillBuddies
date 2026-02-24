import React, { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext(null);
const STORAGE_KEY = "sb.avatarUrl";
const DEFAULT_AVATAR = "/avatars/BB.png";

export function UserProvider({ children }) {
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR);

  // load from localStorage on init
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setAvatarUrl(saved);
  }, []);

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
