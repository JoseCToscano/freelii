import "~/styles/globals.css";

import { type Metadata } from "next";

import { Card } from "~/components/ui/card";

export const metadata: Metadata = {
  title: "Freelii",
  description: "Send money to your friends and family",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-100 p-4">
        <Card className="w-full max-w-md border-0 bg-white shadow-lg">
          {children}
        </Card>
        <span className="mt-4 text-xs text-zinc-500">Arturito • ©2024</span>
      </div>
    </div>
  );
}
