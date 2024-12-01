"use client";
import { Shield, Zap, Globe } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import ExpandingArrow from "~/components/ui/expanding-arrow";
import Disclaimer from "~/app/wallet/[address]/send/_components/disclaimer";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import Link from "next/link";
import { api } from "~/trpc/react";
import useTelegramWebView from "~/hooks/useTelegramWebView";
import { useState } from "react";
import { ClientTRPCErrorHandler } from "~/lib/utils";
import { useRouter } from "next/navigation";
import LoadingDots from "~/components/ui/loading-dots";

export default function Welcome() {
  const { user: telegramUser } = useTelegramWebView();
  const { clickFeedback } = useHapticFeedback();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  // tRPC Procedures
  const registerUser = api.users.registerUser.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  const getStarted = async () => {
    setLoading(true);
    const res = await registerUser
      .mutateAsync({
        telegramId: String(telegramUser?.id),
      })
      .finally(() => {
        setLoading(false);
      });
    router.push(`/wallet/onboarding/${res.id}`);
    clickFeedback("success");
  };

  return (
    <div>
      <CardHeader>
        <div className="mb-4 flex justify-center">
          <img
            src="/placeholder.svg?height=80&width=80"
            alt="Freelii Logo"
            className="h-20 w-20"
          />
        </div>
        <CardTitle className="text-center text-3xl font-bold">
          Welcome to Freelii
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-center text-gray-600">
          Move your money with ease—just like sending a text message.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center text-center">
            <Zap className="mb-2 h-10 w-10 text-yellow-500" />
            <h3 className="font-semibold">Fast</h3>
            <p className="text-sm text-gray-500">
              Instant transfers across the globe
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Globe className="mb-2 h-10 w-10 text-green-500" />
            <h3 className="font-semibold">Global</h3>
            <p className="text-sm text-gray-500">
              Send money to anyone, anywhere
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {loading ? (
          <LoadingDots />
        ) : (
          <Button className="group w-full" size="lg" onClick={getStarted}>
            Get Started
            <ExpandingArrow className="-ml-2 h-3.5 w-3.5" />
          </Button>
        )}
        <Disclaimer className="" />
      </CardFooter>
    </div>
  );
}
