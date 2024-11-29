"use client";
import { type FC, useState, useRef } from "react";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";

interface AmountInputProps {
  value?: number | string;
  onChange?: (value: number | null) => void;
  placeholder?: string;
  className?: string;
}

const AmountInput: FC<AmountInputProps> = ({
  value,
  onChange,
  placeholder = "0.00",
  className,
}) => {
  const { clickFeedback } = useHapticFeedback();
  const [inputValue, setInputValue] = useState(
    value !== undefined ? (Number(value) * 100).toFixed(0) : "", // Store in cents
  );
  const inputRef = useRef<HTMLInputElement | null>(null);

  const formatAmount = (value: string) => {
    const cleanValue = value.replace(/[^\d]/g, ""); // Remove non-numeric characters
    const numericValue = parseInt(cleanValue || "0", 10); // Parse as number

    const dollars = Math.floor(numericValue / 100).toLocaleString("en-US");
    const cents = (numericValue % 100).toString().padStart(2, "0");

    return `${dollars}.${cents}`;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    clickFeedback("soft");
    const rawValue = event.target.value.replace(/[^\d]/g, ""); // Keep only digits
    setInputValue(rawValue);

    // Notify the parent in dollars and cents
    const numericValue = parseInt(rawValue || "0", 10) / 100;
    if (onChange) {
      onChange(!isNaN(numericValue) ? numericValue : null);
    }
  };

  const handleFocus = () => {
    if (inputRef.current) {
      // Place cursor at the end of the input when focused
      const length = inputRef.current.value.length;
      if ("setSelectionRange" in inputRef.current) {
        inputRef.current.setSelectionRange(length, length);
      }
    }
  };

  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
        $
      </span>
      <Input
        id="amount"
        type="tel"
        value={formatAmount(inputValue)}
        onChange={handleChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        ref={inputRef}
        className={cn(className, "pl-6")}
      />
    </div>
  );
};

export default AmountInput;
