import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Nunito } from 'next/font/google';

import { TRPCReactProvider } from "~/trpc/react";
import ToasterProvider from "~/providers/toaster-provider";
import Background from "./components/background";

const nunito = Nunito({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Freelii",
  description: "Send money to your friends and family",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <ToasterProvider />
          <Background >
          {children}
          </Background>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
