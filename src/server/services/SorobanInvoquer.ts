import { type xdr } from "@stellar/stellar-sdk";
import { callWithSignedXDR, getContractXDR } from "~/lib/utils";

export class SorobanRPC {
  sac: string;

  caller: string;

  method: string;

  constructor(sac: string, caller: string, method: string) {
    this.sac = sac;
    this.caller = caller;
    this.method = method;
  }

  async prepareXDR(methodParameters: xdr.ScVal[]): Promise<string> {
    return await getContractXDR(
      this.sac,
      this.method,
      this.caller,
      methodParameters,
    );
  }

  async invoke(xdr: string) {
    return callWithSignedXDR(xdr);
  }
}
