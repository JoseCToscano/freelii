"use client";
import { type FC, type ReactNode, useState } from "react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import PinEntry from "~/app/wallet/_components/pin";
import useTelegramWebView from "~/hooks/useTelegramWebView";

interface TelegramAuthProps {
  children: ReactNode;
}

const TelegramAuth: FC<TelegramAuthProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { user } = useTelegramWebView();

  const { clickFeedback } = useHapticFeedback();

  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(true); // Track if authentication is in progress
  const [authFailed, setAuthFailed] = useState<boolean>(false); // Track if authentication failed
  const [biometricAttempted, setBiometricAttempted] = useState<boolean>(false); // Track if biometrics were attempted

  // Function to handle biometric authentication
  const authenticate = () => {
    setIsAuthenticating(true);
    // INIT BIOMETRIC AUTHENTICATION
    if (window.Telegram?.WebApp) {
      if (window.Telegram.WebApp.BiometricManager?.isInited) {
        requestBiometrics();
      } else {
        if (!window.Telegram.WebApp.BiometricManager) {
          console.log("BiometricManager not available");
          return;
        }
        window.Telegram.WebApp.BiometricManager.init(() => {
          requestBiometrics();
        });
      }
    } else {
      console.log("Telegram not available");
    }
    setIsAuthenticating(false);
  };

  const requestBiometricAccess = (cb: () => void) => {
    if (!window.Telegram.WebApp.BiometricManager.isAccessGranted) {
      window.Telegram.WebApp.BiometricManager.requestAccess(
        {
          reason:
            "We require access to Biometric authentication to keep your Wallet data safe",
        },
        (isAccessGranted) => {
          if (isAccessGranted) {
            console.log("Biometric access granted");
            cb();
          } else {
            if (
              window.confirm(
                "Biometric access denied. Please enable biometric access in settings",
              )
            ) {
              window.Telegram.WebApp.BiometricManager.openSettings();
            }
          }
        },
      );
    }
  };

  const authenticateWithBiometrics = () => {
    window.Telegram.WebApp.BiometricManager.authenticate(
      {
        reason: "Authenticate to access your account",
      },
      (isAuthenticated, biometricToken) => {
        console.log("Biometric authentication result:", isAuthenticated);
        if (isAuthenticated) {
          clickFeedback("success");
          setIsAuthenticated(true);
        } else {
          setAuthFailed(true);
        }
      },
    );
  };

  const requestBiometrics = () => {
    if (window.Telegram.WebApp.BiometricManager.isBiometricAvailable) {
      if (window.Telegram.WebApp.BiometricManager.isAccessGranted) {
        authenticateWithBiometrics();
      } else {
        requestBiometricAccess(authenticateWithBiometrics);
        console.log("Biometric access not granted");
      }
    } else {
      console.log(
        "Biometric not available",
        window.Telegram.WebApp.BiometricManager.isAccessRequested,
      );
    }
  };

  const handleRetry = () => {
    // Reset states and retry authentication
    setAuthFailed(false);
    setBiometricAttempted(false); // Allow re-attempt
    authenticate(); // Trigger the authentication flow again when the user clicks retry
  };

  const requestPinAuth = async (pin: string): Promise<boolean> => {
    // if(pin === user.pin)
    if (pin === "123456") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsAuthenticated(true);
      return true;
    } else {
      setIsAuthenticated(false);
      return false;
    }
  };

  if (user && isAuthenticated) {
    return <div>{children}</div>;
  }

  return (
    <PinEntry
      requestInitialBiometricAuth={authenticate}
      retryBiometricAuth={handleRetry}
      requestPinAuth={requestPinAuth}
    />
  );
};

export default TelegramAuth;
