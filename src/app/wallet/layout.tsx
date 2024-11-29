"use client";
import "~/styles/globals.css";

// import { type Metadata } from "next";

import { Card } from "~/components/ui/card";
import { Suspense, useEffect } from "react";

// export const metadata: Metadata = {
//   title: "Freelii",
//   description: "Send money to your friends and family",
//   icons: [{ rel: "icon", url: "/favicon.ico" }],
// };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Function to dynamically load the Telegram WebApp script if it hasn't been loaded
  const loadTelegramScript = (): Promise<boolean> => {
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
    loadTelegramScript()
      .then((requiresAuth) => {
        console.log("Telegram script loaded:", requiresAuth);
        if (requiresAuth) {
          window.Telegram.WebApp.ready();
        }
      })
      .catch((err) => {
        console.error("Error loading Telegram script:", err);
      });
  }, []); // Empty dependency array ensures it runs only once on initial load

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 p-4">
      <Card className="w-full max-w-md border-0 bg-white shadow-lg">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </Card>
      <span className="mt-4 text-xs text-zinc-500">
        © Freelii, All rights reserved.
      </span>
    </div>
  );
}
