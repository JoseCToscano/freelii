import { StellarAnchorService } from "~/server/services/stellar/StellarAnchorService";
import axios from "axios";
import { Sep10 } from "~/server/services/stellar/Sep10";

interface Quote {
  id: string; // "b309457f-58a3-469b-8bc8-f03a930233df",
  price: string; // "1.22",
  expires_at: string; // "2024-11-05T07:24:30.243918Z",
  sell_asset: string; // "iso4217:USD",
  buy_asset: string; // "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
  sell_amount: string; // "100.00",
  buy_amount: string; // "81.97"
}
export class Sep38 extends StellarAnchorService {
  /**
   * Get a quote for a USDC transaction
   * @param authToken
   * @param amount
   * @param deliveryMethod
   */
  async getUSDCQuote({
    authToken,
    amount,
    deliveryMethod = "cash_dropoff",
  }: {
    authToken: string;
    amount: number;
    deliveryMethod: string;
  }) {
    const quoteServer = await this.getAnchorQuoteServer();
    if (!quoteServer) {
      throw new Error("Quote server not found");
    }
    const quote = await axios.post<Quote>(
      `${quoteServer}/quote`,
      {
        sell_asset: "iso4217:USD",
        sell_amount: amount,
        sell_delivery_method: deliveryMethod,
        buy_asset:
          "stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    );
    return quote.data;
  }
}
