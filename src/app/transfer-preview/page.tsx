"use client";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import { Currency } from "@prisma/client";

export default function Component() {
  const transfer = api.transfers.createTransfer.useMutation({
    onError: console.error,
    onSuccess: () => console.log("Transfer created"),
  });

  const handleTransfer = async () => {
    await transfer.mutateAsync({
      amount: 1000,
      recipientPhone: "+523313415550",
      recipientName: "Jane Smith",
      currency: Currency.USD,
      senderId: 1,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-medium">Review Transfer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">From</p>
              <p className="font-medium">John Doe</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="text-right">
              <p className="text-sm text-muted-foreground">To</p>
              <p className="font-medium">Jane Smith</p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Amount</p>
            <p className="text-2xl font-bold">€5,000.00 EUR</p>
            <p className="text-sm text-muted-foreground">$5,425.00 USD</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm">Transfer Date</p>
              <p className="text-sm font-medium">May 15, 2023</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Estimated Arrival</p>
              <p className="text-sm font-medium">May 17, 2023</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm">Fee</p>
              <p className="text-sm font-medium">$25.00</p>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm text-muted-foreground">Reference</p>
            <p className="text-sm">INV-2023-05-15</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          {/*<Link href="/payment-link">*/}
          <Button onClick={handleTransfer}>Confirm</Button>
          {/*</Link>*/}
        </CardFooter>
      </Card>
    </div>
  );
}
