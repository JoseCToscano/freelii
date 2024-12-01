"use client";

import { useSearchParams } from "next/navigation";
import { type FC } from "react";

interface WalletLayoutWrapperProps {
  children: React.ReactNode;
}
const WalletLayoutWrapper: FC<WalletLayoutWrapperProps> = ({ children }) => {
  const searchParams = useSearchParams();

  if (
    searchParams.has("hideWalletLayout") &&
    searchParams.get("hideWalletLayout") === "true"
  ) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};

export default WalletLayoutWrapper;
