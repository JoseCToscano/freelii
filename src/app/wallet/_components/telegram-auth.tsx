"use client";
import { type FC, type ReactNode, useState } from "react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { Fingerprint, Shield } from "lucide-react";
import { Button } from "~/components/ui/button";
import LoadingDots from "~/components/ui/loading-dots";
import { CardContent } from "~/components/ui/card";
import { useTelegramUser } from "~/hooks/useTelegramUser";

interface TelegramAuthProps {
  children: ReactNode;
}

const TelegramAuth: FC<TelegramAuthProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { user } = useTelegramUser();

  const { clickFeedback } = useHapticFeedback();
  const [biometricAuthStatus, setBiometricAuthStatus] = useState<string>(
    "Checking biometrics...",
  );
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
          setBiometricAuthStatus("Biometric authentication successful");
        } else {
          setAuthFailed(true);
          setBiometricAuthStatus("Biometric authentication failed");
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
    setBiometricAuthStatus("Retrying biometric authentication...");
    authenticate(); // Trigger the authentication flow again when the user clicks retry
  };

  if (user) {
    return <div>{children}</div>;
  }

  return (
    <CardContent className="space-y-8 p-8">
      {JSON.stringify(user)}
      <div className="space-y-2 text-center">
        <Shield className="mx-auto h-12 w-12 text-zinc-800" />
        <h1 className="flex items-center justify-center text-2xl font-semibold text-zinc-900">
          Secure Access
        </h1>
        <p className="text-sm text-zinc-500">
          Authenticate to view your wallet
        </p>
      </div>

      {!isAuthenticated && (
        <Button
          className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
          size="lg"
          onClick={() => {
            handleRetry();
          }}
        >
          <Fingerprint className="mr-2 h-6 w-6" />
          {isAuthenticating ? (
            <LoadingDots color="white" />
          ) : biometricAttempted ? (
            "Retry"
          ) : (
            "Biometric Auth"
          )}
        </Button>
      )}
      {authFailed && (
        <span className="">
          <p className="text-sm text-red-500">
            Biometrics Auth failed. Please try again.
          </p>
        </span>
      )}
    </CardContent>
  );
};

export default TelegramAuth;
