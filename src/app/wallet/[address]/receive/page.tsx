"use client";
import { useState } from "react";
import { QrCode, Share2, Copy, ArrowLeft, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useParams } from "next/navigation";
import { copyToClipboard } from "~/lib/utils";
import { env } from "~/env";
import Link from "next/link";
import { useHapticFeedback } from "~/hooks/useHapticFeedback";

export default function ReceiveTransfers() {
  const { address } = useParams();
  const { clickFeedback } = useHapticFeedback();
  const [activeTab, setActiveTab] = useState<"receive" | "create">("receive");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: "My Wallet Address",
          text: `Here's my wallet address: ${String(address)}`,
          url: `${env.NEXT_PUBLIC_APP_URL}/send?address=${String(address)}`,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      alert("Web Share API is not supported in your browser");
    }
  };

  const handleCopy = () => {
    copyToClipboard(String(address));
  };

  const handleCreateQR = () => {
    // Implement QR code creation with amount and description
    console.log("Creating QR code with:", { amount, description });
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setAmount("");
    setDescription("");
  };

  return (
    <div>
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle className="text-start text-2xl font-bold">
            <Link href={`/wallet/${String(address)}`}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  clickFeedback();
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            Receive Transfers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showPreview ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Payment QR Preview</h3>
                <Button variant="ghost" size="sm" onClick={handleClosePreview}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center rounded-lg bg-white p-4 shadow-inner">
                <QrCode className="h-48 w-48 text-gray-800" />
              </div>
              <div className="space-y-2 text-center">
                <p className="font-semibold">Amount: {amount} USDc</p>
                {description && (
                  <p className="text-sm text-gray-600">
                    Description: {description}
                  </p>
                )}
              </div>
              <Button onClick={handleShare} className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share Payment QR
              </Button>
            </div>
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "receive" | "create")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="receive">Receive Money</TabsTrigger>
                <TabsTrigger value="create">Create Payment QR</TabsTrigger>
              </TabsList>
              <TabsContent value="receive" className="space-y-4">
                <div className="flex items-center justify-center rounded-lg bg-white p-4 shadow-inner">
                  <QrCode className="h-48 w-48 text-gray-800" />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleShare} className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  <p>To receive money:</p>
                  <ol className="mt-2 list-inside list-decimal space-y-1">
                    <li>Share this QR code with the sender</li>
                    <li>Ask them to scan it with their Freelii app</li>
                    <li>Confirm the transfer once it&#39;s initiated</li>
                  </ol>
                </div>
              </TabsContent>
              <TabsContent value="create" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USDc)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="Enter description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateQR} className="w-full">
                  Create Payment QR
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-xs text-gray-500">
            Secure transfers powered by Freelii
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
