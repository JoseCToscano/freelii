"use client";
import { Banknote } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Link from "next/link";

export default function Component() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Choose Payment Method
          </CardTitle>
          <CardDescription className="text-center">
            Select how you&#39;d like to complete your payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Link href="/payment-link/bank-transfer">
            <Button
              variant="outline"
              className="flex h-auto w-full items-center justify-start space-x-4 py-6"
              onClick={() => console.log("Bank Transfer selected")}
            >
              <Banknote className="h-6 w-6" />
              <div className="text-left">
                <h3 className="font-semibold">Bank Transfer</h3>
                <p className="text-muted-foreground text-sm">
                  Pay using online banking or wire transfer
                </p>
              </div>
            </Button>
          </Link>
          <Link href="/payment-link/cash">
            <Button
              variant="outline"
              className="flex h-auto w-full items-center justify-start space-x-4 py-6"
              onClick={() => console.log("Cash Payment selected")}
            >
              <Banknote className="h-6 w-6" />
              <div className="text-left">
                <h3 className="font-semibold">Cash Payment</h3>
                <p className="text-muted-foreground text-sm">
                  Pay with cash at a local payment point
                </p>
              </div>
            </Button>
          </Link>
        </CardContent>
        <CardFooter>
          <Link href="/payment-link">
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => console.log("Back button clicked")}
            >
              Back to Review
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
