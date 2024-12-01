"use client";
import { Button } from "~/components/ui/button";
import { type FC, type ReactNode } from "react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { useQRScanner } from "~/hooks/useQRScanner";
import { CardContent, CardHeader } from "~/components/ui/card";
import { Camera } from "lucide-react";
import WalletLayoutWrapper from "~/app/wallet/[address]/send/_components/wallet-layout";
import TelegramAuth from "~/app/wallet/_components/telegram-auth";

const WalletLayout: FC<{ children?: ReactNode }> = ({ children }) => {
  const { clickFeedback } = useHapticFeedback();
  const { scan } = useQRScanner();

  const onLogout = () => {
    window.Telegram.WebApp.close();
    clickFeedback();
  };

  return (
    <TelegramAuth>
      <CardHeader className="flex flex-row items-center justify-between space-y-1">
        <Button
          onClick={() => {
            clickFeedback("soft");
            clickFeedback("soft");
            onLogout();
          }}
          variant="ghost"
          aria-label="Scan QR Code"
          className="font-semibold text-zinc-500 hover:text-zinc-700"
        >
          Logout
        </Button>
        <WalletLayoutWrapper>
          <Button
            onClick={() => {
              clickFeedback("soft");
              scan();
            }}
            variant="ghost"
            size="icon"
            aria-label="Scan QR Code"
            className="border-[1px] border-zinc-300 text-zinc-500 hover:text-zinc-700"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </WalletLayoutWrapper>
      </CardHeader>
      <CardContent className="space-y-6">
        {/*<NetworkSelector />*/}

        {children}
      </CardContent>
    </TelegramAuth>
  );
};

export default WalletLayout;
