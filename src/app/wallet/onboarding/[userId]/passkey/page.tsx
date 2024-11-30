"use client";
import {
  Key,
  Shield,
  Smartphone,
  Fingerprint,
  Scan,
  LockKeyhole,
} from "lucide-react";
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
          <Scan className="h-12 w-12 text-green-600" />
          <LockKeyhole className="h-12 w-12 text-purple-600" />
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <Shield className="h-8 w-8 flex-shrink-0 text-blue-600" />
            <div>
              <h3 className="font-semibold">Enhanced Security with Passkeys</h3>
              <p className="text-sm text-gray-600">
                Passkeys offer superior protection using your device&#39;s
                biometric features or PIN.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Set up your secure passkey:</h3>
            <ol className="list-inside list-decimal space-y-2 text-gray-600">
              <li>Tap &#34;Create Secure Passkey&#34; below</li>
              <li>
                Use your fingerprint, face recognition, or device PIN when
                prompted
              </li>
              <li>
                Follow the on-screen instructions to complete the secure setup
              </li>
            </ol>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-100 p-4">
            <Smartphone className="mb-2 h-8 w-8 text-green-600" />
            <p className="text-center text-sm font-medium">
              Multi-device security
            </p>
          </div>
          <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-100 p-4">
            <Key className="mb-2 h-8 w-8 text-purple-600" />
            <p className="text-center text-sm font-medium">
              Passwordless protection
            </p>
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
        <p className="text-center text-sm text-gray-500">
          Already have a secure account?{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Log in securely
          </a>
        </p>
      </CardFooter>
    </div>
  );
}
