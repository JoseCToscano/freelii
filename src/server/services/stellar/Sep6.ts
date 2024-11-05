import { StellarAnchorService } from "~/server/services/stellar/StellarAnchorService";
import axios from "axios";

interface IDepositExchange {
  destination_asset: string; // stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B
  source_asset: string; // iso4217:USD
  amount: number;
  account: string; // GD5M4OGHZIVV6ZM2AJ5F6EDQB5FTW4S27DKOAK3XIEQHJF4UGMZKT5ZG
  type: string; // bank_account
}

interface IDepositExchangeResponse {
  how: string; // "fake bank account number";
  id: string; // "4a135cda-089d-4b90-90a1-d43887f15613";
  extra_info: {
    message: string; // "'how' would normally contain a terse explanation for how to deposit the asset with the anchor, and 'extra_info' would provide any additional information.";
  };
}

interface IWithdrawExchange {
  destination_asset: string; // stellar:SRT:GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B
  source_asset: string; // iso4217:USD
  amount: number;
  account: string; // GD5M4OGHZIVV6ZM2AJ5F6EDQB5FTW4S27DKOAK3XIEQHJF4UGMZKT5ZG
  type: string; // bank_account
  dest: string; // "fake bank account number";
  dest_extra: string; // "4a135cda-089d-4b90-90a1-d43887f15613";
}

interface IWithdrawExchangeResponse {
  id: "c56a7b03-c6dd-486d-afc7-b424243b1547";
  account_id: "GCSGSR6KQQ5BP2FXVPWRL6SWPUSFWLVONLIBJZUKTVQB5FYJFVL6XOXE";
  fee_fixed: 1.0;
  memo: "AAAAAAAAAAAAAAAAAAAAAMVqewPG3Uhtr8e0JCQ7FUc=";
  memo_type: "hash";
}
export class Sep6 extends StellarAnchorService {
  /**
   * Initiates a transfer using the SEP-6 protocol.
   * @async
   * @function initiateTransfer6
   * @param {Object} opts Options object
   * @param {string} opts.authToken Authentication token for a Stellar account received through SEP-10 web authentication
   * @param {string} opts.endpoint URL endpoint to be requested, also indicates which direction the transfer is moving
   * @param {Object<string,string>} opts.formData Big ol' object that should be done better, but it's pretty much ALL the information we gather from the user
   * @param {string} opts.domain Domain of the anchor that is handling the transfer
   * @returns {Promise<Object>} JSON response from the server
   * @throws Will throw an error if the server response is not `ok`.
   */
  async initiateDeposit({
    authToken,
    formData,
  }: {
    authToken: string;
    formData: IDepositExchange;
  }): Promise<IDepositExchangeResponse> {
    const transferServer = await this.getTransferServerSep6();
    console.log("here is all the formData", formData);
    const searchParams = new URLSearchParams({
      destination_asset: formData.destination_asset,
      source_asset: formData.source_asset,
      amount: formData.amount.toString(),
      account: formData.account,
      type: formData.type,
    });

    const res = await axios.get<IDepositExchangeResponse>(
      `${transferServer}/deposit-exchange?${searchParams}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
    return res.data;
  }

  async initiateWithdrawal({
    authToken,
    formData,
  }: {
    authToken: string;
    formData: IWithdrawExchange;
  }): Promise<IWithdrawExchangeResponse> {
    const transferServer = await this.getTransferServerSep6();
    console.log("here is all the formData", formData);
    const searchParams = new URLSearchParams({
      destination_asset: formData.destination_asset,
      source_asset: formData.source_asset,
      amount: formData.amount.toString(),
      account: formData.account,
      type: formData.type,
      dest: formData.dest,
      dest_extra: formData.dest_extra,
    });

    const res = await axios.get<IWithdrawExchangeResponse>(
      `${transferServer}/withdraw-exchange?${searchParams}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
    return res.data;
  }
}
