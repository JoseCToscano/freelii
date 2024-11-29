"use client";

import { LogIn, Send, Wallet, Globe } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Link from "next/link";
import { useTelegramUser } from "~/hooks/useTelegramUser";

export default function WalletLogin() {
  const { user } = useTelegramUser();

  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold">
          Welcome to Freelii
        </CardTitle>
        <p className="text-center text-gray-600">
          Your gateway to seamless global transactions
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center rounded-lg bg-gray-100 p-4">
            <Send className="mb-2 h-8 w-8 text-blue-600" />
            <p className="text-center text-sm font-medium">
              Send Money Instantly
            </p>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-gray-100 p-4">
            <Wallet className="mb-2 h-8 w-8 text-green-600" />
            <p className="text-center text-sm font-medium">
              Manage Your Wallet
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center rounded-lg bg-gray-100 p-4">
          <Globe className="mr-4 h-8 w-8 text-purple-600" />
          <p className="text-sm font-medium">Access Global Transactions</p>
        </div>
        <p className="text-center text-gray-600">
          Join Freelii today to start sending money to any contact worldwide.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Link className="w-full" href="/wallet/WALLETADDRESS">
          <Button className="w-full" size="lg">
            <LogIn className="mr-2 h-5 w-5" />
            {user ? `Log In as ${user.username}` : "Log In"}
          </Button>
        </Link>
        <p className="text-center text-sm text-gray-500">
          New to Freelii?{" "}
          <Link
            href="/wallet/new-passkey"
            className="text-blue-600 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </>
  );
}
