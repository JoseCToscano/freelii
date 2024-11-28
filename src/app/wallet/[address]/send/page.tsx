"use client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ArrowRight, Camera, Send } from "lucide-react";
import { useState } from "react";
import { useQRScanner } from "~/hooks/useQRScanner";
import ExpandingArrow from "~/components/ui/expanding-arrow";

export default function SendMoneyForm() {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  const { scan } = useQRScanner();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium text-zinc-700">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            className="border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500"
            value={amount}
            onChange={(e) => setAmount(String(e.target.value ?? ""))}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="address"
            className="text-sm font-medium text-zinc-700"
          >
            Recipient Address
          </Label>
          <div className="flex space-x-2">
            <Input
              id="address"
              type="text"
              placeholder="Enter recipient address"
              className="border-zinc-300 focus:border-zinc-500 focus:ring-zinc-500"
              value={address}
              onChange={(e) => setAddress(String(e.target.value ?? ""))}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="border-2 border-zinc-300 hover:bg-zinc-100"
              onClick={scan}
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">Scan QR Code</span>
            </Button>
          </div>
        </div>
      </div>

      <Button
        className="group w-full bg-zinc-800 py-6 text-lg text-white transition-colors duration-300 hover:bg-zinc-900"
        size="lg"
      >
        Preview Transfer
        <ExpandingArrow className="-ml-2 h-3.5 w-3.5" />
      </Button>

      <p className="-translate-y-4 text-center text-xs text-zinc-500">
        By sending, you agree to the terms of service and privacy policy.
      </p>
    </div>
  );
}
