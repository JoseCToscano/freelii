"use client";

import { type FC, useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";
import ExpandingArrow from "~/components/ui/expanding-arrow";
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
import { ChevronsUpDown } from "lucide-react";
import { cn } from "~/lib/utils";

interface Props {
  isLoading?: boolean;
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
}

const VerificationForm: FC<Props> = ({
  isLoading,
  phoneNumber,
  setPhoneNumber,
}) => {
  const { clickFeedback } = useHapticFeedback();

  const [verificationMethod, setVerificationMethod] = useState("phone");
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhoneNumber = formatPhoneNumber(event.target.value);
    setPhoneNumber(formattedPhoneNumber);
  };

  const handlePhoneKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && phoneInputRef.current) {
      const input = phoneInputRef.current;
      if (input?.value.length === 4 || input?.value.length === 8) {
        input.setSelectionRange(input.value.length - 1, input.value.length - 1);
      }
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Tabs
        value={verificationMethod}
        onValueChange={setVerificationMethod}
        className="w-full"
      >
        <TabsList className="mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="phone">Phone Number</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
        <TabsContent value="phone" className="space-y-4">
          <div className="space-y-2">
            <Label>Country</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedCountry
                    ? `${selectedCountry.label} (+${selectedCountry.code})`
                    : "Select country..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0"
                side="bottom"
                align="start"
              >
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandList>
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup>
                      {countryCodes.map((country) => (
                        <CommandItem
                          key={country.value}
                          onSelect={() => {
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
          </div>
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              type="tel"
              placeholder="XXX XXX XXXX"
              value={phoneNumber}
              onChange={handlePhoneChange}
              onKeyDown={handlePhoneKeyDown}
              ref={phoneInputRef}
              maxLength={12}
            />
            <p className="text-sm text-muted-foreground">
              Enter your phone number without the country code
            </p>
          </div>
        </TabsContent>
        <TabsContent value="email" className="space-y-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input type="email" placeholder="name@example.com" />
            <p className="text-sm text-muted-foreground">
              Enter your email address for verification
            </p>
          </div>
        </TabsContent>
      </Tabs>
      <CardFooter className="mt-4 flex flex-col gap-4 p-0">
        <Button
          type="submit"
          onClick={() => clickFeedback()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <span className="mr-2 animate-spin">⏳</span>
              Sending OTP...
            </>
          ) : (
            <>
              <p className="text-light text-xs">Send Verification Code</p>
              <ExpandingArrow className="-ml-2 h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </CardFooter>
    </div>
  );
};

export default VerificationForm;
