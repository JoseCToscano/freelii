"use client";
import { Shield, Fingerprint, ScanFace, LockKeyhole } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { usePasskey } from "~/hooks/usePasskey";
import toast from "react-hot-toast";

export default function CreateAccount() {
  const { create } = usePasskey("passkey");

  const handleCreatePasskey = () => {
    create()
      .then((res) => {
        toast.success(`passkey created: ${res}`);
      })
      .catch((err) => {
        toast.error((err as Error)?.message ?? "An error occurred");
      });
    // Implement passkey creation logic here
    console.log("Creating passkey...");
  };

  return (
    <div>
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          Secure Your Freelii Account
        </CardTitle>
        <p className="text-center text-gray-600">
          Set up a passkey for maximum security
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center space-x-4">
          <Fingerprint className="h-12 w-12 text-blue-600" />
          <ScanFace className="h-12 w-12 text-green-600" />
          <LockKeyhole className="h-12 w-12 text-purple-600" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <Shield className="h-8 w-8 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">
                Passkeys use your device&#39;s biometric features or PIN for
                superior protection.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Set up your secure passkey:</h3>
            <ol className="list-inside list-decimal space-y-2 text-gray-600">
              <li>Tap the button below</li>
              <li>Use your device&#39;s biometrics or PIN</li>
              <li>Follow on-screen instructions</li>
            </ol>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
          onClick={handleCreatePasskey}
        >
          <LockKeyhole className="mr-2 h-5 w-5" />
          Create Secure Passkey
        </Button>
      </CardFooter>
    </div>
  );
}
