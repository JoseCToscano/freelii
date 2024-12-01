"use client";
import { Button } from "~/components/ui/button";
import { type FC, type ReactNode, useState } from "react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { useQRScanner } from "~/hooks/useQRScanner";
import { CardContent, CardHeader } from "~/components/ui/card";
import { ArrowUpIcon, Camera, Download, Eye, EyeOff, Send } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import WalletLayoutWrapper from "~/app/wallet/[address]/send/_components/wallet-layout";
import TelegramAuth from "~/app/wallet/_components/telegram-auth";

const WalletLayout: FC<{ children?: ReactNode }> = ({ children }) => {
  const { address } = useParams();
  const router = useRouter();

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showSendMoneyForm, setShowSendMoneyForm] = useState(false);

  const { clickFeedback } = useHapticFeedback();
  const { scan } = useQRScanner();
  const toggleBalanceVisibility = () => {
    setIsBalanceHidden((prev) => !prev);
  };

  const balance = { data: "250.00" };

  const onLogout = () => {
    clickFeedback();
    router.push("/wallet");
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

        <WalletLayoutWrapper>
          <div className="rounded-lg bg-zinc-50 p-6 text-center">
            <h2 className="mb-2 flex items-center justify-center text-sm font-medium text-zinc-500">
              Current Balance
              {/* Visibility Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleBalanceVisibility}
                className="text-zinc-500 hover:text-zinc-700"
              >
                {isBalanceHidden ? (
                  <Eye className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
                <span className="sr-only">
                  {isBalanceHidden ? "Show balance" : "Hide balance"}
                </span>
              </Button>
            </h2>
            <div className="flex justify-center">
              {/* Centered Amount */}
              <div className="flex items-baseline">
                <p className="text-4xl font-bold text-zinc-900">
                  {isBalanceHidden ? "•••••" : (balance.data ?? "-")}
                </p>
                <span className="ml-2 font-mono text-xl text-zinc-500">
                  USDc
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Link
              className="w-full"
              href={`/wallet/${String(address)}/${showSendMoneyForm ? "" : "send"}`}
            >
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  clickFeedback("soft");
                  setShowQR(false);
                  setShowSendMoneyForm(!showSendMoneyForm);
                }}
              >
                {!showSendMoneyForm ? (
                  <Send className="mr-2 h-5 w-5" />
                ) : (
                  <ArrowUpIcon className="mr-2 h-5 w-5" />
                )}
                {showSendMoneyForm ? "Hide" : "Send"}
              </Button>
            </Link>
            <Link
              className="w-full"
              href={`/wallet/${String(address)}/${showQR ? "" : "receive"}`}
            >
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  clickFeedback("soft");
                  setShowSendMoneyForm(false);
                  setShowQR(!showQR);
                }}
              >
                {!showQR ? (
                  <Download className="mr-2 h-5 w-5" />
                ) : (
                  <ArrowUpIcon className="mr-2 h-5 w-5" />
                )}
                {showQR ? "Hide QR" : "Receive"}
              </Button>
            </Link>
          </div>
        </WalletLayoutWrapper>

        {children}
      </CardContent>
    </TelegramAuth>
  );
};

export default WalletLayout;
