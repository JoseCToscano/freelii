"use client";
import { Button } from "~/components/ui/button";
import { type FC, ReactNode, useState } from "react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { useQRScanner } from "~/hooks/useQRScanner";
import { CardContent, CardHeader } from "~/components/ui/card";
import { ArrowUpIcon, Camera, Download, Eye, EyeOff, Send } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import WalletLayoutWrapper from "~/app/wallet/[address]/send/_components/wallet-layout";
import TelegramAuth from "~/app/wallet/_components/telegram-auth";
import { useTelegramUser } from "~/hooks/useTelegramUser";

const WalletLayout: FC<{ children?: ReactNode }> = ({ children }) => {
  const { address } = useParams();
  const searchParams = useSearchParams();
  const { logout } = useTelegramUser();

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
    logout();
    clickFeedback();
    alert("Logout clicked!");
  };

  const handlePasskeyDetection = async () => {
    try {
      // Simulate a random challenge from your server
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const options: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname, // Use the current domain
        timeout: 60000, // 1 minute timeout
        userVerification: "preferred", // 'required', 'preferred', or 'discouraged'
      };

      const credential = await navigator.credentials.get({
        publicKey: options,
      });

      if (credential) {
        console.log("Passkey found:", credential);
        alert("Passkey is available and was selected!");
      } else {
        alert("No passkeys available.");
      }
    } catch (error) {
      console.error("Error detecting passkeys:", error);
      alert("An error occurred or no passkeys were found.");
    }
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
                className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
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
                className="w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
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
