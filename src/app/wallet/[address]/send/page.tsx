"use client";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import ExpandingArrow from "~/components/ui/expanding-arrow";
import VerificationForm from "~/app/wallet/[address]/send/_components/phone-mail-input";
import AmountInput from "~/app/wallet/[address]/send/_components/amount-input";
import PreviewTransfer from "~/app/wallet/[address]/send/_components/preview";
import Disclaimer from "~/app/wallet/[address]/send/_components/disclaimer";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const steps = {
  edit: 0,
  preview: 1,
};
export default function SendMoneyForm() {
  const { address } = useParams();
  const { clickFeedback } = useHapticFeedback();
  const [amount, setAmount] = useState<number | string | null>(null);
  const [step, setStep] = useState(steps.edit);
  const [recipient, setRecipient] = useState<string>("");

  const handlePreview = () => {
    clickFeedback("soft");
    setStep(steps.preview);
  };

  const handleGoBack = () => {
    clickFeedback("soft");
    setStep(steps.edit);
  };

  if (step === steps.preview) {
    return (
      <PreviewTransfer
        handleGoBack={handleGoBack}
        amount={Number(amount)}
        recipient={recipient}
      />
    );
  }

  return (
    <div>
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-start text-2xl font-bold">
            <Link href={`/wallet/${String(address)}`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  clickFeedback();
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            Send money
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VerificationForm setRecipient={setRecipient} />
          <div className="space-y-2">
            <Label htmlFor="amount">Amount to send</Label>
            <div className="flex items-center space-x-2">
              <span className="rounded-md border border-input bg-gray-50 p-1 px-2 font-mono text-muted-foreground">
                USDc
              </span>
              <AmountInput
                value={amount ?? undefined}
                onChange={setAmount}
                className="border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="group w-full" size="lg" onClick={handlePreview}>
            Preview Transfer
            <ExpandingArrow className="-ml-2 h-3.5 w-3.5" />
          </Button>
          <Disclaimer className="" />
        </CardFooter>
      </Card>
    </div>
  );
}
