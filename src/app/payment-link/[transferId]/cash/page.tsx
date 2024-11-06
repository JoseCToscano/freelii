"use client";
import { ArrowUpRight, Copy, DollarSign, MapPin } from "lucide-react";
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
import toast from "react-hot-toast";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#3390EC]">
            MoneyGram Cash Payment
          </CardTitle>
          <CardDescription>
            Complete your payment at a MoneyGram location
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to Pay</Label>
            <div className="flex items-center text-2xl font-bold">
              <DollarSign className="mr-1 h-6 w-6" />
              {Number(transfer?.data?.amount)?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              USD
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="receive-code">Receive Code</Label>
            <div className="flex items-center space-x-2">
              <Input id="receive-code" value="1234567890" readOnly />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        navigator.clipboard
                          .writeText("1234567890")
                          .then(() => toast.success("Code Copied to Clipboard"))
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy Receive Code</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Recipient Information</Label>
            <p className="text-sm">Name: [Fake bank] ACME Financial Services</p>
            <p className="text-sm">City: New York</p>
            <p className="text-sm">Country: United States</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 font-semibold">
              <MapPin className="h-4 w-4" />
              How to Pay
            </h3>
            <ol className="list-inside list-decimal space-y-2 text-sm">
              <li>Find a MoneyGram location near you</li>
              <li>Bring the Receive Code and the exact amount in cash</li>
              <li>Tell the agent you&#39;re sending money to a company</li>
              <li>Provide the recipient information (Name, City, Country)</li>
              <li>Pay the amount plus any MoneyGram fees in cash</li>
              <li>Keep your receipt as proof of payment</li>
            </ol>
          </div>
          <div className="rounded-md border border-[#3390EC] bg-[#E7F3FF] p-3 text-sm">
            <p className="font-semibold text-[#3390EC]">Important:</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-gray-700">
              <li>MoneyGram locations may have different operating hours</li>
              <li>Bring a valid government-issued photo ID</li>
              <li>Fees may vary by location and payment amount</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link
            href={`/payment-link/${String(transferId)}?${new URLSearchParams(searchParams).toString()}`}
          >
            <Button variant="outline">Back</Button>
          </Link>
          <Link
            href="https://www.moneygram.com/intl/en/en-locator"
            target="_blank"
          >
            <Button>
              Find MoneyGram Location
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
