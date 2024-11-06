"use client";
import {
  Copy,
  MapPin,
  ArrowRight,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import toast from "react-hot-toast";
import Link from "next/link";

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
  const handleCopyCode = () => {
    navigator.clipboard
      .writeText("1234567890")
      .then(() => toast.success("Code copied"))
      .catch(() => toast.error("Failed to copy code"));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#3390EC]">
            MoneyGram Cash Collection
          </CardTitle>
          <p className="mt-2 text-gray-600">
            Collect your money at any MoneyGram location
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Amount to Collect</h2>
            <div className="flex items-center text-2xl font-bold">
              <DollarSign className="mr-1 h-6 w-6" />
              {Number(transfer?.data?.amount)?.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              USD
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Collection Code</h2>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg bg-gray-50 p-3 font-mono text-lg">
                1234567890
              </div>
              <Button variant="outline" size="icon" onClick={handleCopyCode}>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy code</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Your Information</h2>
            <div className="space-y-1">
              <p>
                <span className="text-gray-600">Name:</span> John Smith
              </p>
              <p>
                <span className="text-gray-600">City:</span> New York
              </p>
              <p>
                <span className="text-gray-600">Country:</span> United States
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <MapPin className="mt-1 h-5 w-5 text-[#3390EC]" />
              <h2 className="text-lg font-semibold">How to Collect</h2>
            </div>
            <ol className="ml-7 list-inside list-decimal space-y-3">
              <li>Find a MoneyGram location near you</li>
              <li>
                Bring your Collection Code and a valid government-issued photo
                ID
              </li>
              <li>Tell the agent you&#39;re collecting a money transfer</li>
              <li>Provide your Collection Code and personal information</li>
              <li>Show your ID for verification</li>
              <li>Receive your cash and keep the receipt</li>
            </ol>
          </div>

          <div className="rounded-lg border border-[#3390EC] bg-[#E7F3FF] p-4">
            <h3 className="mb-2 font-semibold text-[#3390EC]">Important:</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• MoneyGram locations may have different operating hours</li>
              <li>• You must present a valid government-issued photo ID</li>
              <li>• Collection must be done in person</li>
              <li>• The Collection Code expires in 30 days</li>
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
