"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const loadTelegramScript = (): Promise<boolean> => {
    // Function to dynamically load the Telegram WebApp script if it hasn't been loaded
    console.log("called loadTelegramScript");
    return new Promise<boolean>((resolve, reject) => {
      // Check if the script is already in the document
      if (document.getElementById("telegram-web-app-script")) {
        console.log("Telegram WebApp script is already loaded");
        return resolve(false); // If the script is already present, resolve immediately
      }

      // Create and append the script if it doesn't exist
      const script = document.createElement("script");
      script.id = "telegram-web-app-script"; // Add an id to track it
      script.src = "https://telegram.org/js/telegram-web-app.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () =>
        reject(new Error("Failed to load Telegram WebApp script"));
      document.head.appendChild(script);
    });
  };

  // UseEffect to dynamically load the Telegram script and then authenticate
  useEffect(() => {
    console.log("called useEffect");
    loadTelegramScript()
      .then((requiresAuth) => {
        console.log("Telegram script loaded:", requiresAuth);
        if (requiresAuth) {
          window.Telegram.WebApp.ready();
          // Access the user data from Telegram
          const userData = window.Telegram.WebApp.initDataUnsafe?.user;
          toast.success(`userData ${JSON.stringify(userData)}`);
        }
      })
      .catch((err) => {
        console.error("Error loading Telegram script:", err);
      });
  }, []); // Empty dependency array ensures it runs only once on initial load
  return <>{children}</>;
}
