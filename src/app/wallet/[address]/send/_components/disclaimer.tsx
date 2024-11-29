import Link from "next/link";

const Disclaimer = () => {
  return (
    <p className="text-xs text-muted-foreground">
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
