"use client";

import { type FC, useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Camera, ChevronsUpDown } from "lucide-react";
import { cn, countryCodes, formatPhoneNumber } from "~/lib/utils";
import { useQRScanner } from "~/hooks/useQRScanner";

interface VerificationFormProps {
  setRecipient: (recipient: string) => void;
}

const VerificationForm: FC<VerificationFormProps> = ({ setRecipient }) => {
  const { clickFeedback } = useHapticFeedback();
  const { scan } = useQRScanner();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [verificationMethod, setVerificationMethod] = useState("phone");
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let recipientText = "";
    if (verificationMethod === "phone") {
      recipientText = "Phone Number:";
      const fullPhoneNumber = `${selectedCountry ? `(+${selectedCountry.code})` : "( )"} ${phoneNumber}`;
      setRecipient(recipientText + " " + fullPhoneNumber);
    } else {
      recipientText = "Email Address";
      setRecipient(recipientText + " " + email);
    }
  }, [verificationMethod, phoneNumber, email]);

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhoneNumber = formatPhoneNumber(event.target.value);
    setPhoneNumber(formattedPhoneNumber);
    setRecipient(formattedPhoneNumber);
  };

  const handlePhoneKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    clickFeedback("soft");
    if (event.key === "Backspace" && phoneInputRef.current) {
      const input = phoneInputRef.current;
      if (input?.value.length === 4 || input?.value.length === 8) {
        input.setSelectionRange(input.value.length - 1, input.value.length - 1);
      }
    }
  };

  return (
    <Tabs
      value={verificationMethod}
      onValueChange={setVerificationMethod}
      className="w-full"
    >
      <div className="flex gap-1">
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="phone" onClick={() => clickFeedback("medium")}>
            Phone Number
          </TabsTrigger>
          <TabsTrigger value="email" onClick={() => clickFeedback("medium")}>
            Email
          </TabsTrigger>
        </TabsList>
        <Button
          onClick={() => {
            clickFeedback();
            scan();
          }}
          type="button"
          variant="outline"
          size="icon"
          className="border-2 border-zinc-300 hover:bg-zinc-100"
        >
          <Camera className="h-4 w-4" />
          <span className="sr-only">Scan QR Code</span>
        </Button>
      </div>
      <TabsContent value="phone" className="space-y-4">
        <div className="space-y-2"></div>
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <div className="flex items-center space-x-2">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between"
                >
                  {selectedCountry ? `(+${selectedCountry.code})` : "( )"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {countryCodes.map((country) => (
                        <CommandItem
                          key={country.value}
                          onSelect={() => {
                            clickFeedback("medium");
                            setSelectedCountry(country);
                            setOpen(false);
                          }}
                          className={cn(
                            selectedCountry?.value === country.value
                              ? "border-l-4 border-neutral-200 bg-neutral-100"
                              : "bg-transparent",
                          )}
                        >
                          {country.emoji} {country.label} (+{country.code})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Input
              type="tel"
              placeholder="XXX XXX XXXX"
              value={phoneNumber}
              onChange={handlePhoneChange}
              onKeyDown={handlePhoneKeyDown}
              ref={phoneInputRef}
              maxLength={12}
            />
          </div>
          <p className="-translate-y-1 translate-x-1 text-start text-xs text-zinc-500">
            Enter your phone number with country code
          </p>
        </div>
      </TabsContent>
      <TabsContent value="email" className="space-y-4">
        <div className="space-y-2">
          <Label>Email Address</Label>
          {email}
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Enter your email address for verification
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default VerificationForm;
