"use client";

import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Shield, Key, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { ClientTRPCErrorHandler, cn } from "~/lib/utils";
import useTelegramWebView from "~/hooks/useTelegramWebView";
import Link from "next/link";
import { api } from "~/trpc/react";
import { useParams } from "next/navigation";

type Step = "create-pin" | "confirm-pin" | "passkey";

export default function OnboardingMobile() {
  const { userId } = useParams();
  const { clickFeedback } = useHapticFeedback();
  const { isExpanded } = useTelegramWebView();

  const [loading, setLoading] = useState<boolean>(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<Step>("create-pin");
  const [shake, setShake] = useState<boolean>(false);

  // tRPC procedures
  const persistPin = api.users.setPin.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  useEffect(() => {
    if (step === "create-pin") {
      if (pin.length === 6) {
        clickFeedback("success");
        setStep("confirm-pin");
      }
    }
  }, [pin]);

  useEffect(() => {
    if (!userId || typeof userId !== "string") {
      throw new Error("User ID is required");
    }

    if (step === "confirm-pin") {
      if (confirmPin.length === 6) {
        if (confirmPin === pin) {
          setLoading(true);
          persistPin
            .mutateAsync({
              userId: String(userId),
              pin: confirmPin,
            })
            .then(({ success }) => {
              if (!success) {
                throw new Error("Failed to set PIN");
              }
              toast.success(`PIN set successfully`);
              clickFeedback("success");
              setStep("passkey");
              setLoading(false);
            })
            .catch((err) => {
              setLoading(false);
              console.error(err);
            });
        } else {
          setShake(true);
          clickFeedback("error");
          setConfirmPin("");
        }
      }
    }
  }, [confirmPin]);

  const handlePinInput = (value: string) => {
    if (step === "create-pin") {
      if (pin.length < 6) {
        clickFeedback("medium");
        setPin((prev) => prev + value);
      } else {
        clickFeedback("warning");
      }
      return;
    }

    if (step === "confirm-pin") {
      if (confirmPin.length < 6) {
        clickFeedback("medium");
        setConfirmPin((prev) => prev + value);
      } else {
        clickFeedback("warning");
      }
    }
  };

  const handleDelete = () => {
    if (step === "create-pin") {
      if (pin.length === 0) {
        clickFeedback("warning");
        return;
      }
      clickFeedback("medium");
      setPin((prev) => prev.slice(0, -1));
    } else if (step === "confirm-pin") {
      if (pin.length === 0) {
        clickFeedback("warning");
        return;
      }
      clickFeedback("medium");
      setConfirmPin((prev) => prev.slice(0, -1));
    }
  };

  const renderPinInput = (currentPin: string) => (
    <div className="mb-8 flex justify-center space-x-4">
      {[1, 2, 3, 4, 5, 6].map((_, index) => (
        <div
          key={index}
          className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-200 ${shake ? "animate-shake" : ""} ${
            currentPin.length > index
              ? "border-blue-500 bg-blue-500"
              : "border-blue-300"
          }`}
        />
      ))}
    </div>
  );

  const renderNumpad = () => (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
        <Button
          key={number}
          variant="outline"
          className="h-14 text-xl font-semibold"
          onClick={() => handlePinInput(number.toString())}
        >
          {number}
        </Button>
      ))}
      <div className="h-14 text-xl font-semibold"></div>{" "}
      <Button
        variant="outline"
        className="h-14 text-xl font-semibold"
        onClick={() => handlePinInput("0")}
      >
        0
      </Button>
      <Button variant="outline" className="h-14" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-blue-50 to-white">
      <Card className="flex flex-grow flex-col">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Welcome to Freelii
          </CardTitle>
          <CardDescription className="text-center">
            Let&#39;s secure your account
          </CardDescription>
          {/*{JSON.stringify({ isExpanded, user })}*/}
        </CardHeader>
        <CardContent
          className={cn(
            "flex flex-col justify-center",
            isExpanded && "flex-grow",
          )}
        >
          {step === "create-pin" && (
            <>
              <h2 className="mb-4 text-center text-xl font-semibold">
                Create your 6-digit PIN
              </h2>
              {renderPinInput(pin)}
              {renderNumpad()}
            </>
          )}
          {step === "confirm-pin" && (
            <>
              <h2 className="mb-4 text-center text-xl font-semibold">
                Confirm your PIN
              </h2>
              {renderPinInput(confirmPin)}
              {renderNumpad()}
            </>
          )}
          {step === "passkey" && (
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-6 w-6 text-green-500" />
                <span className="font-medium text-green-500">
                  PIN set successfully
                </span>
              </div>
              <Alert>
                <AlertTitle className="flex items-center">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Complete Your Passkey Setup
                </AlertTitle>
                <AlertDescription>
                  To enhance the security of your account, you&#39;ll be
                  redirected to a secure browser where you can set up your
                  passkey. This method uses biometrics for every action,
                  ensuring that all movements require confirmation for added
                  protection
                </AlertDescription>
              </Alert>
              <p className="text-center">
                When you&#39;re ready, click the button below to continue
                setting up your passkey.
              </p>

              <Link
                className="w-full"
                href={`/wallet/onboarding/${String(userId)}/passkey`}
                target="_blank"
              >
                <Button className="w-full">
                  <Key className="mr-2 h-5 w-5" />
                  Set up Passkey in Secure Browser
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-center text-xs text-gray-500">
            By continuing, you agree to Freelii&#39;s Terms of Service and
            Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
