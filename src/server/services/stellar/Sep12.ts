import axios from "axios";
import { StellarAnchorService } from "~/server/services/stellar/StellarAnchorService";

export interface KYCSession {
  id: string;
  provided_fields: Partial<Sep12Fields>;
  fields: Partial<Sep12Fields>;
  status: "NEEDS_INFO" | "ACCEPTED";
}

interface IKYCFields {
  bank_account_number: string;
  bank_number: string;
  photo_id_front: string;
  photo_id_back: string;
  first_name: string;
  last_name: string;
  email_address: string;
}

type Sep12Fields = {
  bank_account_number: {
    description: "bank account number of the customer";
    status: string;
    type: "string";
    optional: boolean;
  };
  bank_number: {
    description: "routing number of the customer";
    status: string;
    type: "string";
    optional: boolean;
  };
  photo_id_front: {
    description: "Image of front of user's photo ID or passport";
    type: "binary";
    status: string;
    optional: true;
  };
  photo_id_back: {
    description: "Image of back of user's photo ID or passport";
    type: "binary";
    status: string;
    optional: true;
  };
  first_name: {
    description: "first name of the customer";
    status: string;
    type: "string";
    optional: boolean;
  };
  last_name: {
    description: "last name of the customer";
    status: string;
    type: "string";
    optional: boolean;
  };
  email_address: {
    description: "email address of the customer";
    status: string;
    type: "string";
    optional: boolean;
  };
};
export class Sep12 extends StellarAnchorService {
  /**
   * Sends a `GET` request to query KYC status for a customer, returns current status of KYC submission
   * @async
   * @function getSep12Fields
   * @param {Object} opts Options object
   * @param {string} opts.authToken JSON web token used to authenticate the user with the KYC server (obtained through SEP-10)
   * @returns {Promise<Object>} Returns the response from the server
   */
  async getSep12Fields({
    authToken,
    params,
  }: {
    authToken: string;
    params?: { type?: string };
  }): Promise<KYCSession> {
    const kycServer = await this.getKycServer();

    const res = await axios.get<KYCSession>(`${kycServer}/customer`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      params: params ?? {},
    });
    console.log("res", res.data);
    return res.data;
  }

  /**
   * Sends a `PUT` request to the KYC server, submitting the supplied fields for the customer's record.
   * @async
   * @function putSep12Fields
   * @param {Object} opts Options object
   * @param {string} opts.authToken JSON web token used to authenticate the user with the KYC server (obtained through SEP-10)
   * @param {Object} opts.fields Object containing key/value pairs of supported SEP-9 fields to submit to the KYC server
   * @returns {Promise<Object>} Returns the response from the server
   */
  async putSep12Fields({
    authToken,
    fields,
  }: {
    authToken: string;
    fields: Partial<IKYCFields>;
  }) {
    const kycServer = await this.getKycServer();
    const { photo_id_back, photo_id_front, ...stringFields } = fields;
    const res = await axios.put<{ id: string }>(
      `${kycServer}/customer`,
      stringFields,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
    return res.data;
  }

  async getKYCRequestConfigForFiles({ authToken }: { authToken: string }) {
    const kycServer = await this.getKycServer();
    const url = `${kycServer}/customer`;
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${authToken}`,
      },
    };

    return {
      url,
      config,
    };
  }
}
