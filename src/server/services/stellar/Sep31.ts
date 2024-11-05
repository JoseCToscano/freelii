import axios from "axios";
import { StellarAnchorService } from "~/server/services/stellar/StellarAnchorService";

interface SEP31Info {
  receive: Record<
    string,
    {
      enabled: boolean;
      sep12: {
        sender: {
          types: {
            "sep31-sender": {
              description: string;
            };
          };
        };
        receiver: {
          types: {
            "sep31-receiver": {
              description: string;
            };
          };
        };
      };
      fields: {
        transaction: {
          routing_number: {
            description: string;
          };
          account_number: {
            description: string;
          };
        };
      };
      fee_fixed: number;
      quotes_supported: boolean;
    }
  >;
}

/**
 * @description A collection of functions that make it easier to work with
 * SEP-31: Cross-Border Payments
 */
export class Sep31 extends StellarAnchorService {
  authToken?: string;

  fields: SEP31Info | null = null;

  /**
   * Fetches and returns basic information about what the SEP-31 transfer server suppports.
   */
  async getSep31Fields() {
    try {
      if (this.fields) {
        return this.fields;
      }
      const sep31Server = await this.getDirectPaymentServer();
      if (!sep31Server) {
        throw new Error("Unsupported: No SEP-31 server found");
      }
      const info = await axios.get(`${sep31Server}/info`);
      this.fields = info.data as SEP31Info;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`Error getting SEP-31 info: ${e.message}`);
      } else {
        throw new Error("An unknown error occurred");
      }
    }
  }
}
