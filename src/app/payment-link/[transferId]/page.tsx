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
import { useParams } from "next/navigation";
import { Badge } from "~/components/ui/badge";

export default function Component() {
  const { transferId } = useParams();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-2xl font-bold text-[#3390EC]">
            Choose Payment Method
          </CardTitle>
          <CardDescription className="text-center">
            Select how you&#39;d like to complete your transfer
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 space-y-6">
          <Link href={`/payment-link/${String(transferId)}/bank-transfer`}>
            <Button
              variant="outline"
              className="flex h-auto w-full items-center justify-start space-x-4 py-10"
              onClick={() => console.log("Bank Transfer selected")}
            >
              <Banknote className="h-6 w-6" />
              <div className="text-left">
                <h3 className="font-semibold">Bank Transfer</h3>
                <p className="text-sm text-muted-foreground">
                  Pay using online banking or wire transfer
                </p>
              </div>
            </Button>
          </Link>
          <Link href={`/payment-link/${String(transferId)}/cash`}>
            <Button
              variant="outline"
              className="flex h-auto w-full items-center justify-start space-x-4 py-10"
              onClick={() => console.log("Cash Payment selected")}
            >
              <Banknote className="h-6 w-6" />
              <div className="text-left">
                <h3 className="font-semibold">
                  Cash Payment
                  <Badge
                    className="ml-2 border-none bg-gradient-to-br from-[#3390EC] to-blue-300"
                    color="blue"
                  >
                    Coming Soon
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pay with cash at a local payment point
                </p>
              </div>
            </Button>
          </Link>
        </CardContent>
        <CardFooter className="flex flex-col text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms">
              <span className="text-blue-500">Terms of Service</span>
            </Link>{" "}
            and{" "}
            <Link href="/privacy">
              <span className="text-blue-500">Privacy Policy</span>
            </Link>
          </p>
          <span className="mt-4 text-xs text-muted-foreground">
            © 2024 Freelii, All rights reserved.
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
