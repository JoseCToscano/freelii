"use client";
import { type FC } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import Disclaimer from "~/app/wallet/[address]/send/_components/disclaimer";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";

interface Props {
  handleGoBack: () => void;
  amount: number | string;
  recipient: string;
}
const PreviewTransfer: FC<Props> = ({ handleGoBack, amount, recipient }) => {
  const { clickFeedback } = useHapticFeedback();

  return (
    <div className="space-y-6 rounded-md bg-white">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              handleGoBack();
              clickFeedback();
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Preview Transfer</h1>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-lg bg-gray-100 p-6">
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Sending to</p>
            <p className="font-medium">{recipient}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">Amount</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                $
                {Number(amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-gray-500">USDc</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Network Fee</span>
            <span className="font-medium">0.00 USDc</span>
          </div>
          <div className="flex justify-between border-t py-2">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-medium">
              $
              {Number(amount).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              USDc
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            clickFeedback("success");
          }}
        >
          Confirm Transfer
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Disclaimer />
      </CardFooter>
    </div>
  );
};

export default PreviewTransfer;
