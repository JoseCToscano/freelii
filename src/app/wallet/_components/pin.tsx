"use client";

import { type FC, useEffect, useState } from "react";
import { Fingerprint, ScanFaceIcon, Delete } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import useTelegramWebView from "~/hooks/useTelegramWebView";

interface PinEntryProps {
  requestInitialBiometricAuth: () => void;
  retryBiometricAuth: () => void;
  requestPinAuth: (pin: string) => Promise<boolean>;
}
const PinEntry: FC<PinEntryProps> = ({
  requestInitialBiometricAuth,
  retryBiometricAuth,
  requestPinAuth,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [pin, setPin] = useState<string>("");
  const { clickFeedback } = useHapticFeedback();
  const { biometricType } = useTelegramWebView();
  const [shake, setShake] = useState<boolean>(false);

  useEffect(() => {
    requestInitialBiometricAuth();
  }, []);

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  useEffect(() => {
    if (pin.length === 6) {
      setLoading(true);
      requestPinAuth(pin)
        .then((success) => {
          if (success) {
            clickFeedback("success");
          } else {
            setShake(true);
            clickFeedback("error");
            setPin("");
          }
        })
        .catch(() => {
          setShake(true);
          setPin("");
        })
        .finally(() => setLoading(false));
    }
  }, [pin]);

  const handleNumberClick = (number: number) => {
    if (pin.length < 6) {
      clickFeedback("medium");
      setPin((prev) => prev + number);
    } else {
      setShake(true);
      clickFeedback("warning");
    }
  };

  const handleDelete = () => {
    if (pin.length === 0) {
      clickFeedback("warning");
      return;
    }
    clickFeedback("medium");
    setPin((prev) => prev.slice(0, -1));
  };

  const handleBiometric = async () => {
    clickFeedback("medium");
    retryBiometricAuth();
  };

  return (
    <div>
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          Freelii
        </CardTitle>
        <p className="text-center text-gray-600">Enter your mobile PIN</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading && (
          <div className="flex items-center justify-center space-x-2">
            <span className="mr-2 animate-spin">⏳</span>
          </div>
        )}
        <div className="mt-6 flex justify-center gap-3">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <div
              key={index}
              className={`h-3.5 w-3.5 rounded-full border-2 transition-all duration-200 ${shake ? "animate-shake" : ""} ${
                pin.length > index
                  ? "border-blue-500 bg-blue-500"
                  : "border-blue-300"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
            <Button
              key={number}
              variant="outline"
              onClick={() => handleNumberClick(number)}
              className="h-14 text-xl font-semibold"
            >
              {number}
            </Button>
          ))}
          <Button
            disabled={biometricType === "unknown"}
            variant="outline"
            onClick={handleBiometric}
            className="flex h-14 items-center justify-center"
          >
            {biometricType === "finger" && (
              <Fingerprint className="h-6 w-6 text-blue-500" />
            )}
            {biometricType === "face" && (
              <ScanFaceIcon className="text-blue-500" />
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleNumberClick(0)}
            className="h-14 text-xl font-semibold"
          >
            0
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="flex h-14 items-center justify-center"
          >
            <Delete className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-center">
          <Button variant="link" className="text-sm text-blue-500">
            I forgot my mobile PIN
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default PinEntry;
