"use client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  ArrowRight,
  Camera,
  DollarSign,
  Globe,
  Send,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQRScanner } from "~/hooks/useQRScanner";
import ExpandingArrow from "~/components/ui/expanding-arrow";
import VerificationForm from "~/app/wallet/[address]/send/_components/phone-mail-input";
import { countries, formatMoney } from "~/lib/utils";
import AmountInput from "~/app/wallet/[address]/send/_components/amount-input";
import Link from "next/link";
import PreviewTransfer from "~/app/wallet/[address]/send/_components/preview";
import Disclaimer from "~/app/wallet/[address]/send/_components/disclaimer";
import { useSearchParams } from "next/navigation";
import { useQuerySearchParams } from "~/hooks/useQuerySearchParams";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";

const steps = {
  edit: 0,
  preview: 1,
};
export default function SendMoneyForm() {
  const { searchParams, addToSeacrhParams } = useQuerySearchParams();
  const { clickFeedback } = useHapticFeedback();
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [amount, setAmount] = useState<number | string | null>(null);
  const [address, setAddress] = useState("");
  const [step, setStep] = useState(steps.edit);

  useEffect(() => {
    addToSeacrhParams("hideWalletLayout", false.toString());
  }, []);

  const formatAmount = (value: string) => {
    // Remove non-numeric characters except "."
    const cleanValue = value.replace(/[^0-9.]/g, "");
    const [integerPart, decimalPart] = cleanValue.split(".");

    // Format integer part with commas
    const formattedInteger = integerPart
      ? parseInt(integerPart, 10).toLocaleString("en-US")
      : "";

    // Limit decimal places to 2
    if (decimalPart !== undefined) {
      const truncatedDecimal = decimalPart.slice(0, 2);
      return `${formattedInteger}.${truncatedDecimal}`;
    }

    return formattedInteger;
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;

    // Format and update the input value
    const formatted = formatAmount(rawValue);
    setAmount(formatted);
  };

  const handlePreview = () => {
    clickFeedback("soft");
    addToSeacrhParams("hideWalletLayout", true.toString());
    setStep(steps.preview);
  };

  const handleGoBack = () => {
    clickFeedback("soft");
    addToSeacrhParams("hideWalletLayout", false.toString());
    setStep(steps.edit);
  };

  if (step === steps.preview) {
    return <PreviewTransfer handleGoBack={handleGoBack} />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address">Send money to any contact</Label>
          <VerificationForm />
        </div>
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
      </div>

      <Button
        className="group w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
        size="lg"
        onClick={handlePreview}
      >
        Preview Transfer
        <ExpandingArrow className="-ml-2 h-3.5 w-3.5" />
      </Button>
      <Disclaimer />
    </div>
  );
}
