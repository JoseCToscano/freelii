"use client";

import { useTelegramUser } from "~/hooks/useTelegramUser";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TelegramLoadingScreen from "~/app/wallet/_components/loading-screen";

export default function WalletLogin() {
  const { user } = useTelegramUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(`/wallet/${user.id}`);
    }
  }, [user]);

  return <TelegramLoadingScreen />;
}
