"use client";

import { useState, FC } from "react";
import {
  ArrowRight,
  ChevronLeft,
  Upload,
  User,
  Mail,
  CreditCard,
  Building2,
  AlertCircle,
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
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Progress } from "~/components/ui/progress";

interface KYCFields {
  first_name_required: boolean;
  last_name_required: boolean;
  email_address_required: boolean;
  bank_account_number_required: boolean;
  bank_number_required: boolean;
  photo_id_front_required: boolean;
  photo_id_back_required: boolean;
}

export const KYCForm: FC<KYCFields> = ({}) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email_address: "",
    bank_account_number: "",
    bank_number: "",
    photo_id_front: null as File | null,
    photo_id_back: null as File | null,
  });
  const [error, setError] = useState("");

  const steps = ["Personal Information", "Photo ID", "Bank Details"];

  const handleChange = (name: string, value: string | File | null) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    const file = event.target.files?.[0] ?? null;
    handleChange(fieldName, file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 0) {
      if (
        !formData.first_name ||
        !formData.last_name ||
        !formData.email_address
      ) {
        setError("Please fill in all personal information fields.");
        return;
      }
    } else if (step === 1) {
      if (!formData.photo_id_front) {
        setError("Please upload the front of your photo ID.");
        return;
      }
    } else if (step === 2) {
      if (!formData.bank_account_number || !formData.bank_number) {
        setError("Please fill in all bank details fields.");
        return;
      }
    }

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      console.log("Form submitted:", formData);
      // Here you would typically send the form data to your backend
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Account Verification
          </CardTitle>
          <CardDescription>
            Please provide the following information to complete your
            verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Progress
              value={((step + 1) / steps.length) * 100}
              className="w-full"
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    placeholder="John"
                    icon={<User className="h-4 w-4 text-gray-500" />}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    value={formData.first_name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    placeholder="Doe"
                    icon={<User className="h-4 w-4 text-gray-500" />}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    value={formData.last_name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email_address">Email Address</Label>
                  <Input
                    id="email_address"
                    name="email_address"
                    type="email"
                    placeholder="john.doe@example.com"
                    icon={<Mail className="h-4 w-4 text-gray-500" />}
                    onChange={(e) =>
                      handleChange("email_address", e.target.value)
                    }
                    value={formData.email_address}
                    required
                  />
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">
                    Bank Account Number
                  </Label>
                  <Input
                    id="bank_account_number"
                    name="bank_account_number"
                    placeholder="1234567890"
                    icon={<CreditCard className="h-4 w-4 text-gray-500" />}
                    onChange={(e) =>
                      handleChange("bank_account_number", e.target.value)
                    }
                    value={formData.bank_account_number}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_number">Routing Number</Label>
                  <Input
                    id="bank_number"
                    name="bank_number"
                    placeholder="123456789"
                    icon={<Building2 className="h-4 w-4 text-gray-500" />}
                    onChange={(e) =>
                      handleChange("bank_number", e.target.value)
                    }
                    value={formData.bank_number}
                    required
                  />
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="photo_id_front">Photo ID Front</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="photo_id_front"
                      name="photo_id_front"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "photo_id_front")}
                      className="hidden"
                    />
                    <Label
                      htmlFor="photo_id_front"
                      className="flex h-32 w-full cursor-pointer appearance-none items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white px-4 transition hover:border-gray-400 focus:outline-none"
                    >
                      <span className="flex items-center space-x-2">
                        <Upload className="h-6 w-6 text-gray-600" />
                        <span className="font-medium text-gray-600">
                          {formData.photo_id_front
                            ? formData.photo_id_front.name
                            : "Click to upload front of ID"}
                        </span>
                      </span>
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="photo_id_back">
                    Photo ID Back (Optional)
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="photo_id_back"
                      name="photo_id_back"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, "photo_id_back")}
                      className="hidden"
                    />
                    <Label
                      htmlFor="photo_id_back"
                      className="flex h-32 w-full cursor-pointer appearance-none items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white px-4 transition hover:border-gray-400 focus:outline-none"
                    >
                      <span className="flex items-center space-x-2">
                        <Upload className="h-6 w-6 text-gray-600" />
                        <span className="font-medium text-gray-600">
                          {formData.photo_id_back
                            ? formData.photo_id_back.name
                            : "Click to upload back of ID (Optional)"}
                        </span>
                      </span>
                    </Label>
                  </div>
                </div>
              </>
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
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <Button
            className={step === 0 ? "w-full" : "ml-4 flex-1"}
            onClick={handleSubmit}
          >
            {step === steps.length - 1 ? "Submit KYC Details" : "Next"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
