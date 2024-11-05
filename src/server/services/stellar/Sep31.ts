import axios from "axios";
import { StellarAnchorService } from "~/server/services/stellar/StellarAnchorService";
import { Sep10 } from "~/server/services/stellar/Sep10";
import { env } from "~/env";
import { Keypair, TransactionBuilder } from "@stellar/stellar-sdk";
import { Sep12 } from "~/server/services/stellar/Sep12";

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

  async authenticateSender(): Promise<string> {
    try {
      // const keypair = Keypair.fromSecret(env.FREELI_DISTRIBUTOR_SECRET_KEY);
      const keypair = Keypair.random();
      const sep10 = new Sep10(this.homeDomain);
      const { network_passphrase, transaction } =
        await sep10.getChallengeTransaction(keypair.publicKey());
      const transactionXDR = TransactionBuilder.fromXDR(
        transaction,
        network_passphrase,
      );
      transactionXDR.sign(keypair);
      const xdr = transactionXDR.toXDR();
      const token = await sep10.submitChallengeTransaction(xdr);
      this.authToken = token;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`Error authenticating Sender: ${e.message}`);
      } else {
        throw new Error("An unknown error occurred");
      }
    }
  }

  async getKYCFields(type: "sender" | "receiver") {
    try {
      let token = "";
      if (!this.authToken) {
        token = await this.authenticateSender();
      }

      // Fetch what Auth is Required
      const info = await this.getSep31Fields();
      // senderAuth = info.receive[asset].sep12.sender.types;

      const sep12 = new Sep12(this.homeDomain);
      const fields = await sep12.getSep12Fields({
        authToken: this.authToken ?? token,
        params: { type: `sep31-${type}` },
      });

      return fields;
    } catch (e) {
      if (e instanceof Error) {
        throw new Error(`Error requesting KYC info: ${e.message}`);
      } else {
        throw new Error("An unknown error occurred");
      }
    }
  }
}
