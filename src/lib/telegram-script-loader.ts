import { useEffect } from "react";

const TelegramWebAppScriptLoader = () => {
  useEffect(() => {
    // Append the script to the document head
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
};

export default TelegramWebAppScriptLoader;
