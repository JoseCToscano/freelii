"use client";
import { useEffect, useState } from "react";

export const useTelegramUser = () => {
  const [user, setUser] = useState<WebAppUser | null>(null);

  useEffect(() => {
    // Check if `window` is available (client-side)
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const userData = window.Telegram.WebApp.initDataUnsafe?.user;
      if (userData) {
        setUser(userData);
      }
    }
  }, []);

  const logout = () => {
    setUser(null);
  };

  return { user, logout };
};
