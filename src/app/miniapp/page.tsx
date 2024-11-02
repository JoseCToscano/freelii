import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Send, Download, PlusCircle, MinusCircle } from "lucide-react";

const Home = () => {
  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center">Bank Transfer Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="border-b pb-4 text-center">
          <p className="text-muted-foreground text-sm">Current Balance</p>
          <p className="font-mono text-3xl font-bold">$1,500.10</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button className="w-full" size="lg">
            <Send className="mr-2 h-4 w-4" /> Send Money
          </Button>
          <Button className="w-full" size="lg">
            <Download className="mr-2 h-4 w-4" /> Receive Money
          </Button>
          <Button className="w-full" size="lg">
            <PlusCircle className="mr-2 h-4 w-4" /> Deposit
          </Button>
          <Button className="w-full" size="lg">
            <MinusCircle className="mr-2 h-4 w-4" /> Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Home;
