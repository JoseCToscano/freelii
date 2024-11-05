"use client";
import { Button } from "~/components/ui/button";
import { CheckCircle, FileText } from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

const ConfirmComponent: React.FC = () => {
  const { transferId } = useParams();

  const transfer = api.stellar.getTransferData.useQuery(
    {
      transferId: String(transferId),
    },
    {
      enabled: !!transferId,
    },
  );

  if (!transfer.data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#3390EC]">
            Transfer Confirmed!
          </CardTitle>
          <CardDescription>
            Your payment of $
            {Number(transfer?.data?.amount).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            USD to {transfer?.data?.recipientName} has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-lg border border-[#3390EC] bg-[#E7F3FF] p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono font-medium">{transferId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-mono font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-mono font-medium text-green-500">
                Completed
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <span className="mt-4 w-full text-center text-xs text-muted-foreground">
            © Freelii, All rights reserved.
          </span>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConfirmComponent;
