"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  CreditCard,
  User,
  DollarSign,
  ArrowRight,
  AlertCircle,
  Globe,
  ChevronLeft,
  Clock,
  Banknote,
  Wallet,
  HelpCircle,
  Bell,
  Lock,
  Phone,
  ExternalLink,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import Link from "next/link";
import { api } from "~/trpc/react";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const countryOptions = [
  { value: "us", label: "United States" },
  { value: "gb", label: "United Kingdom" },
  { value: "eu", label: "European Union" },
  { value: "ca", label: "Canada" },
  { value: "mx", label: "Mexico" },
  { value: "ph", label: "Philippines" },
];

const fieldsByCountry = {
  us: [
    {
      name: "accountHolder",
      label: "Account Holder Name",
      icon: User,
      placeholder: "John Doe",
    },
    {
      name: "accountNumber",
      label: "Account Number",
      icon: CreditCard,
      placeholder: "123456789",
    },
    {
      name: "routingNumber",
      label: "Routing Number",
      icon: Building2,
      placeholder: "123456789",
    },
  ],
  gb: [
    {
      name: "accountHolder",
      label: "Account Holder Name",
      icon: User,
      placeholder: "John Doe",
    },
    {
      name: "accountNumber",
      label: "Account Number",
      icon: CreditCard,
      placeholder: "12345678",
    },
    {
      name: "sortCode",
      label: "Sort Code",
      icon: Building2,
      placeholder: "12-34-56",
    },
  ],
  eu: [
    {
      name: "accountHolder",
      label: "Account Holder Name",
      icon: User,
      placeholder: "John Doe",
    },
    {
      name: "iban",
      label: "IBAN",
      icon: CreditCard,
      placeholder: "DE89 3704 0044 0532 0130 00",
    },
    {
      name: "swiftBic",
      label: "SWIFT/BIC",
      icon: Building2,
      placeholder: "DEUTDEFFXXX",
    },
  ],
  ca: [
    {
      name: "accountHolder",
      label: "Account Holder Name",
      icon: User,
      placeholder: "John Doe",
    },
    {
      name: "accountNumber",
      label: "Account Number",
      icon: CreditCard,
      placeholder: "12345678",
    },
    {
      name: "transitNumber",
      label: "Transit Number",
      icon: Building2,
      placeholder: "12345",
    },
    {
      name: "institutionNumber",
      label: "Institution Number",
      icon: Building2,
      placeholder: "123",
    },
  ],
  mx: [
    {
      name: "accountHolder",
      label: "Account Holder Name",
      icon: User,
      placeholder: "Juan Pérez",
    },
    {
      name: "clabe",
      label: "CLABE",
      icon: CreditCard,
      placeholder: "123456789012345678",
    },
    {
      name: "bankName",
      label: "Bank Name",
      icon: Building2,
      placeholder: "Banco de México",
    },
  ],
  ph: [
    {
      name: "accountHolder",
      label: "Account Holder Name",
      icon: User,
      placeholder: "Juan dela Cruz",
    },
    {
      name: "accountNumber",
      label: "Account Number",
      icon: CreditCard,
      placeholder: "1234567890",
    },
    {
      name: "bankName",
      label: "Bank Name",
      icon: Building2,
      placeholder: "Bank of the Philippine Islands",
    },
    {
      name: "swiftCode",
      label: "SWIFT Code",
      icon: Building2,
      placeholder: "BOPIPHMM",
    },
  ],
};

export default function Component() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    otp: ["", "", "", "", "", ""],
    withdrawalMethod: "bank",
    country: "",
    accountHolder: "",
    accountNumber: "",
    routingNumber: "",
    sortCode: "",
    iban: "",
    swiftBic: "",
    transitNumber: "",
    institutionNumber: "",
    clabe: "",
    bankName: "",
    swiftCode: "",
    amount: "",
    currency: "USD",
    cashPickupLocation: "",
  });
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [callRequested, setCallRequested] = useState(false);
  const phoneNumber = "+1 (555) 123-4567"; // Example phone number

  const { id } = useParams();

  // tRPC Procedure calls
  const { data: transfer } = api.transfers.getTransfer.useQuery(
    { id: String(id) },
    { enabled: !!id },
  );
  const otp = api.post.otp.useMutation({ onError: console.error });
  const fillBankDetails = api.transfers.fillBankDetails.useMutation({
    onError: console.error,
    onSuccess: () => console.log("Bank details filled"),
  });

  useEffect(() => {
    if (timeLeft > 0 && !isExpired) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && !isExpired) {
      setIsExpired(true);
      setError("The form has expired. Please refresh the page to start over.");
    }
  }, [timeLeft, isExpired]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData({ ...formData, otp: newOtp });

    // Move to next input if value is entered
    if (value && index < 5) {
      const nextInput = document.getElementById(
        `otp-${index + 1}`,
      ) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleFillBankDetails = async () => {
    if (!id) {
      toast.error("Invalid bank transfer ID");
      return;
    }
    fillBankDetails.mutate({
      bankTransferId: String(id),
      country: "Mexico",
      recipientAddress: "Address",
      recipientBankName: formData.bankName,
      recipientCLABE: formData.clabe,
    });
  };

  const handleChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isExpired) {
      setError("The form has expired. Please refresh the page to start over.");
      return;
    }
    if (step === 0 && formData.otp.join("").length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }
    if (step === 1 && !formData.withdrawalMethod) {
      setError("Please select a withdrawal method");
      return;
    }
    if (step === 2) {
      if (formData.withdrawalMethod === "bank") {
        if (!formData.country) {
          setError("Please select a country");
          return;
        }
        const requiredFields =
          fieldsByCountry[formData.country as keyof typeof fieldsByCountry];
        const missingFields = requiredFields.filter(
          (field) => !formData[field.name as keyof typeof formData],
        );
        if (missingFields.length > 0) {
          setError(
            `Please fill in all required fields: ${missingFields.map((f) => f.label).join(", ")}`,
          );
          return;
        }
        await handleFillBankDetails();
      } else if (formData.withdrawalMethod === "cash") {
        if (!formData.cashPickupLocation) {
          setError("Please enter a cash pickup location");
          return;
        }
      }
      if (formData.withdrawalMethod !== "wallet" && !formData.amount) {
        setError("Please enter the amount to withdraw");
        return;
      }
    }
    setError("");

    if (step === 0) {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIsLoading(false);
    }

    setStep(step + 1);
    if (step === 2) {
      console.log("Form submitted:", formData);
      // Here you would typically send the form data to your backend
    }
  };

  const handleResendOTP = () => {
    setAttempt((prev) => prev + 1);
    otp.mutate({ phone: "+523313415550" });
    setResendCooldown(90);
    // Simulated OTP resend logic
    console.log("Resending OTP...");
    const cooldownInterval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePhoneCall = () => {
    setCallRequested(true);
    // Simulated phone call logic
    console.log("Requesting phone call...");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {step === 0 ? "Verify Phone Number" : "Withdrawal Details"}
            </CardTitle>
            <div className="flex items-center text-sm font-medium">
              <Clock className="mr-2 h-4 w-4" />
              Time left: {formatTime(timeLeft)}
            </div>
          </div>
          <CardDescription>
            {step === 0
              ? "You have a pending transfer. This transfer is locked to the phone number below. Please verify your phone number to continue."
              : "Choose your withdrawal method and enter the required information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 0 && (
              <div className="space-y-4">
                <Alert className="bg-primary-50 border-primary-500 text-primary-700 border-l-4 p-4">
                  <Bell className="h-4 w-4" />
                  <AlertTitle>Pending Transfer</AlertTitle>
                  <AlertDescription>
                    <p>
                      You have a pending transfer of{" "}
                      <strong>
                        $
                        {Number(transfer?.amount).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {transfer?.currency}
                      </strong>{" "}
                      from:
                    </p>
                    <p className="mt-1 font-medium">
                      {transfer?.sender?.firstName} {transfer?.sender?.lastName}{" "}
                      ({transfer?.sender?.phone})
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Sent on:{" "}
                      <time dateTime="2022-10-15">
                        {transfer
                          ? dayjs(transfer.createdAt).format(
                              "MMM D, YYYY h:mm A",
                            )
                          : ""}
                      </time>
                    </p>
                  </AlertDescription>
                </Alert>
                {/*<div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">*/}
                {/*  <div className="flex items-center">*/}
                {/*    <AlertCircle className="h-5 w-5 mr-2" />*/}
                {/*    <p className="font-bold">Important:</p>*/}
                {/*  </div>*/}
                {/*  <p>This transfer must be redeemed before <span className="font-semibold">November 15, 2024</span>. After this date, the funds will be returned to the sender.</p>*/}
                {/*</div>*/}
                <div className="flex items-center justify-between space-x-2 text-sm text-gray-600">
                  <span className="flex items-center justify-start gap-2">
                    <Phone className="h-4 w-4" />
                    6-digit code {attempt === 0 ? "will be" : ""} sent to:{" "}
                    {phoneNumber}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0 || isExpired || isLoading}
                  >
                    {resendCooldown > 0
                      ? `Resend Code (${resendCooldown}s)`
                      : `${attempt === 0 ? "Send" : "Resend"} Code`}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp-0">Enter 6-digit code</Label>
                  <div className="flex justify-between px-4">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <Input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="h-12 w-12 text-center text-2xl"
                        value={formData.otp[index]}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        required
                        disabled={isExpired || isLoading}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>
                    Your funds are secured through a smart contract and can only
                    be released to the phone number above.
                  </p>
                  <Link
                    href="https://stellar.org/blog/developers/soroban-the-smart-contract-platform-designed-for-developers"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-gray-100 p-2 text-primary hover:underline"
                  >
                    Learn more about our smart contract security
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-4">
                <Label>Select Withdrawal Method</Label>
                <RadioGroup
                  onValueChange={(value) =>
                    handleChange("withdrawalMethod", value)
                  }
                  defaultValue={formData.withdrawalMethod}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center">
                      <Building2 className="mr-2 h-4 w-4" />
                      Bank Transfer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center">
                      <Banknote className="mr-2 h-4 w-4" />
                      Withdraw as Cash
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      Keep in Freelii Wallet
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Keep your funds in your Freelii Wallet for future
                            use, instant transfers, or to earn interest.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </RadioGroup>
              </div>
            )}
            {step === 2 && formData.withdrawalMethod === "bank" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="country">Select Your Country</Label>
                  <Select
                    name="country"
                    onValueChange={(value) => handleChange("country", value)}
                    value={formData.country}
                    disabled={isExpired}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countryOptions.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.country &&
                  fieldsByCountry[
                    formData.country as keyof typeof fieldsByCountry
                  ].map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        placeholder={field.placeholder}
                        onChange={(e) =>
                          handleChange(field.name, e.target.value)
                        }
                        value={formData[field.name as keyof typeof formData]}
                        required
                        disabled={isExpired}
                      />
                    </div>
                  ))}
              </>
            )}
            {step === 2 && formData.withdrawalMethod === "cash" && (
              <div className="space-y-2">
                <Label htmlFor="cashPickupLocation">Cash Pickup Location</Label>
                <Input
                  id="cashPickupLocation"
                  name="cashPickupLocation"
                  placeholder="Enter pickup location"
                  onChange={(e) =>
                    handleChange("cashPickupLocation", e.target.value)
                  }
                  value={formData.cashPickupLocation}
                  required
                  disabled={isExpired}
                />
              </div>
            )}
            {step === 2 && formData.withdrawalMethod !== "wallet" && (
              <div className="space-y-2">
                <Label htmlFor="amount">Amount to Withdraw</Label>
                <div className="flex space-x-2">
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    onChange={(e) => handleChange("amount", e.target.value)}
                    value={formData.amount}
                    required
                    className="flex-1"
                    disabled={isExpired}
                  />
                  <Select
                    name="currency"
                    onValueChange={(value) => handleChange("currency", value)}
                    defaultValue={formData.currency}
                    disabled={isExpired}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                      <SelectItem value="MXN">MXN</SelectItem>
                      <SelectItem value="PHP">PHP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={isExpired || isLoading}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            className={step === 0 ? "w-full" : "ml-4 flex-1"}
            onClick={handleSubmit}
            disabled={isExpired || isLoading}
          >
            {isLoading ? (
              <>
                <span className="mr-2 animate-spin">⏳</span>
                Verifying...
              </>
            ) : (
              <>
                {step === 0
                  ? "Verify Phone Number"
                  : step === 2
                    ? formData.withdrawalMethod === "wallet"
                      ? "Keep in Wallet"
                      : "Submit Withdrawal Request"
                    : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
