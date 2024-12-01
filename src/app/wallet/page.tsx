"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import TelegramLoadingScreen from "~/app/wallet/_components/loading-screen";
import { api } from "~/trpc/react";
import useTelegramWebView from "~/hooks/useTelegramWebView";
import toast from "react-hot-toast";

export default function WalletLogin() {
  const { user } = useTelegramWebView();
  const router = useRouter();

  const query = api.users.getUserByTelegramId.useQuery(
    {
      telegramId: String(user?.id),
    },
    {
      enabled: !!user,
    },
  );

  useEffect(() => {
    console.log("hello from page");
  }, []);

  useEffect(() => {
    console.log("user changed", user);
  }, [user]);

  useEffect(() => {
    if (user && query.status === "success") {
      window.Telegram?.WebApp?.expand();
      // NEW USER
      if (!query.data) {
        return router.push("/wallet/onboarding");
      }

      // EXISTING USER, NOT FULLY ONBOARDED
      if (query.data?.hashedPin) {
        return router.push(`/wallet/${query.data.id}`);
      }

      // EXISTING USER, FULLY ONBOARDED
      router.push(`/wallet/onboarding/${query.data.id}`);
    }
  }, [user, query]);

  // if (true) {
  //   return (
  //     <div>
  //       Status: {JSON.stringify(query.status)}
  //       <div>Error: {JSON.stringify(query.error)}</div>
  //       <div>fetchStatus: {JSON.stringify(query)}</div>
  //     </div>
  //   );
  // }
  //
  // if (query.data) {
  //   return <div>USER: {JSON.stringify(query.data)}</div>;
  // }
  //
  // if (user) {
  //   return <div>USER TG: {JSON.stringify(user)}</div>;
  // }

  return <TelegramLoadingScreen />;
}
