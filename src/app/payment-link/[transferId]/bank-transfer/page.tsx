"use client";
import { ArrowUpRight, Copy, Info } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import Link from "next/link";
import { api } from "~/trpc/react";
import { ClientTRPCErrorHandler } from "~/lib/utils";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface IBank {
  how: "fake bank account number";
  id: "a7a326b9-aad2-4af9-9182-7c11fe7192ba";
  extra_info: {
    message: "'how' would normally contain a terse explanation for how to deposit the asset with the anchor, and 'extra_info' would provide any additional information.";
  };
}
export default function Component() {
  const searchParams = useSearchParams();
  const { transferId } = useParams();

  const transfer = api.stellar.getTransferData.useQuery(
    {
      transferId: String(transferId),
    },
    {
      enabled: !!transferId,
    },
  );

  const deposit = api.stellar.deposit.useMutation({
    // onError: ClientTRPCErrorHandler,
    onSuccess: (data) => {
      console.log(data);
    },
  });

  useEffect(() => {
    if (transferId && typeof transferId === "string") {
      deposit.mutate({ transferId });
    }
  }, [transferId]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#3390EC]">
            Complete Your Payment
          </CardTitle>
          <CardDescription>
            Transfer the funds to complete your transaction
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Pay</Label>
            <div className="text-2xl font-bold">
              $
              {Number(transfer?.data?.amount)?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              USD
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="bank-name">Bank Name</Label>
            <Input id="bank-name" value="FAKE International Bank" readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="account-number">Account Number</Label>
            <div className="flex items-center space-x-2">
              <Input id="account-number" value="1234567890" readOnly />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        navigator.clipboard
                          .writeText("1234567890")
                          .then(() =>
                            toast.success("Account Number Copied to Clipboard"),
                          )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy account number</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="routing-number">Routing Number</Label>
            <div className="flex items-center space-x-2">
              <Input id="routing-number" value="987654321" readOnly />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        navigator.clipboard
                          .writeText("987654321")
                          .then(() =>
                            toast.success("Routing Number Copied to Clipboard"),
                          )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy routing number</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reference">Payment Reference</Label>
            <div className="flex items-center space-x-2">
              <Input id="reference" value="PAY-123456789" readOnly />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        navigator.clipboard
                          .writeText("PAY-123456789")
                          .then(() =>
                            toast.success("Reference Copied to Clipboard"),
                          )
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy payment reference</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <Separator />
          <div className="space-y-2 rounded-md border border-[#3390EC] bg-[#E7F3FF] p-3 text-sm">
            <h3 className="flex items-center gap-2 font-semibold text-[#3390EC]">
              <Info className="h-4 w-4" />
              Instructions
            </h3>
            <ol className="list-inside list-disc space-y-1 text-sm text-gray-700">
              <li>
                Log in to your online banking or visit your local bank branch
              </li>
              <li>Initiate a new bank transfer for the specified amount</li>
              <li>
                Enter the provided account and routing numbers as the recipient
              </li>
              <li>Include the payment reference in the transfer details</li>
              <li>
                Double-check all information before confirming the transfer
              </li>
              <li>
                Complete the transfer and keep the confirmation for your records
              </li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link
            href={`/payment-link/${String(transferId)}?${new URLSearchParams(searchParams).toString()}`}
          >
            <Button variant="outline">Back</Button>
          </Link>
          <Link href={`/payment-link/${String(transferId)}/confirm`}>
            <Button>
              I&#39;ve Made the Payment
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
