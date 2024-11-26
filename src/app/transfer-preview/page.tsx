"use client";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  DollarSign,
  Globe,
  Info,
  Send,
  Smartphone,
  User,
  Zap,
  Lock,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/react";
import { Currency } from "@prisma/client";
import toast from "react-hot-toast";
import {
  ClientTRPCErrorHandler,
  countries,
  mapCountry,
  parsePhoneNumber,
  toPascalCase,
} from "~/lib/utils";
import { useState } from "react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import { useSearchParams } from "next/navigation";

export default function Component() {
  const searchParams = useSearchParams();
  const { clickFeedback } = useHapticFeedback();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    country: mapCountry(searchParams.get("country") ?? ""),
    recipientName: decodeURIComponent(
      toPascalCase(searchParams.get("recipient") ?? ""),
    ),
    phoneNumber: searchParams.get("recipientPhone")
      ? decodeURIComponent(
          String(parsePhoneNumber(searchParams.get("recipientPhone") ?? "")),
        )
      : "",
    amount: searchParams.get("amount") ?? "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isHoveredFeature, setIsHoveredFeature] = useState<number | null>(null);

  const features = [
    { icon: Globe, title: "International" },
    { icon: Zap, title: "Fast" },
    { icon: Lock, title: "Secure" },
    { icon: Smartphone, title: "Mobile-friendly" },
  ];

  const transfer = api.transfers.createTransfer.useMutation({
    onError: ClientTRPCErrorHandler,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCountryChange = (value: string) => {
    clickFeedback("selectionChanged");
    setFormData((prevData) => ({ ...prevData, country: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    if (step < 4) {
      setStep(step + 1);
    } else {
      console.log("Form submitted:", {
        ...formData,
        amount: `${formData.amount} USD`,
      });
      setIsLoading(true);
      const tx = await transfer
        .mutateAsync({
          amount: Number(formData.amount),
          recipientPhone: formData.phoneNumber,
          recipientName: formData.recipientName,
          currency: Currency.USD,
        })
        .finally(() => setIsLoading(false));
      if (!tx) {
        toast.error("Failed to create transfer");
        return;
      }
      clickFeedback("success");
      toast.success("Looking good! Just a few more steps to go.");

      window.location.href = `/onboarding/${String(tx.id)}?${new URLSearchParams(searchParams).toString()}`;
    }
  };

  const handleBack = () => {
    clickFeedback();
    setStep(step - 1);
  };

  const handleEdit = (editStep: number) => {
    setStep(editStep);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-[#3390EC] bg-[#E7F3FF] p-4">
              <p className="text-sm leading-relaxed text-[#3390EC]">
                Welcome! You&#39;re about to set up an international money
                transfer. Here&#39;s what to expect:
              </p>
              <ol className="mt-2 list-inside list-decimal text-sm text-gray-700">
                <li>Enter the recipient&#39;s details</li>
                <li>Review and confirm your transaction</li>
                <li>Complete personal verification</li>
              </ol>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="flex cursor-help flex-col items-center justify-center rounded-lg bg-white p-4 text-center shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
                        style={{
                          transform:
                            isHoveredFeature === index
                              ? "scale(1.05)"
                              : "scale(1)",
                          backgroundColor:
                            isHoveredFeature === index ? "#E7F3FF" : "white",
                        }}
                        onMouseEnter={() => setIsHoveredFeature(index)}
                        onMouseLeave={() => setIsHoveredFeature(null)}
                      >
                        <feature.icon className="mb-2 h-8 w-8 text-[#3390EC]" />
                        <h3 className="text-sm font-semibold text-gray-900">
                          {feature.title}
                        </h3>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getTooltipContent(feature.title)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <Button
              onClick={() => {
                clickFeedback();
                setStep(1);
              }}
              className="w-full"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="country">Where are you sending money to?</Label>
              <Select
                name="country"
                value={formData.country}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient&#39;s Name</Label>
              <Input
                id="recipientName"
                name="recipientName"
                placeholder="Enter recipient's name"
                value={formData.recipientName}
                onChange={handleInputChange}
                required
              />
              <span className="ml-1 text-xs text-muted-foreground">
                Just as it appears on their official ID
              </span>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Recipient&#39;s Phone Number </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="Enter recipient's phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
              <span className="ml-1 text-xs text-muted-foreground">
                Make sure to include the country code (e.g. +63 for Philippines)
              </span>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Send (USD)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="Enter amount in USD"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
              <span className="ml-1 text-xs text-muted-foreground">
                Don&#39;t worry, funds will be converted to the recipient&#39;s
                local currency
              </span>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-3 rounded-lg border-none bg-[#E7F3FF] p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Country:</span>
                <span className="font-mono font-medium">
                  {countries.find((c) => c.value === formData.country)?.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-mono font-medium">
                  {formData.recipientName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Phone Number:</span>
                <span className="font-mono font-medium">
                  {formData.phoneNumber}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-mono text-lg font-medium text-[#3390EC]">
                  $
                  {Number(formData.amount).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  USD
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleEdit(1)}
              >
                <Globe className="mr-2 h-4 w-4" />
                Edit Country
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleEdit(2)}
              >
                <User className="mr-2 h-4 w-4" />
                Edit Recipient Details
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => handleEdit(3)}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Edit Amount
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-2xl font-bold text-[#3390EC]">
            <Send className="mr-2 h-6 w-6 text-[#3390EC]" />
            {step === 0 && "Send Money with Your Phone"}
            {step === 1 && "Select Country"}
            {step === 2 && "Recipient Details"}
            {step === 3 && "Enter Amount"}
            {step === 4 && "Confirm Transaction"}
          </CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            {step === 0 &&
              "No need for complicated account details - it's as easy as sending a message!"}
            {step === 1 && "Select the country where the recipient is located"}
            {step === 2 && "Enter the recipient's name and phone number"}
            {step === 3 && "Enter the amount you want to send"}
            {step === 4 && "Review and confirm your transaction details"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {renderStep()}
            {step > 0 && (
              <div className="mt-6 flex justify-between">
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                {step < 4 && (
                  <Button
                    type="submit"
                    onClick={() => clickFeedback()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="mr-2 animate-spin">⏳</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
                {step === 4 && (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <span className="mr-2 animate-spin">⏳</span>
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex flex-col text-center text-sm text-gray-500">
          <div className="flex w-full items-center justify-center">
            <Info className="mr-2 h-4 w-4 text-[#3390EC]" />
            {step === 0
              ? "Get started with your transfer"
              : `Step ${step} of 4`}
          </div>
          <span className="mt-4 text-xs text-muted-foreground">
            © Freelii, All rights reserved.
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}

function getTooltipContent(title: string) {
  switch (title) {
    case "International":
      return "Send money to recipients in various countries";
    case "Fast":
      return "Quick processing for speedy transfers";
    case "Secure":
      return "Your transaction is protected with advanced security measures";
    case "Mobile-friendly":
      return "Easy to use on your smartphone or tablet";
    default:
      return "";
  }
}
