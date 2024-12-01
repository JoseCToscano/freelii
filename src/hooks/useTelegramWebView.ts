import { useEffect, useState } from "react";

const loadTelegramScript = (): Promise<boolean> => {
  // Function to dynamically load the Telegram WebApp script if it hasn't been loaded
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
const useTelegramWebview = () => {
  const [user, setUser] = useState<WebAppUser>();
  const [initData, setInitData] = useState<WebAppInitData>();
  const [themeParams, setThemeParams] = useState<WebAppThemeParams>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [biometricType, setBiometricType] = useState<
    "face" | "finger" | "unknown"
  >("unknown");

  // UseEffect to dynamically load the Telegram script and then authenticate
  useEffect(() => {
    loadTelegramScript()
      .then((requiresAuth) => {
        console.log("Telegram script loaded:", requiresAuth);
        if (requiresAuth) {
          window.Telegram.WebApp.ready();
          setIsReady(true);
          // Access the user data from Telegram
        }
      })
      .catch((err) => {
        console.error("Error loading Telegram script:", err);
      });
  }, []); // Empty dependency array ensures it runs only once on initial load

  useEffect(() => {
    // Wait until Telegram SDK script is loaded
    let WebApp = window.Telegram?.WebApp;
    let WebView = window.Telegram?.WebView;
    console.log("Telegram WebApp version:", WebApp?.version);
    console.log("Telegram platform:", WebApp?.platform);

    const handleTelegramInit = () => {
      WebApp = window.Telegram?.WebApp;
      WebView = window.Telegram?.WebView;
      if (WebApp) {
        if (WebApp.BiometricManager?.biometricType) {
          setBiometricType(WebApp.BiometricManager.biometricType ?? "unknown");
        }

        if (WebApp.initDataUnsafe.user) {
          console.log("user:", WebApp.initDataUnsafe.user);
          setUser(WebApp.initDataUnsafe.user);
        }
        // Set initial data and theme parameters
        setInitData(WebApp.initDataUnsafe);
        setThemeParams(WebApp.themeParams);
        setIsExpanded(WebApp.isExpanded);

        // Mark the web app as ready
        WebApp.ready();

        // Add event listeners
        WebView?.onEvent("theme_changed", () => {
          if (WebApp?.themeParams) {
            setThemeParams(WebApp?.themeParams);
          }
        });

        WebView?.onEvent("viewport_changed", (e) => {
          setIsExpanded(Boolean(WebApp?.isExpanded));
        });

        WebView?.onEvent("back_button_pressed", () => {
          console.log("Back button pressed");
        });

        // Clean up event listeners on unmount
        return () => {
          // WebView?.offEvent("theme_changed", (e) => {
          //   return e;
          // });
          // WebView?.offEvent("viewport_changed", (e) => {
          //   return e;
          // });
          // WebView?.offEvent("back_button_pressed", (e) => {
          //   return e;
          // });
        };
      }
    };

    const intervalId = setInterval(() => {
      if (window?.Telegram?.WebApp) {
        handleTelegramInit();
        clearInterval(intervalId);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [isReady]);

  useEffect(() => {
    // Only proceed if the WebApp is ready
    if (!isReady) return;

    const WebApp = window.Telegram?.WebApp;
    if (WebApp) {
      // Mark the web app as ready
      WebApp.ready();

      // Ensure event listeners are added after WebApp is ready
      const viewportChangedHandler = () => {
        console.log("Viewport changed:", WebApp.isExpanded);
        setIsExpanded(WebApp.isExpanded);
      };

      WebApp.onEvent("viewport_changed", viewportChangedHandler);

      return () => {
        WebApp.offEvent("viewport_changed", viewportChangedHandler);
      };
    }
  }, [isReady]);

  const closeWebApp = () => {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp) {
      WebApp.close();
    }
  };

  const expandWebApp = () => {
    const WebApp = window.Telegram?.WebApp;
    if (WebApp) {
      WebApp.expand();
      setIsExpanded(true);
    }
  };

  return {
    user,
    initData,
    themeParams,
    isExpanded,
    closeWebApp,
    expandWebApp,
    biometricType,
  };
};

export default useTelegramWebview;
