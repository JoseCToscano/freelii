"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { ArrowRight, Download, Send } from "lucide-react";

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
  return (
    <Card>
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
                    <p className="text-sm text-gray-500">{transaction.date}</p>
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
  );
}
