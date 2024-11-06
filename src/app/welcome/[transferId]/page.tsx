"use client";

import { useEffect, useState } from "react";
import {
  Smartphone,
  Zap,
  Lock,
  ArrowRight,
  Send,
  PhoneCall,
  Info,
  KeyRound,
  RefreshCw,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { usePasskey } from "~/hooks/usePasskey";
import { ClientTRPCErrorHandler, shortStellarAddress } from "~/lib/utils";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import { Keypair, TransactionBuilder } from "@stellar/stellar-sdk";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import ExpandingArrow from "~/components/ui/expanding-arrow";
import { User } from "@prisma/client";
import { useParams } from "next/navigation";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";

const USE_PASSKEY = false;

export default function Component() {
  const { clickFeedback } = useHapticFeedback();
  const { transferId } = useParams();
  const [step, setStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [contract, setContract] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sep10token, setSep10token] = useState<string | null>(null);
  const [isHoveredFeature, setIsHoveredFeature] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { create, sign } = usePasskey("+523313415550");

  // tRPC Procedures
  const sep10Challenge = api.stellar.getAuthChallenge.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const sep10Token = api.stellar.signAuthChallenge.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const newOtp = api.post.otp.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const verifyOtp = api.post.verifyOtp.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const startAuth = api.stellar.startAuthSession.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const saveAuth = api.stellar.saveAuthSession.useMutation({
    onError: ClientTRPCErrorHandler,
  });
  const linkSenderAuthSession = api.stellar.linkSenderAuthSession.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  const features = [
    { icon: UserCheck, title: "Identity Verification" },
    { icon: Smartphone, title: "Code via SMS" },
    { icon: ShieldCheck, title: "Secure Passkey" },
    { icon: Zap, title: "Lightning Fast Transfer" },
  ];

  const startAuthSession = async (receivedId?: number) => {
    try {
      const userId = user?.id ? Number(user?.id) : receivedId;
      if (!userId) {
        throw new Error("Invalid user id");
      }
      const keypair = Keypair.random();
      const { id: sessionId } = await startAuth.mutateAsync({
        userId: Number(userId),
        publicKey: keypair.publicKey(),
      });

      const { transaction, network_passphrase } =
        await sep10Challenge.mutateAsync({
          publicKey: keypair.publicKey(),
        });
      const tx = TransactionBuilder.fromXDR(transaction, network_passphrase);
      tx.sign(keypair);
      const token = await sep10Token.mutateAsync({
        transactionXDR: tx.toXDR(),
        networkPassphrase: network_passphrase,
      });
      console.log("token", token, "sessionId", sessionId);
      await saveAuth.mutateAsync({
        sessionId: sessionId,
        token,
      });
      await linkSenderAuthSession.mutateAsync({
        authSessionId: sessionId,
        transferId: transferId as string,
      });
      // Redirect to next page
      window.location.href = `/kyc/${String(transferId)}`;
      return sessionId;
    } catch (e) {
      console.error(e);
      toast.error((e as Error)?.message ?? "Failed to start auth session");
      throw e;
    }
  };

  const createPasskey = async () => {
    setIsLoading(true);
    const contractId = await create().catch((err) => {
      setIsLoading(false);
      throw err;
    });
    if (contractId) {
      setContract(contractId);
      console.log("contractId", contractId);
      return startAuthSession();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (phoneNumber.length >= 10) {
        setIsLoading(true);
        // Simulate API call
        await newOtp.mutateAsync({ phone: phoneNumber });
        clickFeedback("success");
        toast.success("Verification code sent to your phone");
        setIsLoading(false);
        setStep(2);
        setResendTimer(59); // Set initial resend timer
      }
    } catch (e) {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`,
      ) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (otp.join("").length === 6) {
        setIsLoading(true);
        // Simulate API call
        const userRes = await verifyOtp.mutateAsync({
          phone: phoneNumber,
          otp: otp.join(""),
        });
        setUser(userRes);
        clickFeedback("success");
        toast.success("Phone number verified successfully");
        setIsLoading(false);
        if (USE_PASSKEY) {
          setStep(3);
        } else {
          console.log("userRes", userRes);
          return startAuthSession(userRes.id);
        }
      }
    } catch (e) {
      setIsLoading(false);
      toast((e as Error)?.message ?? "Failed to verify phone number");
      setIsLoading(false);
    }
  };

  const handleUpdatePhone = () => {
    setStep(1);
    setOtp(["", "", "", "", "", ""]);
    setResendTimer(0);
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      await newOtp.mutateAsync({ phone: phoneNumber });
      setIsLoading(false);
      setResendTimer(59); // Reset resend timer
      setOtp(["", "", "", "", "", ""]);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-[#3390EC] bg-[#E7F3FF] p-4">
              <p className="text-sm leading-relaxed text-[#3390EC]">
                Welcome! You&#39;re about to set up a secure way to send money
                using just your phone. Here&#39;s what to expect:
              </p>
              <ol className="mt-2 list-inside list-decimal text-sm text-gray-700">
                <li>We&#39;ll verify your identity</li>
                <li>Secure your account with a unique passkey</li>
                <li>You can then send money easily and securely</li>
              </ol>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex cursor-help flex-col items-center justify-center rounded-lg bg-white p-4 text-center shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
                        style={{
                          transform:
                            isHoveredFeature === index
                              ? "scale(1.05)"
                              : "scale(1)",
                          backgroundColor:
                            isHoveredFeature === index ? "#E7F3FF" : "white",
                        }}
                        onMouseEnter={() => setIsHoveredFeature(index)}
                        onMouseLeave={() => setIsHoveredFeature(null)}
                      >
                        <feature.icon className="mb-2 h-8 w-8 text-[#3390EC]" />
                        <h3 className="text-sm font-semibold text-gray-900">
                          {feature.title}
                        </h3>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getTooltipContent(feature.title)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <Button
              onClick={() => {
                clickFeedback();
                setStep(1);
              }}
              className="group w-full"
            >
              <p className="text-light text-xs">Continue</p>
              <ExpandingArrow className="-ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
        );
      case 1:
        return (
          <form onSubmit={handlePhoneSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Enter your phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +1 234 567 8900"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                onClick={() => clickFeedback()}
                className="group w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <p className="text-light text-xs">Send Verification Code</p>
                    <ExpandingArrow className="-ml-2 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleOtpSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp-0">
                  Enter the 6-digit OTP sent to your phone
                </Label>
                <div className="flex justify-between">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="h-12 w-12 text-center text-2xl"
                      required
                    />
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                onClick={() => clickFeedback()}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Phone Number
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUpdatePhone}
                >
                  Update Number
                  <PhoneCall className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || isLoading}
                >
                  {resendTimer > 0 ? (
                    <>
                      Resend in {resendTimer}s
                      <RefreshCw className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Resend OTP
                      <RefreshCw className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-[#3390EC] bg-[#E7F3FF] p-4">
              <p className="text-sm leading-relaxed text-[#3390EC]">
                Your phone number {phoneNumber} has been verified. Now,
                let&#39;s set up your passkey for secure and easy money
                transfers.
              </p>
            </div>
            <Button onClick={createPasskey} className="w-full">
              {isLoading ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Creating Passkey
                </>
              ) : (
                "Create Passkey"
              )}
              <KeyRound className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleUpdatePhone}
            >
              Update Number
              <PhoneCall className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-2xl font-bold text-[#3390EC]">
            <Send className="mr-2 h-6 w-6 text-[#3390EC]" />
            {step === 0 && "Just one more step"}
            {step === 1 && "Enter Your Phone Number"}
            {step === 2 && "Verify Your Phone"}
            {step === 3 && "Set Up Your Passkey"}
          </CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            {step === 0 && "Let's set up your account for easy money transfers"}
            {step === 1 &&
              "We'll send you a one-time code to verify your number"}
            {step === 2 && "Enter the 6-digit code we sent to your phone"}
            {step === 3 &&
              "Secure your account and enable easy money transfers"}
          </p>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
        <CardFooter className="flex flex-col pb-3 text-center text-sm text-gray-500">
          {step > 0 && step < 3 && (
            <div className="flex w-full items-center justify-center">
              <Info className="mr-2 h-4 w-4 text-[#3390EC]" />
              Your passkey will be linked to this verified phone number
            </div>
          )}
          <span className="mt-2 text-xs text-muted-foreground">
            © 2024 Freelii. All rights reserved.
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}

function getTooltipContent(title: string) {
  switch (title) {
    case "Identity Verification":
      return "We'll verify your identity to ensure secure transactions";
    case "Secure Passkey":
      return "Your personal information is protected with advanced security measures";
    case "Code via SMS":
      return "Receive a one-time password on your phone for verification";
    case "Lightning Fast Transfer":
      return "Complete the whole verification process in just a few minutes";
    default:
      return "";
  }
}
