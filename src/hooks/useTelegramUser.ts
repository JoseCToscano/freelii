"use client";
import { useEffect, useState } from "react";

export const useTelegramUser = () => {
  const [user, setUser] = useState<WebAppUser | null>(null);

  useEffect(() => {
    if (window?.Telegram?.WebApp) {
      const userData = window.Telegram.WebApp.initDataUnsafe?.user;
      if (userData) {
        setUser(userData);
      }
    }
  }, [window?.Telegram]);

  const logout = () => {
    setUser(null);
  };

  return { user, logout };
};
