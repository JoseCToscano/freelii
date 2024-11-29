import Link from "next/link";
import { FC } from "react";
import { cn } from "~/lib/utils";

interface Props {
  className?: string;
}
const Disclaimer: FC<Props> = ({ className }) => {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      By continuing, you agree to our{" "}
      <Link href="/terms">
        <span className="text-blue-500">Terms of Service</span>
      </Link>{" "}
      and{" "}
      <Link href="/privacy">
        <span className="text-blue-500">Privacy Policy</span>
      </Link>
    </p>
  );
};

export default Disclaimer;
