import { env } from "~/env";
import axios from "axios";
import type { PrismaClient } from "@prisma/client";

interface CircleQuoteSessionResponse {
  id: string;
  blockchain: string;
  paymentMethodType: string;
  fiatAmount: { amount: string; currency: string };
  cryptoAmount: { amount: string; currency: string };
  partnerName: string;
  exchangeRate: { rate: string; pair: string };
  fees: { totalAmount: []; breakdown: [] };
  createDate: "2024-11-22T01:00:12.620962Z";
  expireDate: "2024-11-23T01:00:12.606244Z";
}

interface CircleSession {
  id: "a455b7e1-aaed-48b2-aca8-9b37b44fbee8";
  rampType: "BUY";
  status: "PENDING";
  url: "https://access.circle.com/consumer?sessionId=test_a455b7e1-aaed-48b2-aca8-9b37b44fbee8";
  country: {
    countryCode: "US";
    subdivisionCode: null;
  };
  walletAddress: {
    blockchain: "MATIC-AMOY";
    address: "0x29B62C6e83f01C3e8981b077cbd78AdB26B489D9";
  };
  redirectUrl: "https://circle.com";
  createDate: "2024-10-07T16:36:54.657428Z";
  updateDate: "2024-10-07T16:36:54.657428Z";
}
export class CircleService {
  private readonly db: PrismaClient;

  transferId?: string;

  constructor(db: PrismaClient, transferId?: string) {
    this.db = db;
    this.transferId = transferId;
  }
  private get apiKey(): string {
    return env.CIRCLE_API_KEY;
  }

  private readonly baseUrl = "https://api.circle.com";

  async createQuoteSession(tx: { amount: number }) {
    try {
      const quoteSession = await axios.post<{
        data: CircleQuoteSessionResponse;
      }>(
        `${this.baseUrl}/v1/w3s/ramp/quotes`,
        {
          blockchain: "XLM-TESTNET",
          paymentMethodType: "SPEI",
          rampType: "BUY",
          fiatAmount: {
            amount: "5000",
            currency: "MXN",
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );
      console.log(quoteSession.data);
      return this.db.circleSession.create({
        data: {
          id: quoteSession.data.data.id,
          blockchain: quoteSession.data.data.blockchain,
          paymentMethodType: quoteSession.data.data.paymentMethodType,
          fiatAmount: quoteSession.data.data.fiatAmount.amount,
          fiatCurrency: quoteSession.data.data.fiatAmount.currency,
          cryptoAmount: quoteSession.data.data.cryptoAmount.amount,
          cryptoCurrency: quoteSession.data.data.cryptoAmount.currency,
          partnerName: quoteSession.data.data.partnerName,
          exchangeRate: quoteSession.data.data.exchangeRate.rate,
          exchangePair: quoteSession.data.data.exchangeRate.pair,
          createDate: new Date(quoteSession.data.data.createDate),
          expireDate: new Date(quoteSession.data.data.expireDate),
        },
      });
    } catch (e) {
      console.error(e.response.data);
    }
  }

  async getSessionForQuoute(quoteId?: string) {
    try {
      let id = quoteId;
      if (!id) {
        const quote = await this.createQuoteSession();
        console.log("new quote", quote);
        id = quote.id as string;
      }
      const session = await axios.post<{
        data: CircleSession;
      }>(
        `${this.baseUrl}/v1/w3s/ramp/sessions`,
        {
          mode: "REVIEW_SCREEN",
          rampType: "BUY",
          quoteId: id,
          walletAddress: {
            blockchain: "XLM-TESTNET",
            // TODO
            address: "GCLQTRLPMITD76LYTZA23E747YO2PEROCUUKT7AJ4V6UDXQAQNOYRERU",
          },
          redirectUrl: `${env.FRONTEND_URL}/payment-link/${this.transferId}/confirm`,
          country: "US",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );
      return session.data.data;
    } catch (e) {
      console.error(e.response.data);
      if (e.response?.data?.code === 110048) {
        console.log("refreshing quote session");
        return this.getSessionForQuoute();
      }
    }
  }

  async refreshQuoteSession(quoteId: string) {
    try {
      const newQuote = await this.createQuoteSession();
    } catch (e) {
      console.error(e.response.data);
    }
  }
}
