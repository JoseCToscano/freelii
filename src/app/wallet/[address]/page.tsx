"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import {
  ArrowRight,
  ArrowUpIcon,
  Download,
  Eye,
  EyeOff,
  Send,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import WalletLayoutWrapper from "~/app/wallet/[address]/send/_components/wallet-layout";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";

interface Transaction {
  id: string;
  type: "send" | "receive";
  amount: number;
  recipient: string;
  date: string;
}

const transactions: Transaction[] = [
  {
    id: "1",
    type: "send",
    amount: 100,
    recipient: "Maria Santos",
    date: "2 hours ago",
  },
  {
    id: "2",
    type: "receive",
    amount: 50,
    recipient: "Miguel Silva",
    date: "3 hours ago",
  },
  {
    id: "3",
    type: "send",
    amount: 200,
    recipient: "Maria Santos",
    date: "4 hours ago",
  },
];

export default function Wallet() {
  const { address } = useParams();
  const { clickFeedback } = useHapticFeedback();

  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const toggleBalanceVisibility = () => {
    setIsBalanceHidden((prev) => !prev);
  };

  const balance = { data: "250.00" };

  return (
    <div>
      <WalletLayoutWrapper>
        <Card className="bg-white p-6 text-center">
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
              <span className="ml-2 font-mono text-xl text-zinc-500">USDc</span>
            </div>
          </div>
        </Card>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Link className="w-full" href={`/wallet/${String(address)}/send`}>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                clickFeedback("soft");
              }}
            >
              <Send className="mr-2 h-5 w-5" />
              Send
            </Button>
          </Link>
          <Link className="w-full" href={`/wallet/${String(address)}/receive`}>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                clickFeedback("soft");
              }}
            >
              <Download className="mr-2 h-5 w-5" />
              Receive
            </Button>
          </Link>
        </div>
      </WalletLayoutWrapper>

      <Card className="my-4">
        <CardHeader>
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-2 text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">
                Your recent transactions will appear here
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {transactions.map((transaction) => (
                <li
                  key={transaction.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {transaction.type === "send" ? (
                      <Send className="mr-2 h-4 w-4 text-red-500" />
                    ) : (
                      <Download className="mr-2 h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{transaction.recipient}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <p
                      className={`font-medium ${transaction.type === "send" ? "text-red-500" : "text-green-500"}`}
                    >
                      {transaction.type === "send" ? "-" : "+"}
                      {transaction.amount.toFixed(2)} USDc
                    </p>
                    <ArrowRight className="ml-2 h-4 w-4 text-gray-400" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
